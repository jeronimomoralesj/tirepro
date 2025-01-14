import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './analista.css';

const Analista = () => {
  const [cambioInmediatoTires, setCambioInmediatoTires] = useState([]);
  const [recommendedTires, setRecommendedTires] = useState({}); // Store recommended tires
  const [editablePrices, setEditablePrices] = useState({}); // Track editable prices for recommendations
  const [groupedView, setGroupedView] = useState(false); // Toggle between individual and grouped views

  useEffect(() => {
    const fetchTireData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return console.error('Token not found');
  
        const decodedToken = jwtDecode(token);
        const userId = decodedToken?.user?.id;
        if (!userId) return console.error('User ID not found in token');
  
        // Fetch tire data
        const response = await axios.get(`https://tirepro.onrender.com/api/tires/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const tireData = response.data;
  
        // Filter out tires with `placa` value of "fin"
        const filteredTires = tireData.filter((tire) => tire.placa !== "fin");
  
        // Filter for "Cambio Inmediato" tires
        const cambioInmediato = filteredTires.filter((tire) => {
          const minDepth = Math.min(
            ...tire.profundidad_int.map((p) => p.value),
            ...tire.profundidad_cen.map((p) => p.value),
            ...tire.profundidad_ext.map((p) => p.value)
          );
          return minDepth <= 5;
        });
  
        setCambioInmediatoTires(cambioInmediato);
  
        // Group tires by `tipovhc` and `eje`
        const groups = cambioInmediato.reduce((acc, tire) => {
          const key = `${tire.tipovhc}-${tire.eje}`;
          if (!acc[key]) acc[key] = [];
          acc[key].push(tire);
          return acc;
        }, {});
  
        // Fetch recommendations for each group
        const recommendations = {};
        for (const [key, group] of Object.entries(groups)) {
          const tipovhc = group[0]?.tipovhc;
          const eje = group[0]?.eje;
  
          const bestTire = filteredTires
            .filter((tire) => tire.tipovhc === tipovhc && tire.eje === eje)
            .reduce((best, tire) => {
              const cpk = tire.cpk?.at(-1)?.value || Infinity;
              return cpk < (best.cpk || Infinity) ? { ...tire, cpk } : best;
            }, {});
  
          if (bestTire) {
            recommendations[key] = {
              marca: bestTire.marca,
              dimension: bestTire.dimension,
              banda: bestTire.banda,
              costo: bestTire.costo || 0,
              kms: bestTire.kms?.[0]?.value || 1,
              cpk: bestTire.cpk,
            };
          }
        }
  
        setRecommendedTires(recommendations);
      } catch (error) {
        console.error('Error fetching tire data and recommendations:', error);
      }
    };
  
    fetchTireData();
  }, []);
  

  const handlePriceChange = (recommendationKey, value) => {
    setEditablePrices((prevPrices) => ({
      ...prevPrices,
      [recommendationKey]: value.replace(/\D/g, ''), // Allow only numbers
    }));
  };

  const initializeEditablePrice = (recommendationKey, defaultCost) => {
    if (!editablePrices[recommendationKey]) {
      setEditablePrices((prevPrices) => ({
        ...prevPrices,
        [recommendationKey]: defaultCost || 0,
      }));
    }
  };
  

  const calculateCPK = (price, kms) => {
    const validPrice = Number(price);
    const validKms = Number(kms) === 0 ? 1 : Number(kms);
    return (validPrice / validKms).toFixed(2);
  };

  const groupByRecommendation = () => {
    const grouped = {};
  
    cambioInmediatoTires.forEach((tire) => {
      const recommendationKey = `${tire.tipovhc}-${tire.eje}`;
      const recommendation = recommendedTires[recommendationKey] || {};
  
      const key = `${recommendation.marca}, ${recommendation.dimension}, ${recommendation.banda}`;
      if (!grouped[key]) {
        grouped[key] = {
          recommendation,
          recommendationKey,
          quantity: 0,
          totalCost: 0,
          totalKms: recommendation.kms || 1, // Use KMs from recommended tire
        };
      }
  
      grouped[key].quantity += 1;
      grouped[key].totalCost += Number(editablePrices[recommendationKey] || recommendation.costo || 0);
    });
  
    return Object.entries(grouped).map(([key, data]) => ({
      recommendation: key,
      price: editablePrices[data.recommendationKey] || data.recommendation.costo || 0,
      originalPrice: data.recommendation.costo || 0, // Keep track of the original price
      recommendationKey: data.recommendationKey, // Include recommendationKey for updates
      quantity: data.quantity,
      totalCost: data.totalCost,
      cpk: calculateCPK(
        editablePrices[data.recommendationKey] || data.recommendation.costo || 0,
        data.totalKms
      ),
      rendimiento: data.totalKms,
    }));
  };
  
  

  const generatePDF = () => {
    const doc = new jsPDF();
  
    if (groupedView) {
      // Generate PDF for Grouped View
      const groupedData = groupByRecommendation();
  
      doc.text('Que Debo Pedir - Resumen (Agrupado)', 14, 10);
      doc.autoTable({
        head: [['Recomendación IA', 'Precio Llanta', 'Rendimiento Esperado', 'CPK Esperado', 'Cantidad de Llantas', 'Costo Total']],
        body: groupedData.map((row) => [
          row.recommendation,
          `$${row.price}`,
          `${row.rendimiento.toFixed(2)} km`,
          row.cpk,
          row.quantity,
          `$${row.totalCost.toFixed(2)}`,
        ]),
      });
    } else {
      // Generate PDF for Detailed View
      doc.text('Que Debo Pedir - Resumen (Detalle)', 14, 10);
      doc.autoTable({
        head: [['Placa', 'Posición', 'Llanta', 'Marca Actual', 'Recomendación IA', 'Precio Llanta', 'Rendimiento Esperado', 'CPK Esperado']],
        body: cambioInmediatoTires.map((tire) => {
          const recommendationKey = `${tire.tipovhc}-${tire.eje}`;
          const recommendation = recommendedTires[recommendationKey] || {};
  
          return [
            tire.placa,
            tire.pos[0]?.value || 'Desconocida',
            tire.llanta,
            tire.marca,
            `${recommendation.marca}, ${recommendation.dimension}, ${recommendation.banda}`,
            `$${editablePrices[recommendationKey] || recommendation.costo || 0}`,
            `${recommendation.kms ? recommendation.kms.toFixed(2) : 'N/A'} km`,
            recommendation
              ? calculateCPK(editablePrices[recommendationKey], recommendation.kms || 1)
              : 'N/A',
          ];
        }),
      });
    }
  
    doc.save(`QueDeboPedir_${groupedView ? 'Agrupado' : 'Detalle'}.pdf`);
  };
  

  return (
    <div className="analista-container">
      <h2 className="analista-title">Que Debo Pedir</h2>

      {/* Action Buttons */}
      <div className="actions">
        <button className="generate-pdf-btn" onClick={generatePDF} style={{margin:"10px"}}>
          Generar PDF
        </button>
        <button className="generate-pdf-btn" onClick={() => setGroupedView((prev) => !prev)}>
          {groupedView ? 'Ver Detalle' : 'Agrupar por Recomendación'}
        </button>
      </div>

      {groupedView ? (
        // Grouped View
        <div className="table-container">
          <table className="analista-table">
          <thead>
        <tr>
          <th>Recomendación IA</th>
          <th>Precio Llanta</th>
          <th>Rendimiento Esperado</th>
          <th>CPK Esperado</th>
          <th>Cantidad de Llantas</th>
          <th>Costo Total</th>
        </tr>
      </thead>
            <tbody>
        {groupByRecommendation().map((row, index) => (
          <tr key={index}>
            <td>{row.recommendation}</td>
            <td>
            <td>
  <div className="price-edit-container">
    <input
      type="number"
      value={row.price}
      onChange={(e) => handlePriceChange(row.recommendationKey, e.target.value)}
      className="editable-price-input"
    />
  </div>
</td>

            </td>
            <td>{row.rendimiento.toFixed(2)} km</td>
            <td>{row.cpk}</td>
            <td>{row.quantity}</td>
            <td>${row.totalCost.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
          </table>
        </div>
      ) : (
        // Detailed View
        <div className="table-container">
          <table className="analista-table">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Posición</th>
                <th>Llanta</th>
                <th>Marca Actual</th>
                <th>Recomendación IA</th>
                <th>Precio Llanta</th>
                <th>Rendimiento Esperado</th>
                <th>CPK Esperado</th>
              </tr>
            </thead>
            <tbody>
              {cambioInmediatoTires.map((tire, index) => {
                const recommendationKey = `${tire.tipovhc}-${tire.eje}`;

                return (
                  <tr key={index}>
                    <td>{tire.placa}</td>
                    <td>{tire.pos[0]?.value || 'Desconocida'}</td>
                    <td>{tire.llanta}</td>
                    <td>{tire.marca}</td>
                    <td>
                    <td>
  {recommendedTires[recommendationKey]
    ? `${recommendedTires[recommendationKey].marca}, ${recommendedTires[recommendationKey].dimension}, ${recommendedTires[recommendationKey].banda}`
    : 'Cargando...'}
</td>

                    </td>
                    <td>
  <div className="price-edit-container">
    <input
      type="number"
      value={editablePrices[recommendationKey] || recommendedTires[recommendationKey]?.costo || 0}
      onChange={(e) => handlePriceChange(recommendationKey, e.target.value)}
      className="editable-price-input"
    />
  </div>
</td>

                    <td>
                      {recommendedTires[recommendationKey]?.kms
                        ? `${recommendedTires[recommendationKey]?.kms.toFixed(2)} km`
                        : 'N/A'}
                    </td>
                    <td>
                      {recommendedTires[recommendationKey]
                        ? calculateCPK(editablePrices[recommendationKey], recommendedTires[recommendationKey]?.kms || 1)
                        : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Analista;
