import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import './RevenueUpdates.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, ChartDataLabels);

const PromedioEje = ({ tires, onSelectEje, selectedEje }) => {
  const isDarkMode = document.documentElement.classList.contains('dark-mode');

  // Use memoization to calculate average depths by "eje" only when `tires` changes
  const averageDepthData = useMemo(() => {
    const ejeGroups = {};

    tires.forEach((tire) => {
      const eje = tire.eje || '';

      const latestProactEntry = tire.proact?.length
        ? tire.proact[tire.proact.length - 1].value
        : 0;

      if (!ejeGroups[eje]) {
        ejeGroups[eje] = { totalProact: 0, count: 0 };
      }

      ejeGroups[eje].totalProact += latestProactEntry;
      ejeGroups[eje].count += 1;
    });

    return Object.entries(ejeGroups).map(([eje, data]) => ({
      eje,
      averageProact: data.count ? (data.totalProact / data.count).toFixed(2) : 0,
    }));
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
      tooltip: {
        enabled: true,
        callbacks: {
          label: (tooltipItem) => `${tooltipItem.raw}`,
        },
        backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
        titleColor: isDarkMode ? '#ffffff' : '#1a202c',
        bodyColor: isDarkMode ? '#ffffff' : '#1a202c',
        borderColor: isDarkMode ? '#ffffff' : '#1a202c',
        borderWidth: 1,
      },
      datalabels: {
        color: isDarkMode ? '#ffffff' : '#1a202c',
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
          color: isDarkMode ? '#ffffff' : '#1a202c',
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
          color: isDarkMode ? '#ffffff' : '#A0AEC0',
          font: {
            size: 10,
          },
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(160, 174, 192, 0.3)',
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const eje = data.labels[index];
        onSelectEje(eje === selectedEje ? null : eje);
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
