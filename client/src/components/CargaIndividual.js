import React, { useState } from 'react';
import axios from 'axios';
import './Nueva.css';
import './CargaIndividual.css';

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
    peso_carga: '',
    opeacion:'',
  });
  const [loading, setLoading] = useState(false);
  const [isInventoryMode, setIsInventoryMode] = useState(false);
  const [isKilometrajeLocked, setIsKilometrajeLocked] = useState(false);

  // Handle individual tire input change
  const handleIndividualTireChange = async (field, value) => {
    if (isInventoryMode && ['placa', 'pos', 'eje', 'kilometraje_actual', 'frente', 'tipovhc'].includes(field)) {
      return; // Prevent editing when in inventory mode
    }

    if (field === 'placa') {
      const placaValue = value.toLowerCase();
      setIndividualTire((prevState) => ({
        ...prevState,
        placa: placaValue,
      }));
      fetchPlacaKilometraje(placaValue);
    } else {
      setIndividualTire((prevState) => ({
        ...prevState,
        [field]: ['llanta', 'kilometraje_actual', 'pos', 'profundidad_int', 'profundidad_cen', 'profundidad_ext', 'profundidad_inicial', 'presion', 'costo', 'kms'].includes(field)
          ? value.replace(/\D/g, '') // Only allow numbers
          : value.toLowerCase(), // Convert text fields to lowercase
      }));
    }
  };

  // Fetch existing tire data with the same `placa`
  const fetchPlacaKilometraje = async (placa) => {
    if (!placa) {
      setIsKilometrajeLocked(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userId = token ? JSON.parse(atob(token.split('.')[1])).user.id : null;

      if (!userId) {
        alert('Usuario no identificado.');
        return;
      }

      const response = await axios.get(
        `https://tirepro.onrender.com/api/tires/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const matchingTire = response.data.find((tire) => tire.placa === placa);
      if (matchingTire) {
        setIndividualTire((prevState) => ({
          ...prevState,
          kilometraje_actual: matchingTire.kilometraje_actual?.[0]?.value || '',
        }));
        setIsKilometrajeLocked(true);
      } else {
        setIsKilometrajeLocked(false);
      }
    } catch (error) {
      console.error('Error fetching tire data for placa:', error);
    }
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
      const value = Number(individualTire[field]);
      if (isNaN(value) || value < 0) {
        alert(`El campo "${field.replace('_', ' ')}" debe ser un número válido mayor o igual a 0.`);
        return false;
      }

      // Validate profundidades to be within 0 and 30
      if (
        ['profundidad_int', 'profundidad_cen', 'profundidad_ext', 'profundidad_inicial'].includes(
          field
        ) &&
        (value < 0 || value > 30)
      ) {
        alert(`El campo "${field.replace('_', ' ')}" debe estar entre 0 y 30.`);
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
      const cpk = kms >= 0 ? costo / kms : 0; // Ensure stored as number
      const cpkProy = projectedKms > 0 ? costo / projectedKms : 0; // Ensure stored as number

      // Prepare the new tire data
      const newTire = {
        ...individualTire,
        kilometraje_actual: Number(individualTire.kilometraje_actual),
        kms,
        user: userId,
        proact,
        cpk,
        cpkProy,
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
      resetForm();
    } catch (error) {
      console.error('Error al cargar la llanta:', error);
      const errorMessage = error.response?.data?.msg || 'Error al intentar cargar la llanta.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const saveToInventory = () => {
    setIndividualTire((prev) => ({
      ...prev,
      placa: 'inventario',
      pos: '1',
      kilometraje_actual: 1,
      frente: '1',
      tipovhc: '1',
      eje: '1',
    }));
    setIsInventoryMode(true);
  };

  const resetForm = () => {
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
      operacion: '',
      peso_carga: '',
    });
    setIsInventoryMode(false);
    setIsKilometrajeLocked(false);
  };

  return (
    <div className="section individual-section">
      <h3>Carga Individual</h3>
      <button
        className="upload-button"
        onClick={isInventoryMode ? resetForm : saveToInventory}
        disabled={loading}
      >
        {isInventoryMode ? 'Agregar a Vehículo' : 'Guardar en Inventario'}
      </button>
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
          disabled={
            (isInventoryMode &&
              ['placa', 'pos', 'eje', 'kilometraje_actual', 'frente', 'tipovhc'].includes(key)) ||
            (isKilometrajeLocked && key === 'kilometraje_actual')
          } // Disable fields in inventory mode or locked mode
        />
      ))}
      <button className="upload-button" onClick={handleSingleTireUpload} disabled={loading}>
        {loading ? 'Cargando...' : 'Agregar'}
      </button>
    </div>
  );
};

export default CargaIndividual;
