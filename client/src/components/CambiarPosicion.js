import React, { useState } from 'react';
import axios from 'axios';
import './CambiarPosicion.css';

const CambiarPosicion = () => {
  const [placas, setPlacas] = useState(['']); // Array of placas
  const [tires, setTires] = useState([]); // Tires fetched for placas
  const [positionUpdates, setPositionUpdates] = useState({});
  const [previousValues, setPreviousValues] = useState({}); // Store previous values for swapping
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem('token');
  const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const companyId = decodedToken?.user?.companyId;

  // Add a new empty placa input
  const handleAddPlaca = () => setPlacas([...placas, '']);

  // Update the placa array
  const handlePlacaChange = (index, value) => {
    const updatedPlacas = [...placas];
    updatedPlacas[index] = value;
    setPlacas(updatedPlacas);
  };

  // Fetch tires for entered placas
  const handleSearch = async () => {
    if (placas.some((placa) => !placa.trim())) {
      alert('Por favor, asegúrese de que todas las placas ingresadas sean válidas.');
      return;
    }
  
    setIsLoading(true);
    setErrorMessage('');
  
    try {
      const response = await axios.get(
        `https://tirepro.onrender.com/api/tires/user/${companyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const fetchedTires = response.data
        .filter((tire) =>
          placas.some((placa) => tire.placa.toLowerCase() === placa.toLowerCase())
        )
        .sort((a, b) => {
          // Sort by the latest pos value
          const posA = a.pos?.at(-1)?.value || 0;
          const posB = b.pos?.at(-1)?.value || 0;
          return posA - posB; // Ascending order
        });
  
      if (fetchedTires.length > 0) {
        setTires(fetchedTires);
        setPreviousValues(
          fetchedTires.reduce((acc, tire) => {
            const key = `${tire.placa}-${tire.pos?.at(-1)?.value}`;
            acc[key] = {
              frente: tire.frente,
              tipoVhc: tire.tipovhc,
              kilometrajeActual: tire.kilometraje_actual?.at(-1)?.value || 0,
            };
            return acc;
          }, {})
        );
        setPositionUpdates(
          fetchedTires.reduce((acc, tire) => {
            acc[tire._id] = {
              newPlaca: tire.placa,
              newPos: tire.pos?.at(-1)?.value || '',
            };
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
  

  // Swap values between tires correctly
  const handleValueTransfer = (tireId, targetPlaca, targetPos) => {
    const newKey = `${targetPlaca}-${targetPos}`;
    const oldKey = `${positionUpdates[tireId]?.newPlaca}-${positionUpdates[tireId]?.newPos}`;

    const inheritedValues = previousValues[newKey] || {};
    const currentValues = previousValues[oldKey] || {};

    setPreviousValues((prev) => ({
      ...prev,
      [oldKey]: { ...currentValues }, // Store current tire's values to its old position
      [newKey]: { ...currentValues }, // Pass values to the new position
    }));

    setPositionUpdates((prev) => ({
      ...prev,
      [tireId]: {
        newPlaca: targetPlaca,
        newPos: targetPos,
        frente: inheritedValues.frente || '',
        tipoVhc: inheritedValues.tipoVhc || '',
        kilometrajeActual: inheritedValues.kilometrajeActual || 0,
      },
    }));
  };

  // Save updates to the backend
  const handleSaveUpdates = async () => {
    const historicalUpdates = [];
    const nonHistoricalUpdates = [];

    tires.forEach((tire) => {
      const { newPlaca, newPos, frente, tipoVhc, kilometrajeActual } = positionUpdates[tire._id];

      if (newPlaca !== tire.placa || newPos !== tire.pos?.at(-1)?.value) {
        historicalUpdates.push(
          { tireId: tire._id, field: 'pos', newValue: newPos },
          { tireId: tire._id, field: 'kilometraje_actual', newValue: kilometrajeActual }
        );

        nonHistoricalUpdates.push(
          { tireId: tire._id, field: 'placa', newValue: newPlaca },
          { tireId: tire._id, field: 'frente', newValue: frente },
          { tireId: tire._id, field: 'tipovhc', newValue: tipoVhc }
        );
      }
    });

    try {
      setIsLoading(true);

      if (historicalUpdates.length > 0) {
        await axios.put(
          'https://tirepro.onrender.com/api/tires/update-field',
          { tireUpdates: historicalUpdates },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (nonHistoricalUpdates.length > 0) {
        await axios.put(
          'https://tirepro.onrender.com/api/tires/update-nonhistorics',
          { updates: nonHistoricalUpdates },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      alert('Cambios guardados exitosamente.');
      setTires([]);
      setPlacas(['']);
      setPositionUpdates({});
    } catch (error) {
      console.error('Error saving updates:', error);
      alert('Error al guardar los cambios.');
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

      <div className="placas-row">
        {placas.map((placa, index) => (
          <div key={index} className="placa-column">
            <h4>Placa: {placa}</h4>
            <input
              type="text"
              placeholder={`Placa ${index + 1}`}
              value={placa}
              onChange={(e) => handlePlacaChange(index, e.target.value)}
              className="placa-input"
            />
            <div className="tire-cards">
              {tires
                .filter((tire) => tire.placa === placa)
                .map((tire) => (
                  <div key={tire._id} className="tire-card">
                    <p><strong>Llanta:</strong> {tire.llanta}</p>
                    <p><strong>Marca:</strong> {tire.marca}</p>
                    <p>
                      <strong>Placa:</strong>
                      <input
                        type="text"
                        value={positionUpdates[tire._id]?.newPlaca}
                        onBlur={() =>
                          handleValueTransfer(
                            tire._id,
                            positionUpdates[tire._id]?.newPlaca,
                            positionUpdates[tire._id]?.newPos
                          )
                        }
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
                      <strong>Posición:</strong>
                      <input
                        type="number"
                        value={positionUpdates[tire._id]?.newPos}
                        onBlur={() =>
                          handleValueTransfer(
                            tire._id,
                            positionUpdates[tire._id]?.newPlaca,
                            positionUpdates[tire._id]?.newPos
                          )
                        }
                        onChange={(e) =>
                          setPositionUpdates((prev) => ({
                            ...prev,
                            [tire._id]: { ...prev[tire._id], newPos: parseInt(e.target.value, 10) || 0 },
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
