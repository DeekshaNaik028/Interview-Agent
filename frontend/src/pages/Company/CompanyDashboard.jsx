import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyService } from '@/api';
import { Card } from '@/components/common/Card/Card';
import { Button } from '@/components/common/Button/Button';
import { Loader } from '@/components/common/Loader/Loader';
import { Alert } from '@/components/common/Alert/Alert';
import {
  Users,
  Video,
  CheckCircle,
  TrendingUp,
  Clock,
  Calendar,
  Plus,
  Eye,
} from 'lucide-react';
import { formatDate, formatScore, getScoreColor } from '@/utils/formatters';
import './CompanyDashboard.css';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalInterviews: 0,
    totalCandidates: 0,
    pendingEvaluations: 0,
    avgScore: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [interviewsData, evaluationsData] = await Promise.all([
        companyService.getInterviews(),
        companyService.getEvaluationSummary(),
      ]);

      setInterviews(interviewsData);
      setEvaluations(evaluationsData);
      calculateStats(interviewsData, evaluationsData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (interviewsData, evaluationsData) => {
    const uniqueCandidates = new Set(interviewsData.map((i) => i.candidate_id));
    const completed = interviewsData.filter((i) => i.status === 'completed');
    const avgScore =
      evaluationsData.length > 0
        ? evaluationsData.reduce((acc, e) => acc + e.overall_score, 0) /
          evaluationsData.length
        : 0;

    setStats({
      totalInterviews: interviewsData.length,
      totalCandidates: uniqueCandidates.size,
      pendingEvaluations: completed.length - evaluationsData.length,
      avgScore: avgScore.toFixed(2),
    });
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="company-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Company Dashboard</h1>
          <p className="dashboard-subtitle">Manage interviews and evaluate candidates</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/company/create-interview')}
        >
          <Plus size={20} />
          Create Interview
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Stats Cards */}
      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon total">
              <Video size={28} />
            </div>
            <div className="stat-details">
              <p className="stat-label">Total Interviews</p>
              <h3 className="stat-value">{stats.totalInterviews}</h3>
              <p className="stat-change">All time</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon candidates">
              <Users size={28} />
            </div>
            <div className="stat-details">
              <p className="stat-label">Candidates</p>
              <h3 className="stat-value">{stats.totalCandidates}</h3>
              <p className="stat-change">Unique candidates</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon pending">
              <Clock size={28} />
            </div>
            <div className="stat-details">
              <p className="stat-label">Pending Evaluations</p>
              <h3 className="stat-value">{stats.pendingEvaluations}</h3>
              <p className="stat-change">Needs review</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon score">
              <TrendingUp size={28} />
            </div>
            <div className="stat-details">
              <p className="stat-label">Average Score</p>
              <h3 className={`stat-value ${getScoreColor(stats.avgScore)}`}>
                {formatScore(stats.avgScore)}
              </h3>
              <p className="stat-change">Overall performance</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="dashboard-grid">
        {/* Recent Interviews */}
        <Card title="Recent Interviews" className="recent-section">
          {interviews.length === 0 ? (
            <div className="empty-state-small">
              <Video size={40} />
              <p>No interviews yet</p>
            </div>
          ) : (
            <div className="interviews-list-compact">
              {interviews.slice(0, 5).map((interview) => (
                <div key={interview.id} className="interview-item-compact">
                  <div className="interview-info">
                    <h4>{interview.candidate_name}</h4>
                    <p className="interview-role">{interview.job_role}</p>
                    <p className="interview-meta">
                      {formatDate(interview.created_at)}
                    </p>
                  </div>
                  <div className="interview-action">
                    <span className={`status-badge-sm ${interview.status}`}>
                      {interview.status}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate(`/company/evaluation/${interview.id}`)
                      }
                    >
                      <Eye size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {interviews.length > 5 && (
            <div className="section-footer">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/company/interviews')}
              >
                View All
              </Button>
            </div>
          )}
        </Card>

        {/* Top Candidates */}
        <Card title="Top Performers" className="top-candidates-section">
          {evaluations.length === 0 ? (
            <div className="empty-state-small">
              <Users size={40} />
              <p>No evaluations yet</p>
            </div>
          ) : (
            <div className="candidates-list">
              {evaluations
                .sort((a, b) => b.overall_score - a.overall_score)
                .slice(0, 5)
                .map((evaluation, index) => (
                  <div key={evaluation.interview_id} className="candidate-item">
                    <div className="candidate-rank">#{index + 1}</div>
                    <div className="candidate-info">
                      <h4>{evaluation.candidate_name || 'Candidate'}</h4>
                      <p className="candidate-role">{evaluation.job_role}</p>
                    </div>
                    <div className="candidate-score">
                      <span
                        className={`score-badge ${getScoreColor(
                          evaluation.overall_score
                        )}`}
                      >
                        {formatScore(evaluation.overall_score)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions" className="quick-actions-card">
        <div className="quick-actions-grid">
          <button
            className="quick-action-btn"
            onClick={() => navigate('/company/create-interview')}
          >
            <Plus size={24} />
            <span>Create Interview</span>
          </button>
          <button
            className="quick-action-btn"
            onClick={() => navigate('/company/candidates')}
          >
            <Users size={24} />
            <span>View Candidates</span>
          </button>
          <button
            className="quick-action-btn"
            onClick={() => navigate('/company/interviews')}
          >
            <Video size={24} />
            <span>All Interviews</span>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default CompanyDashboard;