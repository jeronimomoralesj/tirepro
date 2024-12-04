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
    proact: '',
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
      [field]: value,
    }));
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

      // Step 1: Fetch existing tires for the user
      const existingTiresResponse = await axios.get(
        `https://tirepro.onrender.com/api/tires/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const existingTires = existingTiresResponse.data;

      // Step 2: Check if there's a conflict with placa and position
      const conflict = existingTires.find((existingTire) => {
        const latestPos = existingTire.pos?.at(-1)?.value; // Get the most recent position value
        return (
          existingTire.placa.toLowerCase() === individualTire.placa.toLowerCase() && // Match placa
          latestPos === Number(individualTire.pos) // Match position
        );
      });

      if (conflict) {
        alert(
          `Conflicto detectado: Ya existe una llanta en la placa '${individualTire.placa}' y posición '${individualTire.pos}'. Por favor, libera esta posición desde 'Agregar Eventos'.`
        );
        return; // Prevent upload
      }

      // Step 3: Prepare the new tire data
      const profundidades = [
        individualTire.profundidad_int,
        individualTire.profundidad_cen,
        individualTire.profundidad_ext,
      ];
      const minProfundidad = Math.min(...profundidades.map((p) => Number(p) || 0));
      const newTire = { ...individualTire, user: userId, proact: minProfundidad };

      // Step 4: Upload the new tire
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
        proact: '',
        eje: '',
        costo: '',
        kms: '',
        dimension: '',
      });
    } catch (error) {
      console.error("Error al cargar la llanta:", error);
      alert("Error al intentar cargar la llanta.");
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
          type="text"
          value={individualTire[key]}
          placeholder={`Ingresar ${key.replace('_', ' ')}`}
          onChange={(e) => handleIndividualTireChange(key, e.target.value)}
          className="input-field"
        />
      ))}
      <button className="upload-button" onClick={handleSingleTireUpload}>
        {loading ? 'Cargando...' : 'Agregar'}
      </button>
    </div>
  );
};

export default CargaIndividual;
