import React, { useState } from 'react';
import axios from 'axios';
import './CambiarPosicion.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const CambiarPosicion = () => {
  const [placas, setPlacas] = useState(['']); // Array of placas
  const [tires, setTires] = useState([]); // Tires fetched for placas
  const [positionUpdates, setPositionUpdates] = useState({});
  const [previousValues, setPreviousValues] = useState({}); // Store previous values for swapping
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uniquePlacas, setUniquePlacas] = useState([]);
  const [pdfContent, setPdfContent] = useState(null); // PDF content for download
  const [isPopupVisible, setIsPopupVisible] = useState(false); // Popup visibility

  const token = localStorage.getItem('token');
  const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const companyId = decodedToken?.user?.companyId;

  
  // Add a new empty placa input
  const handleAddPlaca = () => setPlacas([...placas, '']);

  // Update the placa array
  const handlePlacaChange = (index, value) => {
    const updatedPlacas = [...placas];
    updatedPlacas[index] = value;
    setPlacas(updatedPlacas);
  };

  // Fetch tires for entered placas
  const handleSearch = async () => {
    setIsLoading(true);
    setErrorMessage('');
  
    try {
      const response = await axios.get(
        `http://localhost:5001/api/tires/user/${companyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const fetchedTires = response.data;
  
      // Extract unique `placas`, excluding "fin"
      const placasList = [
        ...new Set(
          fetchedTires
            .map((tire) => tire.placa.toLowerCase())
            .filter((placa) => placa !== 'fin') // Exclude "fin"
        ),
      ];
  
      setUniquePlacas([...placasList, 'inventario']); // Add "inventario"
  
      // Filter tires based on the entered `placas`
      const filteredTires = fetchedTires
        .filter((tire) =>
          placas.some((enteredPlaca) => tire.placa.toLowerCase() === enteredPlaca.toLowerCase())
        )
        .sort((a, b) => {
          const posA = a.pos?.at(-1)?.value || 0;
          const posB = b.pos?.at(-1)?.value || 0;
          return posA - posB; // Ascending order
        });
  
      if (filteredTires.length > 0) {
        setTires(filteredTires);
  
        setPreviousValues(
          filteredTires.reduce((acc, tire) => {
            const key = `${tire.placa}-${tire.pos?.at(-1)?.value}`;
            acc[key] = {
              frente: tire.frente,
              tipoVhc: tire.tipovhc,
              kilometrajeActual: tire.kilometraje_actual?.at(-1)?.value || 0,
            };
            return acc;
          }, {})
        );
  
        setPositionUpdates(
          filteredTires.reduce((acc, tire) => {
            acc[tire._id] = {
              newPlaca: tire.placa,
              newPos: tire.pos?.at(-1)?.value || '',
            };
            return acc;
          }, {})
        );
      } else {
        setErrorMessage('No se encontraron llantas asociadas con las placas ingresadas.');
      }
    } catch (error) {
      console.error('Error fetching tires:', error);
      setErrorMessage('Error al buscar llantas.');
    } finally {
      setIsLoading(false);
    }
  };
  


  // Swap values between tires correctly
  const handleValueTransfer = (tireId, targetPlaca, targetPos) => {
    const newKey = `${targetPlaca}-${targetPos}`;
    const oldKey = `${positionUpdates[tireId]?.newPlaca}-${positionUpdates[tireId]?.newPos}`;

    const inheritedValues = previousValues[newKey] || {};
    const currentValues = previousValues[oldKey] || {};

    setPreviousValues((prev) => ({
      ...prev,
      [oldKey]: { ...currentValues }, // Store current tire's values to its old position
      [newKey]: { ...currentValues }, // Pass values to the new position
    }));

    setPositionUpdates((prev) => ({
      ...prev,
      [tireId]: {
        newPlaca: targetPlaca,
        newPos: targetPos,
        frente: inheritedValues.frente || '',
        tipoVhc: inheritedValues.tipoVhc || '',
        kilometrajeActual: inheritedValues.kilometrajeActual || 0,
      },
    }));
  };

  // Save updates to the backend
  const handleSaveUpdates = async () => {
    const placaPosSet = new Set();
    let hasDuplicates = false;
  
    for (const tireId in positionUpdates) {
      const { newPlaca, newPos } = positionUpdates[tireId];
      const key = `${newPlaca}-${newPos}`;
  
      if (newPlaca !== 'inventario' && newPlaca !== 'fin') {
        if (placaPosSet.has(key)) {
          alert(`Error: Ya existe una llanta en la placa "${newPlaca}" y posición "${newPos}".`);
          hasDuplicates = true;
          break;
        }
        if (newPlaca && newPos) {
          placaPosSet.add(key);
        }
      }
    }
  
    if (hasDuplicates) return;
  
    const nonHistoricalUpdates = [];
    const changes = [];
  
    tires.forEach((tire) => {
      const { newPlaca, newPos } = positionUpdates[tire._id];
  
      if (newPlaca === 'inventario') {
        // Send both placa and pos updates through nonHistoricalUpdates
        nonHistoricalUpdates.push(
          { 
            tireId: tire._id, 
            field: 'placa', 
            newValue: 'inventario',
            currentFrente: tire.frente,
            currentTipovhc: tire.tipovhc
          },
          {
            tireId: tire._id,
            field: 'pos',
            newValue: 1,
            currentFrente: tire.frente,
            currentTipovhc: tire.tipovhc
          }
        );
  
        changes.push({
          tire: tire.llanta,
          previousPlaca: tire.placa,
          previousPos: tire.pos?.at(-1)?.value || 'N/A',
          newPlaca: 'inventario',
          newPos: 1
        });
      } else if (newPlaca !== tire.placa || newPos !== tire.pos?.at(-1)?.value) {
        nonHistoricalUpdates.push(
          {
            tireId: tire._id,
            field: 'placa',
            newValue: newPlaca,
            currentFrente: tire.frente,
            currentTipovhc: tire.tipovhc
          },
          {
            tireId: tire._id,
            field: 'pos',
            newValue: newPos,
            currentFrente: tire.frente,
            currentTipovhc: tire.tipovhc
          }
        );
  
        changes.push({
          tire: tire.llanta,
          previousPlaca: tire.placa,
          previousPos: tire.pos?.at(-1)?.value || 'N/A',
          newPlaca,
          newPos
        });
      }
    });
  
    try {
      setIsLoading(true);
  
      if (nonHistoricalUpdates.length > 0) {
        await axios.put(
          'http://localhost:5001/api/tires/update-nonhistorics',
          { updates: nonHistoricalUpdates },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
  
      setPdfContent(changes);
      setIsPopupVisible(true);
  
      alert('Cambios guardados exitosamente.');
      setTires([]);
      setPlacas(['']);
      setPositionUpdates({});
    } catch (error) {
      console.error('Error saving updates:', error);
      alert('Error al guardar los cambios.');
    } finally {
      setIsLoading(false);
    }
  };
  
  

  // Generate PDF with changes
  const generatePDF = () => {
    if (!pdfContent) {
      alert('No hay cambios para generar el PDF.');
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Reporte de Cambios de Posición de Llantas', 10, 10);

    const tableData = pdfContent.map((change) => [
      change.tire,
      change.previousPlaca,
      change.previousPos,
      change.newPlaca,
      change.newPos,
    ]);

    doc.autoTable({
      head: [['Llanta', 'Placa Anterior', 'Posición Anterior', 'Nueva Placa', 'Nueva Posición']],
      body: tableData,
      startY: 20,
    });

    doc.save('cambios_posicion_llantas.pdf');
  };

  const handleDeletePlaca = (index) => {
    setPlacas((prevPlacas) => prevPlacas.filter((_, i) => i !== index));
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
      <button
        onClick={() => handleDeletePlaca(index)}
        className="delete-placa-button"
        disabled={placas.length <= 1} // Disable delete if there's only one placa left
      >
        Eliminar
      </button>
      <div className="tire-cards">
        {tires
          .filter((tire) => tire.placa === placa)
          .map((tire) => (
            <div key={tire._id} className="tire-card">
              <p><strong>Llanta:</strong> {tire.llanta}</p>
              <p><strong>Marca:</strong> {tire.marca}</p>
              <p><strong>Posición actual: </strong> {tire.pos?.at(-1)?.value || 'N/A'}</p>
              <p>
  <strong>Placa:</strong>
  <select
    value={positionUpdates[tire._id]?.newPlaca}
    onChange={(e) => {
      const selectedPlaca = e.target.value;
      const isInventario = selectedPlaca === 'inventario';

      // Update position if "inventario" is selected
      setPositionUpdates((prev) => ({
        ...prev,
        [tire._id]: {
          ...prev[tire._id],
          newPlaca: selectedPlaca,
          newPos: isInventario ? 1 : prev[tire._id]?.newPos,
        },
      }));
    }}
    className="tire-dropdown"
  >
    <option value="" disabled>Selecciona una placa</option>
    {uniquePlacas.map((placa) => (
      <option key={placa} value={placa}>
        {placa}
      </option>
    ))}
  </select>
</p>


<p>
  <strong>Posición:</strong>
  <input
    type="number"
    value={positionUpdates[tire._id]?.newPos}
    disabled={positionUpdates[tire._id]?.newPlaca === 'inventario'} // Disable editing for "inventario"
    onBlur={() =>
      handleValueTransfer(
        tire._id,
        positionUpdates[tire._id]?.newPlaca,
        positionUpdates[tire._id]?.newPos
      )
    }
    onChange={(e) =>
      setPositionUpdates((prev) => ({
        ...prev,
        [tire._id]: { ...prev[tire._id], newPos: parseInt(e.target.value, 10) || 0 },
      }))
    }
    className="tire-input"
  />
</p>


            </div>
          ))}
      </div>
    </div>
  ))}
</div>


      <div className="save-button-container">
        <button onClick={handleSaveUpdates} className="save-button" disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {/* Popup for PDF Download */}
      {isPopupVisible && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Cambios guardados</h3>
            <p>Descarga el reporte de cambios:</p>
            <button onClick={generatePDF} className="download-pdf-button">
              Descargar PDF
            </button>
            <button onClick={() => setIsPopupVisible(false)} className="close-button">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CambiarPosicion;
