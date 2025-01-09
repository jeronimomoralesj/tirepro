import React from 'react';
import './recomendaciones.css';

const Acontecimientos = () => {
  const analysis = [
    {
      title: "Vida de las Llantas",
      details: [
        'Todas las llantas están registradas como "Nuevas", lo cual sugiere que no han sido recauchadas.',
        'Esto es positivo porque cada llanta debería ofrecer un rendimiento óptimo desde su instalación.',
      ],
    },
    {
      title: "Kilometraje Actual",
      details: [
        "El vehículo ha recorrido 78,783 km, lo que indica que las llantas han sido utilizadas en condiciones de trabajo moderadas.",
        "Si no se han rotado, es probable que algunas posiciones presenten un desgaste mayor.",
      ],
    },
    {
      title: "Desgaste y Condiciones",
      details: [
        "Las llantas de marcas como Continental y Goodyear son reconocidas por su durabilidad, pero requieren mantenimiento constante.",
        'La banda "Original" (como en las Continental CONTIGOL) tiende a desgastarse de manera uniforme si las presiones y alineaciones son correctas.',
      ],
    },
    {
      title: "Carga del Vehículo",
      details: [
        "El frente de operación 'Carga seca' indica que el peso puede ser constante y uniforme, pero asegúrate de que no haya sobrecarga en los ejes traseros.",
      ],
    },
    {
      title: "Problemas Potenciales",
      details: [
        "Si no se ha realizado rotación, las llantas en posiciones de tracción podrían desgastarse más rápido.",
        "Las presiones incorrectas pueden causar desgaste desigual (centro o bordes).",
      ],
    },
  ];

  return (
    <div className="recomendaciones-container">
      <h2 className="recomendaciones-title">Acontecimientos</h2>
      <ul className="recomendaciones-list">
        {analysis.map((item, index) => (
          <li key={index} className="recommendation-item">
            <h3 className="recommendation-title">{item.title}</h3>
            <ul className="recommendation-details">
              {item.details.map((detail, idx) => (
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

export default Acontecimientos;
