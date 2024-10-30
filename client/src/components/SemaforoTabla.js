import React, { useEffect, useState } from 'react';
import './EconomicTable.css';

const SemaforoTabla = ({ filteredTires, onTireSelect, selectedTire }) => {
  const [tableData, setTableData] = useState({});
  const [uniquePlacas, setUniquePlacas] = useState([]);
  const [uniquePositions, setUniquePositions] = useState([]);

  useEffect(() => {
    const groupedData = {};
    const placas = new Set();
    const positions = new Set();

    filteredTires.forEach((tire) => {
      const { placa, pos, proact } = tire;
      placas.add(placa);
      positions.add(pos);

      if (!groupedData[placa]) {
        groupedData[placa] = {};
      }
      groupedData[placa][pos] = proact;
    });

    setTableData(groupedData);
    setUniquePlacas(Array.from(placas));
    setUniquePositions(Array.from(positions).sort((a, b) => a - b));
  }, [filteredTires]);

  const getCellColor = (proact) => {
    if (proact <= 5) return 'red-cell';
    if (proact > 5 && proact <= 10) return 'yellow-cell';
    return 'green-cell';
  };

  return (
    <div className="economic-table-container">
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
