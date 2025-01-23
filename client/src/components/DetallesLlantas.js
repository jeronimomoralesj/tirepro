import React, { useState } from 'react';
import * as XLSX from 'xlsx'; // Import XLSX for Excel generation
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

  // Download table data as Excel file
  const downloadExcel = () => {
    // Prepare data for Excel
    const data = filteredTires.map((tire) => ({
      Llanta: tire.llanta || 'N/A',
      Placa: tire.placa || 'N/A',
      Marca: tire.marca || 'N/A',
      Diseño: tire.diseno || 'N/A',
      Dimensión: tire.dimension || 'N/A',
      Banda: tire.banda || 'N/A',
      Costo: tire.costo || 'N/A',
      Eje: tire.eje || 'N/A',
      Vida: tire.vida?.at(-1)?.value || 'N/A',
      TipoVhc: tire.tipovhc || 'N/A',
      Posición: tire.pos?.at(-1)?.value || 'N/A',
      Kilómetros: tire.kms?.at(-1)?.value || 0,
      CPK: tire.cpk?.at(-1)?.value?.toFixed(2) || 'N/A',
      'CPK Proy': tire.cpk_proy?.at(-1)?.value?.toFixed(2) || 'N/A',
      'Profundidad Mínima': tire.proact?.at(-1)?.value || 'N/A',
      'Profundidad Interior': tire.profundidad_int?.at(-1)?.value || 'N/A',
      'Profundidad Exterior': tire.profundidad_ext?.at(-1)?.value || 'N/A',
      'Profundidad Central': tire.profundidad_cen?.at(-1)?.value || 'N/A',
      'Última Inspección': tire.ultima_inspeccion
        ? new Date(tire.ultima_inspeccion).toLocaleDateString('es-ES')
        : 'N/A',
    }));

    // Create a new workbook and sheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Detalles Llantas');

    // Generate and download Excel file
    XLSX.writeFile(workbook, 'DetallesLlantas.xlsx');
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
        <button className="download-button" onClick={downloadExcel}>
          Descargar Excel
        </button>
      </div>

      <table className="detalles-llantas-table">
        <thead>
          <tr>
            <th>Llanta</th>
            <th>Placa</th>
            <th>CPK</th>
            <th>CPK Proy</th>
            <th>Marca</th>
            <th>Diseño</th>
            <th>Dimensión</th>
            <th>Banda</th>
            <th>Tipo vehiculo</th>
            <th>Costo</th>
            <th>Vida</th>
            <th>Posición</th>
            <th>Kilómetros</th>
            <th>Presión</th>
            <th>Eje</th>
            <th>Profundidad mínima</th>
            <th>Profundidad interior</th>
            <th>Profundidad exterior</th>
            <th>Profundidad central</th>
            <th>Profundidad inicial</th>
            <th>Última Inspección</th>
          </tr>
        </thead>
        <tbody>
          {filteredTires.length > 0 ? (
            filteredTires.map((tire) => {
              const latestPos = tire.pos?.at(-1)?.value || 'N/A';
              const latestKms = tire.kms?.at(-1)?.value || 0;
              const latestCpk = tire.cpk?.at(-1)?.value?.toFixed(2) || 'N/A';
              const latestCpkProy = tire.cpk_proy?.at(-1)?.value?.toFixed(2) || 'N/A';
              const latestProact = tire.proact?.at(-1)?.value || 'N/A';
              const latestInt = tire.profundidad_int?.at(-1)?.value || 'N/A';
              const latestExt = tire.profundidad_ext?.at(-1)?.value || 'N/A';
              const latestPresion = tire.presion?.at(-1)?.value || 'N/A';
              const latestCent = tire.profundidad_cen?.at(-1)?.value || 'N/A';
              const latestVida = tire.vida?.at(-1)?.value || 'N/A';

              return (
                <tr key={tire._id || `${tire.placa}-${tire.llanta}`}>
                  <td>{tire.llanta || 'N/A'}</td>
                  <td>{tire.placa || 'N/A'}</td>
                  <td>{latestCpk}</td>
                  <td>{latestCpkProy}</td>
                  <td>{tire.marca || 'N/A'}</td>
                  <td>{tire.diseno || 'N/A'}</td>
                  <td>{tire.dimension || 'N/A'}</td>
                  <td>{tire.banda || 'N/A'}</td>
                  <td>{tire.tipovhc || 'N/A'}</td>
                  <td>{tire.costo || 'N/A'}</td>
                  <td>{latestVida}</td>
                  <td>{latestPos}</td>
                  <td>{latestKms}</td>
                  <td>{latestPresion}</td>
                  <td>{tire.eje || 'N/A'}</td>
                  <td>{latestProact}</td>
                  <td>{latestInt}</td>
                  <td>{latestExt}</td>
                  <td>{latestCent}</td>
                  <td>{tire.profundidad_inicial || "N/A"}</td>
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
