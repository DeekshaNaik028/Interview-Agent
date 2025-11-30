import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyService } from '@/api';
import { Card } from '@/components/common/Card/Card';
import { Button } from '@/components/common/Button/Button';
import { Input } from '@/components/common/Input/Input';
import { Alert } from '@/components/common/Alert/Alert';
import { ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import './CreateInterview.css';

const CreateInterview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    candidate_id: '',
    candidate_email: '',
    job_role: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.candidate_id) {
      newErrors.candidate_id = 'Candidate ID is required';
    }

    if (!formData.job_role || formData.job_role.length < 2) {
      newErrors.job_role = 'Job role is required (min 2 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    try {
      setLoading(true);

      const interviewData = {
        candidate_id: formData.candidate_id,
        job_role: formData.job_role,
        notes: formData.notes,
      };

      const interview = await companyService.createInterview(interviewData);

      toast.success('Interview created successfully!');
      navigate(`/company/evaluation/${interview.id}`);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to create interview';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-interview">
      <div className="page-header">
        <Button
          variant="outline"
          onClick={() => navigate('/company/interviews')}
        >
          <ArrowLeft size={20} />
          Back
        </Button>
        <h1>Create New Interview</h1>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <Card>
        <form onSubmit={handleSubmit} className="create-interview-form">
          <div className="form-section-block">
            <h3>Candidate Information</h3>
            <p className="form-description">
              Enter the candidate ID. The candidate must be registered in the system.
            </p>

            <Input
              label="Candidate ID"
              name="candidate_id"
              value={formData.candidate_id}
              onChange={handleChange}
              error={errors.candidate_id}
              placeholder="Enter candidate ID"
              required
            />

            <Input
              label="Candidate Email (Optional)"
              name="candidate_email"
              type="email"
              value={formData.candidate_email}
              onChange={handleChange}
              placeholder="candidate@example.com"
            />
          </div>

          <div className="form-section-block">
            <h3>Interview Details</h3>
            <p className="form-description">
              Specify the job role and any additional notes for this interview.
            </p>

            <Input
              label="Job Role"
              name="job_role"
              value={formData.job_role}
              onChange={handleChange}
              error={errors.job_role}
              placeholder="e.g., Senior Software Engineer"
              required
            />

            <div className="input-wrapper">
              <label className="input-label">Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any special instructions or notes..."
                className="textarea-field"
                rows="4"
              />
            </div>
          </div>

          <div className="form-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/company/interviews')}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              <Plus size={20} />
              Create Interview
            </Button>
          </div>
        </form>
      </Card>

      {/* Info Card */}
      <Card className="info-card">
        <h4>📋 Interview Process</h4>
        <ol className="process-list">
          <li>Enter the candidate's ID and job role</li>
          <li>Questions will be automatically generated based on the role</li>
          <li>Candidate receives notification to start the interview</li>
          <li>After completion, evaluation is generated automatically</li>
          <li>Review the evaluation and make hiring decisions</li>
        </ol>
      </Card>
    </div>
  );
};

export default CreateInterview;