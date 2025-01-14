import React, { useState } from 'react';
import './AIChat.css';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AIChat = ({ userName }) => {
  const [isChatOpen, setIsChatOpen] = useState(false); // Chat visibility
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize GoogleGenerativeAI
  const genAI = new GoogleGenerativeAI("AIzaSyCrunfb98s81N0F7rbHrdX2OAnVu0VQTfM");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const fetchTireData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("No authentication token found");

      const decodedToken = jwtDecode(token);
      const userId = decodedToken?.user?.id;
      if (!userId) throw new Error("User ID not found in token");

      const response = await axios.get(`https://tirepro.onrender.com/api/tires/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data; // Return tire data
    } catch (error) {
      console.error('Error fetching tire data:', error);
      return []; // Return empty array on error
    }
  };

  const sendMessageToGemini = async (message, tireDataString = '') => {
    try {
      setIsLoading(true);

      // Formulate the AI prompt
      const prompt = tireDataString
        ? `Eres un asistente experto en llantas. Aquí están los datos disponibles: ${tireDataString}. Responde a esta consulta: ${message}.`
        : `Eres un asistente experto en llantas. Responde a esta consulta: ${message}.`;

      // Send the prompt to Gemini
      const response = await model.generateContent(prompt);

      // Return the AI's response text
      return response.response.text();
    } catch (error) {
      console.error('Error communicating with Gemini API:', error);
      return "Lo siento, hubo un error al intentar contactar al asistente.";
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (currentMessage.trim()) {
      // Add user message to chat
      const userMessage = { user: userName || 'Usuario', message: currentMessage };
      setChatMessages((prev) => [...prev, userMessage]);

      // Fetch tire data for the current user
      const tireData = await fetchTireData();
      const tireDataString = tireData
        .map((tire) => `Placa: ${tire.placa}, Marca: ${tire.marca}, Posición: ${tire.pos?.at(-1)?.value || 'N/A'}`)
        .join('; ');

      // Send the query with tire data
      const aiResponse = await sendMessageToGemini(currentMessage, tireDataString);

      // Add AI response to chat
      const aiMessage = { user: 'TirePro IA', message: aiResponse };
      setChatMessages((prev) => [...prev, aiMessage]);

      // Clear the input
      setCurrentMessage('');
    }
  };

  return (
    <>
      {/* Chat Bubble */}
      <div className="chatbox-icon" onClick={toggleChat}>
        <i className="bx bxs-magic-wand"></i>
      </div>

      {/* Chatbox */}
      {isChatOpen && (
        <div className="chatbox">
          <div className="chatbox-header">
            <h4>TirePro IA</h4>
            <i className="bx bxs-x-circle" onClick={toggleChat}></i>
          </div>
          <div className="chatbox-messages">
            {chatMessages.map((msg, index) => (
              <div key={index} className="chatbox-message">
                <strong>{msg.user}:</strong> {msg.message}
              </div>
            ))}
            {isLoading && <div className="chatbox-message">TirePro IA está escribiendo...</div>}
          </div>
          <div className="chatbox-input">
            <input
              type="text"
              value={currentMessage}
              placeholder="Escribe un mensaje..."
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage}>Enviar</button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;
