import React, { useState, useEffect } from 'react';
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

  const handleSearch = async () => {
    try {
      setSelectedTire(null);
      setProactValues([]);
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage('Usuario no identificado');
        return;
      }

      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const userId = decodedToken?.user?.id;

      if (!userId) {
        setErrorMessage('No se encuentra ID de usuario');
        return;
      }

      let response;
      const searchByLlanta = !isNaN(searchTerm);

      if (searchByLlanta) {
        response = await axios.get(`https://tirepro.onrender.com/api/events/user/${userId}`, {
          params: { llanta: searchTerm },
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        response = await axios.get(`https://tirepro.onrender.com/api/events/user/${userId}`, {
          params: { placa: searchTerm },
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      const fetchedEvents = response?.data;

      if (Array.isArray(fetchedEvents) && fetchedEvents.length > 0) {
        setTireData(fetchedEvents);
        setErrorMessage('');
      } else {
        setErrorMessage('No se encontró llanta o placa');
        setTireData([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setErrorMessage('Error fetching data');
      setTireData([]);
    }
  };

  const fetchProactValues = async (llantaId) => {
    try {
      const token = localStorage.getItem('token');
      const userId = JSON.parse(atob(token.split('.')[1])).user.id;

      const response = await axios.get(`https://tirepro.onrender.com/api/tires/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const tires = response?.data || [];
      const matchingTire = tires.find((tire) => tire.llanta === llantaId);

      if (matchingTire && matchingTire.proact) {
        setProactValues(matchingTire.proact);
      } else {
        setProactValues([]);
      }
    } catch (error) {
      console.error('Error fetching proact values:', error);
      setProactValues([]);
    }
  };

  const handleViewHistory = (tire) => {
    setSelectedTire(tire);
    fetchProactValues(tire.llanta);
  };

  const renderTimeline = (tire) => {
    const allEvents = [
      ...tire.vida.map((entry) => ({
        date: new Date(entry.year, entry.month - 1, entry.day),
        type: 'Vida',
        value: entry.value,
      })),
      ...tire.pos.map((entry) => ({
        date: new Date(entry.year, entry.month - 1, entry.day),
        type: 'Posición',
        value: entry.value,
      })),
      ...tire.otherevents.map((entry) => ({
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
      return <p>No hay datos de Proact disponibles.</p>;
    }

    return (
      <div className="proact-section">
        <h4>Historial de Inspecciones:</h4>
        <table className="proact-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Proact</th>
            </tr>
          </thead>
          <tbody>
            {proactValues.map((entry, index) => (
              <tr key={index}>
                <td>{`${entry.day}/${entry.month}/${entry.year}`}</td>
                <td>{entry.value}</td>
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
        <button className="search-button" onClick={handleSearch}>
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
                        <button className="view-button" onClick={() => handleViewHistory(tire)}>
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
