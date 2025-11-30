import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/common/Button/Button';
import './InterviewComplete.css';

const InterviewComplete = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="interview-complete">
      <div className="complete-container">
        <CheckCircle size={80} className="success-icon" />
        <h1>Interview Completed!</h1>
        <p>
          Thank you for completing the interview. Your responses have been
          recorded and will be reviewed by our team.
        </p>
        <p className="info-text">
          We will get back to you with the results soon.
        </p>
        <Button
          size="lg"
          onClick={() => navigate('/candidate/interviews')}
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default InterviewComplete;
