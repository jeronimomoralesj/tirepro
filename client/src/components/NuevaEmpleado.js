import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Nueva.css';

const NuevaEmpleado = () => {
  const [placas, setPlacas] = useState([]);
  const [selectedPlaca, setSelectedPlaca] = useState('');
  const [filteredTires, setFilteredTires] = useState([]);
  const [profundidadUpdates, setProfundidadUpdates] = useState({});
  const [presionUpdates, setPresionUpdates] = useState({});
  const [kilometrajeActual, setKilometrajeActual] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const decodedToken = token ? jwtDecode(token) : null;
  const userId = decodedToken?.user?.id;
  const companyId = decodedToken?.user?.companyId;

  useEffect(() => {
    const fetchUserPlacas = async () => {
      if (!userId || !token) return;
      try {
        const response = await axios.get(
          `http://localhost:5001/api/auth/users/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPlacas(response.data.placa || []);
      } catch (error) {
        console.error('Error fetching placas:', error);
        alert('Error al obtener las placas.');
      }
    };
    fetchUserPlacas();
  }, [userId, token]);

  const handleSearch = async () => {
    if (!selectedPlaca) {
      alert('Por favor selecciona una placa.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5001/api/tires/user/${companyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const tires = response.data.filter((tire) => tire.placa === selectedPlaca);
      setFilteredTires(tires);
    } catch (error) {
      console.error('Error fetching tires:', error);
      alert('Error al obtener llantas.');
    } finally {
      setLoading(false);
    }
  };

  const validateFields = () => {
    if (!kilometrajeActual.trim()) {
      alert('Por favor, ingresa el kilometraje actual.');
      return false;
    }

    const currentKilometraje = Number(kilometrajeActual);

    for (const tire of filteredTires) {
      const profundidades = profundidadUpdates[tire._id] || {};

      // Check if all required profundidades are filled
      if (
        profundidades.profundidad_int == null ||
        profundidades.profundidad_cen == null ||
        profundidades.profundidad_ext == null
      ) {
        alert(`Completa todas las profundidades para la llanta ${tire.llanta}.`);
        return false;
      }

      // Validate kilometraje_actual
      const lastKilometraje =
        tire.kilometraje_actual?.[tire.kilometraje_actual.length - 1]?.value || 0;
      if (currentKilometraje < lastKilometraje) {
        alert(
          `El kilometraje actual (${currentKilometraje}) no puede ser menor que el último registrado (${lastKilometraje}) para la llanta ${tire.llanta}.`
        );
        return false;
      }

      // Validate profundidades
      const lastProfundidades = {
        int: tire.profundidad_int?.[tire.profundidad_int.length - 1]?.value || 0,
        cen: tire.profundidad_cen?.[tire.profundidad_cen.length - 1]?.value || 0,
        ext: tire.profundidad_ext?.[tire.profundidad_ext.length - 1]?.value || 0,
      };

      if (
        profundidades.profundidad_int > lastProfundidades.int ||
        profundidades.profundidad_cen > lastProfundidades.cen ||
        profundidades.profundidad_ext > lastProfundidades.ext
      ) {
        alert(
          `Las profundidades no pueden ser mayores que las registradas (${lastProfundidades.int}, ${lastProfundidades.cen}, ${lastProfundidades.ext}) para la llanta ${tire.llanta}.`
        );
        return false;
      }
    }

    return true;
  };

  const handleSaveUpdates = async () => {
    if (!validateFields()) return;

    try {
      setLoading(true);

      const updates = filteredTires.map((tire) => {
        const profundidades = profundidadUpdates[tire._id] || {};
        return [
          { tireId: tire._id, field: 'profundidad_int', newValue: profundidades.profundidad_int },
          { tireId: tire._id, field: 'profundidad_cen', newValue: profundidades.profundidad_cen },
          { tireId: tire._id, field: 'profundidad_ext', newValue: profundidades.profundidad_ext },
        ];
      }).flat();

      const tireIds = filteredTires.map((tire) => tire._id);

      await axios.put(
        'http://localhost:5001/api/tires/update-field',
        { tireUpdates: updates },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await axios.put(
        'http://localhost:5001/api/tires/update-inspection-date',
        { tireIds, kilometrajeActual: Number(kilometrajeActual) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Datos actualizados correctamente.');
      setFilteredTires([]);
      setProfundidadUpdates({});
      setKilometrajeActual('');
    } catch (error) {
      console.error('Error saving updates:', error);
      alert('Error al actualizar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section inspeccion-section">
      <h3>Inspección de Llantas</h3>

      {/* Select Placa */}
      <label>Seleccionar Placa:</label>
      <select
        value={selectedPlaca}
        onChange={(e) => setSelectedPlaca(e.target.value)}
        className="input-field"
      >
        <option value="">Seleccione una placa</option>
        {placas.map((placa, index) => (
          <option key={index} value={placa}>
            {placa}
          </option>
        ))}
      </select>

      <button className="search-button" onClick={handleSearch} disabled={loading}>
        {loading ? 'Buscando...' : 'Buscar'}
      </button>

      {filteredTires.length > 0 && (
        <div>
          {filteredTires.map((tire) => (
            <div key={tire._id} className="tire-card">
              <p><strong>Placa:</strong> {tire.placa}</p>
              <p><strong>Llanta:</strong> {tire.llanta}</p>
              {['profundidad_int', 'profundidad_cen', 'profundidad_ext'].map((field) => (
                <div key={field}>
                  <label>{field.replace('_', ' ')}</label>
                  <input
                    type="number"
                    className="input-field"
                    onChange={(e) =>
                      setProfundidadUpdates((prev) => ({
                        ...prev,
                        [tire._id]: {
                          ...prev[tire._id],
                          [field]: Number(e.target.value),
                        },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          ))}
          <input
            type="number"
            placeholder="Kilometraje Actual"
            value={kilometrajeActual}
            onChange={(e) => setKilometrajeActual(e.target.value)}
            className="input-field"
          />
          <button className="save-button" onClick={handleSaveUpdates}>
            Guardar
          </button>
        </div>
      )}
    </div>
  );
};

export default NuevaEmpleado;
