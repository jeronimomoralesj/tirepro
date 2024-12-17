import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    role: 'regular', // Default to 'regular'
    placa: [], // Placa as an array of strings
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
      const res = await axios.post(
        'https://tirepro.onrender.com/api/auth/register',
        formData
      );
      setMessage(res.data.msg || 'Registration successful!');
    } catch (err) {
      console.error('Error during registration:', err.response?.data || err);
      setMessage(
        err.response?.data?.msg || 'Error registering user. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="company"
          placeholder="Company"
          value={formData.company}
          onChange={handleChange}
          required
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="regular">Regular</option>
          <option value="admin">Admin</option>
        </select>

        {/* Conditionally render placa inputs if role is 'regular' */}
        {formData.role === 'regular' && (
          <div className="placa-inputs">
            <label>Placa:</label>
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
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={handleAddPlaca}>
              Add Placa
            </button>
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {message && <p className="register-message">{message}</p>}
    </div>
  );
};

export default Register;
