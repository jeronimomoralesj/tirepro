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
              const latestCpk = tire.cpk?.at(-1)?.value?.toFixed(2) || 'N/A';
              const latestCpkProy = tire.cpk_proy?.at(-1)?.value?.toFixed(2) || 'N/A';
              const latestInt = tire.profundidad_int?.at(-1)?.value || 'N/A';
              const latestExt = tire.profundidad_ext?.at(-1)?.value || 'N/A';
              const latestCent = tire.profundidad_cen?.at(-1)?.value || 'N/A';
              const latestVida = tire.vida?.at(-1)?.value || 'N/A';

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
                  <td>{latestCpk}</td>
                  <td>{latestCpkProy}</td>
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
