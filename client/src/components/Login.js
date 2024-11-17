// client/src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://tirepro.onrender.com/api/auth/login', formData);
      const token = res.data.token;
      localStorage.setItem('token', token); // Save token to local storage

      // Decode token to get user ID
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.user.id;

      // Fetch user role based on ID
      const userRes = await axios.get(`http://localhost:5001/api/auth/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userRole = userRes.data.role;

      // Navigate based on role
      if (userRole === 'admin') {
        navigate('/home'); // Redirect to home if admin
      } else {
        navigate('/nueva'); // Redirect to nueva if regular user
      }
    } catch (err) {
      console.error('Error during login:', err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Bienvenido</h2>
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
          <button type="submit" className="login-button">Iniciar sesión</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
