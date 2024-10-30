// client/src/components/Recomendaciones.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './recomendaciones.css';

const Acontecimientos = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAndGenerateRecommendations = async () => {
      try {
        // Retrieve and decode the user token
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found');

        const decodedToken = jwtDecode(token);
        const userId = decodedToken?.user?.id;
        if (!userId) throw new Error("User ID not found in token");

        // Fetch tire data from the backend for the user
        const response = await axios.get(`http://localhost:5001/api/tires/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tiresData = response.data;

        // Configure the AI model
        const genAI = new GoogleGenerativeAI("AIzaSyAhwbLCdrIZoRkbsoyAvNB2SdFmEu1UWj8");
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Define the AI prompt with user-specific data
        const prompt = `
          Actúa como un experto en mantenimiento de flotas. Basándote en la siguiente información de llantas, genera un analisis de la situacion actual y lo que paso en el pasado:

          Información de llantas:
          ${JSON.stringify(tiresData, null, 2)}

          Proporciona las recomendaciones en formato de puntos, en español, incluyendo lo que consideres pertinente.
        `;

        // Generate recommendations using AI
        const result = await model.generateContent(prompt);
        const generatedText = await result.response.text();
        setRecommendations(generatedText.split('\n').filter(line => line)); // Split response into bullet points

      } catch (error) {
        console.error('Error generating recommendations:', error);
        setError('Error al generar recomendaciones.');
      }
    };

    fetchAndGenerateRecommendations();
  }, []);

  return (
    <div className="recomendaciones-container">
      <h2 className="recomendaciones-title">Recomendaciones</h2>
      <div className="recomendaciones-list">
        {recommendations.length > 0 ? (
          recommendations.map((rec, index) => (
            <div key={index} className="recommendation-item">
              <p>{rec}</p>
            </div>
          ))
        ) : (
          <p>{error || 'Generando recomendaciones...'}</p>
        )}
      </div>
    </div>
  );
};

export default Acontecimientos;
