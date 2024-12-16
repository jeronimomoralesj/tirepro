import React, { useState } from 'react';
import axios from 'axios';

const CambiarPosicion = () => {
  const [placa, setPlaca] = useState('');
  const [tires, setTires] = useState([]);
  const [positionUpdates, setPositionUpdates] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const hasDuplicatePositions = () => {
    const updatedPositions = tires.map((tire) => positionUpdates[tire._id]?.newPos || tire.pos?.at(-1)?.value);
    const positionCounts = updatedPositions.reduce((counts, pos) => {
      counts[pos] = (counts[pos] || 0) + 1;
      return counts;
    }, {});
    return Object.values(positionCounts).some((count) => count > 1);
  };

  const handleSaveUpdates = async () => {
    const token = localStorage.getItem('token');
    const historicalUpdates = [];
    const nonHistoricalUpdates = [];
  
    tires.forEach((tire) => {
      const newPos = positionUpdates[tire._id]?.newPos || tire.pos?.at(-1)?.value;
  
      // Find the tire to swap with based on new position
      const swapTire = tires.find(
        (otherTire) => positionUpdates[otherTire._id]?.newPos === tire.pos?.at(-1)?.value
      );
  
      if (swapTire) {
        // Historical updates for `pos` and `kilometraje_actual`
        historicalUpdates.push(
          {
            tireId: tire._id,
            field: 'pos',
            newValue: newPos,
          },
          {
            tireId: swapTire._id,
            field: 'pos',
            newValue: tire.pos?.at(-1)?.value,
          }
        );
  
        // Non-historical updates for `eje`, `placa`, `tipovhc`, `frente`
        const fieldsToUpdate = ['eje', 'placa', 'tipovhc', 'frente'];
        fieldsToUpdate.forEach((field) => {
          nonHistoricalUpdates.push(
            {
              tireId: tire._id,
              field,
              newValue: swapTire[field],
            },
            {
              tireId: swapTire._id,
              field,
              newValue: tire[field],
            }
          );
        });
      }
    });
  
    try {
      console.log('Historical Updates Payload:', historicalUpdates);
      console.log('Non-Historical Updates Payload:', nonHistoricalUpdates);
  
      // Update historical fields (e.g., `pos`, `kilometraje_actual`)
      if (historicalUpdates.length > 0) {
        await axios.put(
          'https://tirepro.onrender.com/api/tires/update-field',
          { tireUpdates: historicalUpdates },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
  
      // Update non-historical fields (e.g., `eje`, `placa`, `tipovhc`, `frente`)
      if (nonHistoricalUpdates.length > 0) {
        await axios.put(
          'https://tirepro.onrender.com/api/tires/update-nonhistorics',
          { updates: nonHistoricalUpdates },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
  
      alert('Actualización completada con éxito.');
      setTires([]);
      setPlaca('');
      setPositionUpdates({});
    } catch (error) {
      console.error('Error updating positions and fields:', error);
      alert('Error al actualizar posiciones y campos.');
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
