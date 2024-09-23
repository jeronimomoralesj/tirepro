import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from './AuthContext';

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

export default PublicRoute;
