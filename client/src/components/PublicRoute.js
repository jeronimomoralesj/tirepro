// client/src/components/PublicRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // Standardized token name

  // Redirect to /home if already authenticated
  if (token) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default PublicRoute;
