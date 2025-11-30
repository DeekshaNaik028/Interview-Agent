import { useState, useRef, useCallback } from 'react';
import RecordRTC from 'recordrtc';
import { blobToBase64 } from '@/utils/mediaUtils';
import { mediaConfig } from '@/config/media.config';

export const useMediaRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedData, setRecordedData] = useState(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);

  const startRecording = useCallback(async (stream, options = {}) => {
    try {
      streamRef.current = stream;
      
      recorderRef.current = new RecordRTC(stream, {
        type: 'video',
        mimeType: options.mimeType || mediaConfig.recordingOptions.mimeType,
        audioBitsPerSecond: options.audioBitsPerSecond || mediaConfig.recordingOptions.audioBitsPerSecond,
        videoBitsPerSecond: options.videoBitsPerSecond || mediaConfig.recordingOptions.videoBitsPerSecond,
        timeSlice: options.timeSlice || 1000,
        ondataavailable: options.ondataavailable,
      });

      recorderRef.current.startRecording();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }, []);

  const stopRecording = useCallback(async () => {
    return new Promise((resolve, reject) => {
      if (!recorderRef.current) {
        reject(new Error('No recorder instance'));
        return;
      }

      recorderRef.current.stopRecording(async () => {
        try {
          const blob = recorderRef.current.getBlob();
          const base64 = await blobToBase64(blob);
          
          setRecordedData({ blob, base64 });
          setIsRecording(false);
          
          // Stop all tracks
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
          }
          
          resolve({ blob, base64 });
        } catch (error) {
          reject(error);
        }
      });
    });
  }, []);

  const pauseRecording = useCallback(() => {
    if (recorderRef.current && isRecording) {
      recorderRef.current.pauseRecording();
    }
  }, [isRecording]);

  const resumeRecording = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.resumeRecording();
    }
  }, []);

  const resetRecording = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.reset();
    }
    setRecordedData(null);
    setIsRecording(false);
  }, []);

  return {
    isRecording,
    recordedData,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  };
};
