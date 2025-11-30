import React from 'react';
import './ProgressBar.css';

export const ProgressBar = ({ current, total, showLabel = true }) => {
  const percentage = (current / total) * 100;

  return (
    <div className="progress-bar-container">
      {showLabel && (
        <div className="progress-label">
          <span>Progress</span>
          <span>{current} / {total}</span>
        </div>
      )}
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
