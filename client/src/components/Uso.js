import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { FaSearch } from 'react-icons/fa';
import './Uso.css';

const Uso = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tireData, setTireData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage('Usuario no identificado');
        return;
      }

      const decodedToken = jwtDecode(token);
      const userId = decodedToken?.user?.id;

      if (!userId) {
        setErrorMessage('No se encuentra ID de usuario');
        return;
      }

      // Fetch all tire data for the user
      const response = await axios.get(`http://localhost:5001/api/tires/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tires = response.data;

      // Try to find a matching `llanta`
      const foundByLlanta = tires.find((tire) => tire.llanta.toString() === searchTerm);

      if (foundByLlanta) {
        // If a single matching llanta is found, display it
        setTireData([foundByLlanta]);
        setErrorMessage('');
      } else {
        // If no matching llanta, try to find all tires with the same `placa`
        const foundByPlaca = tires.filter((tire) => tire.placa.toLowerCase() === searchTerm.toLowerCase());

        if (foundByPlaca.length > 0) {
          // If matching `placa` is found, display all associated tires
          setTireData(foundByPlaca);
          setErrorMessage('');
        } else {
          // If no results found for either `llanta` or `placa`
          setTireData([]);
          setErrorMessage('No se encontró llanta o placa');
        }
      }
    } catch (error) {
      console.error('Error fetching tire data:', error);
      setErrorMessage('Error fetching data');
    }
  };

  return (
    <div className="uso-container">
      <h2 className="uso-title">Buscar Llanta por ID o Placa</h2>
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Enter Llanta ID or Placa"
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="search-button" onClick={handleSearch}>
          Buscar
        </button>
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {tireData.length > 0 && (
        <div className="results-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>Llanta</th>
                <th>Marca</th>
                <th>Pos</th>
                <th>Placa</th>
              </tr>
            </thead>
            <tbody>
              {tireData.map((tire, index) => (
                <tr key={index}>
                  <td>{tire.llanta}</td>
                  <td>{tire.marca}</td>
                  <td>{tire.pos}</td>
                  <td>{tire.placa}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Tire History Maps */}
          <div className="history-maps-container">
            {tireData.map((tire, index) => (
              <div className="history-map" key={index}>
                <h3 className="history-title">Historial de la Llanta - {tire.llanta}</h3>
                <div className="road-map">
                  <div className="step">
                    <div className="checkpoint pinchada"></div>
                    <span className="step-label">Pinchada</span>
                  </div>
                  <div className="step">
                    <div className="checkpoint reencauchada"></div>
                    <span className="step-label">Reencauchada</span>
                  </div>
                  <div className="step">
                    <div className="checkpoint cambio-posicion"></div>
                    <span className="step-label">Cambio de Posición</span>
                  </div>
                  <div className="step">
                    <div className="checkpoint fin-vida"></div>
                    <span className="step-label">Fin de Vida</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Uso;
