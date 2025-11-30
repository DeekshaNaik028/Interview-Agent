import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { candidateService } from '@/api';
import { Card } from '@/components/common/Card/Card';
import { Button } from '@/components/common/Button/Button';
import { Loader } from '@/components/common/Loader/Loader';
import { Alert } from '@/components/common/Alert/Alert';
import {
  Video,
  Calendar,
  Clock,
  Filter,
  Search,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { formatDate, formatTimeAgo, getStatusColor } from '@/utils/formatters';
import { INTERVIEW_STATUS } from '@/utils/constants';
import './InterviewHistory.css';

const InterviewHistory = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchInterviews();
  }, []);

  useEffect(() => {
    filterInterviews();
  }, [searchTerm, statusFilter, interviews]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const data = await candidateService.getInterviews();
      setInterviews(data);
      setFilteredInterviews(data);
    } catch (err) {
      setError('Failed to load interviews');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterInterviews = () => {
    let filtered = [...interviews];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((interview) =>
        interview.job_role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((interview) => interview.status === statusFilter);
    }

    setFilteredInterviews(filtered);
  };

  const handleStartInterview = (interviewId) => {
    navigate(`/interview/${interviewId}/lobby`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case INTERVIEW_STATUS.COMPLETED:
        return <CheckCircle size={20} className="status-icon-small success" />;
      case INTERVIEW_STATUS.CANCELLED:
        return <XCircle size={20} className="status-icon-small cancelled" />;
      case INTERVIEW_STATUS.IN_PROGRESS:
        return <Clock size={20} className="status-icon-small progress" />;
      default:
        return <Calendar size={20} className="status-icon-small pending" />;
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="interview-history">
      <div className="history-header">
        <div>
          <h1>Interview History</h1>
          <p className="history-subtitle">View all your past and upcoming interviews</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Filters */}
      <Card className="filters-card">
        <div className="filters-container">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by job role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <Filter size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value={INTERVIEW_STATUS.PENDING}>Pending</option>
              <option value={INTERVIEW_STATUS.IN_PROGRESS}>In Progress</option>
              <option value={INTERVIEW_STATUS.COMPLETED}>Completed</option>
              <option value={INTERVIEW_STATUS.CANCELLED}>Cancelled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Interviews List */}
      {filteredInterviews.length === 0 ? (
        <Card className="empty-state-card">
          <div className="empty-state">
            <Video size={64} />
            <h3>No interviews found</h3>
            <p>
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Your interviews will appear here'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="interviews-grid">
          {filteredInterviews.map((interview) => (
            <Card key={interview.id} className="interview-card" hoverable>
              <div className="interview-card-header">
                <div className="interview-title">
                  <Video size={24} className="title-icon" />
                  <div>
                    <h3>{interview.job_role}</h3>
                    <p className="interview-date">
                      {formatDate(interview.created_at)}
                    </p>
                  </div>
                </div>
                <div className="interview-badge">
                  {getStatusIcon(interview.status)}
                </div>
              </div>

              <div className="interview-card-body">
                <div className="interview-info-row">
                  <span className="info-label">Status:</span>
                  <span className={`status-badge ${getStatusColor(interview.status)}`}>
                    {interview.status.replace('_', ' ')}
                  </span>
                </div>

                {interview.started_at && (
                  <div className="interview-info-row">
                    <span className="info-label">Started:</span>
                    <span>{formatTimeAgo(interview.started_at)}</span>
                  </div>
                )}

                {interview.completed_at && (
                  <div className="interview-info-row">
                    <span className="info-label">Completed:</span>
                    <span>{formatTimeAgo(interview.completed_at)}</span>
                  </div>
                )}

                {interview.current_question_index !== undefined && (
                  <div className="progress-info">
                    <span className="info-label">Progress:</span>
                    <div className="mini-progress">
                      <div
                        className="mini-progress-fill"
                        style={{
                          width: `${(interview.current_question_index / 13) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="progress-text">
                      {interview.current_question_index} / 13
                    </span>
                  </div>
                )}
              </div>

              <div className="interview-card-footer">
                {interview.status === INTERVIEW_STATUS.PENDING && (
                  <Button
                    fullWidth
                    onClick={() => handleStartInterview(interview.id)}
                  >
                    Start Interview
                  </Button>
                )}
                {interview.status === INTERVIEW_STATUS.IN_PROGRESS && (
                  <Button
                    fullWidth
                    variant="success"
                    onClick={() => handleStartInterview(interview.id)}
                  >
                    Continue Interview
                  </Button>
                )}
                {interview.status === INTERVIEW_STATUS.COMPLETED && (
                  <Button fullWidth variant="outline" disabled>
                    Completed
                  </Button>
                )}
                {interview.status === INTERVIEW_STATUS.CANCELLED && (
                  <Button fullWidth variant="outline" disabled>
                    Cancelled
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewHistory;