// LandingPage.js

import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import logo from '../img/logo.png';
import landing from '../img/landing.png';

const LandingPage = () => {
  return (
    <div className="landingPage-container">
      {/* Top Navigation Bar */}
      <header className="landingPage-topBar">
        <div className="landingPage-logoSection">
          <img src={logo} alt="Logo" className="landingPage-logo" />
        </div>
        <nav className="landingPage-navLinks">
          <Link to="/login" className="landingPage-navLink">Uso</Link>
          <Link to="/login" className="landingPage-navLink">Flota</Link>
          <Link to="/login" className="landingPage-navLink">Estado</Link>
        </nav>
        <div className="landingPage-authButtons">
          <Link to="/login"><button className="landingPage-loginBtn">Inicia Sesión</button></Link>
        </div>
      </header>

      {/* Gradient Background Section with Title and Image */}
      <section className="landingPage-heroSection">
        <div className="landingPage-heroContent">
          <h1 className="landingPage-heroTitle">Gestione Su Flota Con Facilidad</h1>
          <p className="landingPage-heroSubtitle">Optimiza tus llantas.</p>
          <Link to="/login"><button className="landingPage-ctaButton">Empieza hoy!</button></Link>
        </div>
        <div className="landingPage-heroImage">
          <img src={landing} alt="Vista previa del panel" className="landingPage-landingImage" />
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
