import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import './HistoricChart.css';
import ChartDataLabels from 'chartjs-plugin-datalabels';
ChartJS.register(ChartDataLabels);
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const HistoricChart = ({ tires }) => {
  const [chartDataPoints, setChartDataPoints] = useState([]);
  const [selectedData, setSelectedData] = useState('proact');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const processHistoricData = (tires, field) => {
    const groupedByDate = {};
    const lastValues = {};
  
    // Group all entries by date and keep only the last value for each tire on that day
    tires.forEach((tire) => {
      if (tire[field]) {
        tire[field].forEach((entry) => {
          const key = `${entry.year}-${entry.month}-${entry.day}`;
          if (!groupedByDate[key]) groupedByDate[key] = {};
  
          // Keep only the last value of the day for this tire
          groupedByDate[key][tire._id] = entry.value;
        });
      }
    });
  
    // Sort dates and process missing values
    const sortedDates = Object.keys(groupedByDate)
      .map((key) => {
        const [year, month, day] = key.split('-').map(Number);
        return new Date(year, month - 1, day);
      })
      .sort((a, b) => a - b);
  
    const processedData = [];
  
    sortedDates.forEach((date) => {
      const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      const dayData = groupedByDate[key];
  
      // Carry forward last known values for each tire
      Object.entries(dayData).forEach(([tireId, value]) => {
        lastValues[tireId] = value;
      });
  
      // Compute the average value for this day and round to 2 decimal places
      const averageValue =
        Object.values(lastValues).reduce((sum, value) => sum + Number(value), 0) /
        Object.keys(lastValues).length;
  
      processedData.push({
        date,
        value: parseFloat(averageValue.toFixed(2)), // Round to 2 decimals
      });
    });
  
    // Return the last 60 (or fewer if there are less) entries
    return processedData.slice(-60);
  };
  

  useEffect(() => {
    const processedData = processHistoricData(tires, selectedData);
    setChartDataPoints(processedData);
  }, [tires, selectedData]);

  const chartData = {
    labels: chartDataPoints.map(
      (data) =>
        `${data.date.getDate()}/${data.date.getMonth() + 1}/${data.date.getFullYear()}`
    ),
    datasets: [
      {
        label: selectedData.charAt(0).toUpperCase() + selectedData.slice(1),
        data: chartDataPoints.map((data) => data.value),
        borderColor: '#4A90E2',
        backgroundColor: 'rgba(74, 144, 226, 0.2)',
        fill: true,
        tension: chartDataPoints.length === 1 ? 0 : 0.4,
        borderWidth: 2,
        pointRadius: chartDataPoints.map((_, index) =>
          index === 0 || index === Math.floor(chartDataPoints.length / 2) || index === chartDataPoints.length - 1
            ? 6 // Larger radius for selected points
            : 3
        ),
        pointBackgroundColor: chartDataPoints.map((_, index) =>
          index === 0 || index === Math.floor(chartDataPoints.length / 2) || index === chartDataPoints.length - 1
            ? '#FF5733' // Highlight selected points
            : '#4A90E2'
        ),
      },
    ],
  };
  

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            return `${context.dataset.label}: ${value.toFixed(2)}`;
          },
        },
        displayColors: false,
      },
      datalabels: {
        align: 'top',
        anchor: 'end',
        offset: 10,
        formatter: (value, context) => {
          const index = context.dataIndex;
          const dataLength = context.dataset.data.length;
          if (index === 0 || index === Math.floor(dataLength / 2) || index === dataLength - 1) {
            return value.toFixed(2); // Display label for first, middle, and last points
          }
          return ''; // No label for other points
        },
        font: {
          size: 10,
          weight: 'bold',
        },
        color: '#333',
      },
    },
    scales: {
      x: {
        ticks: { color: '#A0AEC0' },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#A0AEC0' },
        grid: {
          color: 'rgba(160, 174, 192, 0.3)',
        },
      },
    },
    elements: {
      point: {
        radius: chartDataPoints.length === 1 ? 8 : 3,
        backgroundColor: chartDataPoints.length === 1 ? '#FF5733' : '#4A90E2',
      },
    },
  };
  
  
  

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  const handleDataSelect = (field) => {
    setSelectedData(field);
    setDropdownOpen(false);
  };

  return (
    <div className="historic-chart-card">
      <h2 className="historic-chart-title">Datos Históricos (Últimos 60 entradas)</h2>

      <div className="data-selection">
        <button className="data-selection-btn" onClick={toggleDropdown}>
          {selectedData.charAt(0).toUpperCase() + selectedData.slice(1)} ▼
        </button>
        {dropdownOpen && (
          <div className="dropdown-menu">
            {['proact', 'kilometraje_actual', 'profundidad_int', 'profundidad_cen', 'profundidad_ext', 'cpk', 'cpk_proy'].map((field) => (
              <div
                key={field}
                className={`dropdown-item ${field === selectedData ? 'active' : ''}`}
                onClick={() => handleDataSelect(field)}
              >
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="chart-container">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default HistoricChart;
