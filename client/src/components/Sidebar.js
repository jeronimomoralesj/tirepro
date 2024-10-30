// Sidebar.js
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import logo from "../img/logo.png"

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token'); // Use 'token' consistently
    navigate('/login', { replace: true });
  };

  return (
    <div className="sidebar">
      {/* Logo and Header */}
      <div className="logo-section">
        <div className="logo">
          <img src={logo} alt="Catalog Logo" />
          <span className="logo-text">TirePro</span> {/* Add TirePro text */}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="menu">
        <div className="menu-section">
          <Link to="/home" className={`menu-item ${isActive('/home') ? 'active' : ''}`}>
            <i className="menu-icon bx bx-home"></i>
            <span className="menu-text">Resumen</span>
          </Link>
          <Link to="/flota" className={`menu-item ${isActive('/flota') ? 'active' : ''}`}>
            <i className="menu-icon bx bx-car"></i>
            <span className="menu-text">Flota</span>
          </Link>
          <Link to="/estado" className={`menu-item ${isActive('/estado') ? 'active' : ''}`}>
            <i className="menu-icon bx bx-briefcase"></i>
            <span className="menu-text">Estado</span>
          </Link>
          <Link to="/uso" className={`menu-item ${isActive('/uso') ? 'active' : ''}`}>
            <i className="menu-icon bx bx-map"></i>
            <span className="menu-text">Uso</span>
          </Link>
          <Link to="/nueva" className={`menu-item ${isActive('/nueva') ? 'active' : ''}`}>
            <i className="menu-icon bx bx-plus"></i>
            <span className="menu-text">Nueva</span>
          </Link>
          <Link to="/nueva" className={`menu-item ${isActive('/nueva') ? 'active' : ''}`}>
            <i className="menu-icon bx bx-phone"></i>
            <span className="menu-text">Soporte</span>
          </Link>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="profile-section">
        <div className="profile">
          <img src="https://marketplace.canva.com/EAFEits4-uw/1/0/1600w/canva-boy-cartoon-gamer-animated-twitch-profile-photo-oEqs2yqaL8s.jpg" alt="User" className="profile-image" />
          <div className="profile-info">
            <span className="profile-name">Jeronimo Morales</span>
            <span className="profile-role">Admin</span>
          </div>
        </div>

        {/* Simplified Profile Actions */}
        <div className="profile-actions">
          <div className="profile-action-icon">
            <i className="bx bx-cog"></i>
          </div>
          <div className="profile-action-icon" onClick={handleLogout} style={{ cursor: 'pointer' }}>
            <i className="bx bx-log-out"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
