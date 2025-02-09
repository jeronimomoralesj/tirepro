import React, { useState } from 'react';
import './TirePopup.css';

const TirePopup = ({ tire, onClose, onSave, kilometrajeActual }) => {
  const [profundidades, setProfundidades] = useState({
    profundidad_int: tire.profundidad_int || '',
    profundidad_cen: tire.profundidad_cen || '',
    profundidad_ext: tire.profundidad_ext || '',
  });
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfundidades((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const validateProfundidades = () => {
    const minDepth = Math.min(
      profundidades.profundidad_int || 0,
      profundidades.profundidad_cen || 0,
      profundidades.profundidad_ext || 0
    );

    const lastKilometrajeActual =
      tire.kilometraje_actual?.[tire.kilometraje_actual.length - 1]?.value || 0;

    if (Number(kilometrajeActual) < lastKilometrajeActual) {
      alert(`El kilometraje actual (${kilometrajeActual}) no puede ser menor que el último registrado (${lastKilometrajeActual}).`);
      return false;
    }

    if (minDepth === 0) {
      alert('Por favor, ingresa valores de profundidad válidos.');
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (validateProfundidades()) {
      onSave(tire._id, { ...profundidades, image });
      onClose();
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h3>Actualizar Profundidades - Llanta {tire.llanta}</h3>
        
        <div className="scrollable-content">
          <div className="input-group">
            <label>Profundidad Interna</label>
            <input
              type="number"
              name="profundidad_int"
              value={profundidades.profundidad_int}
              onChange={handleChange}
              min="0"
            />
          </div>
          <div className="input-group">
            <label>Profundidad Central</label>
            <input
              type="number"
              name="profundidad_cen"
              value={profundidades.profundidad_cen}
              onChange={handleChange}
              min="0"
            />
          </div>
          <div className="input-group">
            <label>Profundidad Externa</label>
            <input
              type="number"
              name="profundidad_ext"
              value={profundidades.profundidad_ext}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="input-group">
            <label>Subir Imagen</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {image && <p>Imagen seleccionada: {image.name}</p>}
          </div>
        </div>

        <div className="button-group">
          <button className="save-button" onClick={handleSave}>
            Guardar
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TirePopup;
