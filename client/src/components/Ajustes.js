import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Ajustes.css';

const Ajustes = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: '',
  });
  const [companyUsers, setCompanyUsers] = useState([]); // State to store all users with the same companyId
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State to handle errors

  const token = localStorage.getItem('token'); // Get the JWT token
  const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null; // Decode the JWT token
  const companyId = decodedToken?.user?.companyId; // Extract companyId from the token

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          throw new Error('No token found');
        }

        // Fetch logged-in user's data
        const userId = decodedToken.user.id;
        const userResponse = await axios.get(
          `https://tirepro.onrender.com/api/auth/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const { name, email, role } = userResponse.data;
        setUserData({ name, email, role });

        // Fetch all users and filter by companyId, only if the logged-in user is an admin
        if (role === 'admin') {
          const allUsersResponse = await axios.get(
            'https://tirepro.onrender.com/api/auth/users',
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const usersWithSameCompany = allUsersResponse.data.filter(
            (user) => user.companyId === companyId // Match the companyId
          );

          setCompanyUsers(usersWithSameCompany); // Update state with all matching users
        }
      } catch (error) {
        console.error('Error fetching data:', error.message);
        setError('Error loading data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId, token]);

  if (loading) {
    return <div className="ajustes-container">Cargando...</div>;
  }

  if (error) {
    return <div className="ajustes-container">{error}</div>;
  }

  return (
    <div className="ajustes-container">
      <h2 className="ajustes-title">Ajustes</h2>
      <div className="ajustes-card">
        <p>
          <strong>Nombre:</strong> {userData.name}
        </p>
        <p>
          <strong>Email:</strong> {userData.email}
        </p>
        <p>
          <strong>Rol:</strong> {userData.role === 'admin' ? 'Administrador' : 'Usuario'}
        </p>
      </div>

      {/* Display All Users in the Company for Admin Users */}
      {userData.role === 'admin' && companyUsers.length > 0 && (
        <div className="company-users-section">
          <h3 className="company-users-title">Usuarios de la Empresa</h3>
          <div className="scrollable-table-container">
            <table className="company-users-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Placas</th>
                </tr>
              </thead>
              <tbody>
                {companyUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role === 'admin' ? 'Administrador' : 'Usuario'}</td>
                    <td>{user.placa ? user.placa.join(', ') : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Users Message for Admins */}
      {userData.role === 'admin' && companyUsers.length === 0 && (
        <p className="no-users-message">No hay usuarios asociados a esta empresa.</p>
      )}
    </div>
  );
};

export default Ajustes;
