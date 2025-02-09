import React, { useState } from 'react';
import axios from 'axios';
import './CambiarVida.css';

const CambiarVida = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tireData, setTireData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [newVida, setNewVida] = useState('');
  const [newBanda, setNewBanda] = useState('');
  const [newCosto, setNewCosto] = useState('');
  const [newProfundidadInicial, setNewProfundidadInicial] = useState('');
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
      const companyId = decodedToken?.user?.companyId;

      // Fetch tire data by user and `llanta`
      const tireResponse = await axios.get(`https://tirepro.onrender.com/api/tires/user/${companyId}`, {
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
      const eventResponse = await axios.get(`https://tirepro.onrender.com/api/events/user/${companyId}`, {
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

  // Recalculate CPK and CPK_Proy
  const calculateCPK = (costo, kms) => (kms > 0 ? costo / kms : 0);
  const calculateProjectedCPK = (costo, kms, profundidadInicial, proact) => {
    if (proact >= profundidadInicial) return 0; // Avoid division by zero
    const projectedKms = (kms / (profundidadInicial - proact)) * profundidadInicial;
    return projectedKms > 0 ? costo / projectedKms : 0;
  };

  // Function to handle all updates with one button
  const handleUpdate = async () => {
    if (!newVida && !newBanda && !newCosto && !newProfundidadInicial) {
      alert('Por favor, seleccione un nuevo valor para vida, banda, costo o profundidad inicial.');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const tireId = tireData._id; // Tire ID
      const eventId = tireData.eventId; // Event ID

      // Step 1: Add current details to primera_vida
      await axios.post(
        'https://tirepro.onrender.com/api/tires/add-primera-vida',
        { tireId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Step 2: Update the `vida` field in the `events` collection
      if (newVida && eventId) {
        await axios.put(
          'https://tirepro.onrender.com/api/events/update-field',
          { eventId, field: 'vida', newValue: newVida },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      // Step 3: Update the `vida` field in the `tireData` collection
      if (newVida) {
        await axios.put(
          'https://tirepro.onrender.com/api/tires/update-field',
          {
            tireUpdates: [
              {
                tireId,
                field: 'vida',
                newValue: newVida,
              },
            ],
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      // Step 4: Update the `banda` field directly in `tireData`
      if (newBanda) {
        await axios.put(
          'https://tirepro.onrender.com/api/tires/update-nonhistorics',
          {
            updates: [
              {
                tireId,
                field: 'banda',
                newValue: newBanda,
              },
            ],
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      // Step 5: Update profundidad_inicial and related fields
      if (newProfundidadInicial) {
        const profundidadValue = parseFloat(newProfundidadInicial);

        // Update `profundidad_inicial` as a non-historical value
        await axios.put(
          'https://tirepro.onrender.com/api/tires/update-nonhistorics',
          {
            updates: [
              { tireId, field: 'profundidad_inicial', newValue: profundidadValue },
            ],
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Update `profundidad_int`, `profundidad_cen`, `profundidad_ext`, and `proact` with the same value
        const updates = [
          { tireId, field: 'profundidad_int', newValue: profundidadValue },
          { tireId, field: 'profundidad_cen', newValue: profundidadValue },
          { tireId, field: 'profundidad_ext', newValue: profundidadValue },
          { tireId, field: 'proact', newValue: profundidadValue },
        ];

        await axios.put(
          'https://tirepro.onrender.com/api/tires/update-field',
          { tireUpdates: updates },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Step 6: Update the `costo` field in `tireData` by adding the new value to the existing one
      let updatedCosto = tireData.costo;
      if (newCosto) {
        const currentCosto = parseFloat(tireData.costo) || 0;
        updatedCosto = currentCosto + parseFloat(newCosto);

        await axios.put(
          'https://tirepro.onrender.com/api/tires/update-nonhistorics',
          {
            updates: [
              {
                tireId,
                field: 'costo',
                newValue: updatedCosto,
              },
            ],
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      // Step 7: Recalculate and update `cpk` and `cpk_proy`
      const lastKms = tireData.kms?.[tireData.kms.length - 1]?.value || 0;
      const cpk = calculateCPK(updatedCosto, lastKms);
      const cpkProy = calculateProjectedCPK(
        updatedCosto,
        lastKms,
        parseFloat(newProfundidadInicial || tireData.profundidad_inicial),
        parseFloat(newProfundidadInicial || tireData.profundidad_inicial) // Updated proact
      );

      await axios.put(
        'https://tirepro.onrender.com/api/tires/update-field',
        {
          tireUpdates: [
            { tireId, field: 'cpk', newValue: cpk },
            { tireId, field: 'cpk_proy', newValue: cpkProy },
          ],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('¡Actualización completada correctamente!');
      setTireData(null);
      setNewVida('');
      setNewBanda('');
      setNewCosto('');
      setNewProfundidadInicial('');
      setSearchTerm('');
    } catch (error) {
      console.error('Error updating fields:', error);
      alert('Error al actualizar los campos.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate options for new `vida` based on the last `vida` value
  const getAvailableOptions = () => {
    if (!tireData || !tireData.vida || tireData.vida.length === 0) return [];
    const lastVida = tireData.vida?.[tireData.vida.length - 1]?.value;

    const options = ['reencauche', 'reencauche2', 'reencauche3'];
    return options.slice(options.indexOf(lastVida) + 1);
  };

  return (
    <div className="cambiar-vida-container">
      <h2 className="cambiar-vida-title">Cambiar Vida</h2>
      <div className="search-container">
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
            <span>{tireData.vida?.[tireData.vida.length - 1]?.value || 'N/A'}</span>
          </div>
          <div className="info-item">
            <strong>Última Banda:</strong>
            <span>{tireData.banda || 'N/A'}</span>
          </div>
          <div className="info-item">
            <strong>Costo Actual:</strong>
            <span>{tireData.costo || 0}</span>
          </div>
  
          <div className="form-group">
            <label className="form-label" htmlFor="vida">Nueva Vida:</label>
            <select
              className="form-select"
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
  
          <div className="form-group">
            <label className="form-label" htmlFor="banda">Nueva Banda:</label>
            <input
              className="form-input"
              id="banda"
              type="text"
              placeholder="Ingrese nueva banda"
              value={newBanda}
              onChange={(e) => setNewBanda(e.target.value)}
            />
          </div>
  
          <div className="form-group">
            <label className="form-label" htmlFor="costo">Costo Adicional:</label>
            <input
              className="form-input"
              id="costo"
              type="number"
              placeholder="Ingrese costo adicional"
              value={newCosto}
              onChange={(e) => setNewCosto(e.target.value)}
            />
          </div>
  
          <div className="form-group">
            <label className="form-label" htmlFor="profundidad_inicial">
              Nueva Profundidad Inicial:
            </label>
            <input
              className="form-input"
              id="profundidad_inicial"
              type="number"
              placeholder="Ingrese nueva profundidad inicial"
              value={newProfundidadInicial}
              onChange={(e) => setNewProfundidadInicial(e.target.value)}
            />
          </div>
  
          <button 
            className="update-button" 
            onClick={handleUpdate} 
            disabled={isLoading}
          >
            {isLoading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CambiarVida;
