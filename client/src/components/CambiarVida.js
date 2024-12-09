import React, { useState } from 'react';
import axios from 'axios';

const CambiarVida = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tireData, setTireData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [newVida, setNewVida] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch tire and event data
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

      // Fetch tire data by user and `llanta`
      const tireResponse = await axios.get(`https://tirepro.onrender.com/api/tires/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedTires = tireResponse?.data;
      const matchedTire = fetchedTires.find(
        (tire) => tire.llanta === parseInt(searchTerm, 10)
      );

      if (matchedTire) {
        setTireData(matchedTire);
      } else {
        setErrorMessage('No se encontró llanta con el ID proporcionado.');
        return;
      }

      // Fetch event data for the same tire
      const eventResponse = await axios.get(`https://tirepro.onrender.com/api/events/user/${userId}`, {
        params: { llanta: searchTerm },
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedEvents = eventResponse?.data;
      if (Array.isArray(fetchedEvents) && fetchedEvents.length > 0) {
        setTireData((prevData) => ({
          ...prevData,
          eventId: fetchedEvents[0]._id, // Add event ID for updating events
        }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage('Error al buscar datos.');
    }
  };

  // Function to update `vida` in both collections
  const handleVidaChange = async () => {
    if (!newVida) {
      alert('Por favor, seleccione un nuevo valor para la vida.');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const tireId = tireData._id; // Tire ID
      const eventId = tireData.eventId; // Event ID
      const value = newVida; // Only send the value

      // Update the `vida` field in the `events` collection
      if (eventId) {
        await axios.put(
          'https://tirepro.onrender.com/api/events/update-field',
          { eventId, field: 'vida', newValue: value },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      // Update the `vida` field in the `tire data` collection
      await axios.put(
        'https://tirepro.onrender.com/api/tires/update-field',
        {
          tireUpdates: [
            {
              tireId,
              field: 'vida',
              newValue: value,
            },
          ],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('¡La vida de la llanta se actualizó correctamente en ambos sistemas!');
      setTireData(null);
      setNewVida('');
      setSearchTerm('');
    } catch (error) {
      console.error('Error updating vida:', error);
      alert('Error al actualizar la vida en ambos sistemas.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate options for new `vida` based on the last `vida` value
  const getAvailableOptions = () => {
    if (!tireData || !tireData.vida || tireData.vida.length === 0) return [];
    const lastVida = tireData.vida[tireData.vida.length - 1]?.value;

    const options = ['reencauche', 'reencauche2', 'reencauche3'];
    const index = options.indexOf(lastVida);
    return options.slice(index + 1); // Only allow valid transitions
  };

  return (
    <div>
      <h2>Cambiar Vida</h2>
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
            <label htmlFor="vida">Nueva Vida:</label>
            <select
              id="vida"
              value={newVida}
              onChange={(e) => setNewVida(e.target.value)}
            >
              <option value="">Seleccione una opción</option>
              {getAvailableOptions().map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <button onClick={handleVidaChange} disabled={isLoading}>
            {isLoading ? 'Actualizando...' : 'Actualizar Vida'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CambiarVida;
