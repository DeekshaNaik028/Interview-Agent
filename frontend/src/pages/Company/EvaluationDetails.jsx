import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { companyService } from '@/api';
import { Card } from '@/components/common/Card/Card';
import { Button } from '@/components/common/Button/Button';
import { Loader } from '@/components/common/Loader/Loader';
import { Alert } from '@/components/common/Alert/Alert';
import { ArrowLeft, TrendingUp, Award, MessageSquare } from 'lucide-react';
import { formatScore, getScoreColor, formatDate } from '@/utils/formatters';
import './EvaluationDetails.css';

const EvaluationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvaluation();
  }, [id]);

  const fetchEvaluation = async () => {
    try {
      setLoading(true);
      const data = await companyService.getEvaluation(id);
      setEvaluation(data);
    } catch (err) {
      setError('Failed to load evaluation');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (error) {
    return (
      <div className="evaluation-error">
        <Alert type="error" message={error} />
        <Button onClick={() => navigate('/company/interviews')}>
          Back to Interviews
        </Button>
      </div>
    );
  }

  if (!evaluation) {
    return null;
  }

  return (
    <div className="evaluation-details">
      <div className="evaluation-header">
        <Button
          variant="outline"
          onClick={() => navigate('/company/interviews')}
        >
          <ArrowLeft size={20} />
          Back
        </Button>
        <h1>Interview Evaluation</h1>
      </div>

      {/* Candidate Info */}
      <Card className="candidate-info-card">
        <div className="info-grid">
          <div>
            <p className="info-label">Candidate</p>
            <h3>{evaluation.candidate_name}</h3>
          </div>
          <div>
            <p className="info-label">Job Role</p>
            <h3>{evaluation.job_role}</h3>
          </div>
          <div>
            <p className="info-label">Date</p>
            <h3>{formatDate(evaluation.created_at)}</h3>
          </div>
        </div>
      </Card>

      {/* Scores */}
      <div className="scores-grid">
        <Card>
          <div className="score-card-content">
            <TrendingUp size={32} className="score-icon overall" />
            <div>
              <p className="score-label">Overall Score</p>
              <h2 className={`score-value ${getScoreColor(evaluation.overall_score)}`}>
                {formatScore(evaluation.overall_score)}
              </h2>
            </div>
          </div>
        </Card>
        <Card>
          <div className="score-card-content">
            <Award size={32} className="score-icon technical" />
            <div>
              <p className="score-label">Technical Score</p>
              <h2 className={`score-value ${getScoreColor(evaluation.technical_score)}`}>
                {formatScore(evaluation.technical_score)}
              </h2>
            </div>
          </div>
        </Card>
        <Card>
          <div className="score-card-content">
            <MessageSquare size={32} className="score-icon hr" />
            <div>
              <p className="score-label">HR Score</p>
              <h2 className={`score-value ${getScoreColor(evaluation.hr_score)}`}>
                {formatScore(evaluation.hr_score)}
              </h2>
            </div>
          </div>
        </Card>
      </div>

      {/* Summary & Recommendation */}
      <Card title="Summary">
        <p className="summary-text">{evaluation.summary}</p>
        <div className="recommendation-box">
          <strong>Recommendation:</strong> {evaluation.recommendation}
        </div>
      </Card>

      {/* Question Evaluations */}
      <Card title="Question-by-Question Analysis">
        <div className="questions-list">
          {evaluation.question_evaluations?.map((qe, index) => (
            <div key={qe.question_id} className="question-evaluation">
              <div className="question-header">
                <h4>Question {index + 1}</h4>
                <span className={`question-score ${getScoreColor(qe.overall_score)}`}>
                  {formatScore(qe.overall_score)}
                </span>
              </div>
              <p className="question-text">{qe.question_text}</p>
              <div className="criteria-scores">
                <div className="criteria-item">
                  <span>Accuracy:</span>
                  <span>{formatScore(qe.criteria_scores.accuracy)}</span>
                </div>
                <div className="criteria-item">
                  <span>Relevance:</span>
                  <span>{formatScore(qe.criteria_scores.relevance)}</span>
                </div>
                <div className="criteria-item">
                  <span>Communication:</span>
                  <span>{formatScore(qe.criteria_scores.communication)}</span>
                </div>
                <div className="criteria-item">
                  <span>Clarity:</span>
                  <span>{formatScore(qe.criteria_scores.clarity)}</span>
                </div>
                <div className="criteria-item">
                  <span>Confidence:</span>
                  <span>{formatScore(qe.criteria_scores.confidence)}</span>
                </div>
              </div>
              <div className="feedback-box">
                <strong>Feedback:</strong>
                <p>{qe.feedback}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default EvaluationDetails;