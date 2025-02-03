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
    placa: [],
    profileImage: '', // New state for profile image
  });
  const [companyUsers, setCompanyUsers] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
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
  
        // Fetch user data
        const userId = decodedToken.user.id;
        const userResponse = await axios.get(
          `https://tirepro.onrender.com/api/auth/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
  
        const { name, email, role, company, placa, profileImage } = userResponse.data;
  
        // Debug log for profile image
        console.log('Fetched profileImage from backend:', profileImage);
  
        // Validate and fallback to default if needed
        const validProfileImage = profileImage && profileImage.startsWith('http') 
          ? profileImage 
          : 'https://images.pexels.com/photos/12261472/pexels-photo-12261472.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
  
        console.log('Final profileImage being used:', validProfileImage);
  
        // Update user data in state
        setUserData({ name, email, role, company, placa, profileImage: validProfileImage });
  
        // Fetch company users if user is admin
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
  
      // Update the state with the modified user's placas
      setCompanyUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, placa: response.data.placa } : user
        )
      );
  
      // Update current user's data if applicable
      if (userId === decodedToken.user.id) {
        setUserData((prev) => ({
          ...prev,
          placa: response.data.placa,
        }));
      }
    } catch (error) {
      console.error('Error updating placa:', error.message);
      setError('Error updating placa. Please try again.');
    }
  };
  

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a file to upload.');
      return;
    }

    try {
      // Get pre-signed URL for S3
const { data } = await axios.post('https://tirepro.onrender.com/api/s3/presigned-url', {
  userId: decodedToken.user.id,
  fileName: selectedFile.name,
  uploadType: 'profile',  // Make sure this is consistent with the backend logic
});


      // Upload image to S3
      await axios.put(data.url, selectedFile, {
        headers: {
          'Content-Type': selectedFile.type,
        },
      });

      // Update the profile image in the backend
      await axios.put(
        'https://tirepro.onrender.com/api/auth/update-profile-image',
        {
          userId: decodedToken.user.id,
          imageUrl: data.imageUrl || data.publicUrl,  // Ensure the correct URL is passed
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );      
      

      // Update the local state with the new profile image
      setUserData((prev) => ({ ...prev, profileImage: data.imageUrl }));
      setMessage('Profile image updated successfully.');
    } catch (error) {
      console.error('Error uploading profile image:', error);
      setMessage('Failed to upload profile image.');
    }
  };

  if (loading) {
    return <div className="ajustes-container">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="ajustes-container error-container">
        <p>Por seguridad necesitamos que recargues!</p>
        <button 
          className="add-placa-btn" 
          onClick={() => window.location.reload()}
        >
          Recargar Página
        </button>
      </div>
    );
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
        
        <div className="profile-image-section">
          <h4>Imagen de Perfil</h4>
          <img 
            src={userData.profileImage} 
            alt="Profile" 
            className="profile-image" 
            style={{
              height:"150px",
              width:"150px"
            }}
          />
          <input type="file" onChange={handleFileChange} accept="image/*" />
          <button onClick={handleUpload} className="upload-btn">
            Actualizar Imagen de Perfil
          </button>
        </div>

        {message && <p className="upload-message">{message}</p>}

        {/* Display user's placas if they are a regular user */}
        {userData.role === 'regular' && (
          <div className="user-placas">
            <p><strong>Mis Placas:</strong></p>
            <div className="placas-container">
              {userData.placa.map((placa) => (
                <span key={placa} className="placa-tag">
                  {placa}
                </span>
              ))}
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
