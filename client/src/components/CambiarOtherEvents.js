import React, { useState } from 'react';
import axios from 'axios';

const CambiarOtherEvents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tireData, setTireData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedAction, setSelectedAction] = useState(''); // 'fin' or 'pinchazo'
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

      // Fetch tire data
      const tireResponse = await axios.get(`https://tirepro.onrender.com/api/tires/user/${userId}`, {
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
      const eventResponse = await axios.get(`https://tirepro.onrender.com/api/events/user/${userId}`, {
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
        // Update `vida` to "fin" in both collections
        await axios.put(
          'https://tirepro.onrender.com/api/events/update-field',
          { eventId, field: 'vida', newValue: 'fin' },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        await axios.put(
          'https://tirepro.onrender.com/api/tires/update-field',
          {
            tireUpdates: [
              { tireId, field: 'vida', newValue: 'fin' },
            ],
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        alert('¡Fin de vida registrado exitosamente en ambos sistemas!');
      } else if (selectedAction === 'pinchazo') {
        // Add a new "pinchazo" entry to `otherevents` in the events collection
        await axios.put(
          'https://tirepro.onrender.com/api/events/add-other-event',
          {
            eventId,
            newValue: 'pinchazo',
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        alert('¡Pinchazo registrado exitosamente en el sistema de eventos!');
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
    <div>
      <h2>Cambiar Otros Eventos</h2>
      <div>
        <input
          type="text"
          placeholder="Ingrese Llanta ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Buscar</button>
      </div>

      {errorMessage && <p>{errorMessage}</p>}

      {tireData && (
        <div>
          <h3>Información de la Llanta</h3>
          <p>
            <strong>ID:</strong> {tireData.llanta}
          </p>
          <p>
            <strong>Última Vida:</strong>{' '}
            {tireData.vida[tireData.vida.length - 1]?.value || 'N/A'}
          </p>

          <div>
            {tireData?.vida?.[tireData.vida.length - 1]?.value === 'fin' ? (
              <p style={{ color: 'red' }}>Esta llanta ya tiene fin de vida y no puede ser modificada.</p>
            ) : (
              <div>
                <label>Seleccione una acción:</label>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                >
                  <option value="">Seleccione una opción</option>
                  <option value="fin">Fin de Vida</option>
                  <option value="pinchazo">Pinchazo</option>
                </select>

                <button onClick={handleAction} disabled={isLoading}>
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
