import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Home.css';
import SemaforoPie from './SemaforoPie';
import PromedioEje from './PromedioEje';
import ReencuacheTotal from './ReencuacheTotal';
import ProgressBar from './ProgressBar';
import Acontecimientos from './Acontecimientos';
import Recomendaciones from './Recomendaciones';

const Home = () => {
  const [tires, setTires] = useState([]);
  const [selectedEje, setSelectedEje] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [cambioInmediatoTires, setCambioInmediatoTires] = useState([]);

  const [totalCost, setTotalCost] = useState(0);
  const [averageCPK, setAverageCPK] = useState(0);
  const [averageProjectedCPK, setAverageProjectedCPK] = useState(0);
  const [lastMonthInvestment, setLastMonthInvestment] = useState(0);

  // Fetch tire data on mount
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
          const tireData = response.data;
          setTires(tireData);

          // Separate "Cambio Inmediato" tires for popup display
          const cambioInmediato = tireData.filter((tire) => {
            const minDepth = Math.min(tire.profundidad_int, tire.profundidad_cen, tire.profundidad_ext);
            return minDepth <= 5;
          });
          setCambioInmediatoTires(cambioInmediato);
        }
      } catch (error) {
        console.error('Error fetching tire data:', error);
      }
    };

    fetchTireData();
  }, []);

  // Filter tires by selected "Eje" and "Condition"
  const filteredTires = useMemo(() => {
    return tires.filter((tire) => {
      const matchesEje = selectedEje ? tire.eje === selectedEje : true;
      const matchesCondition = selectedCondition
        ? (() => {
            const minDepth = Math.min(tire.profundidad_int, tire.profundidad_cen, tire.profundidad_ext);
            if (selectedCondition === 'buenEstado') return minDepth > 7;
            if (selectedCondition === 'dias60') return minDepth > 6 && minDepth <= 7;
            if (selectedCondition === 'dias30') return minDepth > 5 && minDepth <= 6;
            if (selectedCondition === 'cambioInmediato') return minDepth <= 5;
          })()
        : true;
      return matchesEje && matchesCondition;
    });
  }, [tires, selectedEje, selectedCondition]);

  // Calculate summary metrics based on filtered data
  useEffect(() => {
    const calculateMetrics = () => {
      const totalCost = filteredTires.reduce((sum, tire) => sum + tire.costo, 0);
      setTotalCost(totalCost);

      const totalCPK = filteredTires.reduce((sum, tire) => sum + tire.costo / tire.kilometraje_actual, 0);
      setAverageCPK(filteredTires.length ? totalCPK / filteredTires.length : 0);

      const totalProjectedCPK = filteredTires.reduce((sum, tire) => {
        const projectedKms = tire.kilometraje_actual / (tire.original - tire.proact) * tire.original;
        return sum + tire.costo / projectedKms;
      }, 0);
      setAverageProjectedCPK(filteredTires.length ? totalProjectedCPK / filteredTires.length : 0);

      const currentDate = new Date();
      const previousMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const previousMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

      const lastMonthInvestmentCalc = filteredTires
        .filter((tire) => {
          if (tire.fecha) {
            const [year, month, day] = tire.fecha.split('-');
            const tireDate = new Date(year, month - 1, day);
            return tireDate >= previousMonthStart && tireDate <= previousMonthEnd;
          }
          return false;
        })
        .reduce((sum, tire) => sum + tire.costo, 0);

      setLastMonthInvestment(lastMonthInvestmentCalc);
    };

    calculateMetrics();
  }, [filteredTires]);

  // Check if any filters are active
  const isFilterActive = !!(selectedEje || selectedCondition);

  // Reset filters function
  const resetFilters = () => {
    setSelectedEje(null);
    setSelectedCondition(null);
  };

  // Toggle the popup visibility
  const togglePopup = () => setIsPopupVisible(!isPopupVisible);

  return (
    <div className="home">
      <header className="home-header">
        <button className="generate-pdf-btn">PDF</button>
        <button className="generate-pdf-btn" onClick={togglePopup}>
          <i className="bx bx-bell"></i>
        </button>
      </header>

      {/* Popup for "Cambio Inmediato" tires */}
      {isPopupVisible && (
        <div className="popup-overlay" onClick={togglePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>Tires in "Cambio Inmediato"</h3>
            {cambioInmediatoTires.length > 0 ? (
              <div className="popup-table-container">
                <table className="popup-table">
                  <thead>
                    <tr>
                      <th>Placa</th>
                      <th>Pos</th>
                      <th>Llanta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cambioInmediatoTires.map((tire, index) => (
                      <tr key={index}>
                        <td>{tire.placa}</td>
                        <td>{tire.pos}</td>
                        <td>{tire.llanta}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No tires in "Cambio Inmediato" state.</p>
            )}
            <button className="close-button" onClick={togglePopup}>Close</button>
          </div>
        </div>
      )}

      {/* Summary Section */}
      <div className="sales-card">
        <h2 className="sales-title">Mi Resumen</h2>
        <div className="sales-stats">
          <div className="stat-box">
            <span className="stat-value">${lastMonthInvestment.toLocaleString()}</span>
            <br />
            <span className="stat-label">Inversión Mes</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">${totalCost.toLocaleString()}</span>
            <br />
            <span className="stat-label">Inversión Total</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">${averageCPK.toFixed(2)}</span>
            <br />
            <span className="stat-label">CPK</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">${averageProjectedCPK.toFixed(2)}</span>
            <br />
            <span className="stat-label">CPK Proyectado</span>
          </div>
        </div>
      </div>

      {/* Cards Container with Filtered Tires */}
      <div className="cards-container">
      <Acontecimientos />
      <Recomendaciones />
        <SemaforoPie
          tires={filteredTires}
          onSelectCondition={setSelectedCondition}
          selectedCondition={selectedCondition}
        />
        <PromedioEje
          tires={filteredTires}
          onSelectEje={setSelectedEje}
          selectedEje={selectedEje}
        />
        <ReencuacheTotal />
        <ProgressBar progress={75} />
      </div>

      {/* Reset Filters Button */}
      {isFilterActive && (
        <button className="reset-filters-btn" onClick={resetFilters}>
          Reset Filters
        </button>
      )}
    </div>
  );
};

export default Home;
