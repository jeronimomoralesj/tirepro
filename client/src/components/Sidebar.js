import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Sidebar.css';
import logo from '../img/logo.png';
import logo_text from '../img/logo_text.png';
import AIChat from './AIChat';

const Layout = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <div className="app-wrapper">
      <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

const Sidebar = ({ darkMode, setDarkMode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [profileImage, setProfileImage] = useState(''); // Store user profile image

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/', { replace: true });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const decodedToken = jwtDecode(token);
          const userId = decodedToken.user.id;

          const response = await axios.get(`https://tirepro.onrender.com/api/auth/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const { name, role, profileImage } = response.data;

          setUserName(name.length > 16 ? name.substring(0, 16) + '...' : name);
          setUserRole(role);

          // Use either the fetched profile image or fallback to the default
          const validProfileImage = profileImage && profileImage.startsWith('http') 
            ? profileImage 
            : 'https://images.pexels.com/photos/12261472/pexels-photo-12261472.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

          setProfileImage(validProfileImage);

          // If role is neither admin nor regular, redirect to login
          if (role !== 'admin' && role !== 'regular') {
            localStorage.removeItem('token');
            navigate('/', { replace: true });
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('token');
        navigate('/', { replace: true });
      }
    };

    fetchUserDetails();
  }, [navigate]);

  const renderMenuItem = (path, icon, text) => (
    <Link
      to={path}
      className={`menu-item ${isActive(path) ? 'active' : ''}`}
      onClick={() => setIsMenuOpen(false)}
    >
      <i className={`menu-icon bx ${icon}`}></i>
      <span className="menu-text">{text}</span>
    </Link>
  );

  return (
    <aside className="sidebar">
      <div className="logo-section">
        <div className="logo">
          <img src={logo} alt="Logo" />
          <span className="logo-text">
            <img src={logo_text} alt="Logo text" style={{ height: '20px' }} />
          </span>
        </div>

        <div className="mobile-actions">
          <div className="theme-toggle" onClick={toggleDarkMode}>
            <i className={`bx ${darkMode ? 'bx-sun' : 'bx-moon'}`}></i>
          </div>
          <Link to="/ajustes" className="mobile-action-icon">
            <i className="bx bx-cog"></i>
          </Link>
          <div className="mobile-action-icon" onClick={handleLogout}>
            <i className="bx bx-log-out"></i>
          </div>
        </div>

        <div className="burger-icon" onClick={toggleMenu}>
          <i className="bx bx-menu"></i>
        </div>
      </div>

      <nav className={`menu ${isMenuOpen ? 'menu-open' : ''}`}>
        {userRole === 'admin' ? (
          <>
            {renderMenuItem('/home', 'bx-home', 'Resumen')}
            {renderMenuItem('/flota', 'bx-car', 'Flota')}
            {renderMenuItem('/estado', 'bx-pie-chart-alt-2', 'Semáforo')}
            {renderMenuItem('/uso', 'bx-search', 'Buscar')}
            {renderMenuItem('/nueva', 'bx-plus', 'Agregar')}
            {renderMenuItem('/analista', 'bx-glasses', 'Analista')}
          </>
        ) : userRole === 'regular' ? (
          renderMenuItem('/nuevanormal', 'bx-plus', 'Inspección')
        ) : null}
      </nav>

      <div className="profile-section">
        <div className="profile">
          <img
            src={profileImage}
            alt="User"
            className="profile-image"
          />
          <div className="profile-info">
            <span className="profile-name">{userName}</span>
            <span className="profile-role">{userRole === 'admin' ? 'Admin' : 'Usuario'}</span>
          </div>
        </div>

        <div className="profile-actions">
          <div className="theme-toggle" onClick={toggleDarkMode}>
            <i className={`bx ${darkMode ? 'bx-sun' : 'bx-moon'}`}></i>
          </div>
          <div className="profile-action-icon">
            <Link to="/ajustes">
              <i className="bx bx-cog"></i>
            </Link>
          </div>
          <div className="profile-action-icon" onClick={handleLogout}>
            <i className="bx bx-log-out"></i>
          </div>
        </div>
      </div>

      {/* Conditionally render AIChat */}
      {userRole === 'admin' && <AIChat userName={userName} />}
    </aside>
  );
};

export default Layout;
