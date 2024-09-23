import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from './AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hook
  const { login } = useContext(AuthContext); // Access the login function from AuthContext

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setError(''); // Clear any previous error messages

    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', {
        email,
        password,
      });

      // Check if login was successful
      if (response.data.token) {
        setMessage('Login successful!');
        localStorage.setItem('token', response.data.token); // Store the token in localStorage
        login(); // Update the auth state to logged in
        navigate('/dashboard'); // Redirect to dashboard
      } else {
        setMessage('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Error logging in:', error.response?.data?.msg || error.message);
      setError(error.response?.data?.msg || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="login">
      <form className="login-form" onSubmit={handleLogin}>
        <h2 className="login-title">Login</h2>
        {message && <p className="login-message">{message}</p>}
        {error && <p className="login-error">{error}</p>} {/* Display error message */}
        <div className="login-field">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="login-field">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit" className="login-button">Login</button>
      </form>
    </div>
  );
};

export default Login;
