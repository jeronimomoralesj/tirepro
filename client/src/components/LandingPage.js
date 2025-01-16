import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, BarChart2, PieChart, TrendingUp, Users } from 'lucide-react';
import './LandingPage.css'; // Import the CSS file

const LandingPage = () => {
  return (
    <div className="landing-page-container"> {/* Root container */}
      {/* Navigation */}
      <nav className="navigation">
        <div className="navigation-wrapper">
          <div className="logo">FleetMetrics</div>
          <div className="nav-links">
            <Link to="/features" className="nav-link">Funcionalidades</Link>
            <Link to="/pricing" className="nav-link">Precios</Link>
            <Link to="/about" className="nav-link">Nosotros</Link>
            <Link to="/login" className="nav-link">Iniciar Sesión</Link>
            <Link to="/signup" className="nav-button">
              Prueba Gratis
              <ChevronRight className="icon" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Gestione su Flota con <span className="highlight">Inteligencia</span>
          </h1>
          <p className="hero-description">
            Optimice el rendimiento de sus llantas y reduzca costos operativos con nuestra plataforma integral de gestión de flotas.
          </p>
          <div className="hero-buttons">
            <button className="primary-button">Comenzar Ahora <ChevronRight className="icon" /></button>
            <button className="secondary-button">Ver Demo</button>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="dashboard-preview">
          <div className="dashboard-container">
            <div className="grid grid-cols-12">
              {/* Sidebar */}
              

              {/* Main Content */}
              <div className="dashboard-content col-span-10">
                <div className="dashboard-stats">
                  {['Total Flota', 'En Mantenimiento', 'Alertas', 'Eficiencia'].map((stat, i) => (
                    <div key={i} className="stat-card">
                      <div className="stat-title">{stat}</div>
                      <div className="stat-value">{Math.floor(Math.random() * 100)}%</div>
                    </div>
                  ))}
                </div>
                <div className="chart-area"></div>
                <div className="bottom-charts">
                  <div className="chart"></div>
                  <div className="chart"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="features-container">
          {[
            {
              title: 'Monitoreo en Tiempo Real',
              description: 'Seguimiento continuo del estado y rendimiento de su flota con actualizaciones instantáneas.'
            },
            {
              title: 'Análisis Predictivo',
              description: 'Anticipe necesidades de mantenimiento y optimice la vida útil de sus neumáticos.'
            },
            {
              title: 'Reportes Detallados',
              description: 'Informes completos y personalizables para una mejor toma de decisiones.'
            }
          ].map((feature, i) => (
            <div key={i} className="feature-card">
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
