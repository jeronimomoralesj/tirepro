import React, { useState } from 'react';
import axios from 'axios';
import './Uso.css';
import { FaSearch } from 'react-icons/fa';
import { PiTireBold } from 'react-icons/pi';

const Uso = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tireData, setTireData] = useState([]);
  const [selectedTire, setSelectedTire] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [proactValues, setProactValues] = useState([]);
  const [cpkValues, setCpkValues] = useState([]);
  const [cpkProyValues, setCpkProyValues] = useState([]);

  const fetchTires = async () => {
    try {
      setErrorMessage('');
      setTireData([]);
      setSelectedTire(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage('Usuario no identificado');
        return;
      }

      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const companyId = decodedToken?.user?.companyId;

      if (!companyId) {
        setErrorMessage('No se encuentra ID de la compañía');
        return;
      }

      const searchByLlanta = !isNaN(searchTerm);

      const response = await axios.get(
        `https://tirepro.onrender.com/api/tires/user/${companyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let fetchedTires = response.data;

      // Filter tires based on search term
      if (searchByLlanta) {
        fetchedTires = fetchedTires.filter((tire) => tire.llanta === searchTerm);
      } else {
        fetchedTires = fetchedTires.filter((tire) =>
          tire.placa.toLowerCase() === searchTerm.toLowerCase()
        );
      }

      if (fetchedTires.length === 0) {
        setErrorMessage('No se encontró llanta o placa');
        return;
      }

      // Sort tires by position (pos)
      fetchedTires.sort((a, b) => {
        const posA = a.pos?.at(-1)?.value || 0;
        const posB = b.pos?.at(-1)?.value || 0;
        return posA - posB;
      });

      setTireData(fetchedTires);
    } catch (error) {
      console.error('Error fetching tires:', error);
      setErrorMessage('Error al buscar llantas.');
    }
  };

  const fetchInspectionValues = async (llantaId) => {
    try {
      const token = localStorage.getItem('token');
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const companyId = decodedToken?.user?.companyId;

      const response = await axios.get(
        `https://tirepro.onrender.com/api/tires/user/${companyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const tires = response?.data || [];
      const matchingTire = tires.find((tire) => tire.llanta === llantaId);

      if (matchingTire) {
        setProactValues(matchingTire.proact || []);
        setCpkValues(matchingTire.cpk || []);
        setCpkProyValues(matchingTire.cpk_proy || []);
      } else {
        setProactValues([]);
        setCpkValues([]);
        setCpkProyValues([]);
      }
    } catch (error) {
      console.error('Error fetching inspection values:', error);
    }
  };

  const handleViewHistory = (tire) => {
    setSelectedTire(tire);
    fetchInspectionValues(tire.llanta);
  };

  const renderTimeline = (tire) => {
    const vida = Array.isArray(tire.vida) ? tire.vida : [];
    const pos = Array.isArray(tire.pos) ? tire.pos : [];
    const otherevents = Array.isArray(tire.otherevents) ? tire.otherevents : [];

    const allEvents = [
      ...vida.map((entry) => ({
        date: new Date(entry.year, entry.month - 1, entry.day),
        type: 'Vida',
        value: entry.value,
      })),
      ...pos.map((entry) => ({
        date: new Date(entry.year, entry.month - 1, entry.day),
        type: 'Posición',
        value: entry.value,
      })),
      ...otherevents.map((entry) => ({
        date: new Date(entry.year, entry.month - 1, entry.day),
        type: 'Otro Evento',
        value: entry.value,
      })),
    ];

    allEvents.sort((a, b) => a.date - b.date);

    return (
      <div className="road-map">
        {allEvents.map((event, index) => (
          <div key={index} className="step">
            <PiTireBold className="tire-icon" />
            <span className="step-label">
              {event.type}: {event.value} <br />
              {event.date.toLocaleDateString()}
            </span>
            {index < allEvents.length - 1 && <div className="line-segment"></div>}
          </div>
        ))}
      </div>
    );
  };

  const renderProactValues = () => {
    if (proactValues.length === 0) {
      return <p>No hay datos de inspecciones disponibles.</p>;
    }
  
    // Combine proactValues, cpkValues, and cpkProyValues into a single array of objects
    const inspections = proactValues.map((entry, index) => ({
      date: new Date(entry.year, entry.month - 1, entry.day),
      proact: entry.value,
      cpk: cpkValues[index]?.value || 'N/A',
      cpkProy: cpkProyValues[index]?.value || 'N/A',
    }));
  
    // Sort the inspections array by date in descending order
    inspections.sort((a, b) => b.date - a.date);
  
    return (
      <div className="proact-section">
        <h4>Historial de Inspecciones:</h4>
        <table className="proact-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Proact</th>
              <th>CPK</th>
              <th>CPK Proy</th>
            </tr>
          </thead>
          <tbody>
            {inspections.map((inspection, index) => (
              <tr key={index}>
                <td>{inspection.date.toLocaleDateString()}</td>
                <td>{inspection.proact}</td>
                <td>{inspection.cpk}</td>
                <td>{inspection.cpkProy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  

  return (
    <div className="uso-container">
      <h2 className="uso-title">Buscar Llanta por ID o Placa</h2>
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Llanta ID o Placa..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="search-button" onClick={fetchTires}>
          Buscar
        </button>
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {tireData.length > 0 && (
        <div className="results-container">
          {selectedTire ? (
            <>
              <h3 className="history-title">
                Historial eventos Llanta - {selectedTire.llanta} en Placa: {selectedTire.placa}
              </h3>
              {renderTimeline(selectedTire)}
              {renderProactValues()}
            </>
          ) : (
            <>
              <h3 className="filtered-tires-title">Resultados:</h3>
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Llanta</th>
                    <th>Placa</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {tireData.map((tire, index) => (
                    <tr key={index}>
                      <td>{tire.llanta}</td>
                      <td>{tire.placa}</td>
                      <td>
                        <button
                          className="view-button"
                          onClick={() => handleViewHistory(tire)}
                        >
                          Ver Historial
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Uso;
