import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Home.css';
import SemaforoPie from './SemaforoPie';
import PromedioEje from './PromedioEje';
import PorVida from './PorVida';
import Inspecciones from './Inspecciones';
import SemaforoTabla from './SemaforoTabla';
import DetallesLlantas from './DetallesLlantas';

const Estado = () => {
  const [tires, setTires] = useState([]);
  const [selectedEje, setSelectedEje] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [selectedVida, setSelectedVida] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [cambioInmediatoTires, setCambioInmediatoTires] = useState([]);
  const [averageCPK, setAverageCPK] = useState(0);
  const [averageProjectedCPK, setAverageProjectedCPK] = useState(0);
  const [selectedTire, setSelectedTire] = useState(null);

  const [metrics, setMetrics] = useState({
    expiredInspectionCount: 0,
    placaCount: 0,
    llantasCount: 0,
  });

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

          const response = await axios.get(`https://tirepro.onrender.com/api/tires/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const tireData = response.data;
          setTires(tireData);

          // Identify "Cambio Inmediato" tires based on latest depth values
          const cambioInmediato = tireData.filter((tire) => {
            const minDepth = Math.min(
              ...tire.profundidad_int.map((p) => p.value),
              ...tire.profundidad_cen.map((p) => p.value),
              ...tire.profundidad_ext.map((p) => p.value)
            );
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

  // Filter tires based on selected filters
  const filteredTires = useMemo(() => {
    return tires.filter((tire) => {
      const minDepth = Math.min(
        ...tire.profundidad_int.map((p) => p.value),
        ...tire.profundidad_cen.map((p) => p.value),
        ...tire.profundidad_ext.map((p) => p.value)
      );
      return minDepth > 0; // Example filter, customize as needed
    });
  }, [tires]);

  // Calculate summary metrics including CPK and CPK Proyectado
  useEffect(() => {
    const calculateMetrics = () => {
      let validTiresCount = 0;
      let totalCPK = 0;
      let totalProjectedCPK = 0;

      const expiredInspectionCount = tires.filter((tire) => {
        const lastInspectionDate = new Date(tire.ultima_inspeccion);
        return lastInspectionDate < new Date();
      }).length;

      const uniquePlacas = new Set(tires.map((tire) => tire.placa)).size;
      const llantasCount = tires.length;

      tires.forEach((tire) => {
        const lastKms = tire.kms?.[tire.kms.length - 1]?.value || 0;
        const lastProact = tire.proact?.[tire.proact.length - 1]?.value || 0;

        if (lastProact < 0 || lastProact > 50) return; // Skip invalid `proact` values

        const cpk = lastKms > 0 ? tire.costo / lastKms : 0;
        totalCPK += cpk;

        const projectedKms = lastProact < 16 ? (lastKms / (16 - lastProact)) * 16 : 0;
        const cpkProy = projectedKms > 0 ? tire.costo / projectedKms : 0;
        totalProjectedCPK += cpkProy;

        validTiresCount++;
      });

      setAverageCPK(validTiresCount ? totalCPK / validTiresCount : 0);
      setAverageProjectedCPK(validTiresCount ? totalProjectedCPK / validTiresCount : 0);

      setMetrics({
        expiredInspectionCount,
        placaCount: uniquePlacas,
        llantasCount,
      });
    };

    calculateMetrics();
  }, [tires]);

  // Reset filters function
  const resetFilters = () => {
    setSelectedEje(null);
    setSelectedCondition(null);
    setSelectedVida(null);
  };

  return (
    <div className="home">
      <header className="home-header">
        <button className="generate-pdf-btn">PDF</button>
        <button className="generate-pdf-btn" onClick={() => setIsPopupVisible(!isPopupVisible)}>
          <i className="bx bx-bell"></i>
        </button>
      </header>

      {/* Popup for "Cambio Inmediato" tires */}
      {isPopupVisible && (
        <div className="popup-overlay" onClick={() => setIsPopupVisible(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>Que debo pedir</h3>
            {cambioInmediatoTires.length > 0 ? (
              <div className="popup-table-container">
                <table className="popup-table">
                  <thead>
                    <tr>
                      <th>Placa</th>
                      <th>Pos</th>
                      <th>Llanta</th>
                      <th>Vida</th>
                      <th>Marca</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cambioInmediatoTires.map((tire, index) => (
                      <tr key={index}>
                        <td>{tire.placa}</td>
                        <td>{tire.pos.at(-1)?.value || 'Unknown'}</td>
                        <td>{tire.llanta}</td>
                        <td>{tire.vida.at(-1)?.value || 'N/A'}</td>
                        <td>{tire.marca}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No hay llantas en "Cambio Inmediato".</p>
            )}
            <button className="close-button" onClick={() => setIsPopupVisible(false)}>Cerrar</button>
          </div>
        </div>
      )}

      {/* Summary Section */}
      <div className="sales-card">
        <h2 className="sales-title">Mi Estado</h2>
        <div className="sales-stats">
          <div className="stat-box">
            <span className="stat-value">{metrics.expiredInspectionCount}</span>
            <br />
            <span className="stat-label">Inspecciones Vencidas</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{metrics.placaCount}</span>
            <br />
            <span className="stat-label">Recuento de Placas</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{metrics.llantasCount}</span>
            <br />
            <span className="stat-label">Cantidad de Llantas</span>
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
        <SemaforoTabla
          filteredTires={filteredTires}
          onTireSelect={(placa, pos) => {
            const selected = tires.find(
              (tire) =>
                tire.placa === placa &&
                tire.pos?.at(-1)?.value === pos
            );
            setSelectedTire(selected);
          }}
          selectedTire={selectedTire}
        />
        <DetallesLlantas tires={filteredTires} />
        <PorVida 
          tires={filteredTires}
          onSelectVida={setSelectedVida}
          selectedVida={selectedVida}
        />
        <PromedioEje 
          tires={filteredTires}
          onSelectEje={setSelectedEje}
          selectedEje={selectedEje}
        />
        <SemaforoPie 
          tires={filteredTires}
          onSelectCondition={setSelectedCondition}
          selectedCondition={selectedCondition}
        />
      </div>

      {/* Reset Filters Button */}
      {selectedEje || selectedCondition || selectedVida ? (
        <button className="reset-filters-btn" onClick={resetFilters}>
          Eliminar Filtros
        </button>
      ) : null}
    </div>
  );
};

export default Estado;