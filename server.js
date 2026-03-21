// server.js
const express    = require('express');
const { MongoClient } = require('mongodb');

const app    = express();
const port   = process.env.PORT || 3000;
const uri    = process.env.MONGODB_URI;
const client = new MongoClient(uri);

app.use(express.json());

// POST - recibe ubicación del ESP32
app.post('/api', async (req, res) => {
  try {
    await client.connect();
    const collection = client.db('Atjayaala').collection('rutas');
    const { id, lat, lon } = req.body;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Faltan lat o lon' });
    }

    await collection.insertOne({ id, lat, lon, timestamp: new Date() });
    return res.status(200).json({ status: 'Guardado en DB' });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET - última ubicación
app.get('/api', async (req, res) => {
  try {
    await client.connect();
    const collection = client.db('Atjayaala').collection('rutas');
    const ultima = await collection.find().sort({ timestamp: -1 }).limit(1).toArray();
    return res.status(200).json(ultima[0] || {});
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => console.log(`Servidor corriendo en puerto ${port}`));