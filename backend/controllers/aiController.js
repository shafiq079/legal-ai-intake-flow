const Intake = require('../models/Intake');
const IntakeLink = require('../models/IntakeLink');
const { asyncHandler, NotFoundError } = require('../middleware/errorHandler');
const { convertIntakeToClient, markIntakeAsCompleted } = require('./intakeController'); // Import markIntakeAsCompleted
const intakeQuestions = require('../config/intakeQuestions');

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function for deep merging objects
function deepMerge(target, source) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] instanceof Object && !Array.isArray(source[key]) && target.hasOwnProperty(key) && target[key] instanceof Object) {
        Object.assign(target[key], deepMerge(target[key], source[key]));
      } else if (Array.isArray(source[key])) {
        // For arrays, we'll concatenate them. More complex merging (e.g., by ID) would be needed for specific cases.
        target[key] = (target[key] || []).concat(source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
}

const processAIIntake = asyncHandler(async (req, res) => {
  const { message, intakeId } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }
  if (!intakeId) {
    return res.status(400).json({ message: 'Intake ID is required' });
  }

  const intake = await Intake.findOne({ sessionId: intakeId });
  if (!intake) {
    throw new NotFoundError('Intake session not found for this link.');
  }

  // Add user message to intake messages
  intake.messages.push({
    role: 'user',
    content: message,
    timestamp: new Date(),
  });

  const currentIntakeQuestions = intakeQuestions[intake.intakeType] || intakeQuestions.Other;
  const currentQuestionIndex = intake.messages.filter(msg => msg.role === 'assistant' && msg.messageType === 'question').length;
  const nextQuestionObj = currentIntakeQuestions[currentQuestionIndex];

  let systemPrompt = `You are a legal intake assistant. Your goal is to collect comprehensive information from the client for a ${intake.intakeType} case.`
  systemPrompt += `\n\nBased on the conversation history and the client's last response, extract all relevant information for the following fields, ensuring to handle nested objects and arrays as specified in the Intake model schema.`
  systemPrompt += `\n\nFor fields like 'personalInfo.fullName', please extract and separate into 'personalInfo.firstName' and 'personalInfo.lastName'.`
  systemPrompt += `\n\nFor array fields (e.g., 'immigrationInfo.children', 'criminalHistory.arrests', 'caseInfo.previousLegalIssues'), if new entries are provided, format them as an array of objects. If existing entries are being updated, provide the full updated object.`
  systemPrompt += `\n\nAfter extracting information, determine the next logical question to ask from the predefined list to gather more details. If all questions are answered and sufficient information is collected for the intake type, indicate completion.`
  systemPrompt += `\n\nRespond ONLY in JSON format with two top-level keys: 'extractedData' (an object containing all extracted key-value pairs, including nested objects and arrays) and 'nextQuestion' (the next question to ask, or 'COMPLETED' if the intake is finished).`
  systemPrompt += `\n\nExample for extractedData with nested objects and arrays: { "personalInfo": { "firstName": "John", "lastName": "Doe" }, "contactInfo": { "email": "john.doe@example.com" }, "immigrationInfo": { "children": [ { "name": "Jane Doe", "dateOfBirth": "2010-01-01" } ] } }`
  systemPrompt += `\n\nPredefined questions for ${intake.intakeType} intake: ${JSON.stringify(currentIntakeQuestions.map(q => q.question))}. Prioritize these questions.`

  const conversationHistory = intake.messages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model', // Gemini uses 'user' and 'model' roles
    parts: [{ text: msg.content }]
  }));

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const result = await model.generateContent({
    contents: [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...conversationHistory,
      { role: "user", parts: [{ text: message }] }
    ],
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const aiResponseContent = result.response.text();
  let aiResponseParsed;
  try {
    aiResponseParsed = JSON.parse(aiResponseContent);
  } catch (e) {
    console.error("Failed to parse AI response JSON:", aiResponseContent, e);
    aiResponseParsed = { extractedData: {}, nextQuestion: "I apologize, I had trouble processing that. Could you please rephrase?" };
  }

  const extractedData = aiResponseParsed.extractedData || {};
  const nextQuestion = aiResponseParsed.nextQuestion || "Thank you. Is there anything else you'd like to add?";
  const isComplete = nextQuestion === 'COMPLETED';

  // Merge extracted data using the deepMerge helper
  deepMerge(intake.extractedData, extractedData);

  // Add AI response to intake messages
  intake.messages.push({
    role: 'assistant',
    content: nextQuestion,
    timestamp: new Date(),
    messageType: isComplete ? 'summary' : 'question',
    metadata: { extractedData: extractedData },
  });

  await intake.save();

  // If AI indicates completion, mark intake as completed in intakeController
  if (isComplete) {
    await markIntakeAsCompleted(intake.sessionId, intake.extractedData);
  }

  res.json({ message: nextQuestion, extractedData: intake.extractedData, isComplete: isComplete });
});



const processVoiceIntake = asyncHandler(async (req, res) => {
  const { intakeId, message, initial } = req.body; // intakeId and message (transcribed text) from frontend
  console.log('processVoiceIntake received:', { intakeId, message, initial });

  if (!intakeId) {
    return res.status(400).json({ message: 'Intake ID is required' });
  }

  const intake = await Intake.findOne({ sessionId: intakeId });
  if (!intake) {
    throw new NotFoundError('Intake session not found for this link.');
  }

  let currentMessage = message;

  // If it's the initial request, get the first question
  if (initial) {
    const currentIntakeQuestions = intakeQuestions[intake.intakeType] || intakeQuestions.Other;
    const firstQuestion = currentIntakeQuestions[0]?.question || "Hello, how can I assist you with your legal intake today?";
    console.log('Sending initial question:', firstQuestion);
    intake.messages.push({
      role: 'assistant',
      content: firstQuestion,
      timestamp: new Date(),
      messageType: 'question',
    });
    await intake.save();
    return res.json({ message: firstQuestion, extractedData: intake.extractedData, isComplete: false });
  }

  if (!currentMessage) {
    return res.json({ message: 'Could not understand your response. Please try again.', extractedData: intake.extractedData, isComplete: false });
  }

  // Add user message (transcription) to intake messages
  intake.messages.push({
    role: 'user',
    content: currentMessage,
    timestamp: new Date(),
  });

  const currentIntakeQuestions = intakeQuestions[intake.intakeType] || intakeQuestions.Other;
  const currentQuestionIndex = intake.messages.filter(msg => msg.role === 'assistant' && msg.messageType === 'question').length;
  const nextQuestionObj = currentIntakeQuestions[currentQuestionIndex];

  let systemPrompt = `You are a legal intake assistant. Your goal is to collect comprehensive information from the client for a ${intake.intakeType} case.`
  systemPrompt += `\n\nBased on the conversation history and the client's last response, extract all relevant information for the following fields, ensuring to handle nested objects and arrays as specified in the Intake model schema.`
  systemPrompt += `\n\nFor fields like 'personalInfo.fullName', please extract and separate into 'personalInfo.firstName' and 'personalInfo.lastName'.`
  systemPrompt += `\n\nFor array fields (e.g., 'immigrationInfo.children', 'criminalHistory.arrests', 'caseInfo.previousLegalIssues'), if new entries are provided, format them as an array of objects. If existing entries are being updated, provide the full updated object.`
  systemPrompt += `\n\nAfter extracting information, determine the next logical question to ask from the predefined list to gather more details. If all questions are answered and sufficient information is collected for the intake type, indicate completion.`
  systemPrompt += `\n\nRespond ONLY in JSON format with two top-level keys: 'extractedData' (an object containing all extracted key-value pairs, including nested objects and arrays) and 'nextQuestion' (the next question to ask, or 'COMPLETED' if the intake is finished).`
  systemPrompt += `\n\nExample for extractedData with nested objects and arrays: { "personalInfo": { "firstName": "John", "lastName": "Doe" }, "contactInfo": { "email": "john.doe@example.com" }, "immigrationInfo": { "children": [ { "name": "Jane Doe", "dateOfBirth": "2010-01-01" } ] } }`
  systemPrompt += `\n\nPredefined questions for ${intake.intakeType} intake: ${JSON.stringify(currentIntakeQuestions.map(q => q.question))}. Prioritize these questions.`

  const conversationHistory = intake.messages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model', // Gemini uses 'user' and 'model' roles
    parts: [{ text: msg.content }]
  }));

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const result = await model.generateContent({
    contents: [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...conversationHistory,
      { role: "user", parts: [{ text: currentMessage }] } // Use currentMessage here
    ],
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const aiResponseContent = result.response.text();
  let aiResponseParsed;
  try {
    aiResponseParsed = JSON.parse(aiResponseContent);
  } catch (e) {
    console.error("Failed to parse AI response JSON:", aiResponseContent, e);
    aiResponseParsed = { extractedData: {}, nextQuestion: "I apologize, I had trouble processing that. Could you please rephrase?" };
  }

  const extractedData = aiResponseParsed.extractedData || {};
  const nextQuestion = aiResponseParsed.nextQuestion || "Thank you. Is there anything else you'd like to add?";
  const isComplete = nextQuestion === 'COMPLETED';

  // Merge extracted data using the deepMerge helper
  deepMerge(intake.extractedData, extractedData);

  // Add AI response to intake messages
  intake.messages.push({
    role: 'assistant',
    content: nextQuestion,
    timestamp: new Date(),
    messageType: isComplete ? 'summary' : 'question',
    metadata: { extractedData: extractedData },
  });

  await intake.save();

  // If AI indicates completion, mark intake as completed in intakeController
  if (isComplete) {
    await markIntakeAsCompleted(intake.sessionId, intake.extractedData);
  }

  res.json({ message: nextQuestion, extractedData: intake.extractedData, isComplete: isComplete });
});

module.exports = {
  processAIIntake,
  processVoiceIntake,
};

