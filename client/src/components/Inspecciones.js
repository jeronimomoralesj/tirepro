import React, { useState, useEffect } from 'react';
import './SimpleTable.css';

const Inspecciones = ({ tires }) => {
  const [expiredInspections, setExpiredInspections] = useState([]);
  const [showExpiredOnly, setShowExpiredOnly] = useState(false);
  const [totalTires, setTotalTires] = useState(0);

  // Helper function to strip time from a date
  const stripTime = (date) => {
    const strippedDate = new Date(date);
    strippedDate.setHours(0, 0, 0, 0); // Set time to 00:00:00
    return strippedDate;
  };

  // Calculate expired inspections and total tires
  useEffect(() => {
    const currentDate = stripTime(new Date());
    const expired = tires.filter((tire) => {
      const lastInspectionDate = stripTime(new Date(tire.ultima_inspeccion));
      return lastInspectionDate < currentDate; // Compare only dates, ignoring time
    });

    setExpiredInspections(expired);
    setTotalTires(tires.length);
  }, [tires]);

  // Format the date to a readable format
  const formatDate = (isoDateString) => {
    if (!isoDateString) return 'N/A';
    const date = new Date(isoDateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="inspecciones-container">
      {/* Summary Section */}
      <div className="summary-container">
        <div className="summary-card">
          <h3>Total Llantas</h3>
          <p>{totalTires}</p>
        </div>
        <div className="summary-card">
          <h3>Inspecciones Vencidas</h3>
          <p>{expiredInspections.length}</p>
        </div>
      </div>

      {/* Filter Button */}
      <button
        className="filter-expired-btn"
        onClick={() => setShowExpiredOnly(!showExpiredOnly)}
      >
        {showExpiredOnly ? 'Mostrar Todas' : 'Filtrar por Vencidas'}
      </button>

      {/* Table Section */}
      <div className="table-container">
        <h2>Lista de Inspecciones</h2>
        <table className="simple-table">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Llanta</th>
              <th>Marca</th>
              <th>Última Inspección</th>
            </tr>
          </thead>
          <tbody>
            {(showExpiredOnly ? expiredInspections : tires).map((tire, index) => (
              <tr key={index}>
                <td>{tire.placa}</td>
                <td>{tire.llanta}</td>
                <td>{tire.marca}</td>
                <td
                  className={
                    stripTime(new Date(tire.ultima_inspeccion)) < stripTime(new Date())
                      ? 'date-past'
                      : 'date-future'
                  }
                >
                  {formatDate(tire.ultima_inspeccion)}
                </td>
              </tr>
            ))}
            {tires.length === 0 && (
              <tr className="no-data-row">
                <td colSpan="4">No hay datos disponibles</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inspecciones;
