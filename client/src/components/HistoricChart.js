import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const HistoricChart = ({ tires }) => {
  const [lastFiveMonths, setLastFiveMonths] = useState([]);
  const [selectedData, setSelectedData] = useState(['proact']); // Default selection is 'proact'
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getLastFiveMonthsData = (tires, field) => {
    let monthMap = {};

    // Collect data from all tires based on the selected field
    tires.forEach((tire) => {
      if (tire[field] && tire[field].length > 0) {
        tire[field].forEach((data) => {
          const monthYearKey = `${data.month}-${data.year}`;

          // Initialize the month key if it doesn't exist
          if (!monthMap[monthYearKey]) {
            monthMap[monthYearKey] = {
              sum: 0,
              count: 0,
            };
          }

          // Add the value and increment the count for this month
          if (!isNaN(data.value)) {
            monthMap[monthYearKey].sum += data.value;
            monthMap[monthYearKey].count += 1;
          }
        });
      }
    });

    // Convert the month map to an array of objects and calculate the average for each month
    const sortedData = Object.keys(monthMap).map((key) => {
      const [month, year] = key.split('-');
      const { sum, count } = monthMap[key];

      const averageValue = count > 0 ? sum / count : null; // Calculate the average for the month

      return { month: parseInt(month), year: parseInt(year), value: averageValue };
    }).sort((a, b) => {
      const dateA = new Date(a.year, a.month - 1); // month is 1-based
      const dateB = new Date(b.year, b.month - 1);
      return dateB - dateA; // descending order
    });

    return sortedData.slice(0, 5);
  };

  useEffect(() => {
    const recentData = selectedData.map(field => getLastFiveMonthsData(tires, field));
    setLastFiveMonths(recentData);
  }, [tires, selectedData]);

  const chartData = {
    labels: lastFiveMonths[0]?.map((data) => `${data.month}/${data.year}`) || [],
    datasets: selectedData.map((dataField, index) => ({
      label: dataField.charAt(0).toUpperCase() + dataField.slice(1),
      data: lastFiveMonths[index]?.map((data) => data.value) || [],
      borderColor: `rgb(${index * 50 + 50}, ${index * 60 + 100}, ${index * 70 + 150})`,
      backgroundColor: `rgba(${index * 50 + 50}, ${index * 60 + 100}, ${index * 70 + 150}, 0.2)`,
      fill: true,
      tension: 0.4, // Curvy line
      borderWidth: 2,
      pointRadius: 0, // Remove points on the line
    })),
  };

  const toggleDropdown = () => setDropdownOpen(prev => !prev);

  const handleDataSelect = (field) => {
    setSelectedData((prevSelectedData) => {
      if (prevSelectedData.includes(field)) {
        return prevSelectedData.filter(item => item !== field);
      }
      return [...prevSelectedData, field];
    });
  };

  return (
    <div className="horizontal-bar-chart-card">
      <h2 className="horizontal-bar-chart-title">Datos Históricos (Últimos 5 Meses - Todos los Neumáticos)</h2>

      {/* Button to toggle data selection dropdown */}
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

      {/* Display Chart */}
      <div className="chart-container">
        <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>

      {/* Display Last 5 Months and Their Selected Values */}
      <div className="proact-result">
        <h4>Últimos 5 Meses:</h4>
        <ul>
          {lastFiveMonths[0]?.map((data, index) => (
            <li key={index}>
              Mes: {data.month}/{data.year} - Valor: {data.value !== null && !isNaN(data.value) ? data.value.toFixed(2) : 'N/A'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HistoricChart;
