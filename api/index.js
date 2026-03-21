// api/index.js
const { MongoClient } = require('mongodb');

// ✅ URI desde variable de entorno (nunca en el código)
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

module.exports = async function handler(req, res) {
  // Cabeceras CORS por si acaso
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    await client.connect();
    const db         = client.db('Atjayaala');
    const collection = db.collection('rutas');

    if (req.method === 'POST') {
      const { id, lat, lon } = req.body;

      // Validar que lleguen los datos
      if (!lat || !lon) {
        return res.status(400).json({ error: 'Faltan lat o lon' });
      }

      const data = { id, lat, lon, timestamp: new Date() };
      await collection.insertOne(data);
      return res.status(200).json({ status: 'Guardado en DB' });
    }

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