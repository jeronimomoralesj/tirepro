import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './SalesOverview.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const PorVida = ({ tires, onSelectVida, selectedVida }) => {
  const [vidaCounts, setVidaCounts] = useState([]);

  useEffect(() => {
    const groupByVida = (tires) => {
      const counts = tires.reduce((acc, tire) => {
        const vida = tire.vida || 'Unknown';
        acc[vida] = (acc[vida] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(counts).map(([vida, count]) => ({ vida, count }));
    };

    setVidaCounts(groupByVida(tires));
  }, [tires]);

  const data = {
    labels: vidaCounts.map((item) => item.vida),
    datasets: [
      {
        data: vidaCounts.map((item) => item.count),
        backgroundColor: ['#4a90e2', '#3ed6a2', '#f4a261', '#e76f51', '#c94c4c', '#8ac6d1'],
        borderWidth: 0,
        cutout: '70%',
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const vida = data.labels[index];
        onSelectVida(vida === selectedVida ? null : vida); // Toggle selection
      }
    },
  };

  return (
    <div className="sales-overview-card">
      <h3 className="sales-overview-title">Por Vida</h3>
      <div className="chart-container">
        <Doughnut data={data} options={options} />
      </div>
      <div className="sales-overview-legend">
        {data.labels.map((label, index) => (
          <div
            className="legend-item"
            key={index}
            onClick={() => onSelectVida(label === selectedVida ? null : label)} // Toggle selection
            style={{
              cursor: 'pointer',
              fontWeight: label === selectedVida ? 'bold' : 'normal',
            }}
          >
            <span
              className="legend-color"
              style={{
                backgroundColor: data.datasets[0].backgroundColor[index],
                opacity: label === selectedVida ? 1 : 0.6, // Highlight selected segment
              }}
            ></span>
            <span>{label}</span>
            <span className="legend-value">({data.datasets[0].data[index]})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PorVida;
