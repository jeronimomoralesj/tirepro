import React, { useState } from 'react';
import axios from 'axios';
import './Nueva.css';

const AgregarInspeccion = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTires, setFilteredTires] = useState([]);
  const [profundidadUpdates, setProfundidadUpdates] = useState({});
  const [presionUpdates, setPresionUpdates] = useState({});
  const [kilometrajeActual, setKilometrajeActual] = useState('');
  const [loading, setLoading] = useState(false);
  const [addPressure, setAddPressure] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      alert('Por favor, ingresa una placa o ID de llanta.');
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
      const searchByLlanta = !isNaN(searchTerm);

      const filtered = searchByLlanta
        ? tires.filter((tire) => tire.llanta === searchTerm)
        : tires.filter((tire) => tire.placa.toLowerCase() === searchTerm.toLowerCase());

      if (!searchByLlanta) {
        filtered.sort((a, b) => {
          const posA = a.pos?.[a.pos.length - 1]?.value || 0;
          const posB = b.pos?.[b.pos.length - 1]?.value || 0;
          return posA - posB;
        });
      }

      setFilteredTires(filtered);
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
        alert(`Por favor, completa todas las profundidades para la llanta ${tire.llanta}.`);
        return false;
      }

      if (addPressure && presionUpdates[tire._id] == null) {
        alert(`Por favor, completa la presión para la llanta ${tire.llanta}.`);
        return false;
      }

      const lastKilometrajeActual =
        tire.kilometraje_actual?.[tire.kilometraje_actual.length - 1]?.value || 0;

      if (currentKilometrajeActual < lastKilometrajeActual) {
        alert(`El kilometraje actual para la llanta ${tire.llanta} no puede ser menor que el último valor registrado (${lastKilometrajeActual}).`);
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

  const calculateKms = (lastKilometraje, currentKilometraje, lastKms) => {
    const difference = Math.max(0, currentKilometraje - (lastKilometraje || 0));
    return lastKms + difference;
  };

  const calculateCPK = (costo, kms) => (kms > 0 ? costo / kms : 0);

  const calculateProjectedCPK = (costo, kms, profundidad_inicial, proact) => {
    if (proact >= profundidad_inicial) return 0; // Avoid division by zero
    const projectedKms = (kms / (profundidad_inicial - proact)) * profundidad_inicial;
    return projectedKms > 0 ? costo / projectedKms : 0;
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

      const currentKilometrajeActual = Number(kilometrajeActual);

      const updates = filteredTires.map((tire) => {
        const profundidades = profundidadUpdates[tire._id] || {};
        const minProfundidad = Math.min(
          profundidades.profundidad_int || 0,
          profundidades.profundidad_cen || 0,
          profundidades.profundidad_ext || 0
        );

        const lastKilometrajeActual =
          tire.kilometraje_actual?.[tire.kilometraje_actual.length - 1]?.value || 0;
        const lastKms = tire.kms?.[tire.kms.length - 1]?.value || 0;

        const newKms = calculateKms(lastKilometrajeActual, currentKilometrajeActual, lastKms);
        const cpk = calculateCPK(tire.costo, newKms);
        const cpkProy = calculateProjectedCPK(
          tire.costo,
          newKms,
          tire.profundidad_inicial,
          minProfundidad
        );

        const updatesArray = [
          { tireId: tire._id, field: 'profundidad_int', newValue: profundidades.profundidad_int || 0 },
          { tireId: tire._id, field: 'profundidad_cen', newValue: profundidades.profundidad_cen || 0 },
          { tireId: tire._id, field: 'profundidad_ext', newValue: profundidades.profundidad_ext || 0 },
          { tireId: tire._id, field: 'proact', newValue: minProfundidad },
          { tireId: tire._id, field: 'kms', newValue: newKms },
          { tireId: tire._id, field: 'cpk', newValue: cpk },
          { tireId: tire._id, field: 'cpk_proy', newValue: cpkProy },
        ];

        if (addPressure) {
          updatesArray.push({
            tireId: tire._id,
            field: 'presion',
            newValue: presionUpdates[tire._id] || 0,
          });
        }

        return updatesArray;
      }).flat();

      const tireIds = filteredTires.map((tire) => tire._id);

      await axios.put(
        'https://tirepro.onrender.com/api/tires/update-inspection-date',
        { tireIds, kilometrajeActual: currentKilometrajeActual },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (updates.length > 0) {
        await axios.put(
          'https://tirepro.onrender.com/api/tires/update-field',
          { tireUpdates: updates },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      alert("Datos actualizados correctamente.");
      setKilometrajeActual('');
      setProfundidadUpdates({});
      setPresionUpdates({});
      setFilteredTires([]);
      setSearchTerm('');
      setAddPressure(false);
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
        placeholder="Ingresar placa o ID de llanta"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        className="input-field"
      />
      <button className="search-button" onClick={handleSearch}>
        {loading ? 'Buscando...' : 'Buscar'}
      </button>

      {filteredTires.length > 0 && (
        <div className="filtered-tires-container">
          <button
            className="add-pressure-button"
            onClick={() => setAddPressure((prev) => !prev)}
          >
            {addPressure ? 'Quitar Presión' : 'Agregar Presión'}
          </button>
          {filteredTires.map((tire) => {
            const currentProfundidades = {
              int: tire.profundidad_int?.[tire.profundidad_int.length - 1]?.value || 0,
              cen: tire.profundidad_cen?.[tire.profundidad_cen.length - 1]?.value || 0,
              ext: tire.profundidad_ext?.[tire.profundidad_ext.length - 1]?.value || 0,
            };
            return (
              <div key={tire._id} className="tire-card">
                <p><strong>Placa:</strong> {tire.placa}</p>
                <p><strong>Llanta:</strong> {tire.llanta}</p>
                {['profundidad_int', 'profundidad_cen', 'profundidad_ext'].map((field) => (
                  <div key={field}>
                    <label>{field.replace('_', ' ')}</label>
                    <input
                      type="number"
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
                  </div>
                ))}
                {addPressure && (
                  <div>
                    <label>Presión de Llanta</label>
                    <input
                      type="number"
                      value={presionUpdates[tire._id] || ''}
                      onChange={(e) => {
                        const value = Math.max(0, Number(e.target.value));
                        setPresionUpdates((prev) => ({
                          ...prev,
                          [tire._id]: value,
                        }));
                      }}
                      className="input-field"
                    />
                  </div>
                )}
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
