import React, { useState } from 'react';
import * as XLSX from 'xlsx'; // Import XLSX for Excel generation
import './DetallesLlantas.css'; // Reuse DetallesLlantas.css for styling

const CpkTable = ({ tires }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSinReencauche, setFilterSinReencauche] = useState(false);

  // Filter and sort tires based on the criteria
  const filteredTires = tires
    .filter((tire) => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const latestVida = tire.vida?.at(-1)?.value || '';

      // Apply "sin reencauche" filter
      if (filterSinReencauche) {
        const hasPrimeraVida = tire.primera_vida?.length > 0;
        return (
          hasPrimeraVida &&
          latestVida !== 'nueva' && // Exclude if vida is "nueva"
          (tire.llanta?.toString().toLowerCase().includes(lowerCaseSearchTerm) ||
            tire.placa?.toLowerCase().includes(lowerCaseSearchTerm) ||
            tire.marca?.toLowerCase().includes(lowerCaseSearchTerm) ||
            tire.diseno?.toLowerCase().includes(lowerCaseSearchTerm))
        );
      }

      // Default criteria: kms >= 60000 OR vida === "fin"
      const latestKms = tire.kms?.at(-1)?.value || 0;
      return (
        (latestKms >= 60000 || latestVida === 'fin') &&
        (tire.llanta?.toString().toLowerCase().includes(lowerCaseSearchTerm) ||
          tire.placa?.toLowerCase().includes(lowerCaseSearchTerm) ||
          tire.marca?.toLowerCase().includes(lowerCaseSearchTerm) ||
          tire.diseno?.toLowerCase().includes(lowerCaseSearchTerm))
      );
    })
    .sort((a, b) => {
      const cpkA = filterSinReencauche
        ? a.primera_vida?.[0]?.cpk || Infinity // Use primera_vida cpk if filtered
        : a.cpk?.at(-1)?.value || Infinity;
      const cpkB = filterSinReencauche
        ? b.primera_vida?.[0]?.cpk || Infinity
        : b.cpk?.at(-1)?.value || Infinity;
      return cpkA - cpkB; // Sort by smallest CPK first
    });

  // Download table data as Excel file
  const downloadExcel = () => {
    const data = filteredTires.map((tire) => {
      const primeraVida = tire.primera_vida?.[0] || {};
      return {
        Llanta: tire.llanta || 'N/A',
        Placa: tire.placa || 'N/A',
        Marca: tire.marca || 'N/A',
        Diseño: tire.diseno || 'N/A',
        Dimensión: tire.dimension || 'N/A',
        Banda: filterSinReencauche ? primeraVida.banda || 'N/A' : tire.banda || 'N/A',
        Costo: filterSinReencauche ? primeraVida.costo || 'N/A' : tire.costo || 'N/A',
        Vida: tire.vida?.at(-1)?.value || 'N/A',
        Posición: tire.pos?.at(-1)?.value || 'N/A',
        Kilómetros: filterSinReencauche ? primeraVida.kms || 0 : tire.kms?.at(-1)?.value || 0,
        CPK: filterSinReencauche
          ? primeraVida.cpk?.toFixed(2) || 'N/A'
          : tire.cpk?.at(-1)?.value?.toFixed(2) || 'N/A',
        'CPK Proy': filterSinReencauche
          ? 'N/A'
          : tire.cpk_proy?.at(-1)?.value?.toFixed(2) || 'N/A',
        'Profundidad Mínima': tire.proact?.at(-1)?.value || 'N/A',
        'Profundidad Interior': tire.profundidad_int?.at(-1)?.value || 'N/A',
        'Profundidad Exterior': tire.profundidad_ext?.at(-1)?.value || 'N/A',
        'Profundidad Central': tire.profundidad_cen?.at(-1)?.value || 'N/A',
        'Última Inspección': tire.ultima_inspeccion
          ? new Date(tire.ultima_inspeccion).toLocaleDateString('es-ES')
          : 'N/A',
      };
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    XLSX.utils.book_append_sheet(workbook, worksheet, 'CpkTable');
    XLSX.writeFile(workbook, 'CpkTable.xlsx');
  };

  return (
    <div className="detalles-llantas-container">
      <h2>Tabla de CPK</h2>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por Llanta, Placa, Marca, etc."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button className="download-button" onClick={downloadExcel}>
          Descargar Excel
        </button>
      </div>

      {/* Filter Toggle */}
      <div className="filter-toggle">
        <label>
          <input
            type="checkbox"
            checked={filterSinReencauche}
            onChange={(e) => setFilterSinReencauche(e.target.checked)}
          />
          Mostrar Solo datos de primera vida
        </label>
      </div>

      <table className="detalles-llantas-table">
        <thead>
          <tr>
            <th>Llanta</th>
            <th>Placa</th>
            <th>CPK</th>
            <th>CPK Proy</th>
            <th>Vida</th>
            <th>Posición</th>
            <th>Marca</th>
            <th>Diseño</th>
            <th>Dimensión</th>
            <th>Banda</th>
          </tr>
        </thead>
        <tbody>
          {filteredTires.length > 0 ? (
            filteredTires.map((tire) => {
              const primeraVida = tire.primera_vida?.[0] || {};
              const latestPos = tire.pos?.at(-1)?.value || 'N/A';
              const latestKms = filterSinReencauche
                ? primeraVida.kms || 0
                : tire.kms?.at(-1)?.value || 0;
              const latestCpk = filterSinReencauche
                ? primeraVida.cpk?.toFixed(2) || 'N/A'
                : tire.cpk?.at(-1)?.value?.toFixed(2) || 'N/A';
              const latestCpkProy = filterSinReencauche
                ? 'N/A'
                : tire.cpk_proy?.at(-1)?.value?.toFixed(2) || 'N/A';
              const latestVida = tire.vida?.at(-1)?.value || 'N/A';
              const latestBanda = filterSinReencauche
                ? primeraVida.banda || 'N/A'
                : tire.banda || 'N/A';

              return (
                <tr key={tire._id || `${tire.placa}-${tire.llanta}`}>
                  <td>{tire.llanta || 'N/A'}</td>
                  <td>{tire.placa || 'N/A'}</td>
                  <td>{latestCpk}</td>
                  <td>{latestCpkProy}</td>
                  <td>{latestVida}</td>
                  <td>{latestPos}</td>
                  <td>{tire.marca || 'N/A'}</td>
                  <td>{tire.diseno || 'N/A'}</td>
                  <td>{tire.dimension || 'N/A'}</td>
                  <td>{latestBanda}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="10">No hay datos disponibles</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CpkTable;
