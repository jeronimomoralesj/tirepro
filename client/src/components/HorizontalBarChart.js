import React, { useEffect, useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import './HorizontalBarChart.css';

const HorizontalBarChart = ({ tires, selectedBrand, onSelectBrand }) => {
  // Memoize chartData calculation
  const chartData = useMemo(() => {
    const groupedByMarca = tires.reduce((acc, tire) => {
      acc[tire.marca] = (acc[tire.marca] || 0) + 1;
      return acc;
    }, {});

    // Sort brands by frequency
    const sortedBrands = Object.entries(groupedByMarca)
      .sort((a, b) => b[1] - a[1])
      .reduce(
        (acc, [marca, count]) => {
          acc.labels.push(marca);
          acc.data.push(count);
          return acc;
        },
        { labels: [], data: [] }
      );

    // If a brand is selected, only show data for that brand
    if (selectedBrand && groupedByMarca[selectedBrand]) {
      return {
        labels: [selectedBrand],
        data: [groupedByMarca[selectedBrand]],
      };
    }

    return sortedBrands;
  }, [tires, selectedBrand]);

  // Define chart data for Bar component
  const data = useMemo(
    () => ({
      labels: chartData.labels,
      datasets: [
        {
          data: chartData.data,
          backgroundColor: chartData.labels.map(
            (label) => (label === selectedBrand ? '#4A90E2' : '#8F93FF')
          ),
          borderRadius: 10,
          barPercentage: 0.8,
          categoryPercentage: 0.6,
        },
      ],
    }),
    [chartData, selectedBrand]
  );

  // Options configuration with optimizations
  const options = {
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => `${context.raw} llantas`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: '#A0AEC0', font: { size: 10 } },
        grid: { color: 'rgba(160, 174, 192, 0.3)' },
      },
      y: {
        ticks: { color: '#1a202c', font: { size: 12, weight: '500' } },
        grid: { display: false },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const brand = data.labels[index];
        onSelectBrand(brand === selectedBrand ? null : brand);
      }
    },
  };

  return (
    <div className="horizontal-bar-chart-card">
      <h3 className="horizontal-bar-chart-title">Por marca</h3>
      <div className="chart-container" style={{ height: '400px' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default HorizontalBarChart;
