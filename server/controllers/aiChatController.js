const { GoogleGenerativeAI } = require('@google/generative-ai');
const jwt = require('jsonwebtoken');
const TireData = require('../models/tireData');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Helper to get latest value from historical array
function getLatestValue(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr[arr.length - 1].value;
}

// Helper to get values from last N months
function getLastNMonthsValues(arr, months) {
  if (!Array.isArray(arr)) return [];
  return arr.slice(-months).map(item => ({
    value: item.value,
    date: `${item.day}/${item.month}/${item.year}`
  }));
}

async function askGeminiAI(prompt) {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini AI error:', error);
    throw new Error('Failed to get AI response: ' + error.message);
  }
}

function sanitizeAIResponse(response) {
  try {
    let jsonStr = response.replace(/[\r\n]/g, ' ');
    const matches = jsonStr.match(/\{(?:[^{}]|(?:\{[^{}]*\}))*\}/g);
    if (!matches) throw new Error('No valid JSON found in response');
    jsonStr = matches.reduce((a, b) => a.length > b.length ? a : b);
    return JSON.parse(jsonStr);
  } catch (error) {
    throw new Error('Failed to parse AI response: ' + error.message);
  }
}

const handleAIChat = async (req, res) => {
  const { userMessage } = req.body;

  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.user.id;

    const queryPrompt = `
      Eres un asistente AI especializado en gestión de flotas y llantas para una empresa de transporte.
      Analiza esta consulta: "${userMessage}"

      La base de datos tiene esta estructura:
      - llanta: número identificador, si dicen dame infomracion sobre la llanta x se refiere a llanta con numero identificador x
      - marca: marca de la llanta (ejemplos: continental, pirelli, bridgestone, etc)
      - costo: costo de la llanta 
      - vida: estado de la llanta (ejemplos: nueva, reencauche, reencauche2, reencauche3, fin, etc) una llanta reencauchada apareced con vida reencauche(1,2,3,etc)
      - kilometraje_actual: array con histórico de kilometraje del vehiculo
      - profundidad_int/cen/ext: arrays con histórico de profundidades
      - kms: array con histórico de kilómetros recorridos por la llanta, se le dice rendimiento tmabien.
      - cpk: array con histórico de costo por kilómetro
      - proact: array con histórico de scores proact
      - dimension: dimensión de la llanta
      - placa: placa del vehículo
      - pos: array con histórico de posición
      - eje: eje del carro en el que se encuentra la llanta (ejemplos: direccion, traccion, remolque, etc)
      - tipovhc: es el tipo de vehiculo en que esta la llanta (trailer (1,2,3 eje), cabezote)
      - banda: el tread, la cobertura de la llanta (hdr2, TR866, Defender LTX, lsu, etc)
      - frente: el tipo de carga del vehiculo (ejemplo: cargaseca, liquidos, gas, cemento, etc)
      - dimension: medidas de la llanta (ejemplo: 295/80r22.5, 12r22.5, etc)


      IMPORTANTE: Para todos los arrays históricos, el valor actual es siempre el último del array.

      Genera un JSON que especifique:
      {
        "intent": "[count|info|cpk|depth|cost|compare]",
        "filters": {
          // filtros específicos como marca, llanta, etc
        },
        "calculation": "[latest|average|total|trend|min|max]",
        "fields": ["campo1", "campo2"],
        "timeRange": number, // meses para análisis histórico
        "sort": {
          "field": "campo",
          "order": "asc|desc"
        }
      }
    `;

    const aiQueryResponse = await askGeminiAI(queryPrompt);
    const queryDetails = sanitizeAIResponse(aiQueryResponse);

    const { intent, filters = {}, calculation, fields = [], timeRange, sort } = queryDetails;

    let query = { user: userId };
    
    // Add case-insensitive filters
    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === 'string') {
        query[key] = new RegExp(value, 'i');
      } else if (typeof value === 'number') {
        query[key] = value;
      }
    });

    let result;
    let resultDetails = {};

    switch (intent) {
      case 'count':
        result = await TireData.countDocuments(query);
        resultDetails = { count: result };
        break;

      case 'info':
        const tireInfo = await TireData.findOne(query).lean();
        if (tireInfo) {
          resultDetails = {
            llanta: tireInfo.llanta,
            marca: tireInfo.marca,
            dimension: tireInfo.dimension,
            posicion: getLatestValue(tireInfo.pos),
            kilometraje: getLatestValue(tireInfo.kilometraje_actual),
            profundidad: {
              interna: getLatestValue(tireInfo.profundidad_int),
              central: getLatestValue(tireInfo.profundidad_cen),
              externa: getLatestValue(tireInfo.profundidad_ext)
            },
            cpk: getLatestValue(tireInfo.cpk),
            proact: getLatestValue(tireInfo.proact),
            costo: tireInfo.costo,
            vida: getLatestValue(tireInfo.vida),
            placa: tireInfo.placa
          };
        }
        break;
    
        case 'calculate':
    if (calculation === 'average') {
      const aggregation = await TireData.aggregate([
        { $match: query },
        { $group: { _id: null, avgValue: { $avg: `$${fields[0]}` } } }
      ]);
      result = aggregation[0]?.avgValue || 0;
      resultDetails = { average: result };
    } else if (calculation === 'sum') {
      const aggregation = await TireData.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: `$${fields[0]}` } } }
      ]);
      result = aggregation[0]?.total || 0;
      resultDetails = { total: result };
    }
    break;

    case 'group':
    const groupAggregation = await TireData.aggregate([
      { $match: query },
      { $group: { _id: `$${groupBy}`, count: { $sum: 1 } } },
      { $sort: { count: sort?.order === 'desc' ? -1 : 1 } }
    ]);
    resultDetails = groupAggregation.map(group => ({
      [groupBy]: group._id,
      count: group.count
    }));
    break;

      case 'cpk':
        switch (calculation) {
          case 'latest':
            const tire = await TireData.findOne(query).lean();
            result = tire ? getLatestValue(tire.cpk) : null;
            break;
          case 'average':
            const tires = await TireData.find(query).lean();
            const cpks = tires.map(tire => getLatestValue(tire.cpk)).filter(Boolean);
            result = cpks.length ? cpks.reduce((a, b) => a + b, 0) / cpks.length : null;
            break;
          case 'min':
            const minTire = await TireData.find(query)
              .lean()
              .then(tires => {
                const tiresWithCpk = tires.map(t => ({
                  llanta: t.llanta,
                  cpk: getLatestValue(t.cpk)
                })).filter(t => t.cpk);
                return tiresWithCpk.reduce((min, curr) => 
                  curr.cpk < min.cpk ? curr : min
                );
              });
            result = minTire;
            break;
        }
        resultDetails = { cpk: result };
        break;

      case 'depth':
        const depthData = await TireData.findOne(query).lean();
        if (depthData && timeRange) {
          resultDetails = {
            llanta: depthData.llanta,
            interna: getLastNMonthsValues(depthData.profundidad_int, timeRange),
            central: getLastNMonthsValues(depthData.profundidad_cen, timeRange),
            externa: getLastNMonthsValues(depthData.profundidad_ext, timeRange)
          };
        }
        break;

      case 'cost':
        switch (calculation) {
          case 'total':
            const costSum = await TireData.aggregate([
              { $match: query },
              { $group: { _id: null, total: { $sum: '$costo' } } }
            ]);
            result = costSum[0]?.total || 0;
            break;
          case 'average':
            const costAvg = await TireData.aggregate([
              { $match: query },
              { $group: { _id: null, avg: { $avg: '$costo' } } }
            ]);
            result = costAvg[0]?.avg || 0;
            break;
        }
        resultDetails = { cost: result };
        break;

      case 'compare':
        const tiresList = await TireData.find(query).lean();
        resultDetails = tiresList.map(tire => ({
          llanta: tire.llanta,
          marca: tire.marca,
          cpk: getLatestValue(tire.cpk),
          profundidad: {
            interna: getLatestValue(tire.profundidad_int),
            central: getLatestValue(tire.profundidad_cen),
            externa: getLatestValue(tire.profundidad_ext)
          },
          kilometraje: getLatestValue(tire.kilometraje_actual),
          costo: tire.costo
        }));

        if (sort && sort.field) {
          resultDetails.sort((a, b) => {
            const aValue = sort.field.includes('.') ? 
              sort.field.split('.').reduce((obj, key) => obj[key], a) :
              a[sort.field];
            const bValue = sort.field.includes('.') ?
              sort.field.split('.').reduce((obj, key) => obj[key], b) :
              b[sort.field];
            return sort.order === 'desc' ? bValue - aValue : aValue - bValue;
          });
        }
        break;
    }

    const responsePrompt = `
      Costos y Métricas Clave:

CPK (Costo por Kilómetro): Mide el costo total de operación de una llanta dividido por los kilómetros recorridos. Es clave para evaluar eficiencia y optimizar costos.
Fórmula: cpk = costo/kms CPK Proyectado: Estima el costo por kilómetro para el ciclo de vida completo de la llanta basado en datos históricos y proyecciones actuales.
Usa COP (pesos colombianos) como unidad para costos y asegúrate de incluir separadores de miles para claridad.
Condiciones y Mantenimiento Local:

Profundidad de banda: Llantas con menos de 4 mm requieren atención inmediata. Considera la normatividad colombiana que exige mantener llantas en condiciones óptimas para evitar sanciones​​.
Presión: La presión debe revisarse regularmente con un manómetro calibrado. En condiciones colombianas (clima cálido o terrenos irregulares), el inflado correcto prolonga la vida útil y reduce el riesgo de daños​.
Alineación: Fundamental para carreteras locales irregulares. Previene desgaste desigual y reduce costos de mantenimiento.
Selección y Uso de Llantas:

Clasificación por aplicación:
Ejes de dirección, tracción y remolque requieren llantas específicas.
Para operaciones off-road o mixtas, selecciona llantas con diseño de banda y materiales reforzados​​.
Normatividad en Colombia: Cumple con estándares como las disposiciones del Ministerio de Transporte en cuanto a profundidad y estado de las llantas.
Recauchutado y Reparación:

Recauchutado: Recomendado si la carcasa está en buen estado. En Colombia, es una opción económica y sostenible.
Reparaciones: Realiza reparaciones menores como pinchazos siguiendo las especificaciones del fabricante para evitar comprometer la seguridad​.
Impacto Ambiental:

Promueve prácticas como el uso de llantas de baja resistencia al rodado y reciclaje de llantas para minimizar el impacto ambiental​.
Estructura de tu respuesta al usuario:

Identificar el problema:

Menciona los datos relevantes proporcionados (e.g., profundidad actual, presión, CPK, etc.).
Resalta cualquier valor fuera de los estándares (e.g., profundidad < 4 mm, presión incorrecta, CPK elevado).
Explicación clara:

Si hay un problema con el CPK, explica cómo afecta el costo de operación.
Por ejemplo: "Un CPK de 700 COP indica que cada kilómetro recorrido con esta llanta cuesta significativamente más de lo esperado. Esto puede deberse a desgaste acelerado o mal mantenimiento."
Recomendación práctica:

Incluye acciones específicas, como ajustar presión, rotar llantas, realizar una alineación o recauchutado.
Por ejemplo: "Para reducir el CPK proyectado de 176 COP, recomendamos ajustar la presión a 120 PSI y revisar la alineación del eje de dirección."
Formato de resultados claros:

Incluye siempre la placa del vehículo si está disponible.
Presenta los costos en COP, usando separadores de miles para claridad. Responde solamente la pregunta de manera corta y concisa no te extiendas

Si los datos incluyen imágenes o valores históricos, utilízalos para respaldar tus recomendaciones.
Consulta del usuario: "${userMessage}"

Datos disponibles: ${JSON.stringify(resultDetails)}
    `;

    const finalResponse = await askGeminiAI(responsePrompt);
    
    res.json({ 
      message: finalResponse,
      details: resultDetails
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({
      error: 'Error al procesar tu consulta. Por favor intenta de nuevo.',
      details: error.message
    });
  }
};

module.exports = { handleAIChat };