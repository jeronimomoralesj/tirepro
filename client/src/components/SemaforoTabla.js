import React, { useEffect, useState } from 'react';
import './EconomicTable.css';

const SemaforoTabla = ({ filteredTires, onTireSelect, selectedTire }) => {
  const [tableData, setTableData] = useState({});
  const [uniquePlacas, setUniquePlacas] = useState([]);
  const [uniquePositions, setUniquePositions] = useState([]);
  const [colorCounts, setColorCounts] = useState({ red: 0, yellow: 0, green: 0 });

  useEffect(() => {
    const groupedData = {};
    const placas = new Set();
    const positions = new Set();
    let redCount = 0;
    let yellowCount = 0;
    let greenCount = 0;

    filteredTires.forEach((tire) => {
      const { placa } = tire;
      const pos = tire.pos.at(-1)?.value || 'Unknown'; // Latest position value
      const proact = tire.proact.at(-1)?.value || 0; // Latest proact value

      placas.add(placa);
      positions.add(pos);

      // Count colors based on latest proact values
      if (proact <= 5) redCount++;
      else if (proact > 5 && proact <= 10) yellowCount++;
      else greenCount++;

      if (!groupedData[placa]) {
        groupedData[placa] = {};
      }
      groupedData[placa][pos] = proact;
    });

    setTableData(groupedData);
    setUniquePlacas(Array.from(placas));
    setUniquePositions(Array.from(positions).sort((a, b) => a - b));
    setColorCounts({ red: redCount, yellow: yellowCount, green: greenCount });
  }, [filteredTires]);

  const getCellColor = (proact) => {
    if (proact <= 5) return 'red-cell';
    if (proact > 5 && proact <= 10) return 'yellow-cell';
    return 'green-cell';
  };

  return (
    <div className="economic-table-container">
      {/* Display color counts */}
      <div className="color-counts">
        <span className="color-count red-count">Críticas: {colorCounts.red}</span>
        <span className="color-count yellow-count">Medio: {colorCounts.yellow}</span>
        <span className="color-count green-count">Bien: {colorCounts.green}</span>
      </div>

      <table className="economic-table">
        <thead>
          <tr>
            <th>Semáforo</th>
            {uniquePositions.map((pos) => (
              <th key={pos}>{pos}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {uniquePlacas.map((placa) => (
            <tr key={placa}>
              <td className="economic-index">{placa}</td>
              {uniquePositions.map((pos) => (
                <td
                  key={pos}
                  className={`cell-value ${
                    tableData[placa] &&
                    tableData[placa][pos] !== undefined &&
                    getCellColor(tableData[placa][pos])
                  } ${
                    selectedTire &&
                    selectedTire.placa === placa &&
                    selectedTire.pos === pos
                      ? 'selected-cell' // Highlight selected cell
                      : ''
                  }`}
                  onClick={() => onTireSelect(placa, pos)}
                >
                  {tableData[placa] && tableData[placa][pos] !== undefined
                    ? tableData[placa][pos]
                    : '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SemaforoTabla;
