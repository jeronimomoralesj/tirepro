import React, { useState } from 'react';
import './DetallesLlantas.css';

const DetallesLlantas = ({ tires }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter tires based on search term
  const filteredTires = tires.filter((tire) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      tire.llanta?.toString().toLowerCase().includes(lowerCaseSearchTerm) ||
      tire.placa?.toLowerCase().includes(lowerCaseSearchTerm) ||
      tire.marca?.toLowerCase().includes(lowerCaseSearchTerm) ||
      tire.diseno?.toLowerCase().includes(lowerCaseSearchTerm)
    );
  });

  // Helper function for individual CPK
  const calculateCPK = (kms, costo) => (kms > 0 ? costo / kms : 0);

  // Helper function for individual Projected CPK
  const calculateProjectedCPK = (costo, kms, proact) => {
    const projectedKms = proact < 16 ? (kms / (16 - proact)) * 16 : 0;
    return projectedKms > 0 ? costo / projectedKms : 0;
  };

  return (
    <div className="detalles-llantas-container">
      <h2>Detalles de Llantas</h2>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por Llanta, Placa, Marca, etc."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <table className="detalles-llantas-table">
        <thead>
          <tr>
            <th>Llanta</th>
            <th>Placa</th>
            <th>Marca</th>
            <th>Diseño</th>
            <th>Dimensión</th>
            <th>Banda</th>
            <th>Costo</th>
            <th>Vida</th>
            <th>Posición</th>
            <th>Kilómetros</th>
            <th>CPK</th>
            <th>CPK Proy</th>
            <th>Profundidad mínima</th>
            <th>Profundidad interior</th>
            <th>Profundidad exterior</th>
            <th>Profundidad central</th>
            <th>Última Inspección</th>
          </tr>
        </thead>
        <tbody>
          {filteredTires.length > 0 ? (
            filteredTires.map((tire) => {
              const latestPos = tire.pos?.at(-1)?.value || 'N/A';
              const latestKms = tire.kms?.at(-1)?.value || 0;
              const latestProact = tire.proact?.at(-1)?.value || 0;
              const latestInt = tire.profundidad_int?.at(-1)?.value || 'N/A';
              const latestExt = tire.profundidad_ext?.at(-1)?.value || 'N/A';
              const latestCent = tire.profundidad_cen?.at(-1)?.value || 'N/A';
              const latestVida = tire.vida?.at(-1)?.value || 'N/A';

              const cpk = calculateCPK(latestKms, tire.costo).toFixed(2);
              const cpkProy = calculateProjectedCPK(tire.costo, latestKms, latestProact).toFixed(2);

              return (
                <tr key={tire._id || `${tire.placa}-${tire.llanta}`}>
                  <td>{tire.llanta || 'N/A'}</td>
                  <td>{tire.placa || 'N/A'}</td>
                  <td>{tire.marca || 'N/A'}</td>
                  <td>{tire.diseno || 'N/A'}</td>
                  <td>{tire.dimension || 'N/A'}</td>
                  <td>{tire.banda || 'N/A'}</td>
                  <td>{tire.costo || 'N/A'}</td>
                  <td>{latestVida}</td>
                  <td>{latestPos}</td>
                  <td>{latestKms}</td>
                  <td>{cpk}</td>
                  <td>{cpkProy}</td>
                  <td>{latestProact}</td>
                  <td>{latestInt}</td>
                  <td>{latestExt}</td>
                  <td>{latestCent}</td>
                  <td>
                    {tire.ultima_inspeccion
                      ? new Date(tire.ultima_inspeccion).toLocaleDateString('es-ES')
                      : 'N/A'}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="16">No hay datos disponibles</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DetallesLlantas;
