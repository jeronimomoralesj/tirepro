import React, { useMemo } from 'react';
import './PaymentGateway.css';

const ReencuacheTotal = ({ tires }) => {
  const reencaucheHistory = useMemo(() => {
    const reencaucheValues = ['reencauche', 'reencauche1', 'reencauche2'];

    // Extract and group reencauche entries by month and year
    const groupedEntries = tires.flatMap((tire) => {
      const vidaHistory = Array.isArray(tire.vida) ? tire.vida : [];
      return vidaHistory
        .filter(
          (entry) =>
            entry.value &&
            typeof entry.value === 'string' &&
            reencaucheValues.includes(entry.value.toLowerCase())
        )
        .map((entry) => ({
          month: entry.month,
          year: entry.year,
        }));
    });

    // Group by month and year
    const groupedCounts = groupedEntries.reduce((acc, entry) => {
      const key = `${entry.year}-${entry.month}`;
      if (!acc[key]) {
        acc[key] = { month: entry.month, year: entry.year, count: 0 };
      }
      acc[key].count += 1;
      return acc;
    }, {});

    // Convert grouped data into an array
    let groupedArray = Object.values(groupedCounts).sort(
      (a, b) => new Date(a.year, a.month - 1) - new Date(b.year, b.month - 1)
    );

    // Add cumulative totals for each month within the same year
    groupedArray = groupedArray.reduce((acc, current, index, array) => {
      if (index > 0) {
        const prev = acc[acc.length - 1];
        if (prev.year === current.year) {
          current.count += prev.count;
        }
      }
      acc.push(current);
      return acc;
    }, []);

    // Filter for the last 5 years
    const fiveYearsAgo = new Date().getFullYear() - 5;
    return groupedArray
      .filter((entry) => entry.year >= fiveYearsAgo)
      .slice(-60); // Only include last 60 months (5 years)
  }, [tires]);

  return (
    <div className="reencuache-card">
      <h3 className="reencuache-title">Reencauche Histórico (Últimos 5)</h3>
      <table className="reencuache-table">
        <thead>
          <tr>
            <th>Mes</th>
            <th>Año</th>
            <th>Cantidad de Reencauche</th>
          </tr>
        </thead>
        <tbody>
          {reencaucheHistory.length > 0 ? (
            reencaucheHistory.map((entry, index) => (
              <tr key={index}>
                <td>
                  {new Date(entry.year, entry.month - 1).toLocaleString('es-ES', {
                    month: 'long',
                  })}
                </td>
                <td>{entry.year}</td>
                <td>{entry.count}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center' }}>
                No hay datos disponibles.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReencuacheTotal;
