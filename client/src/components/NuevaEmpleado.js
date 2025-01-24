import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Nueva.css";

const NuevaEmpleado = () => {
  const [filteredTires, setFilteredTires] = useState([]);
  const [profundidadUpdates, setProfundidadUpdates] = useState({});
  const [presionUpdates, setPresionUpdates] = useState({});
  const [kilometrajeActual, setKilometrajeActual] = useState("");
  const [loading, setLoading] = useState(false);
  const [addPressure, setAddPressure] = useState(false);
  const [placas, setPlacas] = useState([]);
  const [selectedPlaca, setSelectedPlaca] = useState("");
  const [selectedFiles, setSelectedFiles] = useState({});

  // Retrieve token and decode it
  const token = localStorage.getItem("token");
  const decodedToken = token ? JSON.parse(atob(token.split(".")[1])) : null;
  const companyId = decodedToken?.user?.companyId;
  const userId = decodedToken?.user?.id;

  // Fetch Placas on Component Load
  useEffect(() => {
    const fetchPlacas = async () => {
      try {
        const response = await axios.get(
          `https://tirepro.onrender.com/api/auth/users/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPlacas(response.data.placa || []);
      } catch (error) {
        console.error("Error fetching placas:", error);
        alert("Error al obtener las placas.");
      }
    };

    if (userId) fetchPlacas();
  }, [token, userId]);

  // Handle Search
  const handleSearch = async () => {
    if (!selectedPlaca) {
      alert("Por favor selecciona una placa.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `https://tirepro.onrender.com/api/tires/user/${companyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const tires = response.data.filter((tire) => tire.placa === selectedPlaca);
      setFilteredTires(tires);
    } catch (error) {
      console.error("Error fetching tire data:", error);
      alert("Error al obtener datos.");
    } finally {
      setLoading(false);
    }
  };

  // Validate Fields
  const validateFields = () => {
    if (!kilometrajeActual.trim() || isNaN(Number(kilometrajeActual))) {
      alert("Por favor, ingresa un kilometraje válido.");
      return false;
    }

    const currentKilometrajeActual = Number(kilometrajeActual);

    for (const tire of filteredTires) {
      const profundidades = profundidadUpdates[tire._id] || {};
      const allProfundidadesFilled =
        profundidades.profundidad_int != null &&
        profundidades.profundidad_cen != null &&
        profundidades.profundidad_ext != null;

      if (!allProfundidadesFilled) {
        alert(`Completa todas las profundidades para la llanta ${tire.llanta}.`);
        return false;
      }

      if (addPressure && presionUpdates[tire._id] == null) {
        alert(`Por favor, completa la presión para la llanta ${tire.llanta}.`);
        return false;
      }

      const lastKilometrajeActual =
        tire.kilometraje_actual?.[tire.kilometraje_actual.length - 1]?.value || 0;

      if (currentKilometrajeActual < lastKilometrajeActual) {
        alert(
          `El kilometraje actual (${currentKilometrajeActual}) no puede ser menor que el último valor registrado (${lastKilometrajeActual}) para la llanta ${tire.llanta}.`
        );
        return false;
      }
    }

    return true;
  };

  // Calculation Helpers
  const calculateKms = (lastKilometraje, currentKilometraje, lastKms) => {
    const difference = Math.max(0, currentKilometraje - (lastKilometraje || 0));
    return lastKms + difference;
  };

  const calculateCPK = (costo, kms) => (kms > 0 ? costo / kms : 0);

  const calculateProjectedCPK = (costo, kms, profundidad_inicial, proact) => {
    if (proact >= profundidad_inicial) return 0; // Avoid division by zero
    const projectedKms = (kms / (profundidad_inicial - proact)) * profundidad_inicial;
    return projectedKms > 0 ? costo / projectedKms : 0;
  };

  // Upload Image to S3
  const uploadImageToS3 = async (tireId, file) => {
    try {
      const { data } = await axios.post(
        "https://tirepro.onrender.com/api/s3/presigned-url",
        { tireId, fileName: file.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await axios.put(data.url, file, { headers: { "Content-Type": file.type } });
      return data.url.split("?")[0];
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error al subir imagen.");
      return null;
    }
  };

  // Save Updates
  const handleSaveUpdates = async () => {
    if (!validateFields()) return;

    setLoading(true);
    try {
      const updates = await Promise.all(
        filteredTires.map(async (tire) => {
          const profundidades = profundidadUpdates[tire._id] || {};
          const minProfundidad = Math.min(
            profundidades.profundidad_int || 0,
            profundidades.profundidad_cen || 0,
            profundidades.profundidad_ext || 0
          );

          const lastKilometrajeActual =
            tire.kilometraje_actual?.[tire.kilometraje_actual.length - 1]?.value || 0;
          const lastKms = tire.kms?.[tire.kms.length - 1]?.value || 0;

          const newKms = calculateKms(lastKilometrajeActual, Number(kilometrajeActual), lastKms);
          const cpk = calculateCPK(tire.costo, newKms);
          const cpkProy = calculateProjectedCPK(
            tire.costo,
            newKms,
            tire.profundidad_inicial,
            minProfundidad
          );

          const imageUrl = selectedFiles[tire._id]
            ? await uploadImageToS3(tire._id, selectedFiles[tire._id])
            : null;

          const updatesArray = [
            { tireId: tire._id, field: "profundidad_int", newValue: profundidades.profundidad_int },
            { tireId: tire._id, field: "profundidad_cen", newValue: profundidades.profundidad_cen },
            { tireId: tire._id, field: "profundidad_ext", newValue: profundidades.profundidad_ext },
            { tireId: tire._id, field: "proact", newValue: minProfundidad },
            { tireId: tire._id, field: "kms", newValue: newKms },
            { tireId: tire._id, field: "cpk", newValue: cpk },
            { tireId: tire._id, field: "cpk_proy", newValue: cpkProy },
          ];

          if (imageUrl) {
            updatesArray.push({ tireId: tire._id, field: "images", newValue: imageUrl });
          }

          if (addPressure) {
            updatesArray.push({
              tireId: tire._id,
              field: "presion",
              newValue: presionUpdates[tire._id],
            });
          }

          return updatesArray;
        })
      );

      const tireIds = filteredTires.map((tire) => tire._id);

      await axios.put(
        "https://tirepro.onrender.com/api/tires/update-inspection-date",
        { tireIds, kilometrajeActual, inspectorName: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (updates.flat().length > 0) {
        await axios.put(
          "https://tirepro.onrender.com/api/tires/update-field",
          { tireUpdates: updates.flat() },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      alert("Datos actualizados correctamente.");
      setFilteredTires([]);
      setProfundidadUpdates({});
      setPresionUpdates({});
      setSelectedFiles({});
      setKilometrajeActual("");
    } catch (error) {
      console.error("Error saving updates:", error);
      alert("Error al guardar los datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section inspeccion-section">
      <h3>Inspección de Llantas</h3>
      <label>Seleccionar Placa:</label>
      <select
        value={selectedPlaca}
        onChange={(e) => setSelectedPlaca(e.target.value)}
        className="input-field"
      >
        <option value="">Seleccione una placa</option>
        {placas.map((placa, index) => (
          <option key={index} value={placa}>
            {placa}
          </option>
        ))}
      </select>
      <button onClick={handleSearch} className="search-button" disabled={loading}>
        {loading ? "Buscando..." : "Buscar"}
      </button>
      {filteredTires.length > 0 && (
        <div className="filtered-tires-container">
          <button
            className="add-pressure-button"
            onClick={() => setAddPressure((prev) => !prev)}
          >
            {addPressure ? "Quitar Presión" : "Agregar Presión"}
          </button>
          {filteredTires.map((tire) => (
            <div key={tire._id} className="tire-card">
              <p>
                <strong>Placa:</strong> {tire.placa}
              </p>
              <p>
                <strong>Llanta:</strong> {tire.llanta}
              </p>
              <p>
                <strong>Marca:</strong> {tire.marca}
              </p>
              {["profundidad_int", "profundidad_cen", "profundidad_ext"].map((field) => (
                <div key={field}>
                  <label>{field.replace("_", " ")}</label>
                  <input
                    type="number"
                    value={profundidadUpdates[tire._id]?.[field] || ""}
                    onChange={(e) => {
                      const value = Math.max(
                        0,
                        Number(e.target.value)
                      );
                      setProfundidadUpdates((prev) => ({
                        ...prev,
                        [tire._id]: {
                          ...prev[tire._id],
                          [field]: value,
                        },
                      }));
                    }}
                    className="input-field"
                  />
                </div>
              ))}
              {addPressure && (
                <div>
                  <label>Presión de Llanta</label>
                  <input
                    type="number"
                    value={presionUpdates[tire._id] || ""}
                    onChange={(e) => {
                      const value = Math.max(0, Number(e.target.value));
                      setPresionUpdates((prev) => ({
                        ...prev,
                        [tire._id]: value,
                      }));
                    }}
                    className="input-field"
                  />
                </div>
              )}
              <div>
                <label>Subir Imagen</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setSelectedFiles((prev) => ({
                      ...prev,
                      [tire._id]: e.target.files[0],
                    }))
                  }
                />
              </div>
            </div>
          ))}
          <input
            type="number"
            placeholder="Kilometraje Actual"
            value={kilometrajeActual}
            onChange={(e) => setKilometrajeActual(e.target.value)}
            className="input-field"
          />
          <button onClick={handleSaveUpdates} className="save-button" disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      )}
    </div>
  );
};

export default NuevaEmpleado;
