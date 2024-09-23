import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import './Register.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(''); // State to store error messages
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setError(''); // Clear any previous error messages

    try {
      const response = await axios.post('http://localhost:5001/api/auth/register', {
        name,
        email,
        password,
      });

      // Check if registration was successful
      if (response.data.token) {
        setMessage('Registration successful!');
        // Store the token if needed and redirect to dashboard
        localStorage.setItem('token', response.data.token);
        navigate('/dashboard'); // Redirect to dashboard
      } else {
        setMessage('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error registering user:', error.response?.data?.msg || error.message);
      setError(error.response?.data?.msg || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="register">
      <form className="register-form" onSubmit={handleRegister}>
        <h2 className="register-title">Register</h2>
        {message && <p className="register-message">{message}</p>}
        {error && <p className="register-error">{error}</p>} {/* Display error message */}
        <div className="register-field">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </div>
        <div className="register-field">
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
        <div className="register-field">
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
        <button type="submit" className="register-button">Register</button>
      </form>
    </div>
  );
};

export default Register;
