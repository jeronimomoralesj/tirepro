import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import './Home.css';
import SemaforoPie from './SemaforoPie';
import PromedioEje from './PromedioEje';
import ReencuacheTotal from './ReencuacheTotal';
import ProgressBar from './ProgressBar';
import HorizontalBarChart from './HorizontalBarChart';
import TipoVehiculo from './TipoVehiculo';
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

          const response = await axios.get(`http://localhost:5001/api/tires/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const tireData = response.data;
          setTires(tireData);

          // Identify "Cambio Inmediato" tires based on latest depth values
          const cambioInmediato = tireData.filter((tire) => {
            const minDepth = Math.min(
              tire.profundidad_int.at(-1)?.value || 0,
              tire.profundidad_cen.at(-1)?.value || 0,
              tire.profundidad_ext.at(-1)?.value || 0
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
        tire.profundidad_int.at(-1)?.value || 0,
        tire.profundidad_cen.at(-1)?.value || 0,
        tire.profundidad_ext.at(-1)?.value || 0
      );

      const matchesEje = selectedEje ? tire.eje === selectedEje : true;
      const matchesCondition = selectedCondition
        ? (selectedCondition === 'buenEstado' && minDepth > 7) ||
          (selectedCondition === 'dias60' && minDepth > 6 && minDepth <= 7) ||
          (selectedCondition === 'dias30' && minDepth > 5 && minDepth <= 6) ||
          (selectedCondition === 'cambioInmediato' && minDepth <= 5)
        : true;
      const matchesVida = selectedVida ? tire.vida.at(-1)?.value === selectedVida : true;

      return matchesEje && matchesCondition && matchesVida;
    });
  }, [tires, selectedEje, selectedCondition, selectedVida]);

  // Calculate summary metrics based on filtered data
  useEffect(() => {
    const calculateMetrics = () => {
      const today = new Date();
      const expiredInspectionCount = filteredTires.reduce((count, tire) => {
        const inspectionDate = new Date(tire.proyeccion_fecha);
        return inspectionDate < today ? count + 1 : count;
      }, 0);

      const uniquePlacas = new Set(filteredTires.map((tire) => tire.placa)).size;
      const llantasCount = filteredTires.length;

      const totalCPKValues = filteredTires.reduce((sum, tire) => {
        const latestCPKValue = tire.cpk.at(-1)?.value || 0;
        return sum + latestCPKValue;
      }, 0);
      setAverageCPK(filteredTires.length ? totalCPKValues / filteredTires.length : 0);

      const totalProjectedCPKValues = filteredTires.reduce((sum, tire) => {
        const latestCPKProyValue = tire.cpk_proy.at(-1)?.value || 0;
        return sum + latestCPKProyValue;
      }, 0);
      setAverageProjectedCPK(filteredTires.length ? totalProjectedCPKValues / filteredTires.length : 0);

      setMetrics({
        expiredInspectionCount,
        placaCount: uniquePlacas,
        llantasCount,
      });
    };

    calculateMetrics();
  }, [filteredTires]);

  // Reset filters function
  const resetFilters = () => {
    setSelectedEje(null);
    setSelectedCondition(null);
    setSelectedVida(null);
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
            <button className="close-button" onClick={togglePopup}>Cerrar</button>
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
            <span className="stat-label">Llantas con Inspección Vencida</span>
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
          onTireSelect={(placa, pos) => console.log(`Selected tire: ${placa} - ${pos}`)}
          selectedTire={null}
        />
        <DetallesLlantas filteredTires={filteredTires} />
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