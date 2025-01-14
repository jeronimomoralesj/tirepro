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
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from "../img/logo_text.png";
import html2canvas from 'html2canvas';

const Estado = () => {
  const [tires, setTires] = useState([]);
  const [selectedEje, setSelectedEje] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [selectedVida, setSelectedVida] = useState(null);
  const [totalCost, setTotalCost] = useState(0);
  const [averageCPK, setAverageCPK] = useState(0);
  const [averageProjectedCPK, setAverageProjectedCPK] = useState(0);
  const [selectedTire, setSelectedTire] = useState(null);
  const [includeEndOfLife, setIncludeEndOfLife] = useState(false);

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
        }
      } catch (error) {
        console.error('Error fetching tire data:', error);
      }
    };

    fetchTireData();
  }, []);

  // Filter tires based on selected filters, toggle `vida` "fin" inclusion, and exclude `placa` equal to "inventario"
  const filteredTires = useMemo(() => {
    return tires.filter((tire) => {
      // Exclude tires with `placa` equal to "inventario"
      if (tire.placa === "inventario") {
        return false;
      }

      const minDepth = Math.min(
        ...tire.profundidad_int.map((p) => p.value),
        ...tire.profundidad_cen.map((p) => p.value),
        ...tire.profundidad_ext.map((p) => p.value)
      );

      const matchesEje = selectedEje ? tire.eje === selectedEje : true;
      const matchesCondition = selectedCondition
        ? selectedCondition === 'buenEstado' && minDepth > 7 ||
          selectedCondition === 'dias60' && minDepth <= 7 && minDepth > 6 ||
          selectedCondition === 'dias30' && minDepth <= 6 && minDepth > 5 ||
          selectedCondition === 'cambioInmediato' && minDepth <= 5
        : true;
      const matchesVida = selectedVida
        ? tire.vida?.at(-1)?.value === selectedVida
        : true;

      // Apply or exclude tires with `vida` equal to "fin" based on toggle state
      const isVidaNotFin = includeEndOfLife || tire.vida?.at(-1)?.value !== "fin";

      return matchesEje && matchesCondition && matchesVida && isVidaNotFin;
    });
  }, [tires, selectedEje, selectedCondition, selectedVida, includeEndOfLife]);

  // Calculate summary metrics including CPK and CPK Proyectado
  useEffect(() => {
    const calculateMetrics = () => {
      let validCPKCount = 0;
      let validProjectedCPKCount = 0;
      let totalCPK = 0;
      let totalProjectedCPK = 0;

      const totalCost = filteredTires.reduce((sum, tire) => sum + tire.costo, 0);
      setTotalCost(totalCost);

      filteredTires.forEach((tire) => {
        const latestCPK = tire.cpk?.at(-1)?.value || 0;
        const latestProjectedCPK = tire.cpk_proy?.at(-1)?.value || 0;

        if (latestCPK > 0) {
          totalCPK += latestCPK;
          validCPKCount++;
        }

        if (latestProjectedCPK > 0) {
          totalProjectedCPK += latestProjectedCPK;
          validProjectedCPKCount++;
        }
      });

      setAverageCPK(validCPKCount ? totalCPK / validCPKCount : 0);
      setAverageProjectedCPK(validProjectedCPKCount ? totalProjectedCPK / validProjectedCPKCount : 0);

      const expiredInspectionCount = filteredTires.filter((tire) => {
        const lastInspectionDate = new Date(tire.ultima_inspeccion);
        return lastInspectionDate < new Date();
      }).length;

      const uniquePlacas = new Set(filteredTires.map((tire) => tire.placa)).size;
      const llantasCount = filteredTires.length;

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

  const generatePDF = async () => {
    const doc = new jsPDF();
    let yOffset = 10;

    // Add logo
    const imgWidth = 50;
    const imgHeight = 20;
    doc.addImage(logo, 'PNG', 10, yOffset, imgWidth, imgHeight);
    yOffset += 30;

    // Add title
    doc.setFontSize(16);
    doc.text('TirePro Report', 14, yOffset);
    yOffset += 10;

    // Add charts and sections
    const sections = document.querySelectorAll('.cards-container > div');
    for (let i = 0; i < sections.length; i++) {
      const canvas = await html2canvas(sections[i]);
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 180; // Fit within PDF width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      if (yOffset + imgHeight > 280) {
        doc.addPage();
        yOffset = 10;
      }
      doc.addImage(imgData, 'PNG', 10, yOffset, imgWidth, imgHeight);
      yOffset += imgHeight + 10;
    }

    doc.save('TirePro_estado.pdf');
  };

  return (
    <div className="home">
      <header className="home-header">
      <button className="generate-pdf-btn" onClick={generatePDF}>
          Generar PDF
        </button>
      </header>

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
            <span className="stat-label">CPK Promedio</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">${averageProjectedCPK.toFixed(2)}</span>
            <br />
            <span className="stat-label">CPK Proyectado Promedio</span>
          </div>
        </div>

<br />
        {/* Toggle Include End-of-Life Tires Button */}
        <button
          className="toggle-filter-btn"
          onClick={() => setIncludeEndOfLife((prev) => !prev)}
        >
          {includeEndOfLife ? "Excluir Llantas en Fin de Vida" : "Incluir Llantas en Fin de Vida"}
        </button>
      </div>

      {/* Reset Filters Button */}
      {(selectedEje || selectedCondition || selectedVida) && (
        <button className="reset-filters-btn" onClick={resetFilters}>
          Eliminar Filtros
        </button>
      )}

      {/* Cards Container */}
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
        
        <SemaforoPie 
          tires={filteredTires}
          onSelectCondition={setSelectedCondition}
          selectedCondition={selectedCondition}
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
        
      </div>
    </div>
  );
};

export default Estado;
