import React from 'react';
import './RankConductores.css';

const RankConductores = () => {
  // Dummy data for drivers and scores
  const driverData = [
    { rank: 1, name: 'Carlos Perez', score: 95 },
    { rank: 2, name: 'Maria Lopez', score: 92 },
    { rank: 3, name: 'Juan Gonzalez', score: 89 },
    { rank: 4, name: 'Ana Martinez', score: 87 },
    { rank: 5, name: 'Luis Ramirez', score: 85 },
    { rank: 6, name: 'Diana Torres', score: 83 },
    { rank: 7, name: 'Jorge Rivera', score: 81 },
    { rank: 8, name: 'Gabriela Vega', score: 79 },
    { rank: 9, name: 'Sofia Hernandez', score: 78 },
    { rank: 10, name: 'Pablo Ortiz', score: 76 },
    { rank: 11, name: 'Lucia Flores', score: 75 },
    { rank: 12, name: 'Fernando Castillo', score: 74 },
  ];

  return (
    <div className="revenue-updates-card">
      <h2 className="revenue-updates-title">Top Conductores</h2>
      <div className="scrollable-table-container">
        <table className="rank-table">
          <thead>
            <tr>
              <th>Ranking</th>
              <th>Nombre</th>
              <th>Puntaje</th>
            </tr>
          </thead>
          <tbody>
            {driverData.map((driver) => (
              <tr key={driver.rank}>
                <td>{driver.rank}</td>
                <td>{driver.name}</td>
                <td>{driver.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RankConductores;
