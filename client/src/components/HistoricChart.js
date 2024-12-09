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

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const HistoricChart = ({ tires }) => {
  const [lastSixtyDaysData, setLastSixtyDaysData] = useState([]);
  const [selectedData, setSelectedData] = useState('proact'); // Default field
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Process historical data and average values for each day
  const processHistoricData = (tires, field) => {
    const groupedData = {};

    tires.forEach((tire) => {
      if (tire[field]) {
        tire[field].forEach((entry) => {
          const key = `${entry.day}-${entry.month}-${entry.year}`;
          if (!groupedData[key]) {
            groupedData[key] = { sum: 0, count: 0 };
          }
          groupedData[key].sum += Number(entry.value) || 0;
          groupedData[key].count += 1;
        });
      }
    });

    const averagedData = Object.entries(groupedData)
      .map(([key, { sum, count }]) => {
        const [day, month, year] = key.split('-').map(Number);
        return {
          day,
          month,
          year,
          value: count > 0 ? sum / count : null,
        };
      })
      .filter((data) => data.value !== null) // Skip dates without data
      .sort((a, b) => {
        const dateA = new Date(a.year, a.month - 1, a.day);
        const dateB = new Date(b.year, b.month - 1, b.day);
        return dateA - dateB; // Sort ascending
      });

    return averagedData.slice(-60); // Limit to the last 60 days
  };

  // Fetch processed data whenever tires or selected field changes
  useEffect(() => {
    const processedData = processHistoricData(tires, selectedData);
    setLastSixtyDaysData(processedData);
  }, [tires, selectedData]);

  const chartData = {
    labels: lastSixtyDaysData.map((data) => `${data.day}/${data.month}/${data.year}`),
    datasets: [
      {
        label: selectedData.charAt(0).toUpperCase() + selectedData.slice(1),
        data: lastSixtyDaysData.map((data) => data.value),
        borderColor: '#4A90E2',
        backgroundColor: 'rgba(74, 144, 226, 0.2)',
        fill: true,
        tension: lastSixtyDaysData.length === 1 ? 0 : 0.4, // Disable curve for a single point
        borderWidth: 2,
        pointRadius: lastSixtyDaysData.length === 1 ? 8 : 3, // Larger point for single data
        pointBackgroundColor: '#4A90E2',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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
        radius: lastSixtyDaysData.length === 1 ? 8 : 3, // Emphasize single point
        backgroundColor: lastSixtyDaysData.length === 1 ? '#FF5733' : '#4A90E2', // Unique color for single point
      },
    },
  };

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  const handleDataSelect = (field) => {
    setSelectedData(field);
    setDropdownOpen(false); // Close the dropdown after selection
  };

  return (
    <div className="historic-chart-card">
      <h2 className="historic-chart-title">Datos Históricos (Últimos 60 datos)</h2>

      {/* Dropdown to select data field */}
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

      {/* Display Line Chart */}
      <div className="chart-container">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default HistoricChart;
