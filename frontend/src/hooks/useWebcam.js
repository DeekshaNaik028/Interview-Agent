import { useState, useCallback } from 'react';
import { checkMediaPermissions } from '@/utils/mediaUtils';
import { mediaConfig } from '@/config/media.config';

export const useWebcam = () => {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);

  const requestPermissions = useCallback(async () => {
    try {
      const permissions = await checkMediaPermissions();
      setHasPermission(permissions.video && permissions.audio);
      return permissions.video && permissions.audio;
    } catch (err) {
      setError('Failed to get media permissions');
      return false;
    }
  }, []);

  const startWebcam = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: mediaConfig.video,
        audio: mediaConfig.audio,
      });
      
      setStream(mediaStream);
      setError(null);
      return mediaStream;
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setError('Failed to access webcam and microphone');
      throw err;
    }
  }, []);

  const stopWebcam = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  return {
    stream,
    error,
    hasPermission,
    requestPermissions,
    startWebcam,
    stopWebcam,
  };
};
