import React, { useMemo } from 'react';
import './ProgressBar.css';

const ProgressBar = ({ tires }) => {
  const progress = useMemo(() => {
    const progressValues = tires.map((tire) => {
      const proactHistory = Array.isArray(tire.proact) ? tire.proact : [];
      if (proactHistory.length === 0) return null;

      const lastProactEntry = proactHistory[proactHistory.length - 1];
      const proactValue = parseFloat(lastProactEntry?.value);

      if (isNaN(proactValue)) return null;

      // Calculate progress for this tire
      return ((16 - proactValue) / 16) * 100;
    });

    // Filter out null values and calculate the average
    const validProgressValues = progressValues.filter((value) => value !== null);
    if (validProgressValues.length === 0) return 0;

    const totalProgress = validProgressValues.reduce((sum, value) => sum + value, 0);
    return (totalProgress / validProgressValues.length).toFixed(2);
  }, [tires]);

  return (
    <div className="progress-bar-card">
      <h3 className="progress-bar-title">Tanque Por Milímetro</h3>
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
      </div>
      <span className="progress-percentage">{progress}%</span>
    </div>
  );
};

export default ProgressBar;
