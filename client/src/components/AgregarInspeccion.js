import React, { useState } from 'react';
import axios from 'axios';
import './Nueva.css';

const AgregarInspeccion = () => {
  const [placa, setPlaca] = useState('');
  const [filteredTires, setFilteredTires] = useState([]);
  const [profundidadUpdates, setProfundidadUpdates] = useState({});
  const [kilometrajeActual, setKilometrajeActual] = useState('');
  const [loading, setLoading] = useState(false);

  // Search tires by "placa"
  const handlePlacaSearch = async () => {
    if (!placa.trim()) {
      alert('Placa invalida.');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');
    const userId = token ? JSON.parse(atob(token.split('.')[1])).user.id : null;

    if (!userId) {
      alert("Usuario no identificado.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`https://tirepro.onrender.com/api/tires/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const tires = response.data;
      const filtered = tires.filter((tire) => tire.placa.toLowerCase() === placa.toLowerCase());
      setFilteredTires(filtered);
    } catch (error) {
      console.error('Error fetching tire data:', error);
      alert('Error al obtener datos.');
    } finally {
      setLoading(false);
    }
  };

  // Validate all required fields before saving updates
  const validateFields = () => {
    if (!kilometrajeActual.trim()) {
      alert("Por favor, ingresa el kilometraje actual.");
      return false;
    }

    for (const tire of filteredTires) {
      const profundidades = profundidadUpdates[tire._id] || {};
      const currentProfundidades = {
        int: tire.profundidad_int?.[tire.profundidad_int.length - 1]?.value || 0,
        cen: tire.profundidad_cen?.[tire.profundidad_cen.length - 1]?.value || 0,
        ext: tire.profundidad_ext?.[tire.profundidad_ext.length - 1]?.value || 0,
      };

      if (
        profundidades.profundidad_int > currentProfundidades.int ||
        profundidades.profundidad_cen > currentProfundidades.cen ||
        profundidades.profundidad_ext > currentProfundidades.ext
      ) {
        alert(`Las profundidades no pueden ser mayores que las actuales para la llanta ${tire.llanta}.`);
        return false;
      }
    }

    return true;
  };

  // Calculate KMS
  const calculateKms = (lastKilometraje, currentKilometraje, lastKms) => {
    const difference = Math.max(0, currentKilometraje - (lastKilometraje || 0));
    return difference; // Only return the difference to append it as a new value
  };

  const calculateCPK = (costo, kms) => (kms > 0 ? costo / kms : 0);

  const calculateProjectedCPK = (costo, kms, profundidad_inicial, proact) => {
    const projectedKms =
      proact < profundidad_inicial
        ? (kms / (profundidad_inicial - proact)) * profundidad_inicial
        : 0;
    return calculateCPK(costo, projectedKms);
  };

  const handleSaveUpdates = async () => {
    if (!validateFields()) {
      return;
    }
  
    const token = localStorage.getItem('token');
    const userId = token ? JSON.parse(atob(token.split('.')[1])).user.id : null;
  
    if (!userId) {
      alert("Usuario no identificado.");
      return;
    }
  
    try {
      setLoading(true);
  
      // Fetch the latest tire data from the server to ensure up-to-date values
      const response = await axios.get(`https://tirepro.onrender.com/api/tires/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const tires = response.data;
  
      const updates = filteredTires.map((tire) => {
        const profundidades = profundidadUpdates[tire._id] || {};
        const minProfundidad = Math.min(
          profundidades.profundidad_int || 0,
          profundidades.profundidad_cen || 0,
          profundidades.profundidad_ext || 0
        );
  
        const latestTireData = tires.find((t) => t._id === tire._id);
        const lastKilometrajeActual =
          latestTireData?.kilometraje_actual?.[latestTireData.kilometraje_actual.length - 1]?.value || 0;
        const lastKms = latestTireData?.kms?.[latestTireData.kms.length - 1]?.value || 0;
  
        // Calculate difference and new KMS
        const difference = Math.max(0, Number(kilometrajeActual) - lastKilometrajeActual);
        const newKms = lastKms + difference;
  
        // Validate and ensure ascending order
        if (newKms < lastKms) {
          console.error(`Invalid KMS value: ${newKms} is less than ${lastKms}`);
          alert(`Error: Invalid KMS value for tire ${tire.llanta}.`);
          return null;
        }
  
        // Calculate CPK and CPK Proy
        const cpk = tire.costo / newKms;
        const projectedKms =
          minProfundidad > 0
            ? (newKms / (tire.profundidad_inicial - minProfundidad)) * tire.profundidad_inicial
            : 0;
        const cpkProy = projectedKms > 0 ? tire.costo / projectedKms : 0;
  
        return [
          { tireId: tire._id, field: 'profundidad_int', newValue: profundidades.profundidad_int || 0 },
          { tireId: tire._id, field: 'profundidad_cen', newValue: profundidades.profundidad_cen || 0 },
          { tireId: tire._id, field: 'profundidad_ext', newValue: profundidades.profundidad_ext || 0 },
          { tireId: tire._id, field: 'proact', newValue: minProfundidad },
          { tireId: tire._id, field: 'kms', newValue: newKms }, // Append new KMS
          { tireId: tire._id, field: 'cpk', newValue: cpk },
          { tireId: tire._id, field: 'cpk_proy', newValue: cpkProy },
        ];
      }).flat();
  
      const tireIds = filteredTires.map((tire) => tire._id);
  
      // Update `kilometraje_actual` on the server
      await axios.put(
        'https://tirepro.onrender.com/api/tires/update-inspection-date',
        { tireIds, kilometrajeActual },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Update historical fields on the server
      if (updates.length > 0) {
        await axios.put(
          'https://tirepro.onrender.com/api/tires/update-field',
          { tireUpdates: updates },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
  
      alert("Kilometraje_actual, profundidades, KMS, CPK, y CPK proyectado actualizados correctamente.");
      setKilometrajeActual('');
      setProfundidadUpdates({});
      setFilteredTires([]);
      setPlaca('');
    } catch (error) {
      console.error("Error updating fields:", error);
      alert("Error actualizando datos.");
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <div className="section inspeccion-section">
      <h3>Inspección</h3>
      <input
        type="text"
        placeholder="Ingresar placa"
        value={placa}
        onChange={(e) => setPlaca(e.target.value.toLowerCase())}
        className="input-field"
      />
      <button className="search-button" onClick={handlePlacaSearch}>
        {loading ? 'Buscando...' : 'Buscar'}
      </button>

      {filteredTires.length > 0 && (
        <div className="filtered-tires-container">
          {filteredTires.map((tire) => {
            const posLastValue = tire.pos?.[tire.pos.length - 1]?.value || 'N/A';
            const currentProfundidades = {
              int: tire.profundidad_int?.[tire.profundidad_int.length - 1]?.value || 0,
              cen: tire.profundidad_cen?.[tire.profundidad_cen.length - 1]?.value || 0,
              ext: tire.profundidad_ext?.[tire.profundidad_ext.length - 1]?.value || 0,
            };
            return (
              <div key={tire._id} className="tire-card">
                <p><strong>Posición:</strong> {posLastValue}</p>
                <p><strong>Placa:</strong> {tire.placa}</p>
                <p><strong>Llanta:</strong> {tire.llanta}</p>
                <p><strong>Marca:</strong> {tire.marca}</p>
                {['profundidad_int', 'profundidad_cen', 'profundidad_ext'].map((field) => (
                  <div key={field}>
                    <label>{field.replace('_', ' ')}</label>
                    <input
                      type="number"
                      placeholder={`Ingresar ${field}`}
                      value={profundidadUpdates[tire._id]?.[field] || ''}
                      onChange={(e) => {
                        const value = Math.max(
                          0,
                          Math.min(currentProfundidades[field.split('_')[1]], Number(e.target.value))
                        );
                        setProfundidadUpdates((prev) => ({
                          ...prev,
                          [tire._id]: {
                            ...prev[tire._id],
                            [field]: value,
                          },
                        }));
                      }}
                      className="input-field"
                    />
                    <p><small>Actual: {currentProfundidades[field.split('_')[1]]}</small></p>
                  </div>
                ))}
              </div>
            );
          })}
          <input
            type="number"
            placeholder="Ingresar kilometraje_actual"
            value={kilometrajeActual}
            onChange={(e) => setKilometrajeActual(e.target.value)}
            className="input-field"
          />
          <button className="save-button" onClick={handleSaveUpdates}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AgregarInspeccion;
