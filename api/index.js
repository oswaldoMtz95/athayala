// api/index.js (Para subir a Vercel)
const { MongoClient } = require('mongodb');

// Reemplaza con tu conexión de MongoDB Atlas

const uri = "mongodb+srv://endii:magama@cluster0.1ybyykn.mongodb.net/?appName=Cluster0";
// O mejor aún:
// const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
    await client.connect();
    const db = client.db('Atjayaala');
    const collection = db.collection('rutas');

    if (req.method === 'POST') {
        // La placa manda: { "lat": 20.6, "lon": -103.3, "bat": 85 }
        const data = { ...req.body, timestamp: new Date() };
        await collection.insertOne(data);
        return res.status(200).json({ status: 'Guardado en DB' });
    }

    if (req.method === 'GET') {
        // La página web pide la última ubicación
        const ultimaUbicacion = await collection.find().sort({ timestamp: -1 }).limit(1).toArray();
        return res.status(200).json(ultimaUbicacion[0] || {});
    }
}