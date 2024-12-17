import React, { useState } from 'react';
import axios from 'axios';
import './CambiarPosicion.css';

const CambiarPosicion = () => {
  const [placas, setPlacas] = useState(['']); // Array to hold multiple placas
  const [tires, setTires] = useState([]);
  const [positionUpdates, setPositionUpdates] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Add a new empty placa
  const handleAddPlaca = () => {
    setPlacas([...placas, '']);
  };

  // Update a specific placa in the array
  const handlePlacaChange = (index, value) => {
    const updatedPlacas = [...placas];
    updatedPlacas[index] = value;
    setPlacas(updatedPlacas);
  };

  // Search for tires associated with the provided placas
  const handleSearch = async () => {
    if (placas.some((placa) => !placa.trim())) {
      alert('Por favor, asegúrese de que todas las placas ingresadas sean válidas.');
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

      const fetchedTires = response.data.filter((tire) =>
        placas.some((placa) => tire.placa.toLowerCase() === placa.toLowerCase())
      );

      if (fetchedTires.length > 0) {
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
            acc[tire._id] = { newPos: currentPos, newPlaca: tire.placa };
            return acc;
          }, {})
        );
      } else {
        setErrorMessage('No se encontraron llantas asociadas con las placas ingresadas.');
      }
    } catch (error) {
      console.error('Error fetching tires:', error);
      setErrorMessage('Error al buscar llantas.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check for duplicate positions within the same placa
  const hasDuplicatePositions = () => {
    const positionMap = {};

    for (const tire of tires) {
      const newPlaca = positionUpdates[tire._id]?.newPlaca || tire.placa;
      const newPos = positionUpdates[tire._id]?.newPos || tire.pos?.at(-1)?.value;

      if (!newPlaca || !newPos) continue;

      if (positionMap[newPlaca]?.includes(newPos)) {
        return true;
      }

      if (!positionMap[newPlaca]) {
        positionMap[newPlaca] = [];
      }
      positionMap[newPlaca].push(newPos);
    }

    return false;
  };

  // Save updates for tire positions and fields
  const handleSaveUpdates = async () => {
    if (hasDuplicatePositions()) {
      alert('No se puede asignar la misma posición a dos llantas diferentes en el mismo vehículo.');
      return;
    }

    const token = localStorage.getItem('token');
    const historicalUpdates = [];
    const nonHistoricalUpdates = [];
    const eventUpdates = [];

    tires.forEach((tire) => {
      const newPlaca = positionUpdates[tire._id]?.newPlaca || tire.placa;
      const newPos = positionUpdates[tire._id]?.newPos || tire.pos?.at(-1)?.value;

      if (newPlaca !== tire.placa || newPos !== tire.pos?.at(-1)?.value) {
        // Historical updates for `pos`
        historicalUpdates.push({
          tireId: tire._id,
          field: 'pos',
          newValue: newPos,
        });

        // Non-historical updates for other fields
        nonHistoricalUpdates.push({
          tireId: tire._id,
          field: 'placa',
          newValue: newPlaca,
        });

        // Event updates for `pos`
        if (tire.eventId) {
          eventUpdates.push({
            eventId: tire.eventId,
            field: 'pos',
            newValue: newPos,
          });
        }
      }
    });

    try {
      // Update historical fields in `tires`
      if (historicalUpdates.length > 0) {
        await axios.put(
          'https://tirepro.onrender.com/api/tires/update-field',
          { tireUpdates: historicalUpdates },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Update non-historical fields in `tires`
      if (nonHistoricalUpdates.length > 0) {
        await axios.put(
          'https://tirepro.onrender.com/api/tires/update-nonhistorics',
          { updates: nonHistoricalUpdates },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Update `events` collection for `pos`
      if (eventUpdates.length > 0) {
        for (const update of eventUpdates) {
          await axios.put(
            'https://tirepro.onrender.com/api/events/update-field',
            update,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }

      alert('Actualización completada con éxito.');
      setTires([]);
      setPlacas(['']);
      setPositionUpdates({});
    } catch (error) {
      console.error('Error updating positions and fields:', error);
      alert('Error al actualizar posiciones y campos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h2 className="title">Cambiar Posición de Llantas</h2>
      <div className="buttons-container">
        <button onClick={handleAddPlaca} className="add-placa-button">
          Agregar otra placa
        </button>
        <button onClick={handleSearch} className="search-button" disabled={isLoading}>
          {isLoading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
      <br />
      <div className="placas-row">
        {placas.map((placa, index) => (
          <div key={index} className="placa-column">
            <div className="placa-header">
              <input
                type="text"
                placeholder={`Ingrese placa ${index + 1}`}
                value={placa}
                onChange={(e) => handlePlacaChange(index, e.target.value)}
                className="placa-input"
              />
            </div>
            <div className="tire-cards">
              {tires
                .filter((tire) => tire.placa === placa || positionUpdates[tire._id]?.newPlaca === placa)
                .map((tire) => (
                  <div key={tire._id} className="tire-card">
                    <p>
                      <strong>Llanta:</strong> {tire.llanta}
                    </p>
                    <p>
                      <strong>Marca:</strong> {tire.marca}
                    </p>
                    <p>
                      <strong>Placa actual:</strong>{' '}
                      <input
                        type="text"
                        value={positionUpdates[tire._id]?.newPlaca || tire.placa}
                        onChange={(e) =>
                          setPositionUpdates((prev) => ({
                            ...prev,
                            [tire._id]: { ...prev[tire._id], newPlaca: e.target.value },
                          }))
                        }
                        className="tire-input"
                      />
                    </p>
                    <p>
                      <strong>Posición actual:</strong>{' '}
                      <input
                        type="number"
                        value={positionUpdates[tire._id]?.newPos || tire.pos?.at(-1)?.value}
                        onChange={(e) =>
                          setPositionUpdates((prev) => ({
                            ...prev,
                            [tire._id]: {
                              ...prev[tire._id],
                              newPos: parseInt(e.target.value, 10) || 0,
                            },
                          }))
                        }
                        className="tire-input"
                      />
                    </p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
      <div className="save-button-container">
        <button onClick={handleSaveUpdates} className="save-button" disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
};

export default CambiarPosicion;
