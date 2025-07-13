import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, StopCircle, Loader2, Volume2, VolumeX, Bot, User } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

interface VoiceIntakeProps {
  intakeId: string;
  intakeType: string;
  onComplete: (extractedData: any) => void;
}

const VoiceIntake: React.FC<VoiceIntakeProps> = ({ intakeId, intakeType, onComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [initialQuestionAsked, setInitialQuestionAsked] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const queryClient = useQueryClient();

  const processVoiceIntakeMutation = useMutation({
    mutationFn: async (transcription: string) => {
      const response = await axios.post('/api/ai/voice-intake', { message: transcription, intakeId });
      return response.data;
    },
    onSuccess: (data) => {
      setTranscribedText(data.transcribedText); // Assuming backend returns transcribedText
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: data.transcribedText || '' }, // User's transcribed message
        { role: 'assistant', content: data.message } // AI's response
      ]);
      if (data.isComplete) {
        onComplete(data.extractedData);
        toast.success('Intake completed! Review the extracted data.');
      } else {
        speakText(data.message);
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to process voice intake.';
      toast.error(errorMessage);
    },
  });

  const startRecording = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      toast.error('Speech Recognition is not supported by your browser. Please use a modern browser like Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false; // Only capture a single utterance
    recognitionRef.current.interimResults = false; // Only return final results
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsRecording(true);
      toast.info('Listening...');
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTranscribedText(transcript);
      processVoiceIntakeMutation.mutate(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      toast.error(`Speech recognition error: ${event.error}`);
      setIsRecording(false);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
      toast.info('Stopped listening.');
    };

    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const speakText = (text: string) => {
    if (isMuted) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };
    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Send an initial request to get the first question
    const getInitialQuestion = async () => {
          console.log('Attempting to get initial question...');
          try {
            const response = await axios.post('/api/ai/voice-intake', { intakeId, initial: true });
            console.log('Initial question response:', response.data);
            setMessages((prev) => [...prev, { role: 'assistant', content: response.data.message }]);
            speakText(response.data.message);
          } catch (error: any) {
            console.error('Error getting initial question:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || 'Failed to start voice intake.';
            toast.error(errorMessage);
          }
        };

    if (!initialQuestionAsked) {
      getInitialQuestion();
      setInitialQuestionAsked(true);
    }
  }, [intakeId, initialQuestionAsked]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="h-8 w-8 text-primary dark:text-blue-400" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Legal Intake Assistant</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Intelligent client data collection and form completion</p>
          </div>
        </div>
        <Button
          onClick={() => setIsMuted(!isMuted)}
          variant="ghost"
          size="icon"
          className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col space-y-4" ref={scrollAreaRef}>
          {messages.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400">Starting voice intake... Please wait for the first question.</p>
          )}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary dark:bg-blue-500 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[75%] p-3 rounded-lg shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                </div>
              )}
            </div>
          ))}
          {processVoiceIntakeMutation.isLoading && (
            <div className="flex items-start gap-3 justify-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary dark:bg-blue-500 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="max-w-[75%] p-3 rounded-lg bg-gray-100 dark:bg-gray-700 shadow-sm">
                <Loader2 className="h-5 w-5 animate-spin text-gray-500 dark:text-gray-400" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Microphone Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-center items-center gap-4">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          variant={isRecording ? 'destructive' : 'default'}
          size="lg"
          className="rounded-full h-16 w-16 flex items-center justify-center shadow-lg transition-all duration-200 ease-in-out"
          disabled={processVoiceIntakeMutation.isLoading || isSpeaking}
        >
          {isRecording ? <StopCircle className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
        </Button>
      </div>
      {transcribedText && <p className="text-sm text-muted-foreground text-center pb-2">Last transcription: "{transcribedText}"</p>}
    </div>
  );
};

export default VoiceIntake;
