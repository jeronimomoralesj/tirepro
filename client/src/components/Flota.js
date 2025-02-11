import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Home.css';
import HorizontalBarChart from './HorizontalBarChart';
import TipoVehiculo from './TipoVehiculo';
import PorVida from './PorVida';
import PromedioEje from './PromedioEje';
import Inspecciones from './Inspecciones';
import CpkTable from './CpkTable';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from "../img/logo_text.png";
import html2canvas from 'html2canvas';

const Flota = () => {
  const [tires, setTires] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState(null);
  const [selectedVida, setSelectedVida] = useState(null);
  const [selectedEje, setSelectedEje] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [includeEndOfLife, setIncludeEndOfLife] = useState(false); // New state for including "fin" tires
  const [totalCost, setTotalCost] = useState(0);
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
          const companyId = decodedToken?.user?.companyId;  // Get companyId from token

        if (!companyId) {
          console.error("Company ID not found in token");
          return;
        }

          if (!userId) {
            console.error("User ID not found in token");
            return;
          }

          const response = await axios.get(`https://tirepro.onrender.com/api/tires/user/${companyId}`, {
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

  const stripTime = (date) => {
    const strippedDate = new Date(date);
    strippedDate.setHours(0, 0, 0, 0); // Set time to 00:00:00
    return strippedDate;
  };
  

  // Filter tires based on selected filters and toggle `vida` "fin" inclusion
  const filteredTires = useMemo(() => {
    return tires.filter((tire) => {
      // Exclude tires with `placa` equal to "inventario"
      if (tire.placa === "inventario") {
        return false;
      }

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

      // Apply or exclude tires with `vida` equal to "fin" based on toggle state
      const isVidaNotFin = includeEndOfLife || tire.vida?.at(-1)?.value !== "fin";

      return matchesBrand && matchesVehicleType && matchesVida && matchesEje && matchesCondition && isVidaNotFin;
    });
  }, [tires, selectedBrand, selectedVehicleType, selectedVida, selectedEje, selectedCondition, includeEndOfLife]);

  // Calculate metrics based on filtered data
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

      const currentDate = stripTime(new Date());
const expiredInspectionCount = filteredTires.filter((tire) => {
  const lastInspectionDate = stripTime(new Date(tire.ultima_inspeccion));
  return lastInspectionDate < currentDate;
}).length;


      const placaCount = new Set(filteredTires.map((tire) => tire.placa)).size;
      const llantasCount = filteredTires.length;

      setMetrics({
        expiredInspectionCount,
        placaCount,
        llantasCount,
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

  const generatePDF = async () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
  
    // Set consistent fonts and colors
    const COLORS = {
      primary: '#4a90e2',
      background: '#f4f4f4',
      text: '#333333'
    };
  
    // Page setup
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
  
    // Add header with company logo and report title
    doc.setFillColor(COLORS.background);
    doc.rect(margin, margin, pageWidth - 2 * margin, 25, 'F');
    
    // Add logo
    doc.addImage(logo, 'PNG', margin + 5, margin + 2, 40, 20);
    
    doc.setTextColor(COLORS.text);
    doc.setFontSize(16);
    doc.text('TirePro Reporte', pageWidth / 2, margin + 15, { align: 'center' });
  
    // Date of report
    doc.setFontSize(10);
    doc.text(new Date().toLocaleDateString(), pageWidth - margin - 10, margin + 10, { align: 'right' });
  
    let yOffset = 40;
  
    // Summary statistics section
    doc.setFillColor('#ffffff');
    doc.rect(margin, yOffset, pageWidth - 2 * margin, 30, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(COLORS.primary);
    doc.text('Resumen: ', margin + 10, yOffset + 10);
    
    doc.setTextColor(COLORS.text);
    doc.setFontSize(10);
    doc.text(`Inversión total: $${totalCost.toLocaleString()}`, margin + 10, yOffset + 20);
    doc.text(`CPK promedio: $${averageCPK.toFixed(2)}`, margin + 10, yOffset + 26);
    
    yOffset += 40;
  
    // Capture and add charts with better layout
    const chartSections = document.querySelectorAll('.cards-container > div');
    for (let i = 0; i < chartSections.length; i++) {
      const canvas = await html2canvas(chartSections[i], { 
        scale: 2,  // Higher resolution
        useCORS: true 
      });
      const imgData = canvas.toDataURL('image/png');
      
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add page break if needed
      if (yOffset + imgHeight > pageHeight - margin) {
        doc.addPage();
        yOffset = margin;
      }
      
      // Add chart with subtle border
      doc.setDrawColor(230, 230, 230);
      doc.rect(margin, yOffset, imgWidth, imgHeight + 5);
      doc.addImage(imgData, 'PNG', margin, yOffset, imgWidth, imgHeight);
      
      yOffset += imgHeight + 15;
    }
  
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Hecho con TirePro', pageWidth / 2, pageHeight - 10, { align: 'center' });
  
    doc.save('TirePro_Monthly_Report.pdf');
  };

  return (
    <div className="home">

      <header className="home-header">
      <button className="generate-pdf-btn" onClick={generatePDF}>
          Generar PDF
        </button>
      </header>

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
            <span className="stat-label">Cantidad de vehiculos</span>
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
        <CpkTable tires={filteredTires} />
      </div>
    </div>
  );
};

export default Flota;
