import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from './context/AuthContext';
import { Loader } from './components/common/Loader/Loader';

// Public Pages
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import NotFoundPage from './pages/NotFound/NotFoundPage';

// Candidate Pages
import CandidateDashboard from './pages/Candidate/CandidateDashboard';
import CandidateProfile from './pages/Candidate/CandidateProfile';
import InterviewHistory from './pages/Candidate/InterviewHistory';

// Interview Pages
import InterviewLobby from './pages/Interview/InterviewLobby';
import InterviewRoom from './pages/Interview/InterviewRoom';
import InterviewComplete from './pages/Interview/InterviewComplete';

// Company Pages
import CompanyDashboard from './pages/Company/CompanyDashboard';
import InterviewsManagement from './pages/Company/InterviewsManagement';
import CandidatesList from './pages/Company/CandidatesList';
import EvaluationDetails from './pages/Company/EvaluationDetails';
import CreateInterview from './pages/Company/CreateInterview';

// Layout
import { DashboardLayout } from './components/layout/DashboardLayout/DashboardLayout';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuthContext();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Candidate Routes */}
      <Route
        path="/candidate"
        element={
          <ProtectedRoute requiredRole="candidate">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<CandidateDashboard />} />
        <Route path="profile" element={<CandidateProfile />} />
        <Route path="interviews" element={<InterviewHistory />} />
      </Route>

      {/* Interview Routes */}
      <Route
        path="/interview/:id/lobby"
        element={
          <ProtectedRoute requiredRole="candidate">
            <InterviewLobby />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview/:id/room"
        element={
          <ProtectedRoute requiredRole="candidate">
            <InterviewRoom />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview/:id/complete"
        element={
          <ProtectedRoute requiredRole="candidate">
            <InterviewComplete />
          </ProtectedRoute>
        }
      />

      {/* Company Routes */}
      <Route
        path="/company"
        element={
          <ProtectedRoute requiredRole="company">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<CompanyDashboard />} />
        <Route path="interviews" element={<InterviewsManagement />} />
        <Route path="candidates" element={<CandidatesList />} />
        <Route path="evaluation/:id" element={<EvaluationDetails />} />
        <Route path="create-interview" element={<CreateInterview />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;