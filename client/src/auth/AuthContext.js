import React, { createContext, useState, useEffect } from 'react';

// Create the AuthContext with default values
const AuthContext = createContext({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

// AuthProvider component to wrap the app and provide auth state
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if a token exists in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('token'); // Remove token on logout
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
