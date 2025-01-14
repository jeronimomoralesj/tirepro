const axios = require('axios');
const jwt = require('jsonwebtoken');
const Tire = require('../models/tireData'); // Mongoose model for tires

// Function to call Gemini AI
async function askGeminiAI(prompt) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY; // Your Google Generative AI API key
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText',
      {
        prompt: { text: prompt },
      },
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    );

    return response.data.candidates[0]?.output || 'No response from AI';
  } catch (error) {
    console.error('Error communicating with Gemini AI:', error.message);
    throw new Error('Gemini AI communication failed.');
  }
}

// Controller function to handle AIChat requests
exports.handleAIChat = async (req, res) => {
  const { userId, userMessage } = req.body;

  if (!userId || !userMessage) {
    return res.status(400).json({ error: 'User ID and message are required.' });
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication token is missing.' });
    }

    const decodedToken = jwt.decode(token);
    const companyId = decodedToken?.user?.companyId;

    // Step 1: Use Gemini to analyze the query
    const geminiQueryResponse = await askGeminiAI(`
      Eres un asistente experto en llantas. Un usuario de la empresa con ID ${companyId} te hizo esta pregunta: "${userMessage}".
      Tu trabajo es analizar esta pregunta y devolver un JSON que especifique la información que se debe consultar en la base de datos.
      Ejemplo:
      {
        "type": "tire",
        "filters": {
          "placa": "ABC123",
          "position": 3
        }
      }
    `);

    const queryDetails = JSON.parse(geminiQueryResponse); // Parse AI response

    if (!queryDetails || queryDetails.type !== 'tire') {
      return res.status(400).json({ error: 'Invalid query details from AI.' });
    }

    // Step 2: Fetch relevant data
    const filters = queryDetails.filters || {};
    const query = {};

    if (filters.placa) query.placa = filters.placa;
    if (filters.position) query['pos.value'] = filters.position;

    query.companyId = companyId; // Restrict to the same company

    const tireData = await Tire.find(query);
    if (!tireData || tireData.length === 0) {
      return res.status(404).json({ error: 'No data found for the specified query.' });
    }

    // Step 3: Use AI to generate a response
    const geminiResponse = await askGeminiAI(`
      Aquí está la información obtenida de la base de datos: ${JSON.stringify(tireData)}.
      Responde a la pregunta original del usuario: "${userMessage}".
    `);

    res.status(200).json({ response: geminiResponse });
  } catch (error) {
    console.error('Error processing AIChat:', error.message);
    res.status(500).json({ error: 'Error processing AI query. Please try again later.' });
  }
};
