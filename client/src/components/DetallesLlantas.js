import React from 'react';
import './DetallesLlantas.css';

const DetallesLlantas = ({ filteredTires }) => {
  return (
    <div className="detalles-llantas-container">
      <table className="detalles-llantas-table">
        <thead>
          <tr>
            <th>Placa</th>
            <th>Posición</th>
            <th>Marca</th>
            <th>Diseño</th>
            <th>Dimensión</th>
            <th>Banda</th>
            <th>Profundidad</th>
            <th>Km REC</th>
            <th>Costo</th>
            <th>CPK</th>
          </tr>
        </thead>
        <tbody>
          {filteredTires.length > 0 ? (
            filteredTires.map((tire, index) => (
              <tr key={index}>
                <td>{tire.placa}</td>
                <td>{tire.pos}</td>
                <td>{tire.marca}</td>
                <td>{tire.diseno}</td>
                <td>{tire.dimension}</td>
                <td>{tire.banda}</td>
                <td>{tire.proact}</td>
                <td>{tire.kms}</td>
                <td>{tire.costo}</td>
                <td>{tire.eje}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DetallesLlantas;
