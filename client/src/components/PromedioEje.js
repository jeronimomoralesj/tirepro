import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import './RevenueUpdates.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, ChartDataLabels);

const PromedioEje = ({ tires, onSelectEje, selectedEje }) => {
  const [averageDepthData, setAverageDepthData] = useState([]);

  useEffect(() => {
    const calculateAverageDepthByEje = (tires) => {
      const ejeGroups = {};

      tires.forEach((tire) => {
        const eje = tire.eje || 'Unknown';
        const proact = parseFloat(tire.proact) || 0;

        if (!ejeGroups[eje]) {
          ejeGroups[eje] = { totalProact: 0, count: 0 };
        }

        ejeGroups[eje].totalProact += proact;
        ejeGroups[eje].count += 1;
      });

      return Object.entries(ejeGroups).map(([eje, data]) => ({
        eje,
        averageProact: data.count ? (data.totalProact / data.count).toFixed(2) : 0,
      }));
    };

    setAverageDepthData(calculateAverageDepthByEje(tires));
  }, [tires]);

  const data = {
    labels: averageDepthData.map((item) => item.eje),
    datasets: [
      {
        data: averageDepthData.map((item) => parseFloat(item.averageProact)),
        backgroundColor: averageDepthData.map((item) =>
          item.eje === selectedEje ? '#4A90E2' : '#8F93FF'
        ),
        borderRadius: 10,
        barPercentage: 0.6,
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
      datalabels: {
        color: '#1a202c',
        anchor: 'end',
        align: 'end',
        offset: -20,
        font: {
          size: 12,
          weight: 'bold',
        },
        formatter: (value) => `${value}`,
      },
    },
    scales: {
      x: {
        display: true,
        ticks: {
          color: '#1a202c',
          font: {
            size: 12,
            weight: '500',
          },
        },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        max: 25,
        ticks: {
          stepSize: 5,
          color: '#A0AEC0',
          font: {
            size: 10,
          },
        },
        grid: {
          color: 'rgba(160, 174, 192, 0.3)',
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const eje = data.labels[index];
        onSelectEje(eje === selectedEje ? null : eje); // Toggle selection
      }
    },
  };

  return (
    <div className="revenue-updates-card">
      <h3 className="revenue-updates-title">Promedio Profundidad Por Eje</h3>
      <div className="chart-container">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default PromedioEje;
