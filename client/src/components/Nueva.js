import React, { useState } from 'react';
import axios from 'axios';
import './Nueva.css';

const Nueva = () => {
  const [file, setFile] = useState(null);
  const [placa, setPlaca] = useState('');
  const [tireData, setTireData] = useState([]);
  const [filteredTires, setFilteredTires] = useState([]);
  const [loading, setLoading] = useState(false);
  const [proactUpdates, setProactUpdates] = useState({});

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
  if (!file) {
    alert("Please select a file to upload");
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('token');
  const userId = token ? JSON.parse(atob(token.split('.')[1])).user.id : null;

  if (!userId) {
    alert("User ID not found");
    return;
  }

  formData.append('user', userId);

  try {
    const uploadResponse = await axios.post('http://localhost:5001/api/tires/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const tires = uploadResponse.data.tires;

    if (!Array.isArray(tires)) {
      throw new Error('Unexpected response format: tires data is not an array');
    }

    // Map tires to events format, including `placa`
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const events = tires.map((tire) => ({
      llanta: tire.llanta,
      vida: tire.vida.map((entry) => ({
        day: entry.day || day,
        month: entry.month || month,
        year: entry.year || year,
        value: entry.value,
      })),
      pos: tire.pos.map((entry) => ({
        day: entry.day || day,
        month: entry.month || month,
        year: entry.year || year,
        value: entry.value,
      })),
      otherevents: [], // Start as empty
      user: userId,
      placa: tire.placa, // Add `placa` to the event
    }));

    // Send events to the backend
    await axios.post('http://localhost:5001/api/events/create-many', { events }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    alert("File uploaded and events created successfully!");
  } catch (error) {
    console.error("Error uploading file or creating events:", error);
    alert("Error uploading file or creating events");
  }
};

  

  const handlePlacaSearch = async () => {
    if (!placa.trim()) {
      alert('Please enter a valid placa.');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');
    const userId = token ? JSON.parse(atob(token.split('.')[1])).user.id : null;

    if (!userId) {
      alert("User ID not found");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5001/api/tires/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const tires = response.data;
      const filtered = tires.filter((tire) => tire.placa.toLowerCase() === placa.toLowerCase());
      setFilteredTires(filtered);
    } catch (error) {
      console.error('Error fetching tire data:', error);
      alert('Error fetching tire data.');
    } finally {
      setLoading(false);
    }
  };

  const handleProactChange = (tireId, value) => {
    if (value < 0 || value > 50) {
      alert('Value must be between 0 and 50');
      return;
    }

    setProactUpdates((prevState) => ({
      ...prevState,
      [tireId]: value,
    }));
  };

  const handleSaveProact = async () => {
    const updates = filteredTires.map((tire) => ({
      tireId: tire._id,
      field: 'proact',
      newValue: proactUpdates[tire._id] || tire.proact[tire.proact.length - 1]?.value || 0,
    }));

    const token = localStorage.getItem('token');

    try {
      await axios.put(
        'http://localhost:5001/api/tires/update-field',
        { tireUpdates: updates },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Proact values updated successfully.');
      setProactUpdates({});
      setFilteredTires([]);
      setPlaca('');
    } catch (error) {
      console.error('Error updating Proact values:', error);
      alert('Error updating Proact values.');
    }
  };

  return (
    <div className="nueva-container">
      <h2 className="nueva-title">Agregar Nueva Entrada</h2>

      {/* File Upload Section */}
      <div className="upload-section">
        <label htmlFor="file-upload" className="upload-label">Subir Archivo Excel:</label>
        <input type="file" id="file-upload" onChange={handleFileChange} className="file-input" accept=".xlsx, .xls, .csv" />
      </div>
      <button className="upload-button" onClick={handleFileUpload}>Upload File</button>

      {/* Search by Placa Section */}
      <div className="search-section">
        <label htmlFor="placa-input" className="search-label">Buscar por Placa:</label>
        <input
          type="text"
          id="placa-input"
          value={placa}
          onChange={(e) => setPlaca(e.target.value)}
          className="placa-input"
          placeholder="Ingresa la placa"
        />
        <button className="search-button" onClick={handlePlacaSearch}>Buscar</button>
      </div>

      {/* Loading Indicator */}
      {loading && <div className="loading-indicator">Cargando...</div>}

      {/* Display Filtered Tires */}
      {filteredTires.length > 0 && (
        <div className="filtered-tires-container">
          <h3 className="filtered-tires-title">Resultados:</h3>
          {filteredTires.map((tire) => (
            <div key={tire._id} className="tire-card">
              <p><strong>Placa:</strong> {tire.placa}</p>
              <p><strong>Llanta:</strong> {tire.llanta}</p>
              <p><strong>Marca:</strong> {tire.marca}</p>
              <input
                type="number"
                className="proact-input"
                placeholder="Proact"
                value={proactUpdates[tire._id] || ''}
                onChange={(e) => handleProactChange(tire._id, Number(e.target.value))}
                min="0"
                max="50"
              />
            </div>
          ))}
          <button className="save-button" onClick={handleSaveProact}>Guardar Cambios</button>
        </div>
      )}
    </div>
  );
};

export default Nueva;
