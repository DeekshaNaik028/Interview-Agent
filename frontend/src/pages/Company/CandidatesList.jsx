import React, { useState, useEffect } from 'react';
import { companyService } from '@/api';
import { Card } from '@/components/common/Card/Card';
import { Loader } from '@/components/common/Loader/Loader';
import { Users, Mail, Phone, Briefcase } from 'lucide-react';
import './CandidatesList.css';

const CandidatesList = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const interviews = await companyService.getInterviews();
      
      // Extract unique candidates
      const uniqueCandidates = {};
      interviews.forEach((interview) => {
        if (!uniqueCandidates[interview.candidate_id]) {
          uniqueCandidates[interview.candidate_id] = {
            id: interview.candidate_id,
            name: interview.candidate_name,
            email: interview.candidate_email,
            interviews: [],
          };
        }
        uniqueCandidates[interview.candidate_id].interviews.push(interview);
      });

      setCandidates(Object.values(uniqueCandidates));
    } catch (err) {
      console.error('Failed to load candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="candidates-list-page">
      <div className="page-header">
        <div>
          <h1>Candidates</h1>
          <p className="page-subtitle">View all interviewed candidates</p>
        </div>
      </div>

      <div className="candidates-grid">
        {candidates.map((candidate) => (
          <Card key={candidate.id} className="candidate-card" hoverable>
            <div className="candidate-card-header">
              <div className="candidate-avatar-large">
                {candidate.name.charAt(0)}
              </div>
              <h3>{candidate.name}</h3>
            </div>
            <div className="candidate-card-body">
              <div className="candidate-info-item">
                <Mail size={18} />
                <span>{candidate.email}</span>
              </div>
              <div className="candidate-info-item">
                <Briefcase size={18} />
                <span>{candidate.interviews.length} Interview(s)</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CandidatesList;