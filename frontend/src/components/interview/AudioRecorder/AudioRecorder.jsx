import React, { useRef, useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import './AudioRecorder.css';

export const AudioRecorder = ({ isRecording, onAudioData }) => {
  const [audioLevel, setAudioLevel] = useState(0);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (isRecording && onAudioData) {
      startAudioAnalysis();
    } else {
      stopAudioAnalysis();
    }

    return () => stopAudioAnalysis();
  }, [isRecording]);

  const startAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      source.connect(analyserRef.current);

      analyzeAudio();
    } catch (error) {
      console.error('Audio analysis error:', error);
    }
  };

  const analyzeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(average);

    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  };

  const stopAudioAnalysis = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  return (
    <div className="audio-recorder">
      <div className="audio-visualizer">
        {isRecording ? <Mic size={24} /> : <MicOff size={24} />}
        <div className="audio-level-bar">
          <div
            className="audio-level-fill"
            style={{ width: `${(audioLevel / 255) * 100}%` }}
          />
        </div>
      </div>
      <span className="audio-status">
        {isRecording ? 'Recording audio...' : 'Audio standby'}
      </span>
    </div>
  );
};