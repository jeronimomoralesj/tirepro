import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Home.css';
import PorVida from './PorVida';
import SemaforoPie from './SemaforoPie';
import SemaforoTabla from './SemaforoTabla';
import DetallesLlantas from './DetallesLlantas';

function Estado() {
  const [tires, setTires] = useState([]);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [selectedVida, setSelectedVida] = useState(null);
  const [inspeccionVencidaCount, setInspeccionVencidaCount] = useState(0);
  const [selectedTire, setSelectedTire] = useState(null); 

  // Fetch tire data on component mount
  useEffect(() => {
    const fetchTireData = async () => {
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
          setTires(response.data);
        }
      } catch (error) {
        console.error('Error fetching tire data:', error);
      }
    };

    fetchTireData();
  }, []);

  // Filter tires based on selected filters
const filteredTires = useMemo(() => {
  return tires.filter((tire) => {
    const minDepth = Math.min(tire.profundidad_int, tire.profundidad_cen, tire.profundidad_ext);

    const matchesCondition = selectedCondition
      ? (selectedCondition === 'buenEstado' && minDepth > 7) ||
        (selectedCondition === 'dias60' && minDepth > 6 && minDepth <= 7) ||
        (selectedCondition === 'dias30' && minDepth > 5 && minDepth <= 6) ||
        (selectedCondition === 'cambioInmediato' && minDepth <= 5)
      : true;

    const matchesVida = selectedVida ? tire.vida === selectedVida : true;

    return matchesCondition && matchesVida;
  });
}, [tires, selectedCondition, selectedVida]);


  // Update "Llantas con inspección vencida" based on filtered tires
  useEffect(() => {
    const today = new Date();
    const count = filteredTires.reduce((acc, tire) => {
      const inspectionDate = new Date(tire.proyeccion_fecha);
      return inspectionDate < today ? acc + 1 : acc;
    }, 0);
    setInspeccionVencidaCount(count);
  }, [filteredTires]);

  const handleTireSelect = (placa, pos) => {
    setSelectedTire((prevSelected) =>
      prevSelected && prevSelected.placa === placa && prevSelected.pos === pos
        ? null // Deselect if clicking the same cell
        : { placa, pos } // Set new selection
    );
  };

  // Check if any filters are active
  const isFilterActive = !!(selectedCondition || selectedVida);

  // Reset filters function
  const resetFilters = () => {
    setSelectedCondition(null);
    setSelectedVida(null);
  };

  return (
    <div className="home">
      {/* Header Section */}
      <header className="home-header">
        <button className="generate-pdf-btn">Generate PDF</button>
      </header>

      {/* Summary Section */}
      <div className="sales-card">
        <h2 className="sales-title">Mi Estado</h2>
        <div className="sales-stats">
          <div className="stat-box">
            <span className="stat-value">{inspeccionVencidaCount}</span>
            <br />
            <span className="stat-label">Llantas con inspección vencida</span>
          </div>
        </div>
      </div>

      {/* Cards Container with Filtered Tires */}
      <div className="cards-container">
      <SemaforoTabla
          filteredTires={filteredTires}
          onTireSelect={handleTireSelect}
          selectedTire={selectedTire} // Pass selected tire to highlight
        />
        <DetallesLlantas filteredTires={filteredTires} />
        <PorVida tires={filteredTires} onSelectVida={setSelectedVida} selectedVida={selectedVida} />
        <SemaforoPie tires={filteredTires} onSelectCondition={setSelectedCondition} selectedCondition={selectedCondition} />
      </div>

      {/* Reset Filters Button */}
      {isFilterActive && (
        <button className="reset-filters-btn" onClick={resetFilters}>
          Reset Filters
        </button>
      )}
    </div>
  );
}

export default Estado;
