import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Nueva.css';

const NuevaEmpleado = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTires, setFilteredTires] = useState([]);
  const [profundidadUpdates, setProfundidadUpdates] = useState({});
  const [presionUpdates, setPresionUpdates] = useState({});
  const [kilometrajeActual, setKilometrajeActual] = useState('');
  const [loading, setLoading] = useState(false);
  const [addPressure, setAddPressure] = useState(false);
  const [placas, setPlacas] = useState([]);
  const [selectedPlaca, setSelectedPlaca] = useState('');

  const token = localStorage.getItem('token');
  const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const companyId = decodedToken?.user?.companyId;

  useEffect(() => {
    const fetchPlacas = async () => {
      try {
        const response = await axios.get(
          `https://tirepro.onrender.com/api/auth/users/${decodedToken.user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPlacas(response.data.placa || []);
      } catch (error) {
        console.error('Error fetching placas:', error);
        alert('Error al obtener las placas.');
      }
    };
    fetchPlacas();
  }, [token, decodedToken]);

  const handleSearch = async () => {
    if (!selectedPlaca) {
      alert('Por favor selecciona una placa.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `https://tirepro.onrender.com/api/tires/user/${companyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const tires = response.data.filter((tire) => tire.placa === selectedPlaca);
      setFilteredTires(tires);
    } catch (error) {
      console.error('Error fetching tire data:', error);
      alert('Error al obtener datos.');
    } finally {
      setLoading(false);
    }
  };

  const validateFields = () => {
    if (!kilometrajeActual.trim()) {
      alert("Por favor, ingresa el kilometraje actual.");
      return false;
    }

    const currentKilometrajeActual = Number(kilometrajeActual);

    for (const tire of filteredTires) {
      const profundidades = profundidadUpdates[tire._id] || {};
      const allProfundidadesFilled =
        profundidades.profundidad_int != null &&
        profundidades.profundidad_cen != null &&
        profundidades.profundidad_ext != null;

      if (!allProfundidadesFilled) {
        alert(`Completa todas las profundidades para la llanta ${tire.llanta}.`);
        return false;
      }

      const lastKilometrajeActual =
        tire.kilometraje_actual?.[tire.kilometraje_actual.length - 1]?.value || 0;

      if (currentKilometrajeActual < lastKilometrajeActual) {
        alert(
          `El kilometraje actual (${currentKilometrajeActual}) no puede ser menor que el último valor registrado (${lastKilometrajeActual}) para la llanta ${tire.llanta}.`
        );
        return false;
      }

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

  const handleSaveUpdates = async () => {
    if (!validateFields()) return;

    try {
      setLoading(true);

      const updates = filteredTires.map((tire) => {
        const profundidades = profundidadUpdates[tire._id] || {};
        const proact = Math.min(
          profundidades.profundidad_int || 0,
          profundidades.profundidad_cen || 0,
          profundidades.profundidad_ext || 0
        );

        return [
          { tireId: tire._id, field: 'profundidad_int', newValue: profundidades.profundidad_int },
          { tireId: tire._id, field: 'profundidad_cen', newValue: profundidades.profundidad_cen },
          { tireId: tire._id, field: 'profundidad_ext', newValue: profundidades.profundidad_ext },
          { tireId: tire._id, field: 'proact', newValue: proact },
        ];
      }).flat();

      const tireIds = filteredTires.map((tire) => tire._id);

      await axios.put(
        'https://tirepro.onrender.com/api/tires/update-inspection-date',
        { tireIds, kilometrajeActual: Number(kilometrajeActual) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (updates.length > 0) {
        await axios.put(
          'https://tirepro.onrender.com/api/tires/update-field',
          { tireUpdates: updates },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      alert('Datos actualizados correctamente.');
      setFilteredTires([]);
      setProfundidadUpdates({});
      setKilometrajeActual('');
    } catch (error) {
      console.error('Error saving updates:', error);
      alert('Error al guardar los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section inspeccion-section">
      <h3>Inspección de Llantas</h3>

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

      <button onClick={handleSearch} className="search-button" disabled={loading}>
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
                    onChange={(e) =>
                      setProfundidadUpdates((prev) => ({
                        ...prev,
                        [tire._id]: {
                          ...prev[tire._id],
                          [field]: Number(e.target.value),
                        },
                      }))
                    }
                    className="input-field"
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
