import React, { useState } from 'react';
import './AgregarEvento.css';
import CambiarVida from './CambiarVida';
import CambiarPosicion from './CambiarPosicion';
import CambiarOtherEvents from './CambiarOtherEvents';

const AgregarEvento = () => {
  const [selectedOption, setSelectedOption] = useState('');

  return (
    <div className="agregar-evento-container">
      <h2>Agregar Evento</h2>
      
      {/* Selection Menu */}
      <div className="option-select-container">
        <label className="option-select-label" htmlFor="option-select">
          Seleccione una acción:
        </label>
        <select
          className="option-select"
          id="option-select"
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
        >
          <option value="">Seleccione una opción</option>
          <option value="cambiarVida">Cambiar Vida</option>
          <option value="cambiarPosicion">Cambiar Posición</option>
          <option value="AgregarOtro">Agregar otro Evento</option>
        </select>
      </div>

      {/* Conditional Rendering */}
      <div className="agregar-evento-content">
        {selectedOption === 'cambiarVida' && <CambiarVida />}
        {selectedOption === 'cambiarPosicion' && <CambiarPosicion />}
        {selectedOption === 'AgregarOtro' && <CambiarOtherEvents />}
      </div>
    </div>
  );
};

export default AgregarEvento;