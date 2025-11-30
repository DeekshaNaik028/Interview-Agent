import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { candidateService } from '@/api';
import { Card } from '@/components/common/Card/Card';
import { Button } from '@/components/common/Button/Button';
import { Input } from '@/components/common/Input/Input';
import { Alert } from '@/components/common/Alert/Alert';
import { Loader } from '@/components/common/Loader/Loader';
import { User, Briefcase, Award, GraduationCap } from 'lucide-react';
import { validatePhone } from '@/utils/validators';
import './CandidateProfile.css';

const CandidateProfile = () => {
  const { user, updateUser } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    job_role: '',
    skills: [],
    experience_years: 0,
    education: '',
    previous_roles: [],
    certifications: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await candidateService.getProfile();
      setProfile({
        full_name: data.full_name,
        phone: data.phone,
        job_role: data.job_role,
        skills: data.resume_data?.skills || [],
        experience_years: data.resume_data?.experience_years || 0,
        education: data.resume_data?.education || '',
        previous_roles: data.resume_data?.previous_roles || [],
        certifications: data.resume_data?.certifications || [],
      });
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSkillsChange = (e) => {
    const skillsArray = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
    setProfile((prev) => ({ ...prev, skills: skillsArray }));
  };

  const validate = () => {
    const newErrors = {};

    if (!profile.full_name || profile.full_name.length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }

    if (!profile.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(profile.phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    if (!profile.job_role) {
      newErrors.job_role = 'Job role is required';
    }

    if (profile.skills.length === 0) {
      newErrors.skills = 'At least one skill is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validate()) return;

    try {
      setSaving(true);

      const updateData = {
        full_name: profile.full_name,
        phone: profile.phone,
        job_role: profile.job_role,
        resume_data: {
          skills: profile.skills,
          experience_years: parseInt(profile.experience_years),
          education: profile.education,
          previous_roles: profile.previous_roles,
          certifications: profile.certifications,
        },
      };

      const updatedProfile = await candidateService.updateProfile(updateData);
      updateUser(updatedProfile);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="candidate-profile">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p className="profile-subtitle">Manage your personal information</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && (
        <Alert type="success" message={success} onClose={() => setSuccess('')} />
      )}

      <form onSubmit={handleSubmit}>
        <Card title="Personal Information" className="profile-section">
          <div className="form-section">
            <div className="section-icon">
              <User size={24} />
            </div>
            <div className="form-fields">
              <div className="form-grid">
                <Input
                  label="Full Name"
                  name="full_name"
                  value={profile.full_name}
                  onChange={handleChange}
                  error={errors.full_name}
                  required
                />
                <Input
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  required
                />
              </div>
              <Input
                label="Email"
                value={user?.email}
                disabled
                placeholder="Email cannot be changed"
              />
            </div>
          </div>
        </Card>

        <Card title="Professional Information" className="profile-section">
          <div className="form-section">
            <div className="section-icon">
              <Briefcase size={24} />
            </div>
            <div className="form-fields">
              <Input
                label="Current Job Role"
                name="job_role"
                value={profile.job_role}
                onChange={handleChange}
                error={errors.job_role}
                placeholder="e.g., Software Engineer"
                required
              />
              <Input
                label="Years of Experience"
                name="experience_years"
                type="number"
                value={profile.experience_years}
                onChange={handleChange}
                min="0"
                max="50"
                required
              />
            </div>
          </div>
        </Card>

        <Card title="Skills & Expertise" className="profile-section">
          <div className="form-section">
            <div className="section-icon">
              <Award size={24} />
            </div>
            <div className="form-fields">
              <div className="input-wrapper">
                <label className="input-label">Skills *</label>
                <textarea
                  className="textarea-field"
                  value={profile.skills.join(', ')}
                  onChange={handleSkillsChange}
                  placeholder="JavaScript, React, Node.js, Python (comma separated)"
                  rows="3"
                />
                {errors.skills && (
                  <span className="input-error-message">{errors.skills}</span>
                )}
              </div>
              {profile.skills.length > 0 && (
                <div className="skills-display">
                  {profile.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card title="Education" className="profile-section">
          <div className="form-section">
            <div className="section-icon">
              <GraduationCap size={24} />
            </div>
            <div className="form-fields">
              <Input
                label="Education"
                name="education"
                value={profile.education}
                onChange={handleChange}
                placeholder="e.g., Bachelor's in Computer Science"
                required
              />
            </div>
          </div>
        </Card>

        <div className="profile-actions">
          <Button type="submit" size="lg" loading={saving}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CandidateProfile;