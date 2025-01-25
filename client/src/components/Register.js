import React, { useState } from 'react';
import axios from 'axios';
import "./register.css"

const Register = ({ companyId, token, companyName, onUserCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'regular',
    placa: [],
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePlacaChange = (index, value) => {
    const updatedPlacas = [...formData.placa];
    updatedPlacas[index] = value;
    setFormData({ ...formData, placa: updatedPlacas });
  };

  const handleAddPlaca = () => {
    setFormData({ ...formData, placa: [...formData.placa, ''] });
  };

  const handleRemovePlaca = (index) => {
    const updatedPlacas = formData.placa.filter((_, i) => i !== index);
    setFormData({ ...formData, placa: updatedPlacas });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Include companyId and company name in the request
      const requestData = {
        ...formData,
        companyId,
        company: companyName,
      };

      const res = await axios.post(
        'https://tirepro.onrender.com/api/auth/register',
        requestData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      setMessage(res.data.msg || 'Usuario registrado con éxito');
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'regular',
        placa: [],
      });

      // Call the callback function if provided
      if (onUserCreated) {
        onUserCreated();
      }
    } catch (err) {
      console.error('Error registering user:', err.response?.data || err);
      setMessage(
        err.response?.data?.msg || 'Error registrando al usuario. Por favor intente nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label htmlFor="name">Nombre:</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Nombre"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Rol:</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="regular">Usuario Regular</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div className="form-group">
          <label>Empresa:</label>
          <input
            type="text"
            value={companyName}
            disabled
            className="disabled-input"
          />
        </div>

        {formData.role === 'regular' && (
          <div className="placa-inputs">
            <label>Placas:</label>
            {formData.placa.map((value, index) => (
              <div key={index} className="placa-field">
                <input
                  type="text"
                  placeholder={`Placa ${index + 1}`}
                  value={value}
                  onChange={(e) => handlePlacaChange(index, e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemovePlaca(index)}
                  className="remove-placa-btn"
                >
                  &times;
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddPlaca}
              className="add-placa-btn"
            >
              Agregar Placa
            </button>
          </div>
        )}

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Registrando...' : 'Registrar Usuario'}
        </button>
      </form>
      {message && <p className="register-message">{message}</p>}
    </div>
  );
};

export default Register;