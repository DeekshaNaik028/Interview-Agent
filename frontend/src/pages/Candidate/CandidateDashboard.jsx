import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { candidateService } from '@/api';
import { Card } from '@/components/common/Card/Card';
import { Button } from '@/components/common/Button/Button';
import { Loader } from '@/components/common/Loader/Loader';
import { Alert } from '@/components/common/Alert/Alert';
import {
  Video,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  TrendingUp,
  Award,
} from 'lucide-react';
import { formatDate, formatTimeAgo, getStatusColor } from '@/utils/formatters';
import { INTERVIEW_STATUS } from '@/utils/constants';
import './CandidateDashboard.css';

const CandidateDashboard = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const data = await candidateService.getInterviews();
      setInterviews(data);
      calculateStats(data);
    } catch (err) {
      setError('Failed to load interviews');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    setStats({
      total: data.length,
      pending: data.filter((i) => i.status === INTERVIEW_STATUS.PENDING).length,
      inProgress: data.filter((i) => i.status === INTERVIEW_STATUS.IN_PROGRESS).length,
      completed: data.filter((i) => i.status === INTERVIEW_STATUS.COMPLETED).length,
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case INTERVIEW_STATUS.COMPLETED:
        return <CheckCircle size={20} className="status-icon success" />;
      case INTERVIEW_STATUS.IN_PROGRESS:
        return <Clock size={20} className="status-icon progress" />;
      case INTERVIEW_STATUS.CANCELLED:
        return <XCircle size={20} className="status-icon cancelled" />;
      default:
        return <Calendar size={20} className="status-icon pending" />;
    }
  };

  const handleStartInterview = (interviewId) => {
    navigate(`/interview/${interviewId}/lobby`);
  };

  const handleViewDetails = (interviewId) => {
    navigate(`/candidate/interviews`);
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="candidate-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.full_name}!</h1>
          <p className="dashboard-subtitle">Here's your interview overview</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/candidate/profile')}>
          Edit Profile
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Stats Cards */}
      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon total">
              <Video size={24} />
            </div>
            <div className="stat-details">
              <p className="stat-label">Total Interviews</p>
              <h3 className="stat-value">{stats.total}</h3>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon pending">
              <Calendar size={24} />
            </div>
            <div className="stat-details">
              <p className="stat-label">Pending</p>
              <h3 className="stat-value">{stats.pending}</h3>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon progress">
              <Clock size={24} />
            </div>
            <div className="stat-details">
              <p className="stat-label">In Progress</p>
              <h3 className="stat-value">{stats.inProgress}</h3>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon completed">
              <CheckCircle size={24} />
            </div>
            <div className="stat-details">
              <p className="stat-label">Completed</p>
              <h3 className="stat-value">{stats.completed}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Interviews */}
      <Card title="Recent Interviews" className="recent-interviews">
        {interviews.length === 0 ? (
          <div className="empty-state">
            <Video size={48} />
            <p>No interviews yet</p>
            <p className="empty-subtitle">
              Your scheduled interviews will appear here
            </p>
          </div>
        ) : (
          <div className="interviews-list">
            {interviews.slice(0, 5).map((interview) => (
              <div key={interview.id} className="interview-item">
                <div className="interview-icon">
                  {getStatusIcon(interview.status)}
                </div>
                <div className="interview-details">
                  <h4>{interview.job_role}</h4>
                  <p className="interview-meta">
                    Created {formatTimeAgo(interview.created_at)}
                  </p>
                </div>
                <div className="interview-status">
                  <span className={`status-badge ${getStatusColor(interview.status)}`}>
                    {interview.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="interview-actions">
                  {interview.status === INTERVIEW_STATUS.PENDING && (
                    <Button
                      size="sm"
                      onClick={() => handleStartInterview(interview.id)}
                    >
                      Start
                    </Button>
                  )}
                  {interview.status === INTERVIEW_STATUS.IN_PROGRESS && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleStartInterview(interview.id)}
                    >
                      Continue
                    </Button>
                  )}
                  {interview.status === INTERVIEW_STATUS.COMPLETED && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(interview.id)}
                    >
                      View
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {interviews.length > 5 && (
          <div className="card-footer-action">
            <Button
              variant="outline"
              onClick={() => navigate('/candidate/interviews')}
            >
              View All Interviews
            </Button>
          </div>
        )}
      </Card>

      {/* Quick Tips */}
      <Card title="Interview Tips" className="tips-card">
        <div className="tips-grid">
          <div className="tip-item">
            <Award className="tip-icon" />
            <div>
              <h4>Be Prepared</h4>
              <p>Research the company and practice common questions</p>
            </div>
          </div>
          <div className="tip-item">
            <TrendingUp className="tip-icon" />
            <div>
              <h4>Stay Confident</h4>
              <p>Speak clearly and maintain eye contact with the camera</p>
            </div>
          </div>
          <div className="tip-item">
            <Clock className="tip-icon" />
            <div>
              <h4>Manage Time</h4>
              <p>Be concise but thorough in your answers</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CandidateDashboard;