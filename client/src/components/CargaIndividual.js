import React, { useState } from 'react';
import axios from 'axios';
import './Nueva.css';

const CargaIndividual = () => {
  const [individualTire, setIndividualTire] = useState({
    llanta: '',
    vida: '',
    placa: '',
    kilometraje_actual: '',
    frente: '',
    marca: '',
    diseno: '',
    banda: '',
    tipovhc: '',
    pos: '',
    profundidad_int: '',
    profundidad_cen: '',
    profundidad_ext: '',
    eje: '',
    costo: '',
    kms: '',
    dimension: '',
  });
  const [loading, setLoading] = useState(false);

  // Handle individual tire input change
  const handleIndividualTireChange = (field, value) => {
    setIndividualTire((prevState) => ({
      ...prevState,
      [field]: field === 'llanta' || 
               field === 'kilometraje_actual' || 
               field === 'pos' || 
               field === 'profundidad_int' || 
               field === 'profundidad_cen' || 
               field === 'profundidad_ext' || 
               field === 'costo' || 
               field === 'kms'
        ? value.replace(/\D/g, '') // Only allow numbers
        : value.toLowerCase(), // Convert text fields to lowercase
    }));
  };

  // Transform value to historical format (no array wrapping)
  const transformToHistoricalValue = (value) => {
    const currentDate = new Date();
    return {
      day: currentDate.getDate(),
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
      value: typeof value === 'string' ? value.trim() : value || 0,
    };
  };

  // Upload individual tire
  const handleSingleTireUpload = async () => {
    const token = localStorage.getItem('token');
    const userId = token ? JSON.parse(atob(token.split('.')[1])).user.id : null;

    if (!userId) {
      alert("Usuario no identificado.");
      return;
    }

    try {
      setLoading(true);

      // Automatically calculate `proact` as the smallest value of the three profundidades
      const profundidades = [
        Number(individualTire.profundidad_int) || 0,
        Number(individualTire.profundidad_cen) || 0,
        Number(individualTire.profundidad_ext) || 0,
      ];
      const proact = Math.min(...profundidades);

      // Prepare the new tire data with historical formatting
      const newTire = {
        ...individualTire,
        user: userId,
        vida: transformToHistoricalValue(individualTire.vida || 'nuevo'),
        kilometraje_actual: transformToHistoricalValue(individualTire.kilometraje_actual),
        pos: transformToHistoricalValue(individualTire.pos),
        profundidad_int: transformToHistoricalValue(individualTire.profundidad_int),
        profundidad_cen: transformToHistoricalValue(individualTire.profundidad_cen),
        profundidad_ext: transformToHistoricalValue(individualTire.profundidad_ext),
        kms: transformToHistoricalValue(individualTire.kms),
        proact: transformToHistoricalValue(proact), // Add calculated `proact`
        ultima_inspeccion: new Date(),
      };

      // Make the POST request
      const response = await axios.post(
        'http://localhost:5001/api/tires',
        newTire,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Llanta agregada exitosamente!');
      setIndividualTire({
        llanta: '',
        vida: '',
        placa: '',
        kilometraje_actual: '',
        frente: '',
        marca: '',
        diseno: '',
        banda: '',
        tipovhc: '',
        pos: '',
        profundidad_int: '',
        profundidad_cen: '',
        profundidad_ext: '',
        eje: '',
        costo: '',
        kms: '',
        dimension: '',
      });
    } catch (error) {
      console.error("Error al cargar la llanta:", error);
      const errorMessage = error.response?.data?.msg || "Error al intentar cargar la llanta.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section individual-section">
      <h3>Carga Individual</h3>
      {Object.keys(individualTire).map((key) => {
        if (key === 'proact') return null; // Skip proact as it's automatically calculated
        return (
          <input
            key={key}
            type={key === 'llanta' || 
                  key === 'kilometraje_actual' || 
                  key === 'pos' || 
                  key === 'profundidad_int' || 
                  key === 'profundidad_cen' || 
                  key === 'profundidad_ext' || 
                  key === 'costo' || 
                  key === 'kms' 
                  ? 'number' 
                  : 'text'} // Set input type
            value={individualTire[key]}
            placeholder={`Ingresar ${key.replace('_', ' ')}`}
            onChange={(e) => handleIndividualTireChange(key, e.target.value)}
            className="input-field"
          />
        );
      })}
      <button className="upload-button" onClick={handleSingleTireUpload} disabled={loading}>
        {loading ? 'Cargando...' : 'Agregar'}
      </button>
    </div>
  );
};

export default CargaIndividual;
