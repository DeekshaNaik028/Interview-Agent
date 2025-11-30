import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebcam } from '@/hooks/useWebcam';
import { Button } from '@/components/common/Button/Button';
import { Card } from '@/components/common/Card/Card';
import { Alert } from '@/components/common/Alert/Alert';
import { CheckCircle, XCircle } from 'lucide-react';
import './InterviewLobby.css';

const InterviewLobby = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission, requestPermissions, stream, startWebcam, stopWebcam } = useWebcam();
  const [isReady, setIsReady] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  const handleCheckSetup = async () => {
    setChecking(true);
    const granted = await requestPermissions();
    
    if (granted) {
      try {
        await startWebcam();
        setIsReady(true);
      } catch (error) {
        setIsReady(false);
      }
    }
    setChecking(false);
  };

  const handleStartInterview = () => {
    navigate(`/interview/${id}/room`);
  };

  return (
    <div className="interview-lobby">
      <div className="lobby-container">
        <Card>
          <h1>Interview Lobby</h1>
          <p className="lobby-subtitle">
            Please check your setup before starting the interview
          </p>

          <div className="setup-checklist">
            <div className="checklist-item">
              {hasPermission ? (
                <CheckCircle className="icon-success" size={24} />
              ) : (
                <XCircle className="icon-error" size={24} />
              )}
              <span>Camera & Microphone Access</span>
            </div>
          </div>

          {!isReady && (
            <Alert
              type="info"
              message="Click 'Check Setup' to test your camera and microphone"
            />
          )}

          {isReady && (
            <Alert
              type="success"
              message="Setup complete! You're ready to start the interview."
            />
          )}

          <div className="lobby-actions">
            {!isReady ? (
              <Button
                onClick={handleCheckSetup}
                loading={checking}
                size="lg"
                fullWidth
              >
                Check Setup
              </Button>
            ) : (
              <Button
                onClick={handleStartInterview}
                variant="success"
                size="lg"
                fullWidth
              >
                Start Interview
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InterviewLobby;