// Sidebar.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import './Sidebar.css';
import logo from "../img/logo.png";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState(''); // to check if user is admin

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const decodedToken = jwtDecode(token);
          const userId = decodedToken.user.id;

          const response = await axios.get(`http://localhost:5001/api/auth/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const { name, role } = response.data;
          setUserName(name.length > 16 ? name.substring(0, 16) + '...' : name);
          setUserRole(role); // Set role for conditionally rendering sidebar links
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <div className="sidebar">
      <div className="logo-section">
        <div className="logo">
          <img src={logo} alt="Catalog Logo" />
          <span className="logo-text">TirePro</span>
        </div>
        <div className="burger-icon" onClick={toggleMenu}>
          <i className="bx bx-menu"></i>
        </div>
      </div>

      <div className={`menu ${isMenuOpen ? 'menu-open' : ''}`}>
        {userRole === 'admin' && (
          <>
            <Link to="/home" className={`menu-item ${isActive('/home') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
              <i className="menu-icon bx bx-home"></i>
              <span className="menu-text">Resumen</span>
            </Link>
            <Link to="/flota" className={`menu-item ${isActive('/flota') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
              <i className="menu-icon bx bx-car"></i>
              <span className="menu-text">Flota</span>
            </Link>
            <Link to="/estado" className={`menu-item ${isActive('/estado') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
              <i className="menu-icon bx bx-briefcase"></i>
              <span className="menu-text">Estado</span>
            </Link>
            <Link to="/uso" className={`menu-item ${isActive('/uso') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
              <i className="menu-icon bx bx-map"></i>
              <span className="menu-text">Uso</span>
            </Link>
          </>
        )}
        <Link to="/nueva" className={`menu-item ${isActive('/nueva') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
          <i className="menu-icon bx bx-plus"></i>
          <span className="menu-text">Nueva</span>
        </Link>
        {userRole === 'admin' && (
          <Link to="/soporte" className={`menu-item ${isActive('/soporte') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
            <i className="menu-icon bx bx-phone"></i>
            <span className="menu-text">Soporte</span>
          </Link>
        )}
      </div>

      <div className="profile-section">
        <div className="profile">
          <img src="https://marketplace.canva.com/EAFEits4-uw/1/0/1600w/canva-boy-cartoon-gamer-animated-twitch-profile-photo-oEqs2yqaL8s.jpg" alt="User" className="profile-image" />
          <div className="profile-info">
            <span className="profile-name">{userName}</span>
            <span className="profile-role">{userRole === 'admin' ? 'Admin' : 'Usuario'}</span>
          </div>
        </div>

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
