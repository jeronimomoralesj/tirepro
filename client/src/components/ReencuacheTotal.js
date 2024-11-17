import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import './PaymentGateway.css';

const ReencuacheTotal = () => {
  const [reencaucheHistory, setReencaucheHistory] = useState([]);

  useEffect(() => {
    const fetchReencaucheData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const decodedToken = jwtDecode(token);
          const userId = decodedToken?.user?.id;

          if (!userId) {
            console.error("User ID not found in token");
            return;
          }

          const response = await axios.get(`https://tirepro.onrender.com/api/tires/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const tires = response.data;
          const recentReencaucheHistory = getRecentReencaucheEntries(tires);
          setReencaucheHistory(recentReencaucheHistory);
        }
      } catch (error) {
        console.error('Error fetching tire data:', error);
      }
    };

    fetchReencaucheData();
  }, []);

  // Function to retrieve and count recent reencauche entries based on last `vida` entry
  const getRecentReencaucheEntries = (tires) => {
    const reencaucheEntries = tires
      .flatMap(tire => {
        const vidaHistory = tire.vida;
        if (Array.isArray(vidaHistory) && vidaHistory.length > 0) {
          const lastVidaEntry = vidaHistory[vidaHistory.length - 1];
          if (["Reencauche", "Reencauche1", "Reencauche2", "Reencauche3"].includes(lastVidaEntry.value)) {
            return [{
              month: lastVidaEntry.month,
              year: lastVidaEntry.year,
            }];
          }
        }
        return [];
      });

    // Group by month and year, counting occurrences
    const monthlyCounts = reencaucheEntries.reduce((acc, entry) => {
      const key = `${entry.month}-${entry.year}`;
      if (!acc[key]) {
        acc[key] = { month: entry.month, year: entry.year, count: 0 };
      }
      acc[key].count += 1;
      return acc;
    }, {});

    // Convert to array, sort by date, and take the last 5 entries
    return Object.values(monthlyCounts)
      .sort((a, b) => new Date(b.year, b.month - 1) - new Date(a.year, a.month - 1))
      .slice(0, 5);
  };

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
          {reencaucheHistory.map((entry, index) => (
            <tr key={index}>
              <td>{new Date(entry.year, entry.month - 1).toLocaleString('es-ES', { month: 'long' })}</td>
              <td>{entry.year}</td>
              <td>{entry.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReencuacheTotal;