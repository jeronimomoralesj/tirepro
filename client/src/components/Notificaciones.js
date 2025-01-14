import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Home.css";

const Notificaciones = ({ tires, onCambioInmediatoCount }) => {
  const [cambioInmediatoTires, setCambioInmediatoTires] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Filter "Cambio Inmediato" tires from the passed tires data
    const cambioInmediato = tires.filter((tire) => {
      const minDepth = Math.min(
        ...tire.profundidad_int.map((p) => p.value),
        ...tire.profundidad_cen.map((p) => p.value),
        ...tire.profundidad_ext.map((p) => p.value)
      );
      // Exclude tires with `placa` equal to "fin"
      return minDepth <= 5 && tire.placa !== "fin";
    });

    setCambioInmediatoTires(cambioInmediato);

    // Notify parent component of the count
    onCambioInmediatoCount(cambioInmediato.length);
  }, [tires, onCambioInmediatoCount]);

  return (
    <div className="notificaciones-container">
      <h3>Notificaciones</h3>
      {cambioInmediatoTires.length > 0 ? (
        <div className="notificaciones-content">
          <p>
            Tienes <strong>{cambioInmediatoTires.length}</strong> llanta
            {cambioInmediatoTires.length > 1 ? "s" : ""} por cambiar.
          </p>
          <button
            className="navigate-button"
            onClick={() => navigate('/analista')}
          >
            Ver en detalle
          </button>
        </div>
      ) : (
        <p>No tienes llantas por cambiar.</p>
      )}
    </div>
  );
};

export default Notificaciones;
