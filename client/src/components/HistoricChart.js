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

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const HistoricChart = ({ tires }) => {
  const [lastFiftyDaysData, setLastFiftyDaysData] = useState([]);
  const [selectedData, setSelectedData] = useState(['proact']); // Default selection is 'proact'
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
        return dateB - dateA; // Sort descending
      });

    return averagedData.slice(-50); // Limit to the last 50 days
  };

  // Fetch processed data whenever tires or selected fields change
  useEffect(() => {
    const processedData = selectedData.map((field) => processHistoricData(tires, field));
    setLastFiftyDaysData(processedData);
  }, [tires, selectedData]);

  const chartData = {
    labels: lastFiftyDaysData[0]?.map((data) => `${data.day}/${data.month}/${data.year}`) || [],
    datasets: selectedData.map((dataField, index) => ({
      label: dataField.charAt(0).toUpperCase() + dataField.slice(1),
      data: lastFiftyDaysData[index]?.map((data) => data.value) || [],
      borderColor: `rgb(${index * 50 + 50}, ${index * 60 + 100}, ${index * 70 + 150})`,
      backgroundColor: `rgba(${index * 50 + 50}, ${index * 60 + 100}, ${index * 70 + 150}, 0.2)`,
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 0,
    })),
  };

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  const handleDataSelect = (field) => {
    setSelectedData((prevSelectedData) => {
      if (prevSelectedData.includes(field)) {
        return prevSelectedData.filter((item) => item !== field);
      }
      return [...prevSelectedData, field];
    });
  };

  // Helper to get spaced points for summary display
  const spacedPoints = lastFiftyDaysData.map((dataset) =>
    dataset.filter((_, index) => index % Math.ceil(dataset.length / 3) === 0)
  );

  return (
    <div className="horizontal-bar-chart-card">
      <h2 className="horizontal-bar-chart-title">Datos Históricos (Últimos 50 Días - Promedio por Día)</h2>

      {/* Dropdown to toggle data fields */}
      <div className="data-selection">
        <button className="data-selection-btn" onClick={toggleDropdown}>
          Escoger Elementos
        </button>
        {dropdownOpen && (
          <div className="dropdown-menu">
            {['proact', 'kilometraje_actual', 'profundidad_int', 'profundidad_cen', 'profundidad_ext', 'cpk', 'cpk_proy'].map((field) => (
              <div key={field} className="dropdown-item">
                <input
                  type="checkbox"
                  id={field}
                  checked={selectedData.includes(field)}
                  onChange={() => handleDataSelect(field)}
                />
                <label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Display Line Chart */}
      <div className="chart-container">
        <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>

      {/* Display spaced points */}
      <div className="proact-result">
        <h4>Puntos Espaciados:</h4>
        <ul>
          {spacedPoints[0]?.map((data, index) => (
            <li key={index}>
              Día: {data.day}/{data.month}/{data.year} - Valor: {data.value !== null && !isNaN(data.value) ? data.value.toFixed(2) : 'N/A'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HistoricChart;
