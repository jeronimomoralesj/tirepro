import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Turnstile from '@marsidev/react-turnstile';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(''); // Store CAPTCHA token
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      alert('Please complete the CAPTCHA.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post('https://tirepro.onrender.com/api/auth/login', {
        ...formData,
        captchaToken, // Include CAPTCHA token
      });
      const token = res.data.token;
      localStorage.setItem('token', token);

      // Decode token to get user ID and fetch role
      const userId = jwtDecode(token).user.id;
      const userRes = await axios.get(`https://tirepro.onrender.com/api/auth/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userRole = userRes.data.role;
      if (userRole === 'admin') navigate('/home');
      else navigate('/nueva');
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
            <Turnstile
              siteKey="your-turnstile-site-key" // Replace with your Cloudflare Turnstile site key
              onSuccess={(token) => setCaptchaToken(token)}
              onError={() => alert('CAPTCHA verification failed.')}
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
