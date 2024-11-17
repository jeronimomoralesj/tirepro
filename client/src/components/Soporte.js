import React from 'react';
import { FaEnvelope } from 'react-icons/fa';
import './Soporte.css';

const Soporte = () => {
  return (
    <div className="soporte-container">
      <h2 className="soporte-title">Soporte Técnico</h2>
      <p className="soporte-description">
        ¿Necesitas ayuda? Nuestro equipo está aquí para asistirte.
      </p>
      <a href="mailto:jeronimo.morales@merquellantas.com" className="soporte-button">
        <FaEnvelope className="soporte-icon" />
        Contactar a Soporte
      </a>
    </div>
  );
};

export default Soporte;
