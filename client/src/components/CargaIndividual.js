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
    profundidad_inicial: '',
    presion: '',
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
      [field]: ['llanta', 'kilometraje_actual', 'pos', 'profundidad_int', 'profundidad_cen', 'profundidad_ext', 'profundidad_inicial', 'presion', 'costo', 'kms'].includes(field)
        ? value.replace(/\D/g, '') // Only allow numbers
        : value.toLowerCase(), // Convert text fields to lowercase
    }));
  };

  // Validate the form before submission
  const validateForm = () => {
    const numericFields = [
      'llanta',
      'kilometraje_actual',
      'pos',
      'profundidad_int',
      'profundidad_cen',
      'profundidad_ext',
      'profundidad_inicial',
      'presion',
      'costo',
      'kms',
    ];
    for (const field of numericFields) {
      const value = individualTire[field];
      if (!value || isNaN(Number(value))) {
        alert(`El campo "${field.replace('_', ' ')}" debe ser un número válido.`);
        return false;
      }
    }
    return true;
  };

  // Upload individual tire
  const handleSingleTireUpload = async () => {
    const token = localStorage.getItem('token');
    const userId = token ? JSON.parse(atob(token.split('.')[1])).user.id : null;

    if (!userId) {
      alert('Usuario no identificado.');
      return;
    }

    // Validate the form
    if (!validateForm()) {
      return; // Stop submission if validation fails
    }

    try {
      setLoading(true);

      // Fetch existing tires to check for conflicts
      const existingTiresResponse = await axios.get(
        `https://tirepro.onrender.com/api/tires/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const existingTires = existingTiresResponse.data;

      // Check for duplicate llanta ID
      const duplicateLlanta = existingTires.some(
        (existingTire) => existingTire.llanta === individualTire.llanta
      );
      if (duplicateLlanta) {
        alert(`Ya existe una llanta con el ID: ${individualTire.llanta}`);
        setLoading(false);
        return;
      }

      // Check for duplicate placa and position
      const duplicatePos = existingTires.some((existingTire) => {
        const latestPos = existingTire.pos?.[existingTire.pos.length - 1]?.value || null;
        return (
          existingTire.placa === individualTire.placa.toLowerCase() &&
          latestPos === Number(individualTire.pos)
        );
      });
      if (duplicatePos) {
        alert(
          `Conflicto detectado: Ya existe una llanta en la placa '${individualTire.placa}' y posición '${individualTire.pos}'.`
        );
        setLoading(false);
        return;
      }

      // Automatically calculate `proact` as the smallest value of the three profundidades
      const profundidades = [
        Number(individualTire.profundidad_int) || 0,
        Number(individualTire.profundidad_cen) || 0,
        Number(individualTire.profundidad_ext) || 0,
      ];
      const proact = Math.min(...profundidades);

      // Calculate projected KMS
      const profundidadInicial = Number(individualTire.profundidad_inicial) || 20;
      const kms = Number(individualTire.kms) || 0;
      const projectedKms =
        proact < profundidadInicial
          ? (kms / (profundidadInicial - proact)) * profundidadInicial
          : 0;

      // Calculate CPK and Projected CPK
      const costo = Number(individualTire.costo) || 0;
      const cpk = kms > 0 ? costo / kms : 0; // Ensure stored as number
      const cpkProy = projectedKms > 0 ? costo / projectedKms : 0; // Ensure stored as number

      // Prepare the new tire data
      const newTire = {
        ...individualTire,
        user: userId,
        vida: {
          day: new Date().getDate(),
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          value: individualTire.vida || 'nuevo',
        },
        kilometraje_actual: {
          day: new Date().getDate(),
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          value: Number(individualTire.kilometraje_actual) || 0,
        },
        pos: {
          day: new Date().getDate(),
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          value: Number(individualTire.pos) || 0,
        },
        profundidad_int: {
          day: new Date().getDate(),
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          value: Number(individualTire.profundidad_int) || 0,
        },
        profundidad_cen: {
          day: new Date().getDate(),
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          value: Number(individualTire.profundidad_cen) || 0,
        },
        profundidad_ext: {
          day: new Date().getDate(),
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          value: Number(individualTire.profundidad_ext) || 0,
        },
        profundidad_inicial: profundidadInicial,
        presion: {
          day: new Date().getDate(),
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          value: Number(individualTire.presion) || 0,
        },
        kms: {
          day: new Date().getDate(),
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          value: kms,
        },
        cpk: {
          day: new Date().getDate(),
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          value: cpk,
        },
        cpk_proy: {
          day: new Date().getDate(),
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          value: cpkProy,
        },
        proact,
        ultima_inspeccion: new Date(),
        costo, // Ensure `costo` is a number
      };

      // Make the POST request
      await axios.post(
        'https://tirepro.onrender.com/api/tires',
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
        profundidad_inicial: '',
        presion: '',
        eje: '',
        costo: '',
        kms: '',
        dimension: '',
      });
    } catch (error) {
      console.error('Error al cargar la llanta:', error);
      const errorMessage = error.response?.data?.msg || 'Error al intentar cargar la llanta.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section individual-section">
      <h3>Carga Individual</h3>
      {Object.keys(individualTire).map((key) => (
        <input
          key={key}
          type={
            ['llanta', 'kilometraje_actual', 'pos', 'profundidad_int', 'profundidad_cen', 'profundidad_ext', 'profundidad_inicial', 'presion', 'costo', 'kms'].includes(key)
              ? 'number' // Use number input type for numeric fields
              : 'text' // Use text input type for other fields
          }
          value={individualTire[key]}
          placeholder={`Ingresar ${key.replace('_', ' ')}`}
          onChange={(e) => handleIndividualTireChange(key, e.target.value)}
          className="input-field"
        />
      ))}
      <button className="upload-button" onClick={handleSingleTireUpload} disabled={loading}>
        {loading ? 'Cargando...' : 'Agregar'}
      </button>
    </div>
  );
};

export default CargaIndividual;
