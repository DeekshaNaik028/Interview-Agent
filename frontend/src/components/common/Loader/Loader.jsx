import React from 'react';
import './Loader.css';

export const Loader = ({ size = 'md', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        <div className={`loader loader-${size}`}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`loader loader-${size}`}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};
