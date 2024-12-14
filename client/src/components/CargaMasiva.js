import React, { useState } from 'react';
import axios from 'axios';
import './Nueva.css';
import './CargaIndividual.css';

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
  
      let existingTires = [];
  
      try {
        const existingTiresResponse = await axios.get(
          `https://tirepro.onrender.com/api/tires/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        existingTires = existingTiresResponse.data;
      } catch (error) {
        if (error.response?.status === 404) {
          console.warn('No existing tire data found for this user. Proceeding with upload.');
        } else {
          throw error;
        }
      }
  
      // Skip conflict detection if no existing tires
      const response = await axios.post(
        'https://tirepro.onrender.com/api/tires/upload',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
        }
      );
  
      const { tires, events } = response.data;
      alert(
        `Subido con éxito:\n- ${tires.length} llantas agregadas\n- ${events.length} eventos creados.`
      );
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
