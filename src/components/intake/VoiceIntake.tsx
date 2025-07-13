import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, StopCircle, Send, Loader2, Volume2, VolumeX } from 'lucide-react';
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>AI-Powered Voice Intake</CardTitle>
        <CardDescription>
          Speak naturally to the AI assistant to complete your intake for a <span className="font-semibold text-primary">{intakeType}</span> case.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[400px] p-4 border rounded-md bg-muted/50">
          <div className="flex flex-col space-y-2" ref={scrollAreaRef}>
            {messages.length === 0 && (
              <p className="text-center text-muted-foreground">Starting voice intake... Please wait for the first question.</p>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {(processVoiceIntakeMutation.isLoading) && (
              <div className="flex justify-start">
                <div className="max-w-[70%] p-3 rounded-lg bg-gray-200 dark:bg-gray-700">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex items-center space-x-2">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            variant={isRecording ? 'destructive' : 'outline'}
            size="icon"
            disabled={processVoiceIntakeMutation.isLoading || isSpeaking}
          >
            {isRecording ? <StopCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Button
            onClick={() => setIsMuted(!isMuted)}
            variant="outline"
            size="icon"
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
        </div>
        {transcribedText && <p className="text-sm text-muted-foreground mt-2">Last transcription: "{transcribedText}"</p>}
      </CardContent>
    </Card>
  );
};

export default VoiceIntake;
