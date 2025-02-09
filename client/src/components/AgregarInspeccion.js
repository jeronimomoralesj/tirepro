import React, { useState } from 'react';
import axios from 'axios';
import './Nueva.css';
import './AgregarInspeccion.css';

const AgregarInspeccion = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTires, setFilteredTires] = useState([]);
  const [profundidadUpdates, setProfundidadUpdates] = useState({});
  const [presionUpdates, setPresionUpdates] = useState({});
  const [kilometrajeActual, setKilometrajeActual] = useState('');
  const [loading, setLoading] = useState(false);
  const [addPressure, setAddPressure] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState({});

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      alert('Por favor, ingresa una placa o ID de llanta.');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');
    const userId = token ? JSON.parse(atob(token.split('.')[1])).user.id : null;
    const companyId = token ? JSON.parse(atob(token.split('.')[1])).user.companyId : null;  // Changed to companyId
    if (!userId) {
      alert("Usuario no identificado.");
      setLoading(false);
      return;
    }

    if (!companyId) {
      alert("ID de la empresa no encontrado.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`https://tirepro.onrender.com/api/tires/user/${companyId}`, {
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

  const uploadImageToS3 = async (tireId, file) => {
    try {
      const { data } = await axios.post('https://tirepro.onrender.com/api/s3/presigned-url', {
        tireId,
        fileName: file.name,
      });
  
      // Upload the file to the S3 presigned URL
      await axios.put(data.url, file, {
        headers: {
          'Content-Type': file.type,
        },
      });
  
      return data.url.split('?')[0]; // Return the uploaded file URL without query parameters
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir imagen.');
      return null;
    }
  };
  

  const handleSaveUpdates = async () => {
    if (!validateFields()) {
      return;
    }
  
    const token = localStorage.getItem('token');
    const userId = token ? JSON.parse(atob(token.split('.')[1])).user.id : null;
    const userName = token ? JSON.parse(atob(token.split('.')[1])).user.name : null; // Get user's name

    if (!userId) {
      alert("Usuario no identificado.");
      return;
    }
  
    try {
      setLoading(true);
  
      const currentKilometrajeActual = Number(kilometrajeActual);
  
      const updates = await Promise.all(
        filteredTires.map(async (tire) => {
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
  
          // Upload the image and get the URL
          const imageUrl = selectedFiles[tire._id]
            ? await uploadImageToS3(tire._id, selectedFiles[tire._id])
            : null;
  
          const updatesArray = [
            { tireId: tire._id, field: 'profundidad_int', newValue: profundidades.profundidad_int || 0 },
            { tireId: tire._id, field: 'profundidad_cen', newValue: profundidades.profundidad_cen || 0 },
            { tireId: tire._id, field: 'profundidad_ext', newValue: profundidades.profundidad_ext || 0 },
            { tireId: tire._id, field: 'proact', newValue: minProfundidad },
            { tireId: tire._id, field: 'kms', newValue: newKms },
            { tireId: tire._id, field: 'cpk', newValue: cpk },
            { tireId: tire._id, field: 'cpk_proy', newValue: cpkProy },
          ];
  
          if (imageUrl) {
            updatesArray.push({ tireId: tire._id, field: 'images', newValue: imageUrl });
          }
  
          if (addPressure) {
            updatesArray.push({
              tireId: tire._id,
              field: 'presion',
              newValue: presionUpdates[tire._id] || 0,
            });
          }
  
          return updatesArray;
        })
      );
  
      const tireIds = filteredTires.map((tire) => tire._id);
  
      await axios.put(
        'https://tirepro.onrender.com/api/tires/update-inspection-date',
        { tireIds, kilometrajeActual: currentKilometrajeActual,
          inspectorName: userId,
         },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (updates.flat().length > 0) {
        await axios.put(
          'https://tirepro.onrender.com/api/tires/update-field',
          { tireUpdates: updates.flat() },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
  
      try {
        // Increment the user's pointcount
        await axios.put(
          'https://tirepro.onrender.com/api/auth/update-pointcount',
          { userId, incrementBy: 1 }, // Pass the userId and incrementBy value
          { headers: { Authorization: `Bearer ${token}` } }
        );        
        alert("Datos actualizados correctamente y punto añadido al usuario.");
      } catch (error) {
        console.error("Error updating user's pointcount:", error);
        alert("Datos actualizados, pero hubo un problema al actualizar el puntaje del usuario.");
      }
      
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
            {addPressure ? 'Quitar Presión' : 'Incluir Presión'}
          </button>
          {filteredTires.map((tire) => {
            const currentProfundidades = {
              int: tire.profundidad_int?.[tire.profundidad_int.length - 1]?.value || 0,
              cen: tire.profundidad_cen?.[tire.profundidad_cen.length - 1]?.value || 0,
              ext: tire.profundidad_ext?.[tire.profundidad_ext.length - 1]?.value || 0,
            };
            const currentPos = tire.pos?.[tire.pos.length - 1]?.value || 'N/A';
            return (
              <div key={tire._id} className="tire-card">
                <p><strong>Placa:</strong> {tire.placa}</p>
                <p><strong>Llanta:</strong> {tire.llanta}</p>
                <p><strong>Marca:</strong> {tire.marca}</p>
                <p><strong>Posición:</strong> {currentPos}</p>
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
                <div>
                  <label>Subir Imagen</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setSelectedFiles((prev) => ({
                        ...prev,
                        [tire._id]: e.target.files[0],
                      }))
                    }
                  />
                </div>
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
