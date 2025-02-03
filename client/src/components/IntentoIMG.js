import React, { useState } from 'react';

function IntentoIMG() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [error, setError] = useState('');

  // Handles file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Please select an image to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("https://tireproapp-models.onrender.com/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error with the API: ${response.statusText}`);
      }

      const data = await response.json();
      setPrediction(data.prediction);
      setError('');
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h1>Upload Tire Image</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} accept="image/*" />
        <button type="submit" style={{ marginTop: "10px", padding: "10px 15px" }}>
          Predict
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {prediction && (
        <div style={{ marginTop: "20px" }}>
          <h2>Prediction:</h2>
          <p>{prediction}</p>
        </div>
      )}
    </div>
  );
}

export default IntentoIMG;
