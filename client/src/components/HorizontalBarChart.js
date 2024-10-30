import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import './HorizontalBarChart.css';

const HorizontalBarChart = ({ tires, selectedBrand, onSelectBrand }) => {
  const [chartData, setChartData] = useState({ labels: [], data: [] });

  useEffect(() => {
    const groupedByMarca = tires.reduce((acc, tire) => {
      acc[tire.marca] = (acc[tire.marca] || 0) + 1;
      return acc;
    }, {});

    const allBrandsData = {
      labels: Object.keys(groupedByMarca),
      data: Object.values(groupedByMarca),
    };

    setChartData(
      selectedBrand && groupedByMarca[selectedBrand]
        ? { labels: [selectedBrand], data: [groupedByMarca[selectedBrand]] }
        : allBrandsData
    );
  }, [tires, selectedBrand]);

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        data: chartData.data,
        backgroundColor: chartData.labels.map(
          (label) => (label === selectedBrand ? '#4A90E2' : '#8F93FF')
        ),
        borderRadius: 10,
        barPercentage: 0.6,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { beginAtZero: true, ticks: { color: '#A0AEC0', font: { size: 10 } }, grid: { color: 'rgba(160, 174, 192, 0.3)' } },
      y: { ticks: { color: '#1a202c', font: { size: 12, weight: '500' } }, grid: { display: false } },
    },
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, element) => {
      if (element.length > 0) {
        const index = element[0].index;
        const brand = data.labels[index];
        onSelectBrand(brand === selectedBrand ? null : brand);
      }
    },
  };

  return (
    <div className="horizontal-bar-chart-card">
      <h3 className="horizontal-bar-chart-title">Total Count by Marca</h3>
      <div className="chart-container">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default HorizontalBarChart;
