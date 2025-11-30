import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, CameraOff } from 'lucide-react';
import { mediaConfig } from '@/config/media.config';
import './VideoRecorder.css';

export const VideoRecorder = ({ onStreamReady, isRecording }) => {
  const webcamRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: mediaConfig.video,
        audio: mediaConfig.audio,
      });
      
      setHasPermission(true);
      
      if (onStreamReady) {
        onStreamReady(stream);
      }
    } catch (err) {
      console.error('Camera permission error:', err);
      setError('Please allow camera and microphone access');
      setHasPermission(false);
    }
  };

  if (error) {
    return (
      <div className="video-recorder-error">
        <CameraOff size={48} />
        <p>{error}</p>
        <button onClick={checkPermissions} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="video-recorder">
      {hasPermission ? (
        <>
          <Webcam
            ref={webcamRef}
            audio={true}
            muted={true}
            videoConstraints={mediaConfig.video}
            audioConstraints={mediaConfig.audio}
            className="webcam-view"
          />
          {isRecording && (
            <div className="recording-indicator">
              <span className="recording-dot" />
              Recording
            </div>
          )}
        </>
      ) : (
        <div className="video-recorder-loading">
          <Camera size={48} />
          <p>Requesting camera access...</p>
        </div>
      )}
    </div>
  );
};