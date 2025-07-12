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
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [transcribedText, setTranscribedText] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const queryClient = useQueryClient();

  const processAIMutation = useMutation({
    mutationFn: async ({ message, intakeId }: { message: string; intakeId: string }) => {
      const response = await axios.post('/api/ai/intake-chat', { message, intakeId });
      return response.data;
    },
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
      setCurrentMessage('');
      if (data.isComplete) {
        onComplete(data.extractedData);
        toast.success('Intake completed! Review the extracted data.');
      } else {
        speakText(data.message);
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to process AI intake.';
      toast.error(errorMessage);
    },
  });

  const transcribeAudioMutation = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      const response = await axios.post('/api/ai/transcribe-audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      setTranscribedText(data.transcribedText);
      setMessages((prev) => [...prev, { role: 'user', content: data.transcribedText }]);
      processAIMutation.mutate({ message: data.transcribedText, intakeId });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to transcribe audio.';
      toast.error(errorMessage);
    },
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        setAudioChunks((prev) => [...prev, event.data]);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        transcribeAudioMutation.mutate(audioBlob);
        setAudioChunks([]);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.info('Recording started...');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Failed to start recording. Please ensure microphone access is granted.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      toast.info('Recording stopped. Transcribing...');
    }
  };

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      setMessages((prev) => [...prev, { role: 'user', content: currentMessage }]);
      processAIMutation.mutate({ message: currentMessage, intakeId });
      setCurrentMessage('');
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
              <p className="text-center text-muted-foreground">Start by speaking or typing your first message.</p>
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
            {(processAIMutation.isLoading || transcribeAudioMutation.isLoading) && (
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
            disabled={processAIMutation.isLoading || transcribeAudioMutation.isLoading}
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
          <Input
            placeholder="Type your message..."
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            disabled={processAIMutation.isLoading || transcribeAudioMutation.isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || processAIMutation.isLoading || transcribeAudioMutation.isLoading}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        {transcribedText && <p className="text-sm text-muted-foreground mt-2">Last transcription: "{transcribedText}"</p>}
      </CardContent>
    </Card>
  );
};

export default VoiceIntake;
