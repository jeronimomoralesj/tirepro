import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './SalesOverview.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const TipoVehiculo = ({ tires, onSelectVehicleType, selectedVehicleType }) => {
  // Memoize the vehicle type counts to improve performance
  const vehicleCounts = useMemo(() => {
    const counts = tires.reduce((acc, tire) => {
      const vehicleType = tire.tipovhc || 'Unknown';
      acc[vehicleType] = (acc[vehicleType] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([type, count]) => ({ type, count }));
  }, [tires]);

  // Memoize chart data to prevent unnecessary recalculations
  const data = useMemo(() => ({
    labels: vehicleCounts.map((item) => item.type),
    datasets: [
      {
        data: vehicleCounts.map((item) => item.count),
        backgroundColor: ['#4a90e2', '#3ed6a2', '#f4a261', '#e76f51', '#c94c4c', '#8ac6d1'],
        borderWidth: 0,
        cutout: '70%',
      },
    ],
  }), [vehicleCounts]);

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
        const selectedType = data.labels[index];
        onSelectVehicleType(selectedType === selectedVehicleType ? null : selectedType);
      }
    },
  };

  return (
    <div className="sales-overview-card">
      <h3 className="sales-overview-title">Tipo de Vehículo</h3>
      <div className="chart-container">
        <Doughnut data={data} options={options} />
      </div>
      <div className="sales-overview-legend">
        {data.labels.map((label, index) => (
          <div
            className="legend-item"
            key={index}
            onClick={() => onSelectVehicleType(label === selectedVehicleType ? null : label)}
            style={{
              fontWeight: label === selectedVehicleType ? 'bold' : 'normal',
              color: label === selectedVehicleType ? '#4a90e2' : '#000',
              cursor: 'pointer',
            }}
          >
            <span
              className="legend-color"
              style={{ backgroundColor: data.datasets[0].backgroundColor[index] }}
            ></span>
            <span>{label}</span>
            <span className="legend-value">({data.datasets[0].data[index]})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TipoVehiculo;
