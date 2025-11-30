import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInterviewContext } from '@/context/InterviewContext';
import { useMediaRecorder } from '@/hooks/useMediaRecorder';
import { useWebcam } from '@/hooks/useWebcam';
import { useTimer } from '@/hooks/useTimer';
import { VideoRecorder } from '@/components/interview/VideoRecorder/VideoRecorder';
import { AudioRecorder } from '@/components/interview/AudioRecorder/AudioRecorder';
import { QuestionDisplay } from '@/components/interview/QuestionDisplay/QuestionDisplay';
import { TimerDisplay } from '@/components/interview/TimerDisplay/TimerDisplay';
import { ProgressBar } from '@/components/interview/ProgressBar/ProgressBar';
import { Button } from '@/components/common/Button/Button';
import { Modal } from '@/components/common/Modal/Modal';
import { Loader } from '@/components/common/Loader/Loader';
import { appConfig } from '@/config/app.config';
import { TOTAL_QUESTIONS } from '@/utils/constants';
import { Mic, MicOff, Video, VideoOff, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import './InterviewRoom.css';

const InterviewRoom = () => {
  const { id: interviewId } = useParams();
  const navigate = useNavigate();
  
  const {
    interview,
    currentQuestion,
    loadInterview,
    startInterview,
    submitAnswer,
  } = useInterviewContext();

  const {
    isRecording,
    startRecording,
    stopRecording,
    recordedData,
  } = useMediaRecorder();

  const { stream, startWebcam, stopWebcam } = useWebcam();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { time, isRunning, start, stop, formatTime } = useTimer(
    appConfig.questionTimeLimit,
    handleTimeUp
  );

  useEffect(() => {
    initializeInterview();

    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (currentQuestion && !isInitialized) {
      startQuestionFlow();
      setIsInitialized(true);
    }
  }, [currentQuestion]);

  const initializeInterview = async () => {
    try {
      // Load interview details
      await loadInterview(interviewId);
      
      // Start webcam
      const mediaStream = await startWebcam();
      
      // Start the interview and get first question
      await startInterview(interviewId);
    } catch (error) {
      console.error('Failed to initialize interview:', error);
      toast.error('Failed to start interview');
      navigate('/candidate/interviews');
    }
  };

  const startQuestionFlow = async () => {
    try {
      // Start recording
      if (stream) {
        await startRecording(stream);
        start(); // Start timer
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Failed to start recording');
    }
  };

  async function handleTimeUp() {
    toast.warning('Time is up for this question!');
    await handleSubmitAnswer();
  }

  const handleSubmitAnswer = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      stop(); // Stop timer

      // Stop recording and get the data
      const { base64 } = await stopRecording();

      // Prepare answer data
      const answerData = {
        interview_id: interviewId,
        question_id: currentQuestion.id,
        audio_data: base64,
        answer_text: '', // Can add speech-to-text here
      };

      // Submit answer
      const response = await submitAnswer(answerData);

      if (response.completed) {
        // Interview completed
        cleanup();
        navigate(`/interview/${interviewId}/complete`);
      } else {
        // Move to next question
        setQuestionIndex(prev => prev + 1);
        setIsInitialized(false);
        toast.success('Answer submitted!');
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
      toast.error('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  const handleExitInterview = () => {
    setShowExitModal(true);
  };

  const confirmExit = () => {
    cleanup();
    navigate('/candidate/interviews');
  };

  const cleanup = () => {
    stop();
    stopWebcam();
    if (isRecording) {
      stopRecording();
    }
  };

  if (!currentQuestion || !stream) {
    return <Loader fullScreen />;
  }

  return (
    <div className="interview-room">
      <div className="interview-header">
        <div className="interview-info">
          <h2>Interview in Progress</h2>
          <p>{interview?.job_role}</p>
        </div>
        <Button variant="danger" onClick={handleExitInterview}>
          Exit Interview
        </Button>
      </div>

      <div className="interview-content">
        <div className="interview-left">
          <VideoRecorder
            onStreamReady={(s) => {}}
            isRecording={isRecording}
          />

          <div className="video-controls">
            <button
              className={`control-btn ${!audioEnabled ? 'disabled' : ''}`}
              onClick={toggleAudio}
            >
              {audioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
            </button>
            <button
              className={`control-btn ${!videoEnabled ? 'disabled' : ''}`}
              onClick={toggleVideo}
            >
              {videoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
            </button>
          </div>

          <AudioRecorder
            isRecording={isRecording}
            onAudioData={(data) => {}}
          />
        </div>

        <div className="interview-right">
          <div className="question-section">
            <div className="question-header-bar">
              <TimerDisplay
                time={time}
                formatTime={formatTime}
                isWarning={time < 30}
              />
              <ProgressBar
                current={questionIndex + 1}
                total={TOTAL_QUESTIONS}
              />
            </div>

            <QuestionDisplay
              question={currentQuestion}
              questionNumber={questionIndex + 1}
              totalQuestions={TOTAL_QUESTIONS}
            />

            <div className="question-actions">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleSubmitAnswer}
                loading={isSubmitting}
                disabled={!isRecording}
              >
                <Send size={20} />
                Submit Answer & Continue
              </Button>
            </div>

            <div className="interview-tips">
              <h4>Tips:</h4>
              <ul>
                <li>Speak clearly and confidently</li>
                <li>Take your time to think before answering</li>
                <li>Be specific with examples</li>
                <li>Maintain eye contact with the camera</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title="Exit Interview?"
        size="sm"
      >
        <div className="exit-modal-content">
          <p>Are you sure you want to exit the interview?</p>
          <p className="warning-text">
            Your progress will be lost and you'll need to restart.
          </p>
          <div className="modal-actions">
            <Button
              variant="secondary"
              onClick={() => setShowExitModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmExit}
            >
              Exit Interview
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InterviewRoom;