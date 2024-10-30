import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Home.css';
import HorizontalBarChart from './HorizontalBarChart';
import TipoVehiculo from './TipoVehiculo';
import PorVida from './PorVida';
import PromedioEje from './PromedioEje';
import ProgressBar from './ProgressBar';
import Inspecciones from './Inspecciones';

function Flota() {
  const [tires, setTires] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedVida, setSelectedVida] = useState(null);
  const [selectedEje, setSelectedEje] = useState(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState(null);
  const [showExpiredOnly, setShowExpiredOnly] = useState(false);

  const [filteredMetrics, setFilteredMetrics] = useState({
    expiredInspectionCount: 0,
    placaCount: 0,
    llantasCount: 0,
    cpk: 0,
    cpkProyectado: 0,
  });

  // Check if any filter is active
  const hasActiveFilters = selectedBrand || selectedVida || selectedEje || selectedVehicleType || showExpiredOnly;

  useEffect(() => {
    const fetchTireData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const decodedToken = jwtDecode(token);
          const userId = decodedToken?.user?.id;

          if (!userId) {
            console.error('User ID not found in token');
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

  const filteredTires = useMemo(() => {
    return tires.filter((tire) => {
      const isExpired = new Date(tire.proyeccion_fecha) < new Date();
      return (
        (!selectedBrand || tire.marca === selectedBrand) &&
        (!selectedVida || tire.vida === selectedVida) &&
        (!selectedEje || tire.eje === selectedEje) &&
        (!selectedVehicleType || tire.tipovhc === selectedVehicleType) &&
        (!showExpiredOnly || isExpired)
      );
    });
  }, [tires, selectedBrand, selectedVida, selectedEje, selectedVehicleType, showExpiredOnly]);

  useEffect(() => {
    const calculateMetrics = () => {
      const today = new Date();
      const expiredInspectionCount = filteredTires.reduce((count, tire) => {
        const inspectionDate = new Date(tire.proyeccion_fecha);
        return inspectionDate < today ? count + 1 : count;
      }, 0);

      const uniquePlacas = new Set(filteredTires.map((tire) => tire.placa)).size;
      const llantasCount = filteredTires.length;

      const totalCpk = filteredTires.reduce(
        (sum, tire) => sum + (tire.costo / tire.kilometraje_actual),
        0
      );
      const cpk = llantasCount ? (totalCpk / llantasCount).toFixed(2) : 0;

      const totalCpkProyectado = filteredTires.reduce((sum, tire) => {
        const projectedKms = tire.kilometraje_actual / (tire.original - tire.proact) * tire.original;
        return sum + (tire.costo / projectedKms);
      }, 0);
      const cpkProyectado = llantasCount ? (totalCpkProyectado / llantasCount).toFixed(2) : 0;

      setFilteredMetrics({
        expiredInspectionCount,
        placaCount: uniquePlacas,
        llantasCount,
        cpk,
        cpkProyectado,
      });
    };

    calculateMetrics();
  }, [filteredTires]);

  const handleBrandSelect = (brand) => setSelectedBrand(brand === selectedBrand ? null : brand);
  const handleVidaSelect = (vida) => setSelectedVida(vida === selectedVida ? null : vida);
  const handleEjeSelect = (eje) => setSelectedEje(eje === selectedEje ? null : eje);
  const handleVehicleTypeSelect = (vehicleType) =>
    setSelectedVehicleType(vehicleType === selectedVehicleType ? null : vehicleType);
  const toggleExpiredFilter = () => setShowExpiredOnly((prev) => !prev);

  const handleResetFilters = () => {
    setSelectedBrand(null);
    setSelectedVida(null);
    setSelectedEje(null);
    setSelectedVehicleType(null);
    setShowExpiredOnly(false);
  };

  return (
    <div className="home">
      <header className="home-header">
        <button className="generate-pdf-btn">Generate PDF</button>
      </header>

      <div className="sales-card">
        <h2 className="sales-title">Mi Flota</h2>
        <div className="sales-stats">
          <div className="stat-box">
            <span className="stat-value">{filteredMetrics.expiredInspectionCount}</span>
            <br />
            <span className="stat-label">Llantas con inspección vencida</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{filteredMetrics.placaCount}</span>
            <br />
            <span className="stat-label">Recuento de Placas</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{filteredMetrics.llantasCount}</span>
            <br />
            <span className="stat-label">Cantidad de Llantas</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{filteredMetrics.cpk}</span>
            <br />
            <span className="stat-label">CPK</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{filteredMetrics.cpkProyectado}</span>
            <br />
            <span className="stat-label">CPK Proyectado</span>
          </div>
        </div>
      </div>

      <div className="cards-container">
        <HorizontalBarChart
          tires={filteredTires}
          onSelectBrand={handleBrandSelect}
          selectedBrand={selectedBrand}
        />
        <TipoVehiculo
          tires={filteredTires}
          onSelectVehicleType={handleVehicleTypeSelect}
          selectedVehicleType={selectedVehicleType}
        />
        <PorVida tires={filteredTires} onSelectVida={handleVidaSelect} selectedVida={selectedVida} />
        <PromedioEje tires={filteredTires} onSelectEje={handleEjeSelect} selectedEje={selectedEje} />
        <ProgressBar />
        <Inspecciones
          tires={filteredTires}
          showExpiredOnly={showExpiredOnly}
          onToggleExpiredFilter={toggleExpiredFilter}
        />
      </div>

      {hasActiveFilters && (
        <button className="reset-filters-btn" onClick={handleResetFilters}>
          Delete Filters
        </button>
      )}
    </div>
  );
}

export default Flota;
