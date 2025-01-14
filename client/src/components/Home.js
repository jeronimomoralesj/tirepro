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
import MonthlyCPKChart from './MonthlyCPKChart';
import PorVida from './PorVida';
import HistoricChart from './HistoricChart';
import { FaPlus } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from "../img/logo_text.png";
import html2canvas from 'html2canvas';
import RankConductores from './RankConductores';
import Notificaciones from './Notificaciones';

const Home = () => {
  const [tires, setTires] = useState([]);
  const [selectedEje, setSelectedEje] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [totalCost, setTotalCost] = useState(0);
  const [averageCPK, setAverageCPK] = useState(0);
  const [cambioInmediatoCount, setCambioInmediatoCount] = useState(0);
  const [showNotificaciones, setShowNotificaciones] = useState(false);
  const [averageProjectedCPK, setAverageProjectedCPK] = useState(0);
  const [lastMonthInvestment, setLastMonthInvestment] = useState(10000000); // Static for now
  const [charts, setCharts] = useState([{ id: 0 }]); // Array to store chart configurations
  const [includeEndOfLife, setIncludeEndOfLife] = useState(false); // New state for including "fin" tires

  // Fetch tire data on mount
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
    
          const response = await axios.get(`https://tirepro.onrender.com/api/tires/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const tireData = response.data;
          setTires(tireData);
    
          // Calculate "Inversión Mes"
          const currentMonth = new Date().getMonth() + 1;
          const currentYear = new Date().getFullYear();
          const investmentThisMonth = tireData.reduce((sum, tire) => {
            const latestVida = tire.vida?.at(-1); // Get the latest `vida` entry
            if (
              latestVida &&
              latestVida.month === currentMonth &&
              latestVida.year === currentYear
            ) {
              return sum + tire.costo; // Add the tire's cost if the latest `vida` entry is in the same month/year
            }
            return sum;
          }, 0);
    
          setLastMonthInvestment(investmentThisMonth);
        }
      } catch (error) {
        console.error('Error fetching tire data:', error);
      }
    };
    

    fetchTireData();
  }, []);

  // notifications popup
  const toggleNotificaciones = () => setShowNotificaciones((prev) => !prev);

  // Filter tires by selected "Eje" and "Condition"
  const filteredTires = useMemo(() => {
    return tires.filter((tire) => {
      // Exclude tires with "placa" equal to "inventario"
      if (tire.placa === "inventario") {
        return false;
      }

      const matchesEje = selectedEje ? tire.eje === selectedEje : true;
      const matchesCondition = selectedCondition
        ? (() => {
            const minDepth = Math.min(
              ...tire.profundidad_int.map((p) => p.value),
              ...tire.profundidad_cen.map((p) => p.value),
              ...tire.profundidad_ext.map((p) => p.value)
            );
            if (selectedCondition === 'buenEstado') return minDepth > 7;
            if (selectedCondition === 'dias60') return minDepth > 6 && minDepth <= 7;
            if (selectedCondition === 'dias30') return minDepth > 5 && minDepth <= 6;
            if (selectedCondition === 'cambioInmediato') return minDepth <= 5;
          })()
        : true;

      // Include or exclude tires with `vida` equal to "fin" based on toggle state
      const isVidaNotFin = includeEndOfLife || tire.vida?.at(-1)?.value !== "fin";

      return matchesEje && matchesCondition && isVidaNotFin;
    });
  }, [tires, selectedEje, selectedCondition, includeEndOfLife]);

  
  // Calculate summary metrics based on filtered data
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

  // Add a new HistoricChart component
  const addHistoricChart = () => {
    setCharts((prevCharts) => [...prevCharts, { id: prevCharts.length }]);
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

    doc.save('TirePro_resumen.pdf');
  };

  return (
    <div className="home">
       <header className="home-header">
        <button className="generate-pdf-btn">
          Generar PDF
        </button>
        <button
          className={`generate-pdf-btn notificaciones-btn ${cambioInmediatoCount > 0 ? 'has-notifications' : ''}`}
          onClick={toggleNotificaciones}
        >
          Notificaciones (
          {cambioInmediatoCount > 0 && (
            <span style={{color:"red"}} className="notification-badge">{cambioInmediatoCount}</span>
          )}
          )
        </button>
      </header>
      
      {showNotificaciones && (
        <div className="popup-overlay" onClick={toggleNotificaciones}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <Notificaciones
              tires={tires}
              onCambioInmediatoCount={(count) => setCambioInmediatoCount(count)}
            />
            <button className="close-button" onClick={toggleNotificaciones}>
              Cerrar
            </button>
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
  <ReencuacheTotal tires={filteredTires} /> {/* Pass filteredTires */}
  <ProgressBar tires={filteredTires} /> {/* Pass filteredTires */}
  <RankConductores />
  {charts.map((chart) => (
    <HistoricChart key={chart.id} tires={filteredTires} />
  ))}
  {/* Add Button */}
  <button className="add-chart-btn" onClick={addHistoricChart}>
    <FaPlus className="add-icon" />
    Agregar
  </button>
</div>


      {/* Reset Filters Button */}
      {isFilterActive && (
        <button className="reset-filters-btn" onClick={resetFilters}>
          Eliminar Filtros
        </button>
      )}
    </div>
  );
};

export default Home;
