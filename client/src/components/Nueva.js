import React, { useState } from 'react';
import axios from 'axios';
import './Nueva.css';

const Nueva = () => {
  const [file, setFile] = useState(null);

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

    // Assuming you have access to the user's ID, e.g., from localStorage or context
    const token = localStorage.getItem('token');
    const userId = token ? JSON.parse(atob(token.split('.')[1])).user.id : null;

    if (!userId) {
      alert("User ID not found");
      return;
    }

    formData.append('user', userId); // Attach user ID

    try {
      const response = await axios.post('http://localhost:5001/api/tires/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file");
    }
  };

  return (
    <div className="nueva-container">
      <h2 className="nueva-title">Agregar Nueva Entrada</h2>
      <div className="upload-section">
        <label htmlFor="file-upload" className="upload-label">Subir Archivo Excel:</label>
        <input type="file" id="file-upload" onChange={handleFileChange} className="file-input" accept=".xlsx, .xls, .csv" />
      </div>
      <button className="upload-button" onClick={handleFileUpload}>Upload File</button>
    </div>
  );
};

export default Nueva;
