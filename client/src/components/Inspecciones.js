import React, { useMemo } from 'react';
import './SimpleTable.css';

const Inspecciones = ({ tires, showExpiredOnly, onToggleExpiredFilter }) => {
  // Memoize filtered inspections to avoid recalculating on each render
  const filteredInspections = useMemo(() => (
    showExpiredOnly
      ? tires.filter((tire) => new Date(tire.proyeccion_fecha) < new Date())
      : tires
  ), [tires, showExpiredOnly]);

  // Helper to format date in a readable format
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
    <div className="table-container">
      <h2>Inspecciones</h2>
      <button className="filter-expired-btn" onClick={onToggleExpiredFilter}>
        {showExpiredOnly ? 'Todas' : 'Filtrar por vencidos'}
      </button>
      <table className="simple-table">
        <thead>
          <tr>
            <th>Placa</th>
            <th>Llanta</th>
            <th>Marca</th>
            <th>Proyección Fecha</th>
          </tr>
        </thead>
        <tbody>
          {filteredInspections.length > 0 ? (
            filteredInspections.map((tire, index) => (
              <tr key={index}>
                <td>{tire.placa}</td>
                <td>{tire.llanta}</td>
                <td>{tire.marca}</td>
                <td className={new Date(tire.proyeccion_fecha) < new Date() ? 'date-past' : 'date-future'}>
                  {formatDate(tire.proyeccion_fecha)}
                </td>
              </tr>
            ))
          ) : (
            <tr className="no-data-row">
              <td colSpan="4">No data</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Inspecciones;
