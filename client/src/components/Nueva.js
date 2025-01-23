import React, { useState } from 'react';
import './Nueva.css';
import CargaMasiva from './CargaMasiva';
import CargaIndividual from './CargaIndividual';
import AgregarInspeccion from './AgregarInspeccion';
import AgregarEvento from './AgregarEvento';
import ImageAnalysis from './imageAnalysis';

const Nueva = () => {
  const [activeSection, setActiveSection] = useState('');

  return (
    <div className="nueva-container">
      <h2 className="nueva-title">Agregar</h2>

      <div className="button-container">
        <button
          className={`section-button ${activeSection === 'masiva' ? 'active' : ''}`}
          onClick={() => setActiveSection('masiva')}
        >
          Carga Masiva
        </button>
        <button
          className={`section-button ${activeSection === 'individual' ? 'active' : ''}`}
          onClick={() => setActiveSection('individual')}
        >
          Carga Individual
        </button>
        <button
          className={`section-button ${activeSection === 'inspeccion' ? 'active' : ''}`}
          onClick={() => setActiveSection('inspeccion')}
        >
          Inspección
        </button>
        <button
          className={`section-button ${activeSection === 'evento' ? 'active' : ''}`}
          onClick={() => setActiveSection('evento')}
        >
          Evento
        </button>

        <ImageAnalysis />
      </div>

      {activeSection === 'masiva' && <CargaMasiva />}
      {activeSection === 'individual' && <CargaIndividual />}
      {activeSection === 'inspeccion' && <AgregarInspeccion />}
      {activeSection === 'evento' && <AgregarEvento />}
    </div>
  );
};

export default Nueva;
