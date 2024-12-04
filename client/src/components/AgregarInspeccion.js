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
      if (
        profundidades.profundidad_int == null ||
        profundidades.profundidad_cen == null ||
        profundidades.profundidad_ext == null
      ) {
        alert(`Por favor, completa todas las profundidades para la llanta.`);
        return false;
      }
    }

    return true;
  };

  // Save updates: Profundidades and proact
  const handleSaveUpdates = async () => {
    if (!validateFields()) {
      return; // Stop if validation fails
    }

    const tireIds = filteredTires.map((tire) => tire._id);
    const updates = filteredTires.map((tire) => {
      const profundidades = profundidadUpdates[tire._id] || {};
      const minProfundidad = Math.min(
        profundidades.profundidad_int || 0,
        profundidades.profundidad_cen || 0,
        profundidades.profundidad_ext || 0
      );

      return [
        { tireId: tire._id, field: 'profundidad_int', newValue: profundidades.profundidad_int || 0 },
        { tireId: tire._id, field: 'profundidad_cen', newValue: profundidades.profundidad_cen || 0 },
        { tireId: tire._id, field: 'profundidad_ext', newValue: profundidades.profundidad_ext || 0 },
        { tireId: tire._id, field: 'proact', newValue: minProfundidad },
      ];
    }).flat();

    const token = localStorage.getItem('token');

    try {
      setLoading(true);

      await axios.put(
        'https://tirepro.onrender.com/api/tires/update-inspection-date',
        { tireIds, kilometrajeActual },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (updates.length > 0) {
        await axios.put(
          'https://tirepro.onrender.com/api/tires/update-field',
          { tireUpdates: updates },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      alert("Kilometraje_actual y profundidades actualizadas correctamente.");
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
                        const value = Math.max(0, Math.min(30, Number(e.target.value))); // Restrict value between 0 and 30
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
