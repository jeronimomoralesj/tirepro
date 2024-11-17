import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './SalesOverview.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const SemaforoPie = ({ tires, onSelectCondition, selectedCondition }) => {
  const [tireCounts, setTireCounts] = useState({ buenEstado: 0, dias30: 0, dias60: 0, cambioInmediato: 0 });

  const classifyTires = (tires) => {
    const counts = { buenEstado: 0, dias30: 0, dias60: 0, cambioInmediato: 0 };

    tires.forEach((tire) => {
      // Get the latest depth values
      const latestProfundidadInt = tire.profundidad_int?.at(-1)?.value || 0;
      const latestProfundidadCen = tire.profundidad_cen?.at(-1)?.value || 0;
      const latestProfundidadExt = tire.profundidad_ext?.at(-1)?.value || 0;

      const minDepth = Math.min(latestProfundidadInt, latestProfundidadCen, latestProfundidadExt);

      // Classify based on the minimum depth value
      if (minDepth > 7) counts.buenEstado++;
      else if (minDepth > 6) counts.dias60++;
      else if (minDepth > 5) counts.dias30++;
      else counts.cambioInmediato++;
    });

    return counts;
  };

  useEffect(() => {
    setTireCounts(classifyTires(tires));
  }, [tires]);

  const conditions = ['buenEstado', 'dias30', 'dias60', 'cambioInmediato'];
  const conditionLabels = ['Buen estado', '30 Dias', '60 Dias', 'Cambio Inmediato'];
  const backgroundColors = ['#8edf34', '#ff9e00', '#4895ef', '#f72585'];

  // Filter out zero values and prepare the chart data
  const chartData = selectedCondition
    ? conditions.map((condition, index) =>
        condition === selectedCondition ? tireCounts[condition] : 0
      )
    : conditions.map((condition) => tireCounts[condition]);

  const displayData = chartData.filter((value) => value > 0);
  const displayLabels = conditionLabels.filter((_, index) => chartData[index] > 0);
  const displayColors = backgroundColors.filter((_, index) => chartData[index] > 0);

  const data = {
    labels: displayLabels,
    datasets: [
      {
        data: displayData,
        backgroundColor: displayColors,
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
    onClick: (_, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const selected = conditions[conditionLabels.indexOf(displayLabels[index])];
        onSelectCondition(selected === selectedCondition ? null : selected);
      }
    },
  };

  return (
    <div className="sales-overview-card">
      <h3 className="sales-overview-title">Semáforo</h3>
      <div className="chart-container">
        <Doughnut data={data} options={options} />
      </div>
      <div className="sales-overview-legend">
        {conditionLabels.map((label, index) => (
          <div
            className="legend-item"
            key={index}
            onClick={() =>
              onSelectCondition(conditions[index] === selectedCondition ? null : conditions[index])
            }
            style={{
              opacity:
                selectedCondition && conditions[index] !== selectedCondition ? 0.3 : 1,
            }}
          >
            <span
              className="legend-color"
              style={{
                backgroundColor: backgroundColors[index],
              }}
            ></span>
            <span>{label}</span>
            <span className="legend-value">({tireCounts[conditions[index]]})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SemaforoPie;