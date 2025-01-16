import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './analista.css';
import AnalistaPlacas from './AnalistaPlacas'; 

const Analista = () => {
  const [cambioInmediatoTires, setCambioInmediatoTires] = useState([]);
  const [recommendedTires, setRecommendedTires] = useState({});
  const [editablePrices, setEditablePrices] = useState({});
  const [editableKms, setEditableKms] = useState({});
  const [groupedView, setGroupedView] = useState(false);
  const [showTireModal, setShowTireModal] = useState(false);
  const [selectedTireKey, setSelectedTireKey] = useState(null);
  const [availableTires, setAvailableTires] = useState([]);
  const [selectedMarca, setSelectedMarca] = useState('');
const [selectedDimension, setSelectedDimension] = useState('');
const [selectedBanda, setSelectedBanda] = useState('');

  
  // Add state for modal fields
  const [tireOptions, setTireOptions] = useState({
    marcas: [],
    dimensiones: [],
    bandas: []
  });

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
        
        // Extract unique tire options
        const marcas = [...new Set(tireData.map(tire => tire.marca))];
        const dimensiones = [...new Set(tireData.map(tire => tire.dimension))];
        const bandas = [...new Set(tireData.map(tire => tire.banda))];
        
        setTireOptions({ marcas, dimensiones, bandas });
        setAvailableTires(tireData);

        // Rest of your existing fetchTireData logic...
        const filteredTires = tireData.filter((tire) => tire.placa !== "fin");
  
        const cambioInmediato = filteredTires.filter((tire) => {
          const minDepth = Math.min(
            ...tire.profundidad_int.map((p) => p.value),
            ...tire.profundidad_cen.map((p) => p.value),
            ...tire.profundidad_ext.map((p) => p.value)
          );
          return minDepth <= 5;
        });
  
        setCambioInmediatoTires(cambioInmediato);
  
        const groups = cambioInmediato.reduce((acc, tire) => {
          const key = `${tire.tipovhc}-${tire.eje}`;
          if (!acc[key]) acc[key] = [];
          acc[key].push(tire);
          return acc;
        }, {});
  
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
        
        // Initialize editable KMs
        const initialKms = {};
        Object.entries(recommendations).forEach(([key, tire]) => {
          initialKms[key] = tire.kms || 1;
        });
        setEditableKms(initialKms);
      } catch (error) {
        console.error('Error fetching tire data and recommendations:', error);
      }
    };
  
    fetchTireData();
  }, []);

  const handlePriceChange = (recommendationKey, value) => {
    setEditablePrices(prev => ({
      ...prev,
      [recommendationKey]: value.replace(/\D/g, '')
    }));
  };

  const handleKmsChange = (recommendationKey, value) => {
    setEditableKms((prev) => ({
      ...prev,
      [recommendationKey]: value, // Allow users to freely edit "rendimiento"
    }));
  };
  

  const handleTireSelection = () => {
    if (!selectedTireKey) return;
  
    const selectedTire = availableTires.find(
      (tire) =>
        tire.marca === selectedMarca &&
        tire.dimension === selectedDimension &&
        tire.banda === selectedBanda
    );
  
    if (selectedTire) {
      setRecommendedTires((prev) => ({
        ...prev,
        [selectedTireKey]: {
          ...prev[selectedTireKey],
          marca: selectedTire.marca,
          dimension: selectedTire.dimension,
          banda: selectedTire.banda,
          costo: selectedTire.costo || 0,
          kms: selectedTire.kms?.[0]?.value || 1,
        },
      }));
  
      setEditablePrices((prev) => ({
        ...prev,
        [selectedTireKey]: selectedTire.costo || 0,
      }));
  
      setEditableKms((prev) => ({
        ...prev,
        [selectedTireKey]: selectedTire.kms?.[0]?.value || 1,
      }));
  
      // Reset modal state only after successful selection
      setShowTireModal(false);
      setSelectedMarca('');
      setSelectedDimension('');
      setSelectedBanda('');
    }
  };
  
  

  const calculateCPK = (price, kms) => {
    const validPrice = Number(price);
    const validKms = Number(kms) === 0 ? 1 : Number(kms);
    return (validPrice / validKms).toFixed(2);
  };

  const TireSelectionModal = () => (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000, // Ensure the overlay is behind the modal
      }}
      onClick={() => {
        setShowTireModal(false); // Close the modal on overlay click
        setSelectedMarca('');
        setSelectedDimension('');
        setSelectedBanda('');
      }}
    >
      <div
        className="modal"
        style={{
          display: showTireModal ? 'block' : 'none',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 1001,
          minWidth: '300px',
        }}
        onClick={(e) => e.stopPropagation()} // Prevent overlay clicks from propagating
      >
        <h3>Seleccionar Llanta</h3>
        <div style={{ marginBottom: '15px' }}>
          <label>Marca:</label>
          <select
            value={selectedMarca}
            onChange={(e) => setSelectedMarca(e.target.value)}
            style={{ width: '100%', marginTop: '5px', padding: '5px' }}
          >
            <option value="">Seleccionar Marca</option>
            {tireOptions.marcas.map((marca) => (
              <option key={marca} value={marca}>
                {marca}
              </option>
            ))}
          </select>
        </div>
  
        <div style={{ marginBottom: '15px' }}>
          <label>Dimensión:</label>
          <select
            value={selectedDimension}
            onChange={(e) => setSelectedDimension(e.target.value)}
            style={{ width: '100%', marginTop: '5px', padding: '5px' }}
          >
            <option value="">Seleccionar Dimensión</option>
            {tireOptions.dimensiones.map((dimension) => (
              <option key={dimension} value={dimension}>
                {dimension}
              </option>
            ))}
          </select>
        </div>
  
        <div style={{ marginBottom: '15px' }}>
          <label>Banda:</label>
          <select
            value={selectedBanda}
            onChange={(e) => setSelectedBanda(e.target.value)}
            style={{ width: '100%', marginTop: '5px', padding: '5px' }}
          >
            <option value="">Seleccionar Banda</option>
            {tireOptions.bandas.map((banda) => (
              <option key={banda} value={banda}>
                {banda}
              </option>
            ))}
          </select>
        </div>
  
        <button
          onClick={handleTireSelection}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px',
          }}
        >
          Confirmar
        </button>
        <button
  onClick={() => {
    setShowTireModal(false);
    setSelectedMarca('');
    setSelectedDimension('');
    setSelectedBanda('');
  }}
  style={{
    padding: '8px 16px',
    backgroundColor: '#ff4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  }}
>
  Cancelar
</button>

      </div>
    </div>
  );
  
  

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
          totalKms: editableKms[recommendationKey] || recommendation.kms || 1,
        };
      }
  
      grouped[key].quantity += 1;
      grouped[key].totalCost += Number(editablePrices[recommendationKey] || recommendation.costo || 0);
    });
  
    return Object.entries(grouped).map(([key, data]) => ({
      recommendation: key,
      price: editablePrices[data.recommendationKey] || data.recommendation.costo || 0,
      originalPrice: data.recommendation.costo || 0,
      recommendationKey: data.recommendationKey,
      quantity: data.quantity,
      totalCost: data.totalCost,
      cpk: calculateCPK(
        editablePrices[data.recommendationKey] || data.recommendation.costo || 0,
        editableKms[data.recommendationKey] || data.totalKms
      ),
      rendimiento: editableKms[data.recommendationKey] || data.totalKms,
    }));
  };
  

  const generatePDF = () => {
    const doc = new jsPDF();
  
    if (groupedView) {
      doc.text('Que Debo Pedir - Resumen (Agrupado)', 14, 10);
      doc.autoTable({
        head: [['Recomendación IA', 'Precio Llanta', 'Rendimiento Esperado', 'CPK Esperado', 'Cantidad de Llantas', 'Costo Total']],
        body: groupByRecommendation().map((row) => [
          row.recommendation,
          `$${row.price}`,
          `${row.rendimiento.toFixed(2)} km`,
          row.cpk,
          row.quantity,
          `$${row.totalCost.toFixed(2)}`,
        ]),
      });
    } else {
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
            `${editableKms[recommendationKey] ? editableKms[recommendationKey].toFixed(2) : 'N/A'} km`,
            calculateCPK(
              editablePrices[recommendationKey] || recommendation.costo || 0,
              editableKms[recommendationKey] || recommendation.kms || 1
            ),
          ];
        }),
      });
    }
  
    doc.save(`QueDeboPedir_${groupedView ? 'Agrupado' : 'Detalle'}.pdf`);
  };

  return (
    <div className="analista-container">
      <h2 className="analista-title">Que Debo Pedir</h2>

      <div className="actions">
        <button className="generate-pdf-btn" onClick={generatePDF} style={{margin:"10px"}}>
          Generar PDF
        </button>
        <button className="generate-pdf-btn" onClick={() => setGroupedView((prev) => !prev)}>
          {groupedView ? 'Ver Detalle' : 'Agrupar por Recomendación'}
        </button>
      </div>

      {groupedView ? (
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
      <td>
        <div
          onClick={() => {
            setSelectedTireKey(row.recommendationKey);
            setShowTireModal(true);
          }}
          style={{ cursor: 'pointer', textDecoration: 'underline' }}
        >
          {row.recommendation}
        </div>
      </td>
      <td>
        <input
          type="number"
          value={row.price}
          onChange={(e) => handlePriceChange(row.recommendationKey, e.target.value)}
          className="editable-price-input"
        />
      </td>
      <td>
        <input
          type="number"
          value={editableKms[row.recommendationKey] || row.rendimiento || 1}
          onChange={(e) => handleKmsChange(row.recommendationKey, e.target.value)}
          className="editable-kms-input"
        />
      </td>
      <td>{row.cpk}</td>
      <td>{row.quantity}</td>
      <td>${row.totalCost.toFixed(2)}</td>
    </tr>
  ))}
</tbody>

          </table>
        </div>
      ) : (
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
                const recommendation = recommendedTires[recommendationKey] || {};

                return (
                  <tr key={index}>
                    <td>{tire.placa}</td>
                    <td>{tire.pos[0]?.value || 'Desconocida'}</td>
                    <td>{tire.llanta}</td>
                    <td>{tire.marca}</td>
                    <td>
                      <div 
                        onClick={() => {
                          setSelectedTireKey(recommendationKey);
                          setShowTireModal(true);
                        }} 
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        {recommendation.marca}, {recommendation.dimension}, {recommendation.banda}
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editablePrices[recommendationKey] || recommendation.costo || 0}
                        onChange={(e) => handlePriceChange(recommendationKey, e.target.value)}
                        className="editable-price-input"
                      />
                    </td>
                    <td>
  <input
    type="number"
    value={editableKms[recommendationKey] || recommendation.kms || 1}
    onChange={(e) => handleKmsChange(recommendationKey, e.target.value)}
    className="editable-kms-input"
  />
</td>

                    <td>
                      {calculateCPK(
                        editablePrices[recommendationKey] || recommendation.costo || 0,
                        editableKms[recommendationKey] || recommendation.kms || 1
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

{showTireModal && (
  <div
    className={`modal-overlay ${showTireModal ? 'active' : ''}`}
    onClick={() => {
      setShowTireModal(false); // Close the modal on overlay click
      setSelectedMarca('');
      setSelectedDimension('');
      setSelectedBanda('');
    }}
  >
    <div
      className={`modal ${showTireModal ? 'active' : ''}`}
      onClick={(e) => e.stopPropagation()} // Prevent overlay clicks from propagating
    >
      <h3>Seleccionar Llanta</h3>
      <div style={{ marginBottom: '15px' }}>
        <label>Marca:</label>
        <select
          value={selectedMarca}
          onChange={(e) => setSelectedMarca(e.target.value)}
          style={{ width: '100%', marginTop: '5px', padding: '5px' }}
        >
          <option value="">Seleccionar Marca</option>
          {tireOptions.marcas.map((marca) => (
            <option key={marca} value={marca}>
              {marca}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Dimensión:</label>
        <select
          value={selectedDimension}
          onChange={(e) => setSelectedDimension(e.target.value)}
          style={{ width: '100%', marginTop: '5px', padding: '5px' }}
        >
          <option value="">Seleccionar Dimensión</option>
          {tireOptions.dimensiones.map((dimension) => (
            <option key={dimension} value={dimension}>
              {dimension}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Banda:</label>
        <select
          value={selectedBanda}
          onChange={(e) => setSelectedBanda(e.target.value)}
          style={{ width: '100%', marginTop: '5px', padding: '5px' }}
        >
          <option value="">Seleccionar Banda</option>
          {tireOptions.bandas.map((banda) => (
            <option key={banda} value={banda}>
              {banda}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleTireSelection}
        style={{
          padding: '8px 16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginRight: '10px',
        }}
      >
        Confirmar
      </button>
      <button
        onClick={() => {
          setShowTireModal(false);
          setSelectedMarca('');
          setSelectedDimension('');
          setSelectedBanda('');
        }}
        style={{
          padding: '8px 16px',
          backgroundColor: '#ff4444',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Cancelar
      </button>
    </div>
  </div>
)}


<TireSelectionModal />

<div className="analisis-placas-wrapper">
  <AnalistaPlacas />
</div>
    </div>
  );
};

export default Analista;