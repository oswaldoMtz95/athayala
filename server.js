const express = require('express');
const path    = require('path');
const cors    = require('cors'); // Requerido para conectar el Frontend con el Backend
const { MongoClient } = require('mongodb');

const app    = express();
const port   = process.env.PORT || 3000;
const uri    = process.env.MONGODB_URI; // Asegúrate de tener esta variable en Railway

// --- CONFIGURACIÓN DE MIDDLEWARES ---
app.use(cors()); // Permite peticiones desde el navegador (CORS)
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const client = new MongoClient(uri);

// --- FUNCIÓN PARA GUARDAR EN DB ---
async function guardarPosicion(data) {
    try {
        await client.connect();
        const collection = client.db('Atjayaala').collection('rutas');
        
        // Estructura del documento
        const nuevoRegistro = {
            id: data.id || "Athayala_Collar",
            lat: parseFloat(data.lat),
            lon: parseFloat(data.lon),
            vel: parseFloat(data.vel) || 0,
            alt: parseFloat(data.alt) || 0,
            sat: parseInt(data.sat) || 0,
            hdop: parseFloat(data.hdop) || 0,
            gps_ok: data.gps_ok,
            red: data.red || "desconocida",
            bat: data.bat || 0,
            timestamp: new Date()
        };

        const result = await collection.insertOne(nuevoRegistro);
        console.log(`[DB] ✅ Guardado: ID ${result.insertedId} | Lat: ${data.lat} Lon: ${data.lon} [${data.red}]`);
        return true;
    } catch (err) {
        console.error('[DB] ❌ Error al insertar:', err.message);
        return false;
    }
}

// ─── POST /api y /data ───
// Usamos la misma lógica para ambos endpoints por si la placa usa uno u otro
app.post(['/api', '/data'], async (req, res) => {
    const { lat, lon } = req.body;

    if (lat === undefined || lon === undefined) {
        console.warn('[HTTP] ⚠️ Recibido JSON incompleto');
        return res.status(400).json({ error: 'Faltan lat o lon' });
    }

    const exito = await guardarPosicion(req.body);
    
    if (exito) {
        return res.status(200).json({ status: 'Guardado correctamente' });
    } else {
        return res.status(500).json({ error: 'Error interno de base de datos' });
    }
});

// ─── GET /api ───
// Este lo usa el mapa (index.html) para obtener el último punto
app.get('/api', async (req, res) => {
    try {
        await client.connect();
        const collection = client.db('Atjayaala').collection('rutas');
        
        // Buscamos el último registro insertado
        const ultimaPosicion = await collection
            .find()
            .sort({ timestamp: -1 })
            .limit(1)
            .toArray();

        if (ultimaPosicion.length > 0) {
            return res.status(200).json(ultimaPosicion[0]);
        } else {
            return res.status(200).json({ status: "No hay datos aún" });
        }
    } catch (err) {
        console.error('[DB] Error GET:', err.message);
        return res.status(500).json({ error: err.message });
    }
});

// Lanzar servidor
app.listen(port, () => {
    console.log(`🚀 Servidor Athayala corriendo en puerto ${port}`);
});