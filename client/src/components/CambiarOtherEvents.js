import React, { useState } from 'react';
import axios from 'axios';
import './CambiarOtherEvents.css';

const CambiarOtherEvents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tireData, setTireData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedAction, setSelectedAction] = useState(''); // 'fin', 'pinchazo', etc.
  const [isLoading, setIsLoading] = useState(false);

  // Fetch tire and event data
  const handleSearch = async () => {
    try {
      setErrorMessage('');
      setTireData(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage('Usuario no identificado');
        return;
      }

      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const userId = decodedToken?.user?.id;
      const companyId = decodedToken?.user?.companyId;

      // Fetch tire data
      const tireResponse = await axios.get(`https://tirepro.onrender.com/api/tires/user/${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedTires = tireResponse?.data;
      const matchedTire = fetchedTires.find(
        (tire) => tire.llanta === parseInt(searchTerm, 10)
      );

      if (!matchedTire) {
        setErrorMessage('No se encontró llanta con el ID proporcionado.');
        return;
      }

      // Fetch event data
      const eventResponse = await axios.get(`https://tirepro.onrender.com/api/events/user/${companyId}`, {
        params: { llanta: searchTerm },
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedEvents = eventResponse?.data;
      if (!Array.isArray(fetchedEvents) || fetchedEvents.length === 0) {
        setErrorMessage('No se encontró evento relacionado con esta llanta.');
        return;
      }

      setTireData({
        ...matchedTire,
        eventId: fetchedEvents[0]._id,
        vida: fetchedEvents[0].vida, // Vida from the event data
        otherevents: fetchedEvents[0].otherevents, // Other events from event data
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage('Error al buscar datos.');
    }
  };

  // Handle changes based on the selected action
  const handleAction = async () => {
    if (!selectedAction) {
      alert('Por favor, seleccione una acción.');
      return;
    }

    if (tireData?.vida?.[tireData.vida.length - 1]?.value === 'fin') {
      alert('Esta llanta ya tiene fin de vida y no se puede cambiar.');
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem('token');

    try {
      const tireId = tireData._id;
      const eventId = tireData.eventId;

      if (selectedAction === 'fin') {
        // Update `vida`, `placa`, and `pos` for "Fin de Vida"
        await axios.put(
          'https://tirepro.onrender.com/api/events/update-field',
          { eventId, field: 'vida', newValue: 'fin' },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        await axios.put(
          'https://tirepro.onrender.com/api/tires/update-field',
          {
            tireUpdates: [
              { tireId, field: 'vida', newValue: 'fin' }, // Update historical "vida"
              { tireId, field: 'pos', newValue: 1 }, // Update historical "pos"
            ],
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        await axios.put(
          'https://tirepro.onrender.com/api/tires/update-nonhistorics',
          {
            updates: [
              { tireId, field: 'placa', newValue: 'fin' }, // Overwrite non-historical "placa"
            ],
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        alert('¡Fin de vida registrado exitosamente en ambos sistemas!');
      } else {
        // Handle other events like "pinchazo"
        await axios.put(
          'https://tirepro.onrender.com/api/events/add-other-event',
          {
            eventId,
            newValue: selectedAction,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        alert(`¡${selectedAction} registrado exitosamente en el sistema de eventos!`);
      }

      setTireData(null);
      setSearchTerm('');
      setSelectedAction('');
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Error al realizar la acción.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="other-events-container">
      <h2 className="other-events-title">Cambiar Otros Eventos</h2>

      <div className="search-section">
        <input
          className="search-input"
          type="text"
          placeholder="Ingrese Llanta ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="search-button" onClick={handleSearch}>
          Buscar
        </button>
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {tireData && (
        <div className="tire-info">
          <h3>Información de la Llanta</h3>
          <div className="info-item">
            <strong>ID:</strong>
            <span>{tireData.llanta}</span>
          </div>
          <div className="info-item">
            <strong>Última Vida:</strong>
            <span>{tireData.vida[tireData.vida.length - 1]?.value || 'N/A'}</span>
          </div>

          <div className="action-section">
            {tireData?.vida?.[tireData.vida.length - 1]?.value === 'fin' ? (
              <p className="end-of-life-message">
                Esta llanta ya tiene fin de vida y no puede ser modificada.
              </p>
            ) : (
              <div>
                <label className="action-label">Seleccione una acción:</label>
                <select
                  className="action-select"
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                >
                  <option value="">Seleccione una opción</option>
                  <option value="fin">Fin de Vida</option>
                  <option value="pinchazo">Pinchazo</option>
                  <option value="cachetona">Cachetona</option>
                  <option value="cristalizada">Cristalizada</option>
                </select>

                <button
                  className="action-button"
                  onClick={handleAction}
                  disabled={isLoading}
                >
                  {isLoading ? 'Procesando...' : 'Registrar Acción'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CambiarOtherEvents;
