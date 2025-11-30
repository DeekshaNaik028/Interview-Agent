import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Menu } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { ROUTES } from '@/utils/constants';
import './Header.css';

export const Header = ({ onMenuToggle }) => {
  const { user, logout, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          {onMenuToggle && (
            <button className="menu-toggle" onClick={onMenuToggle}>
              <Menu size={24} />
            </button>
          )}
          <Link to={ROUTES.HOME} className="header-logo">
     <img src="/logo.svg" alt="Interview Agent" style={{ height: '40px' }} />
   </Link>
        </div>

        <nav className="header-nav">
          {isAuthenticated ? (
            <div className="header-user">
              <div className="user-info">
                <User size={20} />
                <span>{user?.full_name || user?.company_name}</span>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={20} />
                Logout
              </button>
            </div>
          ) : (
            <div className="header-actions">
              <Link to={ROUTES.LOGIN} className="header-link">
                Login
              </Link>
              <Link to={ROUTES.REGISTER} className="header-btn">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
