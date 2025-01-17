import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Register from './Register';
import './Ajustes.css';

const MAX_USERS = 10;

const Ajustes = () => {
  const [userData, setUserData] = useState({ 
    name: '', 
    email: '', 
    role: '',
    company: '',
    placa: [] 
  });
  const [companyUsers, setCompanyUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const companyId = decodedToken?.user?.companyId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          throw new Error('No token found');
        }

        const userId = decodedToken.user.id;

        const userResponse = await axios.get(
          `https://tirepro.onrender.com/api/auth/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const { name, email, role, company, placa } = userResponse.data;
        setUserData({ name, email, role, company, placa });

        if (role === 'admin') {
          const allUsersResponse = await axios.get(
            'https://tirepro.onrender.com/api/auth/users',
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const usersWithSameCompany = allUsersResponse.data.filter(
            (user) => user.companyId === companyId
          );

          setCompanyUsers(usersWithSameCompany);
        }
      } catch (error) {
        console.error('Error fetching data:', error.message);
        setError('Error loading data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId, token, decodedToken]);

  const handlePlacaChange = async (userId, newPlacas) => {
    try {
      const response = await axios.put(
        'https://tirepro.onrender.com/api/auth/update-placa',
        {
          userId,
          placa: newPlacas,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCompanyUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, placa: response.data.placa } : user
        )
      );

      if (userId === decodedToken.user.id) {
        setUserData(prev => ({
          ...prev,
          placa: response.data.placa
        }));
      }
    } catch (error) {
      console.error('Error updating placa:', error.message);
      setError('Error updating placa. Please try again.');
    }
  };

  const handleAddPlaca = (userId) => {
    const newPlaca = prompt('Enter the new placa:');
    if (newPlaca) {
      const user = companyUsers.find((u) => u._id === userId);
      const updatedPlacas = [...(user.placa || []), newPlaca];
      handlePlacaChange(userId, updatedPlacas);
    }
  };

  const handleDeletePlaca = (userId, placaToDelete) => {
    const user = companyUsers.find((u) => u._id === userId);
    const updatedPlacas = (user.placa || []).filter(
      (placa) => placa !== placaToDelete
    );
    handlePlacaChange(userId, updatedPlacas);
  };

  const handleUserCreated = async () => {
    try {
      const allUsersResponse = await axios.get(
        'https://tirepro.onrender.com/api/auth/users',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const usersWithSameCompany = allUsersResponse.data.filter(
        (user) => user.companyId === companyId
      );

      setCompanyUsers(usersWithSameCompany);
    } catch (error) {
      console.error('Error refreshing users list:', error.message);
    }
  };

  if (loading) {
    return <div className="ajustes-container">Cargando...</div>;
  }

  if (error) {
    return <div className="ajustes-container">{error}</div>;
  }

  return (
    <div className="ajustes-container">
      <h2 className="ajustes-title">Ajustes</h2>
      
      {/* User Information Card */}
      <div className="ajustes-card">
        <h3 className="card-section-title">Información del Usuario</h3>
        <p><strong>Nombre:</strong> {userData.name}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Empresa:</strong> {userData.company}</p>
        <p><strong>Rol:</strong> {userData.role === 'admin' ? 'Administrador' : 'Usuario'}</p>
        
        {/* Display user's placas if they are a regular user */}
        {userData.role === 'regular' && (
          <div className="user-placas">
            <p><strong>Mis Placas:</strong></p>
            <div className="placas-container">
              {userData.placa.map((placa) => (
                <span key={placa} className="placa-tag">
                  {placa}
                  <button
                    className="delete-placa-btn"
                    onClick={() => handleDeletePlaca(decodedToken.user.id, placa)}
                  >
                    &times;
                  </button>
                </span>
              ))}
              <button
                className="add-placa-btn"
                onClick={() => handleAddPlaca(decodedToken.user.id)}
              >
                Agregar Placa
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Company Users Section (Admin Only) */}
      {userData.role === 'admin' && (
        <div className="company-users-section">
          <h3 className="section-title">
            Usuarios de la Empresa
            <span className="user-count">
              ({companyUsers.length}/{MAX_USERS} usuarios)
            </span>
          </h3>
          
          {companyUsers.length > 0 ? (
            <div className="scrollable-table-container">
              <table className="company-users-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Placas</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {companyUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role === 'admin' ? 'Administrador' : 'Usuario'}</td>
                      <td>
                        <div className="placas-cell">
                          {(user.placa || []).map((placa) => (
                            <span key={placa} className="placa-tag">
                              {placa}
                              <button
                                className="delete-placa-btn"
                                onClick={() => handleDeletePlaca(user._id, placa)}
                                title="Eliminar placa"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <button
                          className="add-placa-btn"
                          onClick={() => handleAddPlaca(user._id)}
                        >
                          Agregar Placa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-users-message">No hay usuarios asociados a esta empresa.</p>
          )}

          {/* Registration Section (Admin Only) */}
          {companyUsers.length < MAX_USERS ? (
            <div className="register-section">
              <h3 className="section-title">Registrar Nuevo Usuario</h3>
              <Register 
                companyId={companyId} 
                token={token} 
                companyName={userData.company}
                onUserCreated={handleUserCreated}
              />
            </div>
          ) : (
            <div className="user-limit-warning">
              <p>Has alcanzado el límite máximo de {MAX_USERS} usuarios.</p>
              <p>Para agregar más usuarios, contacta con el administrador del sistema.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Ajustes;