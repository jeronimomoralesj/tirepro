import React, { useState } from 'react';
import CambiarVida from './CambiarVida';
import CambiarPosicion from './CambiarPosicion';
import CambiarOtherEvents from './CambiarOtherEvents';

const AgregarEvento = () => {
  const [selectedOption, setSelectedOption] = useState(''); // Track user's choice

  return (
    <div>
      <h2>Agregar Evento</h2>

      {/* Selection Menu */}
      <div>
        <label htmlFor="option-select">Seleccione una acción:</label>
        <select
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
      <div style={{ marginTop: '2rem' }}>
        {selectedOption === 'cambiarVida' && <CambiarVida />}
        {selectedOption === 'cambiarPosicion' && <CambiarPosicion />}
        {selectedOption === 'AgregarOtro' && <CambiarOtherEvents />}
      </div>
    </div>
  );
};

export default AgregarEvento;
