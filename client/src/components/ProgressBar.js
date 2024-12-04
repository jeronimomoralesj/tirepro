import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import './ProgressBar.css';

const ProgressBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found.');
          return;
        }

        const decodedToken = jwtDecode(token);
        const userId = decodedToken?.user?.id;

        if (!userId) {
          console.error('User ID not found in token');
          return;
        }

        const response = await axios.get(
          `https://tirepro.onrender.com/api/tires/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const tires = response.data;

        const averageProgress = calculateAverageProgress(tires);
        setProgress(averageProgress);
      } catch (error) {
        console.error('Error fetching tire data:', error);
      }
    };

    fetchProgressData();
  }, []);

  const calculateAverageProgress = (tires) => {
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
  };

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
