import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import './Home.css';
import HorizontalBarChart from './HorizontalBarChart';
import TipoVehiculo from './TipoVehiculo';
import PorVida from './PorVida';
import PromedioEje from './PromedioEje';
import Inspecciones from './Inspecciones';

const Flota = () => {
  const [tires, setTires] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState(null);
  const [selectedVida, setSelectedVida] = useState(null);
  const [selectedEje, setSelectedEje] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [metrics, setMetrics] = useState({
    expiredInspectionCount: 0,
    placaCount: 0,
    llantasCount: 0,
    averageCPK: 0,
    averageProjectedCPK: 0,
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
      const matchesBrand = selectedBrand ? tire.marca === selectedBrand : true;
      const matchesVehicleType = selectedVehicleType ? tire.tipovhc === selectedVehicleType : true;
      const matchesVida = selectedVida
        ? (() => {
            const vida = tire.vida?.[tire.vida.length - 1]?.value || 'Desconocido';
            return vida === selectedVida;
          })()
        : true;
      const matchesEje = selectedEje ? tire.eje === selectedEje : true;
      const matchesCondition = selectedCondition
        ? (() => {
            const minDepth = Math.min(
              ...tire.profundidad_int.map((p) => p.value),
              ...tire.profundidad_cen.map((p) => p.value),
              ...tire.profundidad_ext.map((p) => p.value)
            );
            if (selectedCondition === 'Buen estado') return minDepth > 7;
            if (selectedCondition === 'Dentro de 60 días') return minDepth > 6 && minDepth <= 7;
            if (selectedCondition === 'Dentro de 30 días') return minDepth > 5 && minDepth <= 6;
            if (selectedCondition === 'Cambio inmediato') return minDepth <= 5;
          })()
        : true;

      return matchesBrand && matchesVehicleType && matchesVida && matchesEje && matchesCondition;
    });
  }, [tires, selectedBrand, selectedVehicleType, selectedVida, selectedEje, selectedCondition]);

  // Calculate metrics based on filtered data
  useEffect(() => {
    const calculateMetrics = () => {
      const today = new Date();
      const expiredInspectionCount = filteredTires.filter((tire) => {
        const inspectionDate = new Date(tire.ultima_inspeccion);
        return inspectionDate < today;
      }).length;

      const placaCount = new Set(filteredTires.map((tire) => tire.placa)).size;
      const llantasCount = filteredTires.length;

      let validTiresCount = 0;
      let totalCPK = 0;
      let totalProjectedCPK = 0;

      filteredTires.forEach((tire) => {
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

      setMetrics({
        expiredInspectionCount,
        placaCount,
        llantasCount,
        averageCPK: validTiresCount ? totalCPK / validTiresCount : 0,
        averageProjectedCPK: validTiresCount ? totalProjectedCPK / validTiresCount : 0,
      });
    };

    calculateMetrics();
  }, [filteredTires]);

  // Reset filters
  const resetFilters = () => {
    setSelectedBrand(null);
    setSelectedVehicleType(null);
    setSelectedVida(null);
    setSelectedEje(null);
    setSelectedCondition(null);
  };

  return (
    <div className="home">
      {/* Summary Section */}
      <div className="sales-card">
        <h2 className="sales-title">Mi Flota</h2>
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
            <span className="stat-value">${metrics.averageCPK.toFixed(2)}</span>
            <br />
            <span className="stat-label">CPK</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">${metrics.averageProjectedCPK.toFixed(2)}</span>
            <br />
            <span className="stat-label">CPK Proyectado</span>
          </div>
        </div>
      </div>

      {/* Reset Filters Button */}
      {(selectedBrand || selectedVehicleType || selectedVida || selectedEje || selectedCondition) && (
        <button className="reset-filters-btn" onClick={resetFilters}>
          Eliminar Filtros
        </button>
      )}

      {/* Cards Container */}
      <div className="cards-container">
        <HorizontalBarChart
          tires={filteredTires}
          selectedBrand={selectedBrand}
          onSelectBrand={setSelectedBrand}
        />
        <TipoVehiculo
          tires={filteredTires}
          onSelectVehicleType={setSelectedVehicleType}
          selectedVehicleType={selectedVehicleType}
        />
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
        <Inspecciones tires={filteredTires} />

      </div>
    </div>
  );
};

export default Flota;
