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
                <td>{tire.pos.at(-1)?.value || 'Unknown'}</td> {/* Latest position */}
                <td>{tire.marca}</td>
                <td>{tire.diseno}</td>
                <td>{tire.dimension}</td>
                <td>{tire.banda}</td>
                <td>{tire.proact.at(-1)?.value || 'N/A'}</td> {/* Latest profundidad */}
                <td>{tire.kms.at(-1)?.value || 'N/A'}</td> {/* Latest Km REC */}
                <td>{tire.costo}</td>
                <td>{tire.cpk.at(-1)?.value || 'N/A'}</td> {/* Latest CPK */}
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
