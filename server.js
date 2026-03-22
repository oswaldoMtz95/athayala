const express = require('express');
const path    = require('path');
const { MongoClient } = require('mongodb');

const app    = express();
const port   = process.env.PORT || 3000;
const uri    = process.env.MONGODB_URI;
const client = new MongoClient(uri);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── POST /data — Recibe datos del ESP32 (HTTP plano) ────────
// Endpoint separado para la placa para evitar redirección HTTPS
app.post('/data', async (req, res) => {
  try {
    await client.connect();
    const collection = client.db('Atjayaala').collection('rutas');
    const { id, lat, lon, vel, alt, sat, hdop, gps_ok, red, bat } = req.body;

    if (lat === undefined || lon === undefined) {
      return res.status(400).json({ error: 'Faltan lat o lon' });
    }

    await collection.insertOne({
      id, lat, lon, vel, alt, sat, hdop, gps_ok, red, bat,
      timestamp: new Date()
    });

    console.log(`[DB] Guardado: lat=${lat} lon=${lon} red=${red} bat=${bat}%`);
    return res.status(200).json({ status: 'Guardado en DB' });

  } catch (err) {
    console.error('[DB] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ─── POST /api — mismo endpoint para compatibilidad ──────────
app.post('/api', async (req, res) => {
  try {
    await client.connect();
    const collection = client.db('Atjayaala').collection('rutas');
    const { id, lat, lon, vel, alt, sat, hdop, gps_ok, red, bat } = req.body;

    if (lat === undefined || lon === undefined) {
      return res.status(400).json({ error: 'Faltan lat o lon' });
    }

    await collection.insertOne({
      id, lat, lon, vel, alt, sat, hdop, gps_ok, red, bat,
      timestamp: new Date()
    });

    console.log(`[DB] Guardado: lat=${lat} lon=${lon} red=${red}`);
    return res.status(200).json({ status: 'Guardado en DB' });

  } catch (err) {
    console.error('[DB] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /api — Última ubicación para el panel web ───────────
app.get('/api', async (req, res) => {
  try {
    await client.connect();
    const collection = client.db('Atjayaala').collection('rutas');
    const ultima = await collection
      .find()
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();
    return res.status(200).json(ultima[0] || {});
  } catch (err) {
    console.error('[DB] Error GET:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => console.log(`Servidor corriendo en puerto ${port}`));