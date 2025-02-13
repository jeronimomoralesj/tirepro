import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CambiarPosicion.css';

// Predefined vehicle structures
const VEHICLE_STRUCTURES = {
  'CABEZOTE': {
    axes: 2,
    axleConfig: [
      { axle: 1, left: 1, right: 1 }, // First axle: 2 tires (positions 1-2)
      { axle: 2, left: 2, right: 2 }  // Second axle: 4 tires (positions 3-6)
    ],
    totalTires: 6,
    startPosition: 1 // Cabezote starts at position 1
  },
  'TRAILER': {
    axes: 3,
    axleConfig: [
      { axle: 1, left: 2, right: 2 }, // First axle: 4 tires (positions 7-10)
      { axle: 2, left: 2, right: 2 }, // Second axle: 4 tires (positions 11-14)
      { axle: 3, left: 2, right: 2 }  // Third axle: 4 tires (positions 15-18)
    ],
    totalTires: 12,
    startPosition: 7 // Trailer starts at position 7
  },
  'DEFAULT': {
    axes: 2,
    axleConfig: [
      { axle: 1, left: 1, right: 1 },
      { axle: 2, left: 2, right: 2 }
    ],
    totalTires: 6,
    startPosition: 1
  }
};

const CambiarPosicion = () => {
  const [placas, setPlacas] = useState(['']);
  const [tires, setTires] = useState([]);
  const [swappedTires, setSwappedTires] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredTire, setHoveredTire] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [changes, setChanges] = useState([]);
  const [vehicleConfigs, setVehicleConfigs] = useState({});
  
  const token = localStorage.getItem('token');
  const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const companyId = decodedToken?.user?.companyId;

  const handleAddPlaca = () => setPlacas([...placas, '']);

  const handlePlacaChange = (index, value) => {
    const updatedPlacas = [...placas];
    updatedPlacas[index] = value;
    setPlacas(updatedPlacas);
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://tirepro.onrender.com/api/tires/user/${companyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const fetchedTires = response.data.filter((tire) =>
        placas.some((placa) => tire.placa.toLowerCase() === placa.toLowerCase())
      );

      const newConfigs = {};
      fetchedTires.forEach(tire => {
        if (!newConfigs[tire.placa]) {
          newConfigs[tire.placa] = {};
        }
        if (!newConfigs[tire.placa][tire.tipovhc]) {
          newConfigs[tire.placa][tire.tipovhc] = VEHICLE_STRUCTURES[tire.tipovhc.toUpperCase()] || VEHICLE_STRUCTURES.DEFAULT;
        }
      });

      setVehicleConfigs(newConfigs);
      setTires(fetchedTires);
      setSwappedTires([]);
      setChanges([]);
    } catch (error) {
      console.error('Error fetching tires:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTirePosition = (tipovhc, axleNumber, side, index) => {
    const structure = VEHICLE_STRUCTURES[tipovhc.toUpperCase()];
    if (!structure) return null;

    const axleStartPosition = structure.startPosition + 
      structure.axleConfig
        .slice(0, axleNumber - 1)
        .reduce((acc, curr) => acc + (curr.left + curr.right), 0);

    return side === 'left' ? 
      axleStartPosition + index :
      axleStartPosition + structure.axleConfig[axleNumber - 1].left + index;
  };

  const handleDragStart = (e, tire) => {
    setIsDragging(true);
    e.dataTransfer.setData('tireId', tire._id);
    e.dataTransfer.setData('tipovhc', tire.tipovhc);
    e.dataTransfer.setData('placa', tire.placa);
    e.dataTransfer.setData('sourcePosition', tire.pos?.at(-1)?.value || 'inventory');
  };

  const handleDragEnd = () => setIsDragging(false);

  const handleDrop = (e, newPos, tipovhc, targetPlaca) => {
    e.preventDefault();
    const tireId = e.dataTransfer.getData('tireId');
    const draggedTireType = e.dataTransfer.getData('tipovhc');
    const sourcePlaca = e.dataTransfer.getData('placa');
    const sourcePosition = e.dataTransfer.getData('sourcePosition');

    if (draggedTireType.toUpperCase() !== tipovhc.toUpperCase()) {
      alert('Las llantas solo pueden moverse dentro del mismo tipo de vehículo.');
      return;
    }

    const draggedTire = [...tires, ...swappedTires].find(t => t._id === tireId);
    if (!draggedTire) return;

    const existingTire = tires.find(
      t => t.pos?.at(-1)?.value === newPos && 
          t.tipovhc.toUpperCase() === tipovhc.toUpperCase() && 
          t.placa === targetPlaca
    );

    setTires(prevTires => {
      const newTires = prevTires.filter(t => 
        t._id !== draggedTire._id && 
        (existingTire ? t._id !== existingTire._id : true)
      );
      return [...newTires, { 
        ...draggedTire, 
        pos: [{ value: newPos }],
        placa: targetPlaca
      }];
    });

    if (existingTire) {
      setSwappedTires(prev => [...prev, { ...existingTire, pos: [{ value: null }] }]);
    } else {
      setSwappedTires(prev => prev.filter(t => t._id !== draggedTire._id));
    }

    setChanges(prev => [...prev, {
      tireId: draggedTire._id,
      from: sourcePosition,
      to: newPos,
      fromPlaca: sourcePlaca,
      toPlaca: targetPlaca
    }]);
  };

  const handleInventoryDrop = (e) => {
    e.preventDefault();
    const tireId = e.dataTransfer.getData('tireId');
    const sourcePosition = e.dataTransfer.getData('sourcePosition');
    const sourcePlaca = e.dataTransfer.getData('placa');

    const draggedTire = tires.find(t => t._id === tireId);
    if (!draggedTire) return;

    setTires(prev => prev.filter(t => t._id !== tireId));
    setSwappedTires(prev => [...prev, { ...draggedTire, pos: [{ value: null }] }]);
    setChanges(prev => [...prev, {
      tireId: draggedTire._id,
      from: sourcePosition,
      to: 'inventory',
      fromPlaca: sourcePlaca,
      toPlaca: null
    }]);
  };

  const saveChanges = async () => {
    try {
      const updatedPositions = tires.map((tire) => ({
        tireId: tire._id,
        position: tire.pos?.at(-1)?.value || 1, // Set to 1 if missing
        placa: tire.placa || 'inventario', // Move to inventory if no placa
      }));
  
      // Ensure swapped tires are correctly moved to inventory
      const inventoryPositions = swappedTires.map((tire) => ({
        tireId: tire._id,
        position: 1, // Always 1 in inventory
        placa: 'inventario',
      }));
  
      const finalPositions = [...updatedPositions, ...inventoryPositions];
  
      await axios.put(
        'https://tirepro.onrender.com/api/tires/update-positions',
        { positions: finalPositions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      window.alert('Éxito', 'Las posiciones de las llantas han sido actualizadas.');
      setChanges([]);
    } catch (error) {
      console.error('Error saving tire positions:', error);
      window.alert('Error', 'No se pudieron guardar los cambios.');
    }
  };
  
  

  const renderAxle = (axleConfig, tiresForTipovhc, tipovhc, axleNumber, placa) => {
    return (
      <div key={axleNumber} className="axis">
        <div className="tire-group">
          <div className="side left-side">
            {Array(axleConfig.left).fill(null).map((_, i) => {
              const position = calculateTirePosition(tipovhc, axleNumber, 'left', i);
              const tire = tiresForTipovhc.find(t => t.pos?.at(-1)?.value === position);
              return (
                <div
                  key={`left-${i}`}
                  className={`tire-icon ${!tire ? 'placeholder' : ''} ${isDragging ? 'droppable' : ''}`}
                  draggable={!!tire}
                  onDragStart={(e) => tire && handleDragStart(e, tire)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, position, tipovhc, placa)}
                  onMouseEnter={() => setHoveredTire(tire || null)}
                  onMouseLeave={() => setHoveredTire(null)}
                >
                  {tire ? '🛞' : '○'}
                  <span className="position-indicator">{position}</span>
                </div>
              );
            })}
          </div>

          <div className="middle-frame">
            <div className="axis-line" />
          </div>

          <div className="side right-side">
            {Array(axleConfig.right).fill(null).map((_, i) => {
              const position = calculateTirePosition(tipovhc, axleNumber, 'right', i);
              const tire = tiresForTipovhc.find(t => t.pos?.at(-1)?.value === position);
              return (
                <div
                  key={`right-${i}`}
                  className={`tire-icon ${!tire ? 'placeholder' : ''} ${isDragging ? 'droppable' : ''}`}
                  draggable={!!tire}
                  onDragStart={(e) => tire && handleDragStart(e, tire)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, position, tipovhc, placa)}
                  onMouseEnter={() => setHoveredTire(tire || null)}
                  onMouseLeave={() => setHoveredTire(null)}
                >
                  {tire ? '🛞' : '○'}
                  <span className="position-indicator">{position}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderVehicleType = (placa, tipovhc) => {
    const structure = VEHICLE_STRUCTURES[tipovhc.toUpperCase()] || VEHICLE_STRUCTURES.DEFAULT;
    const tiresForType = tires.filter(t => 
      t.placa === placa && 
      t.tipovhc.toUpperCase() === tipovhc.toUpperCase()
    );

    return (
      <div key={`${placa}-${tipovhc}`} className="vehicle-type">
        <h4>{tipovhc}</h4>
        <div className="axles-container">
          {structure.axleConfig.map((axleConfig, index) => 
            renderAxle(axleConfig, tiresForType, tipovhc, index + 1, placa)
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <h2 className="title">Cambiar Posición de Llantas</h2>
      <div className="buttons-container">
        <button onClick={handleAddPlaca} className="add-placa-button">
          Agregar otra placa
        </button>
        <button onClick={handleSearch} className="search-button" disabled={isLoading}>
          {isLoading ? 'Buscando...' : 'Buscar'}
        </button>
        {changes.length > 0 && (
          <button onClick={saveChanges} className="save-button">
            Guardar Cambios
          </button>
        )}
      </div>

      <div className="placas-row">
        {placas.map((placa, index) => (
          <div key={index} className="placa-column">
            <h4>Placa: {placa}</h4>
            <input
              type="text"
              placeholder={`Placa ${index + 1}`}
              value={placa}
              onChange={(e) => handlePlacaChange(index, e.target.value)}
              className="placa-input"
            />
            <div className="vehicles-container">
              {Object.keys(vehicleConfigs[placa] || {}).map(tipovhc => 
                renderVehicleType(placa, tipovhc)
              )}
            </div>
          </div>
        ))}
      </div>

      <div 
        className="swapped-tires-container"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleInventoryDrop}
      >
        <h4>Inventario</h4>
        <div className="swapped-tires">
          {swappedTires.map((tire, index) => (
            <div
              key={index}
              className="tire-icon swapped"
              draggable
              onDragStart={(e) => handleDragStart(e, tire)}
              onDragEnd={handleDragEnd}
            >
              🛞
              <div className="tire-info">
                <span>{tire.llanta}</span>
                <span>{tire.marca}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {hoveredTire && (
        <div className="tire-hover-card">
          <p><strong>Pos:</strong> {hoveredTire.pos?.at(-1)?.value || 'N/A'}</p>
          <p><strong>Llanta:</strong> {hoveredTire.llanta}</p>
          <p><strong>Marca:</strong> {hoveredTire.marca}</p>
          <p><strong>Placa:</strong> {hoveredTire.placa}</p>
          <p><strong>Tipo:</strong> {hoveredTire.tipovhc}</p>
        </div>
      )}
    </div>
  );
};

export default CambiarPosicion;
