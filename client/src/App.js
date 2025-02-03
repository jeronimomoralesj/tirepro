// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Register from './components/Register';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import SidebarLayout from './components/SidebarLayout';
import Estado from './components/Estado';
import Home from './components/Home';
import Flota from './components/Flota';
import Uso from './components/Uso';
import Nueva from './components/Nueva';
import Soporte from './components/Soporte';
import Ajustes from './components/Ajustes';
import NuevaEmpleado from './components/NuevaEmpleado';
import Analista from './components/Analista';
import ProteccionDatos from './components/ProteccionDatos';
import TerminosCondiciones from './components/TerminosCondiciones';
import EliminacionDatos from './components/EliminacionDatos';
import IntentoIMG from './components/IntentoIMG';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />
        <Route
          path="/politica-datos"
          element={
            <PublicRoute>
              <ProteccionDatos />
            </PublicRoute>
          }
        />
        <Route
          path="/intento-img"
          element={
            <PublicRoute>
              <IntentoIMG />
            </PublicRoute>
          }
        />
        <Route
          path="/terminos-condiciones"
          element={
            <PublicRoute>
              <TerminosCondiciones />
            </PublicRoute>
          }
        />
        <Route
          path="/eliminar-datos"
          element={
            <PublicRoute>
              <EliminacionDatos />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

<Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Sidebar Layout for Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <SidebarLayout />
            </ProtectedRoute>
          }
        >
          <Route path="home" element={<Home />} />
          <Route path="flota" element={<Flota />} />
          <Route path="estado" element={<Estado />} />
          <Route path="uso" element={<Uso />} />
          <Route path="nueva" element={<Nueva />} />
          <Route path="soporte" element={<Soporte />} />
          <Route path="ajustes" element={<Ajustes />} />
          <Route path="nuevanormal" element={<NuevaEmpleado />} />
          <Route path="analista" element={<Analista />} />
          {/* Add other nested routes here */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
