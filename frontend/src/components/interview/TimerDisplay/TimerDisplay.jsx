import React from 'react';
import { Clock } from 'lucide-react';
import './TimerDisplay.css';

export const TimerDisplay = ({ time, formatTime, isWarning = false }) => {
  return (
    <div className={`timer-display ${isWarning ? 'timer-warning' : ''}`}>
      <Clock size={20} />
      <span className="timer-text">{formatTime()}</span>
    </div>
  );
};