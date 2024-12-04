import React, { useState } from 'react';
import axios from 'axios';
import './Nueva.css';

const CargaMasiva = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle file input change
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
    } else {
      alert('Por favor, selecciona un archivo Excel válido (.xlsx, .xls).');
      setFile(null);
    }
  };

  // Upload Excel file and check for conflicts
  const handleFileUpload = async () => {
    if (!file) {
      alert('Por favor selecciona un documento válido.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const userId = token ? JSON.parse(atob(token.split('.')[1])).user.id : null;

    if (!userId) {
      alert('Usuario no identificado.');
      return;
    }

    formData.append('user', userId);

    try {
      setLoading(true);

      // Step 1: Fetch existing tires
      const existingTiresResponse = await axios.get(
        `https://tirepro.onrender.com/api/tires/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const existingTires = existingTiresResponse.data;

      // Step 2: Parse and filter the uploaded tires for conflicts
      const response = await axios.post('https://tirepro.onrender.com/api/tires/upload-preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });

      const { tires: uploadedTires } = response.data;

      // Step 3: Check for duplicate `llanta` IDs
      const duplicateLlantas = uploadedTires.filter((newTire) => {
        return existingTires.some((existingTire) => existingTire.llanta === newTire.llanta);
      });

      if (duplicateLlantas.length > 0) {
        const duplicateMessages = duplicateLlantas.map(
          (duplicate) => `Llanta con ID '${duplicate.llanta}' ya existe.`
        );
        alert(`Conflictos detectados:\n${duplicateMessages.join('\n')}`);
        return; // Stop further processing
      }

      // Step 4: Check for `placa` and `pos` conflicts
      const posConflicts = uploadedTires.filter((newTire) => {
        return existingTires.some((existingTire) => {
          const latestPos = existingTire.pos?.at(-1)?.value || null; // Fetch the last position value
          return (
            existingTire.placa.toLowerCase() === newTire.placa.toLowerCase() && // Same placa
            latestPos === newTire.pos // Same position
          );
        });
      });

      if (posConflicts.length > 0) {
        const posConflictMessages = posConflicts.map(
          (conflict) =>
            `Conflicto detectado: Llanta con placa '${conflict.placa}' y posición '${conflict.pos}' ya existe. Por favor libere esta posición en la sección "Agregar Eventos".`
        );
        alert(`Conflictos detectados:\n${posConflictMessages.join('\n')}`);
        return; // Stop further processing
      }

      // Step 5: Confirm successful upload if no conflicts
      const uploadResponse = await axios.post('https://tirepro.onrender.com/api/tires/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });

      const { tires } = uploadResponse.data;
      alert(`Subido con éxito: ${tires.length} llantas agregadas correctamente.`);
    } catch (error) {
      if (error.response?.status === 400) {
        const { msg } = error.response.data;
        alert(`Error: ${msg}`);
      } else {
        console.error('Error al cargar el archivo:', error);
        alert('Error desconocido, asegurate de tener buena conexión y no tener duplicados.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section masiva-section">
      <h3>Carga Masiva</h3>
      <input type="file" onChange={handleFileChange} className="file-input" accept=".xlsx,.xls" />
      <button className="upload-button" onClick={handleFileUpload} disabled={loading}>
        {loading ? 'Cargando...' : 'Subir'}
      </button>
    </div>
  );
};

export default CargaMasiva;
