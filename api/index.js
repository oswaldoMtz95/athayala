// api/index.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

module.exports = async function handler(req, res) {
  // CORS manual para Serverless
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responder rápido a las peticiones "preflight" de los navegadores
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await client.connect();
    const db = client.db('Atjayaala');
    const collection = db.collection('rutas');

    // --- GUARDAR DATOS (ESP32 -> Vercel) ---
    if (req.method === 'POST') {
      const { lat, lon } = req.body;

      if (!lat || !lon) {
        return res.status(400).json({ error: 'Faltan lat o lon' });
      }

      // Guardamos TODO el cuerpo del mensaje + la fecha del servidor
      const data = { 
        ...req.body, 
        timestamp: new Date() 
      };

      await collection.insertOne(data);
      console.log("📍 Ubicación guardada de:", data.id);
      return res.status(200).json({ status: 'Guardado en DB' });
    }

    // --- LEER DATOS (Mapa -> Vercel) ---
    if (req.method === 'GET') {
      const ultima = await collection
        .find()
        .sort({ timestamp: -1 })
        .limit(1)
        .toArray();
      return res.status(200).json(ultima[0] || {});
    }

    return res.status(405).json({ error: 'Método no permitido' });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
};