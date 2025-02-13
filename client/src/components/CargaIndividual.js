import React, { useState } from 'react';
import axios from 'axios';
import './Nueva.css';
import './CargaIndividual.css';

const DEFAULT_TIRE_IMAGE = 'https://media.istockphoto.com/id/135170090/photo/four-black-car-tires-stacked-on-top-of-one-another.jpg?s=612x612&w=0&k=20&c=jI2XKopUST-0MvSmj2VKkzihuzg6zbsDS8D-AqAPV0Y=';


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
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isKilometrajeLocked, setIsKilometrajeLocked] = useState(false);
  const [isFrenteLocked, setIsFrenteLocked] = useState(false);
  const [isInventoryMode, setIsInventoryMode] = useState(false);

  const handleIndividualTireChange = async (field, value) => {
    if (isKilometrajeLocked && field === 'kilometraje_actual') return;
    if (isFrenteLocked && field === 'frente') return;

    if (field === 'placa') {
      const placaValue = value.toLowerCase();
      setIndividualTire((prevState) => ({ ...prevState, placa: placaValue }));
      fetchPlacaDetails(placaValue);
    } else {
      setIndividualTire((prevState) => ({
        ...prevState,
        [field]: ['llanta', 'kilometraje_actual', 'pos', 'profundidad_int', 'profundidad_cen', 'profundidad_ext', 'profundidad_inicial', 'presion', 'costo', 'kms'].includes(field)
          ? value.replace(/\D/g, '') // Allow only numbers
          : value.toLowerCase(), // Convert text fields to lowercase
      }));
    }
  };

  const fetchPlacaDetails = async (placa) => {
    if (!placa) {
      setIsKilometrajeLocked(false);
      setIsFrenteLocked(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userId = token ? JSON.parse(atob(token.split('.')[1])).user.id : null;
      const companyId = token ? JSON.parse(atob(token.split('.')[1])).user.companyId : null;

      if (!userId) {
        alert('Usuario no identificado.');
        return;
      }

      const response = await axios.get(
        `https://tirepro.onrender.com/api/tires/user/${companyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const matchingTire = response.data.find((tire) => tire.placa === placa);
      if (matchingTire) {
        setIndividualTire((prevState) => ({
          ...prevState,
          kilometraje_actual: matchingTire.kilometraje_actual?.[0]?.value || '',
          frente: matchingTire.frente || '',
        }));
        setIsKilometrajeLocked(true);
        setIsFrenteLocked(true);
      } else {
        setIsKilometrajeLocked(false);
        setIsFrenteLocked(false);
      }
    } catch (error) {
      console.error('Error fetching tire data for placa:', error);
    }
  };

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

      if (
        ['profundidad_int', 'profundidad_cen', 'profundidad_ext', 'profundidad_inicial'].includes(field) &&
        (value < 0 || value > 30)
      ) {
        alert(`El campo "${field.replace('_', ' ')}" debe estar entre 0 y 30.`);
        return false;
      }
    }

    return true;
  };

  const checkForDuplicatePlacaAndPos = async () => {
    // Skip duplicate check if placa is "inventario"
    if (individualTire.placa === 'inventario') {
      return false; // No duplicates in this case
    }
  
    const token = localStorage.getItem('token');
    const userId = token ? JSON.parse(atob(token.split('.')[1])).user.id : null;
    const companyId = token ? JSON.parse(atob(token.split('.')[1])).user.companyId : null;
  
    if (!userId) {
      alert('Usuario no identificado.');
      return true;
    }
  
    try {
      const response = await axios.get(
        `https://tirepro.onrender.com/api/tires/user/${companyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const duplicates = response.data.find(
        (tire) => tire.placa === individualTire.placa && tire.pos?.[0]?.value === Number(individualTire.pos)
      );
  
      if (duplicates) {
        alert(
          `Ya existe una llanta con la placa ${individualTire.placa} en la posición ${individualTire.pos}.`
        );
        return true;
      }
  
      return false;
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return true;
    }
  };
  

  const uploadImageToS3 = async (file) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        'https://tirepro.onrender.com/api/s3/presigned-url',
        {
          userId: individualTire.llanta || 'default',  // Use llanta as userId or fallback to 'default'
          fileName: file.name,
          uploadType: 'tires',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      await axios.put(data.url, file, {
        headers: { 'Content-Type': file.type },
      });
  
      return data.imageUrl;  // Return the uploaded image URL
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir imagen.');
      return null;
    }
  };
  

  const handleSingleTireUpload = async () => {
    const token = localStorage.getItem('token');
    const userId = token ? JSON.parse(atob(token.split('.')[1])).user.id : null;
    const companyId = token ? JSON.parse(atob(token.split('.')[1])).user.companyId : null;
  
    if (!userId) {
      alert('Usuario no identificado.');
      return;
    }
  
    if (!validateForm()) return;
  
    // Skip duplicate check if in inventory mode
    if (!(await checkForDuplicatePlacaAndPos())) {
      try {
        setLoading(true);
  
        const profundidades = [
          Number(individualTire.profundidad_int) || 0,
          Number(individualTire.profundidad_cen) || 0,
          Number(individualTire.profundidad_ext) || 0,
        ];
        const proact = Math.min(...profundidades);
  
        const currentDate = new Date();
        const normalizeHistoricalValue = (value) => ({
          day: currentDate.getDate(),
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
          value,
        });
  
        const kms = Number(individualTire.kms || 0) === 0 ? 1 : Number(individualTire.kms); // Convert 0 to 1
        const costo = Number(individualTire.costo || 0);
        const profundidadInicial = Number(individualTire.profundidad_inicial || 20);
  
        const cpk = kms > 0 ? costo / kms : 0;
        const cpkProy =
          proact < profundidadInicial
            ? (kms / (profundidadInicial - proact)) * profundidadInicial > 0
              ? costo / ((kms / (profundidadInicial - proact)) * profundidadInicial)
              : 0
            : 0;
  
            const imageUrl = imageFile 
            ? await uploadImageToS3(imageFile) 
            : DEFAULT_TIRE_IMAGE;
          
  
        const newTire = {
          ...individualTire,
          user: userId,
          vida: normalizeHistoricalValue(individualTire.vida || 'nueva'),
          kilometraje_actual: normalizeHistoricalValue(Number(individualTire.kilometraje_actual)),
          pos: normalizeHistoricalValue(Number(individualTire.pos || 1)),
          proact: normalizeHistoricalValue(proact),
          profundidad_int: normalizeHistoricalValue(Number(individualTire.profundidad_int)),
          profundidad_cen: normalizeHistoricalValue(Number(individualTire.profundidad_cen)),
          profundidad_ext: normalizeHistoricalValue(Number(individualTire.profundidad_ext)),
          kms: normalizeHistoricalValue(kms), // Ensure kms is at least 1
          presion: normalizeHistoricalValue(Number(individualTire.presion || 0)),
          cpk: normalizeHistoricalValue(cpk),
          cpk_proy: normalizeHistoricalValue(cpkProy),
          images: imageUrl ? [normalizeHistoricalValue(imageUrl)] : [],
        };
  
        await axios.post(
          'https://tirepro.onrender.com/api/tires',
          newTire,
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        alert('Llanta agregada exitosamente!');
        resetForm();
      } catch (error) {
        console.error('Error al cargar la llanta:', error);
        alert('Error al intentar cargar la llanta.');
      } finally {
        setLoading(false);
      }
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
    });
    setImageFile(null);
    setIsKilometrajeLocked(false);
    setIsFrenteLocked(false);
    setIsInventoryMode(false);
  };

  

  return (
    <div className="section individual-section">
      <h3>Carga Individual</h3>
  
      {/* Toggle between Inventory Mode and Vehicle Mode */}
      <button
        className="upload-button"
        onClick={isInventoryMode ? resetForm : saveToInventory}
        disabled={loading}
      >
        {isInventoryMode ? 'Agregar a Vehículo' : 'Guardar en Inventario'}
      </button>
  
      {/* Input Fields */}
      {Object.keys(individualTire).map((key) => (
        <input
          key={key}
          type={
            [
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
            ].includes(key)
              ? 'number'
              : 'text'
          }
          value={individualTire[key]}
          placeholder={`Ingresar ${key.replace('_', ' ')}`}
          onChange={(e) => handleIndividualTireChange(key, e.target.value)}
          className="input-field"
          disabled={
            isInventoryMode && 
            ['placa', 'pos', 'kilometraje_actual', 'frente', 'tipovhc', 'eje'].includes(key)
              ? true // Disable these fields in inventory mode
              : (isKilometrajeLocked && key === 'kilometraje_actual') ||
                (isFrenteLocked && key === 'frente')
          }
        />
      ))}
  
      {/* Image Upload */}
      <div>
        <label>Subir Imagen</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
        />
      </div>
  
      {/* Add Tire Button */}
      <button
        className="upload-button"
        onClick={handleSingleTireUpload}
        disabled={loading}
      >
        {loading ? 'Cargando...' : 'Agregar'}
      </button>
    </div>
  );
  
};

export default CargaIndividual;
