// src/components/Dashboard.js

import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../auth/AuthContext';

const Dashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Update the auth state to logged out
    navigate('/login'); // Redirect to login page
  };

  return (
    <div>
      <h1>Welcome to the Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
