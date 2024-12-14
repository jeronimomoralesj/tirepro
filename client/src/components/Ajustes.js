import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Ajustes.css';

const Ajustes = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        const userId = JSON.parse(atob(token.split('.')[1])).user.id;

        const response = await axios.get(`https://tirepro.onrender.com/api/auth/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { name, email, role } = response.data;
        setUserData({ name, email, role });
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <div className="ajustes-container">Cargando...</div>;
  }

  return (
    <div className="ajustes-container">
      <h2 className="ajustes-title">Ajustes</h2>
      <div className="ajustes-card">
        <p><strong>Nombre:</strong> {userData.name}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Rol:</strong> {userData.role === 'admin' ? 'Administrador' : 'Usuario'}</p>
      </div>
    </div>
  );
};

export default Ajustes;
