import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyService } from '@/api';
import { Card } from '@/components/common/Card/Card';
import { Button } from '@/components/common/Button/Button';
import { Loader } from '@/components/common/Loader/Loader';
import { Search, Filter, Eye, Download, Plus } from 'lucide-react';
import { formatDate, getStatusColor } from '@/utils/formatters';
import './InterviewsManagement.css';

const InterviewsManagement = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const data = await companyService.getInterviews();
      setInterviews(data);
    } catch (err) {
      console.error('Failed to load interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterInterviews = () => {
    let filtered = [...interviews];

    if (searchTerm) {
      filtered = filtered.filter(
        (i) =>
          i.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.job_role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((i) => i.status === statusFilter);
    }

    setFilteredInterviews(filtered);
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="interviews-management">
      <div className="page-header">
        <div>
          <h1>Interviews Management</h1>
          <p className="page-subtitle">Manage and review all interviews</p>
        </div>
        <Button onClick={() => navigate('/company/create-interview')}>
          <Plus size={20} />
          Create Interview
        </Button>
      </div>

      <Card className="filters-section">
        <div className="filters-row">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by candidate or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </Card>

      <Card>
        <div className="table-container">
          <table className="interviews-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Job Role</th>
                <th>Date</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInterviews.map((interview) => (
                <tr key={interview.id}>
                  <td>
                    <div className="candidate-cell">
                      <div className="candidate-avatar">
                        {interview.candidate_name.charAt(0)}
                      </div>
                      <div>
                        <div className="candidate-name">
                          {interview.candidate_name}
                        </div>
                        <div className="candidate-email">
                          {interview.candidate_email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{interview.job_role}</td>
                  <td>{formatDate(interview.created_at)}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(interview.status)}`}>
                      {interview.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    {interview.current_question_index !== undefined && (
                      <div className="progress-cell">
                        <div className="progress-bar-mini">
                          <div
                            className="progress-fill-mini"
                            style={{
                              width: `${(interview.current_question_index / 13) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="progress-text-mini">
                          {interview.current_question_index}/13
                        </span>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default InterviewsManagement;
