import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UseVoiceDictationOptions {
  onTranscription: (text: string) => void;
  addTimestamp?: boolean;
}

export const useVoiceDictation = ({ onTranscription, addTimestamp = false }: UseVoiceDictationOptions) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];

        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
          body: { audio: base64Audio },
        });

        if (error) throw error;

        if (data?.text) {
          let transcribedText = data.text;
          
          if (addTimestamp) {
            const now = new Date();
            const timestamp = now.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            });
            transcribedText = `[${timestamp}] ${transcribedText}`;
          }
          
          onTranscription(transcribedText);
          toast({
            title: 'Voice transcribed!',
            description: 'Your audio has been converted to text.',
          });
        }
        setIsProcessing(false);
      };
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: 'Transcription failed',
        description: 'Could not transcribe audio. Please try again.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  }, [onTranscription, addTimestamp]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      recordingStartTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        
        // Check if recording was long enough (at least 500ms)
        const duration = Date.now() - recordingStartTimeRef.current;
        if (duration < 500) {
          toast({
            title: 'Recording too short',
            description: 'Please record for at least 0.5 seconds.',
            variant: 'destructive',
          });
          setIsProcessing(false);
          return;
        }
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size < 1000) {
          toast({
            title: 'Recording too short',
            description: 'Please try again with a longer recording.',
            variant: 'destructive',
          });
          setIsProcessing(false);
          return;
        }
        
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      toast({
        title: 'Recording...',
        description: 'Tap again to stop recording.',
      });
    } catch (error) {
      console.error('Microphone access error:', error);
      toast({
        title: 'Microphone access denied',
        description: 'Please allow microphone access to use voice dictation.',
        variant: 'destructive',
      });
    }
  }, [transcribeAudio]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  }, []);

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    toggleRecording,
  };
};
