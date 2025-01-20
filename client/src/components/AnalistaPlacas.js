import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AnalistaPlacas.css';

const AnalisisPlacas = () => {
  const [analysisResults, setAnalysisResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.post(
          'http://localhost:5001/api/ai-chat/analyze-by-placa',
          {}
        );

        console.log('API Response:', response.data); // Debug API Response
        setAnalysisResults(response.data.results || []);
      } catch (err) {
        console.error('Error fetching analysis data:', err);
        setError(err.response?.data?.error || 'Error fetching analysis data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, []);

  const renderPlacaTable = (placa, tires, recommendations) => (
    <div key={placa} className="placa-section">
      <h2 className="placa-title">Placa: {placa}</h2>

      <div className="recommendations-section">
        <h3>Recomendaciones</h3>
        {Array.isArray(recommendations) && recommendations.length > 0 ? (
          <ul>
            {recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        ) : (
          <p>No hay recomendaciones disponibles.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="analisis-placas-container">
      <h1 className="title">Análisis por Placa</h1>

      {loading && <p className="loading">Cargando análisis...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && analysisResults.length > 0 ? (
        analysisResults.map(({ placa, recommendations }) =>
          renderPlacaTable(
            placa,
            [], // Pass an empty array for tires if not used
            recommendations || [] // Pass recommendations
          )
        )
      ) : (
        !loading && !error && <p className="no-data">No se encontraron datos para analizar.</p>
      )}
    </div>
  );
};

export default AnalisisPlacas;
