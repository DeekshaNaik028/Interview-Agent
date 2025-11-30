import React from 'react';
import clsx from 'clsx';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import './Alert.css';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export const Alert = ({ type = 'info', message, onClose, className }) => {
  const Icon = icons[type];

  return (
    <div className={clsx('alert', `alert-${type}`, className)}>
      <div className="alert-content">
        <Icon size={20} className="alert-icon" />
        <span className="alert-message">{message}</span>
      </div>
      {onClose && (
        <button className="alert-close" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
};
