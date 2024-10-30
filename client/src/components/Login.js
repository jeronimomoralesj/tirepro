// client/src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // client/src/components/Login.js
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post('http://localhost:5001/api/auth/login', formData);
    localStorage.setItem('token', res.data.token); // Save token to local storage
    console.log('Token saved:', res.data.token); // Verify token is saved
    console.log('Navigating to home'); // Check if this line runs
    navigate('/home'); // Redirect to home
  } catch (err) {
    console.error('Error during login:', err);
  }
};


  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
