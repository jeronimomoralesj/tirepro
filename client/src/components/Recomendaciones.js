// client/src/components/Recomendaciones.js
import React from 'react';
import './recomendaciones.css';

const Recomendaciones = () => {
  const recommendations = [
    {
      title: "Revisión de Presión de Inflado",
      details: [
        "Verifica que todas las llantas estén infladas a las presiones recomendadas por el fabricante para las condiciones de carga actuales (particularmente para vehículos de carga seca como tu 'Cabezote').",
        "Usa un manómetro calibrado y ajusta las presiones según la carga transportada.",
      ],
    },
    {
      title: "Inspección Física",
      details: [
        "Revisa cada llanta para identificar desgaste irregular, cortes, abultamientos o cualquier daño estructural.",
        "Evalúa la alineación de los ejes si observas desgaste desigual.",
      ],
    },
    {
      title: "Rotación de Llantas",
      details: [
        "Realiza una rotación entre posiciones direccionales, de tracción y soporte si no se ha hecho en los últimos 20,000-25,000 km. Esto ayudará a uniformar el desgaste.",
      ],
    },
    {
      title: "Profundidad de Banda",
      details: [
        "Mide las profundidades actuales de la banda (centro, lados internos y externos).",
        "Cambia las llantas que tengan una profundidad menor a 2 mm, como exige la normativa colombiana.",
      ],
    },
    {
      title: "Planificación de Reemplazo",
      details: [
        "Identifica las llantas cercanas al final de su vida útil (menor a 3 mm de profundidad) y planifica su reemplazo anticipado.",
      ],
    },
    {
      title: "Monitoreo Regular",
      details: [
        "Establece un calendario para inspecciones visuales semanales y mantenimiento mensual (presión, alineación, etc.).",
      ],
    },
  ];

  return (
    <div className="recomendaciones-container">
      <h2 className="recomendaciones-title">Recomendaciones</h2>
      <ul className="recomendaciones-list">
        {recommendations.map((rec, index) => (
          <li key={index} className="recommendation-item">
            <h3 className="recommendation-title">{rec.title}</h3>
            <ul className="recommendation-details">
              {rec.details.map((detail, idx) => (
                <li key={idx} className="recommendation-detail">
                  {detail}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Recomendaciones;
