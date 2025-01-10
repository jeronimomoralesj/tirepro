import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './Nueva.css';
import './CargaMasiva.css';

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

    const token = localStorage.getItem('token');
    const userId = token ? JSON.parse(atob(token.split('.')[1])).user.id : null;

    if (!userId) {
      alert('Usuario no identificado.');
      return;
    }

    try {
      setLoading(true);

      // Read the file content
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Validate repeated placas with different kilometraje_actual
        const placaKilometrajeMap = new Map();
        const conflictingPlacas = new Set();

        jsonData.forEach((row) => {
          const placa = row['placa'];
          const kilometraje = row['kilometraje_actual'];

          if (placa && kilometraje !== undefined) {
            if (
              placaKilometrajeMap.has(placa) &&
              placaKilometrajeMap.get(placa) !== kilometraje
            ) {
              conflictingPlacas.add(placa);
            } else {
              placaKilometrajeMap.set(placa, kilometraje);
            }
          }
        });

        if (conflictingPlacas.size > 0) {
          alert(
            `Error: Se encontraron placas con diferentes valores de kilometraje_actual:\n${[
              ...conflictingPlacas,
            ].join(', ')}`
          );
          setLoading(false);
          return;
        }

        // Proceed with uploading the file
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user', userId);

        try {
          const response = await axios.post(
            'http://localhost:5001/api/tires/upload',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
              },
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
            alert(
              'Error desconocido, asegurate de tener buena conexión y no tener duplicados.'
            );
          }
        } finally {
          setLoading(false);
        }
      };

      fileReader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error al validar el archivo:', error);
      alert('Error desconocido durante la validación del archivo.');
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
