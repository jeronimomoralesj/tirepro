// client/src/components/ReencuacheTotal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { parse, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import './PaymentGateway.css';

const ReencuacheTotal = () => {
  const [reencaucheByMonth, setReencaucheByMonth] = useState([]);

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

          const response = await axios.get(`http://localhost:5001/api/tires/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const tires = response.data;
          const cumulativeReencauche = calculateCumulativeReencauche(tires);
          setReencaucheByMonth(cumulativeReencauche);
        }
      } catch (error) {
        console.error('Error fetching tire data:', error);
      }
    };

    fetchReencaucheData();
  }, []);

  const calculateCumulativeReencauche = (tires) => {
    const currentDate = new Date();
    const monthsData = [];

    const allReencaucheTires = tires.filter((tire) => tire.vida === 'Reencauche1');
    let cumulativeCount = allReencaucheTires.length;

    for (let i = 4; i >= 0; i--) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);

      const monthlyCount = allReencaucheTires.filter((tire) => {
        if (tire.fecha) {
          const [day, month, year] = tire.fecha.split('/');
          const tireDate = parse(`${year}-${month}-${day}`, 'yyyy-MM-dd', new Date());
          return isWithinInterval(tireDate, { start: monthStart, end: monthEnd });
        }
        return false;
      }).length;

      monthsData.push({
        name: monthStart.toLocaleString('es-ES', { month: 'long', year: 'numeric', locale: es }),
        count: cumulativeCount,
      });

      cumulativeCount -= monthlyCount;
    }

    return monthsData.reverse();
  };

  return (
    <div className="reencuache-card">
      <h3 className="reencuache-title">Reencauche por Mes</h3>
      <table className="reencuache-table">
        <thead>
          <tr>
            <th>Mes</th>
            <th>Cantidad de Reencauche</th>
          </tr>
        </thead>
        <tbody>
          {reencaucheByMonth.map((monthData, index) => (
            <tr key={index}>
              <td>{monthData.name}</td>
              <td>{monthData.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReencuacheTotal;
