// client/src/components/Recomendaciones.js
import React from 'react';
import './recomendaciones.css';

const Recomendaciones = () => {
  const recommendations = [
    {
      title: "Placa: abc123",
      details: [
        "Llanta 2: Profundidad < 4 mm. Inspección y reemplazo inmediato.",
        "Llanta 6: CPK alto (561.89 COP). Evaluar recauchado o llantas más económicas.",
        "Llantas 15-18 (Kapsen): CPK muy alto (1075 COP). Analizar alternativas para reducir costos.",
      ],
    },
    {
      title: "Placa: dec342",
      details: [
        "Llantas 19-22: CPK alto (860 COP). Investigar reducción de costos.",
        "Llantas 23-24: Desgaste irregular. Revisar alineación y presión.",
        "Llanta 28: Desgaste irregular. Inspeccionar y corregir causas.",
      ],
    },
    {
      title: "Placa: sec192",
      details: [
        "Llanta 33: Profundidad de 2 mm. Reemplazo inmediato.",
        "Llantas 35-47: CPK > 600 COP. Evaluar recauchado o alternativas más económicas.",
      ],
    },
    {
      title: "Placa: rer565",
      details: [
        "Llanta 59: Profundidad alta y uso ineficiente. Rotar para optimizar.",
        "Llanta 59: CPK alto (> 600 COP). Considerar recauchado o alternativas más económicas.",
      ],
    },
    {
      title: "Placa: inventario",
      details: [
        "Llanta 99: Profundidad inusualmente alta (22 mm). Verificar datos y mantener en inventario.",
      ],
    },
    {
      title: "Placa: jer123",
      details: [
        "Llanta 5863: Excelente CPK (19.61 COP). Monitorear desgaste y rotar.",
        "Falta información sobre carga y especificaciones para evaluación completa.",
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
