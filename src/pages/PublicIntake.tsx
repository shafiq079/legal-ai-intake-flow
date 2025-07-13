import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Upload, FileText, Loader2, Check, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { toast } from 'sonner';

import ManualIntakeForm from '@/components/intake/ManualIntakeForm';
import IntakeSubmission from '@/components/intake/IntakeSubmission';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  extractedData?: Record<string, any>;
}

interface ExtractedField {
  field: string;
  value: string;
  confidence: number;
  category: string;
}

// Helper function to determine category for extracted fields
const getCategoryForField = (field: string): string => {
  if (['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'nationality', 'maritalStatus', 'occupation', 'employer'].includes(field)) {
    return 'Personal Information';
  } else if (['caseType', 'description', 'urgency', 'desiredOutcome', 'previousLegalIssues', 'currentProceedings'].includes(field)) {
    return 'Case Information';
  } else if (['currentStatus', 'visaType', 'familyMembers', 'travelHistory'].includes(field)) {
    return 'Immigration Information';
  } else if (['hasHistory', 'details'].includes(field)) {
    return 'Criminal History';
  } else if (['annualIncome', 'employmentStatus', 'assets', 'liabilities'].includes(field)) {
    return 'Financial Information';
  } else if (['documentsNeeded', 'documentsAvailable'].includes(field)) {
    return 'Documents';
  } else if (['preferredMethod', 'language', 'needsInterpreter', 'bestTimeToCall'].includes(field)) {
    return 'Communication Preferences';
  } else if (['privacyPolicy', 'dataSharing', 'backgroundCheck'].includes(field)) {
    return 'Consents';
  } else {
    return 'Other';
  }
};

// Helper function to get display name for fields
const getFieldDisplayName = (field: string): string => {
  const displayNames: Record<string, string> = {
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    dateOfBirth: 'Date of Birth',
    nationality: 'Nationality',
    maritalStatus: 'Marital Status',
    occupation: 'Occupation',
    employer: 'Employer',
    caseType: 'Case Type',
    description: 'Description',
    urgency: 'Urgency',
    desiredOutcome: 'Desired Outcome',
    previousLegalIssues: 'Previous Legal Issues',
    currentProceedings: 'Current Proceedings',
    currentStatus: 'Current Status',
    visaType: 'Visa Type',
    familyMembers: 'Family Members',
    travelHistory: 'Travel History',
    hasHistory: 'Has Criminal History',
    details: 'Details',
    annualIncome: 'Annual Income',
    employmentStatus: 'Employment Status',
    assets: 'Assets',
    liabilities: 'Liabilities',
    documentsNeeded: 'Documents Needed',
    documentsAvailable: 'Documents Available',
    preferredMethod: 'Preferred Method',
    language: 'Language',
    needsInterpreter: 'Needs Interpreter',
    bestTimeToCall: 'Best Time to Call',
    privacyPolicy: 'Privacy Policy',
    dataSharing: 'Data Sharing',
    backgroundCheck: 'Background Check',
  };
  return displayNames[field] || field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
};

export default function PublicIntake() {
  const { linkId } = useParams<{ linkId: string }>();

  type IntakeType = 'voice' | 'manual' | null;
  const [selectedIntakeType, setSelectedIntakeType] = useState<IntakeType>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([]);
  const [completionProgress, setCompletionProgress] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isIntakeComplete, setIsIntakeComplete] = useState(false);
  const [manualFormData, setManualFormData] = useState<any>(null); // New state for manual form data

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const { data: intakeData, isLoading: isLoadingIntake, error: intakeError } = useQuery({
    queryKey: ['intake', linkId],
    queryFn: async () => {
      if (!linkId) return null;
      const response = await axios.get(`/api/intake/${linkId}`);
      return response.data;
    },
    onSuccess: (data) => {
      if (data) {
        // Map backend messages to frontend Message interface
        const loadedMessages: Message[] = data.messages.map((msg: any) => ({
          id: msg._id,
          type: msg.role === 'assistant' ? 'ai' : 'user',
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          extractedData: msg.metadata?.extractedData,
        }));
        setMessages(loadedMessages);

        // Map backend extracted data to frontend ExtractedField interface
        if (data.extractedData) {
          const loadedFields: ExtractedField[] = Object.entries(data.extractedData).map(([key, value]) => ({
            field: key,
            value: value as string,
            confidence: 1, // Assuming 100% confidence for loaded data
            category: getCategoryForField(key),
          }));
          setExtractedFields(loadedFields);
        }
        setCompletionProgress(data.completionPercentage || 0);
        // Check if intake was already completed
        if (data.status === 'completed') {
          setIsIntakeComplete(true);
        }
      }
    },
    onError: (error) => {
      console.error('Error loading intake data:', error);
      toast.error('Failed to load previous intake data.');
    },
    enabled: !!linkId, // Only run query if linkId is available
  });

  const handleSendMessage = async (text?: string) => {
    const messageContent = text || inputMessage.trim();
    if (!messageContent) return;
    if (!linkId) {
      toast.error('Intake ID is missing. Cannot send message.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageContent, intakeId: linkId }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const aiResponse = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.message,
        timestamp: new Date(),
        extractedData: aiResponse.extractedData,
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update extracted fields
      if (aiResponse.extractedData) {
        const newFields = Object.entries(aiResponse.extractedData).map(([key, value]) => ({
          field: key,
          value: value as string,
          confidence: 0.85 + Math.random() * 0.15, // Placeholder confidence
          category: getCategoryForField(key),
        }));
        setExtractedFields(prev => {
          // Simple merge: new fields overwrite old ones, existing fields are updated
          const updatedFields = new Map(prev.map(f => [f.field, f]));
          newFields.forEach(f => updatedFields.set(f.field, f));
          return Array.from(updatedFields.values());
        });
        setCompletionProgress(prev => Math.min(prev + 10, 90));
      }

      if (aiResponse.isComplete) {
        setIsIntakeComplete(true);
        toast.success("Intake complete! Please review and submit.");
      }

    } catch (error) {
      console.error('Error sending message to AI intake:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I am having trouble processing your request right now.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    if (!isRecording) {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('audio', audioBlob, 'audio.webm');
          formData.append('intakeId', linkId || '');

          setIsLoading(true);
          try {
            const response = await fetch('/api/ai/transcribe', {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              throw new Error('Failed to transcribe audio');
            }

            const data = await response.json();
            handleSendMessage(data.transcribedText); // Send transcribed text as a message
          } catch (error) {
            console.error('Error transcribing audio:', error);
            setMessages(prev => [...prev, {
              id: (Date.now() + 1).toString(),
              type: 'ai',
              content: 'Sorry, I could not process your voice input.',
              timestamp: new Date(),
            }]);
          } finally {
            setIsLoading(false);
          }
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
                toast.error('Please allow microphone access to use voice intake.');
      }
    } else {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoadingIntake) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading intake session...</p>
      </div>
    );
  }

  if (intakeError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full text-red-500">
        <p className="text-lg">Error: {intakeError.message}</p>
        <p className="text-sm">Please ensure the link is valid and not expired.</p>
      </div>
    );
  }

  const handleSubmissionSuccess = () => {
    toast.success("Intake finalized and submitted successfully!");
    // Optionally redirect or show a final success message
    // For now, we'll just disable further interaction
  };

  const handleManualFormSubmit = async (data: any) => {
    console.log("PublicIntake: Manual form submitted with data", data);
    setManualFormData(data); // Store the complete form data

    if (!linkId) {
      toast.error("Intake ID is missing. Cannot save manual form data.");
      return;
    }

    try {
      // API call to update the intake session with manual form data
      const response = await axios.put(`/api/intake/${linkId}/update-data`, data);
      if (response.data.success) {
        toast.success("Manual form data saved successfully!");
        // Optionally update extractedFields or other state based on backend response
        // For now, we'll just rely on manualFormData for IntakeSubmission
      } else {
        toast.error(response.data.message || "Failed to save manual form data.");
      }
    } catch (error: any) {
      console.error("Error saving manual form data:", error);
      toast.error(error.response?.data?.message || "Failed to save manual form data.");
    }
  };

  return (
    <div className="flex h-screen w-full">
      {!selectedIntakeType && (
        <div className="flex flex-col items-center justify-center w-full h-full p-4">
          <h1 className="text-4xl font-bold text-gradient-primary mb-8">
            Welcome to Legal Intake
          </h1>
          <p className="text-lg text-muted-foreground mb-12 text-center max-w-2xl">
            Choose how you'd like to proceed with your legal intake. You can either speak with our AI assistant or fill out a smart form manually.
          </p>
          <div className="flex gap-8">
            <Card className="w-80 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedIntakeType('voice')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-6 w-6" /> AI Voice Intake
                </CardTitle>
                <CardDescription>
                  Speak naturally with our AI assistant to provide your information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Guided conversation, speech-to-text, real-time data extraction.
                </p>
                <Button variant="legal" className="mt-4 w-full">Start AI Voice Intake</Button>
              </CardContent>
            </Card>
            <Card className="w-80 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedIntakeType('manual')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6" /> Smart Manual Intake
                </CardTitle>
                <CardDescription>
                  Fill out a dynamic form at your own pace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Dynamic forms, conditional logic, document upload with OCR.
                </p>
                <Button variant="legal" className="mt-4 w-full">Start Manual Intake</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {selectedIntakeType && (
        <div className="flex flex-1 h-full">
          {/* Left Panel: Manual Intake Form */}
          <div className="flex-1 flex flex-col overflow-y-auto p-4 border-r">
            <ManualIntakeForm
              extractedData={extractedFields}
              onBack={() => setSelectedIntakeType(null)}
              intakeType={intakeData?.intakeType || 'Other'} // Pass intakeType here
              onFormSubmit={handleManualFormSubmit} // Pass the new handler
              intakeId={linkId || ''} // Pass intakeId here
            />
          </div>

          {/* Right Panel: Voice Bot or Empty */}
          {selectedIntakeType === 'voice' && (
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="p-6 border-b bg-gradient-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gradient-primary flex items-center gap-2">
                      <Bot className="h-6 w-6" />
                      AI Legal Intake Assistant
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      Intelligent client data collection and form completion
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">Completion Progress</p>
                      <p className="text-xs text-muted-foreground">{completionProgress}% Complete</p>
                    </div>
                    <div className="w-32">
                      <Progress value={completionProgress} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'ai' && (
                      <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[70%] rounded-lg p-4 ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>

                    {message.type === 'user' && (
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">AI is analyzing your response...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input or Submission */}
              {!isIntakeComplete ? (
                <div className="p-6 border-t bg-background">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={isRecording ? "Listening..." : "Type your response here..."}
                      className="legal-input"
                      disabled={isLoading || isRecording}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading || isRecording}
                      variant="legal"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={handleVoiceInput}
                      disabled={isLoading}
                      variant="outline"
                      size="icon"
                      className={isRecording ? "animate-pulse" : ""}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                  {isRecording && (
                    <p className="text-sm text-muted-foreground mt-2">Recording audio... Click again to stop.</p>
                  )}
                </div>
              ) : (
                <IntakeSubmission intakeId={linkId || ''} extractedData={extractedFields} onSubmissionSuccess={handleSubmissionSuccess} formData={manualFormData} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}        
