import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

// Cache for decoded tokens
let tokenCache = {
  token: null,
  decodedToken: null
};

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

  // Memoized token decoder
  const getDecodedToken = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token === tokenCache.token) {
      return tokenCache.decodedToken;
    }
    const decodedToken = jwtDecode(token);
    tokenCache = { token, decodedToken };
    return decodedToken;
  }, []);

  // Optimized data fetching with AbortController
  useEffect(() => {
    const abortController = new AbortController();

    const fetchTireData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const decodedToken = getDecodedToken();
        const userId = decodedToken?.user?.id;
        if (!userId) return;

        const response = await axios.get(
          `https://tirepro.onrender.com/api/tires/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: abortController.signal
          }
        );
        setTires(response.data);
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error('Error fetching tire data:', error);
        }
      }
    };

    fetchTireData();
    return () => abortController.abort();
  }, [getDecodedToken]);

  // Memoized tire filtering
  const filteredTires = useMemo(() => {
    return tires.filter((tire) => {
      if (tire.placa === "inventario") return false;
      
      const minDepth = Math.min(
        ...tire.profundidad_int.map((p) => p.value),
        ...tire.profundidad_cen.map((p) => p.value),
        ...tire.profundidad_ext.map((p) => p.value)
      );

      if (!includeEndOfLife && tire.vida?.at(-1)?.value === "fin") return false;
      if (selectedEje && tire.eje !== selectedEje) return false;
      
      if (selectedCondition) {
        if (selectedCondition === 'buenEstado' && minDepth <= 7) return false;
        if (selectedCondition === 'dias60' && (minDepth > 7 || minDepth <= 6)) return false;
        if (selectedCondition === 'dias30' && (minDepth > 6 || minDepth <= 5)) return false;
        if (selectedCondition === 'cambioInmediato' && minDepth > 5) return false;
      }

      if (selectedVida && tire.vida?.at(-1)?.value !== selectedVida) return false;

      return true;
    });
  }, [tires, selectedEje, selectedCondition, selectedVida, includeEndOfLife]);

  // Optimized metrics calculation
  useEffect(() => {
    const now = new Date();
    const {
      expiredCount,
      uniquePlacas,
      cpkStats,
      totalCostValue
    } = filteredTires.reduce((acc, tire) => {
      // Check inspection date
      if (new Date(tire.ultima_inspeccion) < now) {
        acc.expiredCount++;
      }

      // Track unique placas
      acc.uniquePlacas.add(tire.placa);

      // Calculate CPK stats
      const latestCPK = tire.cpk?.at(-1)?.value || 0;
      const latestProjectedCPK = tire.cpk_proy?.at(-1)?.value || 0;

      if (latestCPK > 0) {
        acc.cpkStats.totalCPK += latestCPK;
        acc.cpkStats.validCPKCount++;
      }

      if (latestProjectedCPK > 0) {
        acc.cpkStats.totalProjectedCPK += latestProjectedCPK;
        acc.cpkStats.validProjectedCPKCount++;
      }

      acc.totalCostValue += tire.costo;

      return acc;
    }, {
      expiredCount: 0,
      uniquePlacas: new Set(),
      cpkStats: {
        totalCPK: 0,
        totalProjectedCPK: 0,
        validCPKCount: 0,
        validProjectedCPKCount: 0
      },
      totalCostValue: 0
    });

    setMetrics({
      expiredInspectionCount: expiredCount,
      placaCount: uniquePlacas.size,
      llantasCount: filteredTires.length,
    });

    setTotalCost(totalCostValue);
    setAverageCPK(cpkStats.validCPKCount ? cpkStats.totalCPK / cpkStats.validCPKCount : 0);
    setAverageProjectedCPK(cpkStats.validProjectedCPKCount ? cpkStats.totalProjectedCPK / cpkStats.validProjectedCPKCount : 0);
  }, [filteredTires]);

  // Memoized PDF generation
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

  const resetFilters = useCallback(() => {
    setSelectedEje(null);
    setSelectedCondition(null);
    setSelectedVida(null);
  }, []);

  // Keep the exact same JSX structure
  return (
    <div className="home">
      <header className="home-header">
        <button className="generate-pdf-btn" onClick={generatePDF}>
          Generar PDF
        </button>
      </header>

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
        <button
          className="toggle-filter-btn"
          onClick={() => setIncludeEndOfLife((prev) => !prev)}
        >
          {includeEndOfLife ? "Excluir Llantas en Fin de Vida" : "Incluir Llantas en Fin de Vida"}
        </button>
      </div>

      {(selectedEje || selectedCondition || selectedVida) && (
        <button className="reset-filters-btn" onClick={resetFilters}>
          Eliminar Filtros
        </button>
      )}

      <div className="cards-container">
        <SemaforoTabla
          filteredTires={filteredTires}
          onTireSelect={(placa, pos) => {
            const selected = tires.find(
              (tire) => tire.placa === placa && tire.pos?.at(-1)?.value === pos
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