// ProgressBar.js
import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ progress }) => {
  return (
    <div className="progress-bar-card">
      <h3 className="progress-bar-title">Tanque Por Milimetro</h3>
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
      </div>
      <span className="progress-percentage">{progress}%</span>
    </div>
  );
};

export default ProgressBar;
