import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // API call for login
      const res = await axios.post('http://localhost:5001/api/auth/login', formData);
      const token = res.data.token;
      localStorage.setItem('token', token);

      // Decode the token
      const decodedToken = jwtDecode(token);

      const userId = decodedToken.user.id;

      // Fetch additional user data
      const userRes = await axios.get(`http://localhost:5001/api/auth/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userRole = userRes.data.role;
      const companyId = userRes.data.companyId;

      // Navigate based on role
      if (userRole === 'admin') {
        navigate('/home');
      } else {
        navigate('/nueva');
      }
    } catch (err) {
      console.error('Error during login:', err);
      alert('Error during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Bienvenido</h2>
        {isLoading ? (
          <div className="loading-spinner"></div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              onChange={handleChange}
              required
              className="login-input"
            />
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              onChange={handleChange}
              required
              className="login-input"
            />
            <button type="submit" className="login-button">
              Iniciar sesión
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
