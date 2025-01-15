import React, { useState, useRef, useEffect } from 'react';
import './AIChat.css';
import axios from 'axios';

const AIChat = ({ userName }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const chatEndRef = useRef(null);

  // Add initial message when chat opens
  useEffect(() => {
    if (isChatOpen && chatMessages.length === 0) {
      setChatMessages([{
        user: 'TirePro IA',
        message: '¡Hola! Soy tu asistente de TirePro. ¿En qué puedo ayudarte?'
      }]);
    }
  }, [isChatOpen]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    const trimmedMessage = currentMessage.trim();
    if (!trimmedMessage) return;

    const userMessage = { user: userName || 'Usuario', message: trimmedMessage };
    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
      const response = await axios.post(
        `${backendUrl}/api/ai-chat`,
        { userMessage: trimmedMessage },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.data && response.data.message) {
        setChatMessages(prev => [...prev, {
          user: 'TirePro IA',
          message: response.data.message
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, {
        user: 'TirePro IA',
        message: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Rest of the component remains the same
  return (
    <>
      <div className="chatbox-icon" onClick={() => setIsChatOpen(!isChatOpen)}>
        <i className="bx bxs-magic-wand"></i>
      </div>

      {isChatOpen && (
        <div className="chatbox">
          <div className="chatbox-header">
            <h4>TirePro IA</h4>
            <i className="bx bxs-x-circle" onClick={() => setIsChatOpen(false)}></i>
          </div>
          <div className="chatbox-messages">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`chatbox-message ${msg.user === 'TirePro IA' ? 'ai' : 'user'}`}>
                <strong>{msg.user}:</strong> {msg.message}
              </div>
            ))}
            {isLoading && (
              <div className="chatbox-message ai">
                <strong>TirePro IA:</strong> Escribiendo...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="chatbox-input">
            <input
              type="text"
              value={currentMessage}
              placeholder="Escribe un mensaje..."
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              disabled={isLoading}
            />
            <button 
              onClick={handleSendMessage} 
              disabled={isLoading || !currentMessage.trim()}
            >
              {isLoading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;