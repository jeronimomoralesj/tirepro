import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import logo from "../img/logo_text.png";
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
  
    try {
      const res = await axios.post('https://tirepro.onrender.com/api/auth/login', formData);
      const token = res.data.token;
      localStorage.setItem('token', token);
  
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.user.id;
  
      // Get full user details, including profile image
      const userRes = await axios.get(`https://tirepro.onrender.com/api/auth/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const { role: userRole, companyId, profileImage } = userRes.data;
localStorage.setItem('userImage', profileImage);  // Store the image in localStorage
  
      // Redirect based on role
      if (userRole === 'admin') {
        navigate('/home');
      } else {
        navigate('/nueva');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setErrorMessage('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src={logo} alt="Company Logo" className="login-logo" />
          <h2 className="login-title">Inicia sesión</h2>
        </div>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {isLoading ? (
          <div className="loading-spinner"></div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">correo</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="ingresa tu correo"
                onChange={handleChange}
                required
                className="login-input"
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">contraseña</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="ingresa tu contraseña"
                onChange={handleChange}
                required
                className="login-input"
              />
            </div>
            <button type="submit" className="login-button">
              Ingresar
            </button>
          </form>
        )}
        <div className="signup-link">
          ¿No tienes cuenta? <a href="mailto:jeronimo.morales@merquellantas.com">Contáctanos</a>
        </div>
      </div>
    </div>
  );
};

export default Login;