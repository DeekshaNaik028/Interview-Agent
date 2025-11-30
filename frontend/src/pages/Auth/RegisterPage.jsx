import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/common/Button/Button';
import { Input } from '@/components/common/Input/Input';
import { Alert } from '@/components/common/Alert/Alert';
import { validateEmail, validatePassword, validatePhone } from '@/utils/validators';
import './AuthPages.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    job_role: '',
    skills: '',
    experience_years: '',
    education: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register } = useAuthContext();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.full_name || formData.full_name.length < 2) {
      newErrors.full_name = 'Full name is required (min 2 characters)';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    if (!formData.job_role) {
      newErrors.job_role = 'Job role is required';
    }

    if (!formData.skills) {
      newErrors.skills = 'At least one skill is required';
    }

    if (!formData.experience_years || formData.experience_years < 0) {
      newErrors.experience_years = 'Valid experience years required';
    }

    if (!formData.education) {
      newErrors.education = 'Education is required';
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
      
      const registerData = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone: formData.phone,
        job_role: formData.job_role,
        resume_data: {
          skills: formData.skills.split(',').map(s => s.trim()),
          experience_years: parseInt(formData.experience_years),
          education: formData.education,
          previous_roles: [],
          certifications: [],
        },
      };

      await register(registerData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <Alert
              type="success"
              message="Registration successful! Redirecting to login..."
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Create Account</h1>
            <p>Register as a candidate</p>
          </div>

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-grid">
              <Input
                label="Full Name"
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                error={errors.full_name}
                required
              />

              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />

              <Input
                label="Phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                required
              />

              <Input
                label="Job Role"
                type="text"
                name="job_role"
                value={formData.job_role}
                onChange={handleChange}
                error={errors.job_role}
                placeholder="e.g., Software Engineer"
                required
              />

              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
              />
            </div>

            <Input
              label="Skills"
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              error={errors.skills}
              placeholder="JavaScript, React, Node.js (comma separated)"
              required
            />

            <div className="form-grid">
              <Input
                label="Experience (years)"
                type="number"
                name="experience_years"
                value={formData.experience_years}
                onChange={handleChange}
                error={errors.experience_years}
                min="0"
                required
              />

              <Input
                label="Education"
                type="text"
                name="education"
                value={formData.education}
                onChange={handleChange}
                error={errors.education}
                placeholder="e.g., Bachelor's in CS"
                required
              />
            </div>

            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
            >
              Register
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;