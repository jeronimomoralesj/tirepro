import React, { useState } from 'react';
import './AIChat.css';
import axios from 'axios';

const AIChat = ({ userName }) => {
  const [isChatOpen, setIsChatOpen] = useState(false); // Chat visibility
  const [chatMessages, setChatMessages] = useState([]); // Chat history
  const [currentMessage, setCurrentMessage] = useState(''); // Input message
  const [isLoading, setIsLoading] = useState(false); // Loading state for AI response

  // Toggle chat visibility
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  // Send the user's message to the backend and process the AI response
  const handleSendMessage = async () => {
    if (currentMessage.trim()) {
      // Add user message to chat
      const userMessage = { user: userName || 'Usuario', message: currentMessage };
      setChatMessages((prev) => [...prev, userMessage]);
  
      try {
        setIsLoading(true);
  
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
  
        // Make a request to the AI backend
        const response = await axios.post(
          'http://localhost:5001/api/ai-chat', // Backend endpoint
          { userMessage: currentMessage }, // Send the user's message
          { headers: { Authorization: `Bearer ${token}` } } // Pass the token in the headers
        );
  
        // Add AI's response to the chat
        const aiMessage = { user: 'TirePro IA', message: response.data.message };
        setChatMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        console.error('Error communicating with the AI backend:', error);
  
        // Show an error message in the chat
        const errorMessage = {
          user: 'TirePro IA',
          message: 'Lo siento, hubo un error al intentar contactar al asistente.',
        };
        setChatMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        setCurrentMessage(''); // Clear the input
      }
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
            {/* Render chat messages */}
            {chatMessages.map((msg, index) => (
              <div key={index} className="chatbox-message">
                <strong>{msg.user}:</strong> {msg.message}
              </div>
            ))}
            {/* Show loading message */}
            {isLoading && <div className="chatbox-message">TirePro IA está escribiendo...</div>}
          </div>
          <div className="chatbox-input">
            <input
              type="text"
              value={currentMessage}
              placeholder="Escribe un mensaje..."
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} // Allow pressing Enter to send
            />
            <button onClick={handleSendMessage}>Enviar</button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;
