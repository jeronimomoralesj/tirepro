import React, { useState } from 'react';
import axios from 'axios';
import './Nueva.css';

const Nueva = () => {
  const [file, setFile] = useState(null);
  const [placa, setPlaca] = useState('');
  const [filteredTires, setFilteredTires] = useState([]);
  const [loading, setLoading] = useState(false);
  const [proactUpdates, setProactUpdates] = useState({});
  const [kilometrajeActual, setKilometrajeActual] = useState('');
  const [individualTire, setIndividualTire] = useState({
    llanta: '',
    vida: '',
    placa: '',
    kilometraje_actual: '',
    frente: '',
    marca: '',
    diseno: '',
    banda: '',
    tipovhc: '',
    pos: '',
    proact: '',
    eje: '',
    profundidad_int: '',
    profundidad_cen: '',
    profundidad_ext: '',
    costo: '',
    kms: '',
    dimension: '',
  });

  // Handle file input change
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // Upload Excel file and create tires with events
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
      const response = await axios.post('http://localhost:5001/api/tires/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });

      const { tires, events } = response.data;

      alert(
        `File uploaded successfully: ${tires.length} tires added, ${events.length} events created.`
      );
    } catch (error) {
      if (error.response?.status === 400) {
        const { msg, duplicates } = error.response.data;
        alert(`${msg}\nDuplicates: ${duplicates.join(', ')}`);
      } else {
        console.error("Error uploading file and creating events:", error);
        alert("Error uploading file and creating events.");
      }
    }
  };

  // Search tires by "placa"
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

  // Save updates: Proact, kilometraje_actual, and inspection date
  const handleSaveUpdates = async () => {
    if (!kilometrajeActual || isNaN(kilometrajeActual)) {
      alert("Please enter a valid kilometraje_actual value.");
      return;
    }

    const tireIds = filteredTires.map((tire) => tire._id); // Get all tire IDs for the placa
    const updates = filteredTires.map((tire) => ({
      tireId: tire._id,
      field: 'proact',
      newValue: proactUpdates[tire._id] || tire.proact[tire.proact.length - 1]?.value || 0,
    }));

    const token = localStorage.getItem('token');

    try {
      // Update kilometraje_actual, kms, and inspection date
      await axios.put(
        'http://localhost:5001/api/tires/update-inspection-date',
        { tireIds, kilometrajeActual },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update Proact values
      if (updates.length > 0) {
        await axios.put(
          'http://localhost:5001/api/tires/update-field',
          { tireUpdates: updates },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      alert("Kilometraje_actual, kms, inspection dates, and Proact values updated successfully!");
      setKilometrajeActual('');
      setProactUpdates({});
      setFilteredTires([]);
      setPlaca('');
    } catch (error) {
      console.error("Error updating inspection date or Proact values:", error);
      alert("Error updating inspection date or Proact values.");
    }
  };

  // Handle individual tire input change
  const handleIndividualTireChange = (field, value) => {
    setIndividualTire((prevState) => ({
      ...prevState,
      [field]: field === 'placa' || field === 'frente' || field === 'marca' || field === 'dimension' || field === 'diseno' || field === 'banda' || field === 'eje'
        ? value.toLowerCase() // Convert specific text fields to lowercase
        : value,
    }));
  };

  // Upload individual tire
  const handleSingleTireUpload = async () => {
    const token = localStorage.getItem('token');
    const userId = token ? JSON.parse(atob(token.split('.')[1])).user.id : null;

    if (!userId) {
      alert("User ID not found");
      return;
    }

    try {
      const newTire = { ...individualTire, user: userId };

      const tireResponse = await axios.post(
        'http://localhost:5001/api/tires',
        newTire,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const createdTire = tireResponse.data.tire;

      const event = {
        llanta: createdTire.llanta,
        vida: createdTire.vida,
        pos: createdTire.pos,
        otherevents: [],
        user: createdTire.user,
        placa: createdTire.placa.toLowerCase(),
      };

      await axios.post(
        'http://localhost:5001/api/events/create-many',
        { events: [event] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Tire and associated event uploaded successfully!');
      setIndividualTire({
        llanta: '',
        vida: '',
        placa: '',
        kilometraje_actual: '',
        frente: '',
        marca: '',
        diseno: '',
        banda: '',
        tipovhc: '',
        pos: '',
        proact: '',
        eje: '',
        profundidad_int: '',
        profundidad_cen: '',
        profundidad_ext: '',
        costo: '',
        kms: '',
        dimension: '',
      });
    } catch (error) {
      console.error("Error uploading single tire and event:", error);
      alert("Error uploading single tire and event");
    }
  };

  return (
    <div className="nueva-container">
      <h2 className="nueva-title">Tire Management System</h2>

      {/* File Upload Section */}
      <div className="upload-section">
        <label htmlFor="file-upload" className="upload-label">Upload Excel File:</label>
        <input type="file" id="file-upload" onChange={handleFileChange} className="file-input" accept=".xlsx, .xls, .csv" />
      </div>
      <button className="upload-button" onClick={handleFileUpload}>Upload File</button>

      {/* Individual Tire Upload Section */}
      <div className="single-tire-section">
        <h3>Add Individual Tire</h3>
        {Object.keys(individualTire).map((key) => (
          <input
            key={key}
            type="text"
            value={individualTire[key]}
            placeholder={`Enter ${key.replace('_', ' ')}`}
            onChange={(e) => handleIndividualTireChange(key, e.target.value)}
            className="single-tire-input"
          />
        ))}
        <button className="single-upload-button" onClick={handleSingleTireUpload}>Upload Tire</button>
      </div>

      {/* Search by Placa Section */}
      <div className="search-section">
        <label htmlFor="placa-input" className="search-label">Search by Placa:</label>
        <input
          type="text"
          id="placa-input"
          value={placa}
          onChange={(e) => setPlaca(e.target.value.toLowerCase())}
          className="placa-input"
          placeholder="Enter placa"
        />
        <button className="search-button" onClick={handlePlacaSearch}>Search</button>
      </div>

      {/* Display Filtered Tires */}
      {filteredTires.length > 0 && (
        <div className="filtered-tires-container">
          <h3>Results:</h3>
          <div className="kilometraje-section">
            <label htmlFor="kilometraje-input" className="kilometraje-label">Kilometraje Actual:</label>
            <input
              type="number"
              id="kilometraje-input"
              value={kilometrajeActual}
              onChange={(e) => setKilometrajeActual(e.target.value)}
              className="kilometraje-input"
              placeholder="Enter new kilometraje_actual"
            />
          </div>
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
                onChange={(e) => setProactUpdates((prevState) => ({
                  ...prevState,
                  [tire._id]: Number(e.target.value),
                }))}
                min="0"
                max="50"
              />
            </div>
          ))}
          <button className="save-button" onClick={handleSaveUpdates}>Save Updates</button>
        </div>
      )}
    </div>
  );
};

export default Nueva;