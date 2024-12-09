import React, { useState } from 'react';
import axios from 'axios';

const CambiarPosicion = () => {
  const [placa, setPlaca] = useState('');
  const [tires, setTires] = useState([]);
  const [positionUpdates, setPositionUpdates] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch tires by placa
  const handleSearch = async () => {
    if (!placa.trim()) {
      alert('Por favor, ingresa una placa válida.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    const token = localStorage.getItem('token');
    const userId = token ? JSON.parse(atob(token.split('.')[1])).user.id : null;

    if (!userId) {
      alert('Usuario no identificado.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(`https://tirepro.onrender.com/api/tires/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedTires = response.data.filter((tire) => tire.placa.toLowerCase() === placa.toLowerCase());
      if (fetchedTires.length > 0) {
        // Fetch event data for the tires
        const eventResponse = await axios.get(`https://tirepro.onrender.com/api/events/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const fetchedEvents = eventResponse.data;

        const tiresWithEventIds = fetchedTires.map((tire) => {
          const event = fetchedEvents.find((e) => e.llanta === tire.llanta);
          return { ...tire, eventId: event?._id || null };
        });

        setTires(tiresWithEventIds);
        setPositionUpdates(
          tiresWithEventIds.reduce((acc, tire) => {
            const currentPos = tire.pos?.at(-1)?.value || '';
            acc[tire._id] = { newPos: currentPos };
            return acc;
          }, {})
        );
      } else {
        setErrorMessage('No se encontraron llantas asociadas con esta placa.');
      }
    } catch (error) {
      console.error('Error fetching tires:', error);
      setErrorMessage('Error al buscar llantas.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check for duplicate positions
  const hasDuplicatePositions = () => {
    const updatedPositions = tires.map((tire) => positionUpdates[tire._id]?.newPos || tire.pos?.at(-1)?.value);
    const positionCounts = updatedPositions.reduce((counts, pos) => {
      counts[pos] = (counts[pos] || 0) + 1;
      return counts;
    }, {});
    return Object.values(positionCounts).some((count) => count > 1);
  };

  // Save updated positions to both events and tire data collections
  const handleSaveUpdates = async () => {
    if (hasDuplicatePositions()) {
      alert('Existen posiciones duplicadas. Por favor, corrige los conflictos antes de continuar.');
      return;
    }

    const updates = tires.map((tire) => ({
      tireId: tire._id,
      eventId: tire.eventId,
      newPos: positionUpdates[tire._id]?.newPos,
    }));

    setIsLoading(true);
    const token = localStorage.getItem('token');

    try {
      // Update in tire data
      const tireDataUpdates = updates.map((update) => ({
        tireId: update.tireId,
        field: 'pos',
        newValue: update.newPos,
      }));

      await axios.put(
        'https://tirepro.onrender.com/api/tires/update-field',
        { tireUpdates: tireDataUpdates },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update in events
      const eventUpdates = updates
        .filter((update) => update.eventId) // Ensure events exist for updates
        .map((update) => ({
          eventId: update.eventId,
          field: 'pos',
          newValue: update.newPos,
        }));

      await Promise.all(
        eventUpdates.map((update) =>
          axios.put(
            'https://tirepro.onrender.com/api/events/update-field',
            update,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );

      alert('Posiciones actualizadas correctamente en ambos sistemas.');
      setTires([]);
      setPlaca('');
      setPositionUpdates({});
    } catch (error) {
      console.error('Error updating positions:', error);
      alert('Error al actualizar posiciones.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Cambiar Posición</h2>
      <div>
        <input
          type="text"
          placeholder="Ingrese placa"
          value={placa}
          onChange={(e) => setPlaca(e.target.value)}
        />
        <button onClick={handleSearch}>{isLoading ? 'Buscando...' : 'Buscar'}</button>
      </div>

      {errorMessage && <p>{errorMessage}</p>}

      {tires.length > 0 && (
        <div>
          <h3>Resultados para placa: {placa}</h3>
          {tires.map((tire) => {
            const currentPosition = positionUpdates[tire._id]?.newPos || tire.pos?.at(-1)?.value;
            const isDuplicate = tires.some(
              (otherTire) =>
                otherTire._id !== tire._id &&
                (positionUpdates[otherTire._id]?.newPos || otherTire.pos?.at(-1)?.value) === currentPosition
            );

            return (
              <div key={tire._id} style={{ marginBottom: '1rem' }}>
                <p>
                  <strong>Llanta:</strong> {tire.llanta}
                </p>
                <p>
                  <strong>Marca:</strong> {tire.marca}
                </p>
                <p style={{ color: isDuplicate ? 'red' : 'black' }}>
                  <strong>Posición actual:</strong>{' '}
                  <input
                    type="number"
                    value={currentPosition}
                    onChange={(e) =>
                      setPositionUpdates((prev) => ({
                        ...prev,
                        [tire._id]: { newPos: parseInt(e.target.value, 10) || 0 },
                      }))
                    }
                  />
                </p>
                {isDuplicate && <p style={{ color: 'red' }}>Posición duplicada</p>}
              </div>
            );
          })}
          <button onClick={handleSaveUpdates} disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CambiarPosicion;
