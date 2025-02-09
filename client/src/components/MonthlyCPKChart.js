import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './MonthlyCPKChart.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const MonthlyCPKChart = () => {
  const [cpkData, setCpkData] = useState([]);

  useEffect(() => {
    const fetchCPKData = async () => {
      try {
        const token = localStorage.getItem('token');
        const decoded = jwtDecode(token);
        const companyId = decoded.user.companyId;  // Get companyId from token

        console.log(`Attempting to update CPK data for company ${companyId}`);

        // Trigger update in backend
        await axios.post('https://tirepro.onrender.com/api/historics/update', { company: companyId });

        // Fetch updated CPK data for the company
        const response = await axios.get(`https://tirepro.onrender.com/api/historics/company/${companyId}`);
        const sortedData = response.data.cpk_mes
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5)
          .reverse();

        setCpkData(sortedData);
        console.log("Fetched CPK data:", sortedData);
      } catch (error) {
        console.error("Error fetching CPK data:", error);
      }
    };

    fetchCPKData();
  }, []);

  const chartData = {
    labels: cpkData.map(entry => `${entry.month}/${entry.year}`),
    datasets: [
      {
        label: 'CPK',
        data: cpkData.map(entry => entry.cpk),
        borderColor: '#4A90E2',
        backgroundColor: 'rgba(74, 144, 226, 0.2)',
        pointBackgroundColor: '#fff',
        pointBorderColor: '#4A90E2',
        pointBorderWidth: 2,
        pointRadius: 5,
        fill: true,
        tension: 0.4, // Smooth the line
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false }, // Hide legend to match example
      tooltip: {
        callbacks: {
          label: (context) => `CPK: ${context.parsed.y}`,
        },
        backgroundColor: '#1f1f1f',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 4,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#888' }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f0f0f0' },
        ticks: { color: '#888' }
      }
    }
  };

  return (
    <div className="chart-container">
      <h3>Monthly CPK Analytics</h3>
      <div className="chart-wrapper">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default MonthlyCPKChart;
