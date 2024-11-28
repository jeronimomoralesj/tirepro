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
      const uploadResponse = await axios.post('https://tirepro.onrender.com/api/tires/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });

      const tires = uploadResponse.data.tires;

      if (!Array.isArray(tires)) {
        throw new Error('Unexpected response format: tires data is not an array');
      }

      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file");
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
      const response = await axios.get(`https://tirepro.onrender.com/api/tires/user/${userId}`, {
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
        'https://tirepro.onrender.com/api/tires/update-field',
        { tireUpdates: updates },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(`Proact values updated successfully.`);
      setProactUpdates({});
      setFilteredTires([]);
      setPlaca('');
    } catch (error) {
      console.error('Error updating Proact values:', error);
      alert('Error updating Proact values.');
    }
  };

  const handleIndividualTireChange = (field, value) => {
    setIndividualTire((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSingleTireUpload = async () => {
    const token = localStorage.getItem('token');
    const userId = token ? JSON.parse(atob(token.split('.')[1])).user.id : null;
  
    if (!userId) {
      alert("User ID not found");
      return;
    }
  
    try {
      const currentDate = new Date();
      const newTire = {
        llanta: individualTire.llanta || 0,
        vida: [
          {
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear(),
            value: individualTire.vida || 'N/A',
          },
        ],
        placa: individualTire.placa || 'Unknown',
        kilometraje_actual: [
          {
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear(),
            value: parseFloat(individualTire.kilometraje_actual) || 0,
          },
        ],
        frente: individualTire.frente || 'N/A',
        marca: individualTire.marca || 'N/A',
        diseno: individualTire.diseno || 'N/A',
        banda: individualTire.banda || 'N/A',
        tipovhc: individualTire.tipovhc || 'N/A',
        pos: [
          {
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear(),
            value: parseFloat(individualTire.pos) || 0,
          },
        ],
        original: individualTire.original || 'N/A',
        profundidad_int: [
          {
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear(),
            value: parseFloat(individualTire.profundidad_int) || 0,
          },
        ],
        profundidad_cen: [
          {
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear(),
            value: parseFloat(individualTire.profundidad_cen) || 0,
          },
        ],
        profundidad_ext: [
          {
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear(),
            value: parseFloat(individualTire.profundidad_ext) || 0,
          },
        ],
        costo: parseFloat(individualTire.costo) || 0,
        kms: [
          {
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear(),
            value: parseFloat(individualTire.kms) || 0,
          },
        ],
        dimension: individualTire.dimension || 'N/A',
        proact: [
          {
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear(),
            value: parseFloat(individualTire.proact) || 0,
          },
        ],
        eje: individualTire.eje || 'N/A',
        KMS_x_MM: parseFloat(individualTire.KMS_x_MM) || 0,
        pro_mes: parseFloat(individualTire.pro_mes) || 0,
        costo_por_mes: parseFloat(individualTire.costo_por_mes) || 0,
        costo_remanente: parseFloat(individualTire.costo_remanente) || 0,
        proyeccion_fecha: currentDate,
        ultima_inspeccion: currentDate,
        user: userId,
      };
  
      const response = await axios.post(
        'https://tirepro.onrender.com/api/tires',
        newTire,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      alert('Tire uploaded successfully!');
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
      console.error("Error uploading single tire:", error);
      alert("Error uploading single tire");
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

      {/* Individual Tire Upload Section */}
      <div className="single-tire-section">
        <h3>Agregar Una Llanta</h3>
        {Object.keys(individualTire).map((key) => (
          <input
            key={key}
            type="text"
            value={individualTire[key]}
            placeholder={`Ingresar ${key.replace('_', ' ')}`}
            onChange={(e) => handleIndividualTireChange(key, e.target.value)}
            className="single-tire-input"
          />
        ))}
        <button className="single-upload-button" onClick={handleSingleTireUpload}>Subir Llanta</button>
      </div>
    </div>
  );
};

export default Nueva;
