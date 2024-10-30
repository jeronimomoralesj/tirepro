// Inspecciones.js
import React from 'react';
import './SimpleTable.css';

const Inspecciones = ({ tires, showExpiredOnly, onToggleExpiredFilter }) => {
  const filteredInspections = showExpiredOnly
    ? tires.filter((tire) => new Date(tire.proyeccion_fecha) < new Date())
    : tires;

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="table-container">
      <h2>Inspecciones</h2>
      <button className="filter-expired-btn" onClick={onToggleExpiredFilter}>
        {showExpiredOnly ? 'Show All Inspections' : 'Show Expired Inspections Only'}
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
                  {tire.proyeccion_fecha ? formatDate(tire.proyeccion_fecha) : 'N/A'}
                </td>
              </tr>
            ))
          ) : (
            <tr className="no-data-row">
              <td colSpan="4">No inspection data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Inspecciones;
