import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  ClipboardList,
  Settings,
  Video,
} from 'lucide-react';
import { USER_ROLES, ROUTES } from '@/utils/constants';
import { useAuthContext } from '@/context/AuthContext';
import './Sidebar.css';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuthContext();

  const candidateLinks = [
    { to: ROUTES.CANDIDATE_DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
    { to: ROUTES.CANDIDATE_INTERVIEWS, icon: Video, label: 'My Interviews' },
    { to: ROUTES.CANDIDATE_PROFILE, icon: Settings, label: 'Profile' },
  ];

  const companyLinks = [
    { to: ROUTES.COMPANY_DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
    { to: ROUTES.COMPANY_INTERVIEWS, icon: Video, label: 'Interviews' },
    { to: ROUTES.COMPANY_CANDIDATES, icon: Users, label: 'Candidates' },
    { to: ROUTES.COMPANY_CREATE_INTERVIEW, icon: FileText, label: 'Create Interview' },
  ];

  const links = user?.role === USER_ROLES.CANDIDATE ? candidateLinks : companyLinks;

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <nav className="sidebar-nav">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
              onClick={onClose}
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};