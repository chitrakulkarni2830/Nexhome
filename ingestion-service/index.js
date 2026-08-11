const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory store for recent telemetry data
const deviceTelemetry = new Map();
let sseClients = [];

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'NexHome Ingestion' });
});

app.post('/telemetry', (req, res) => {
    const { device_id, metrics } = req.body;
    
    if (!device_id || !metrics) {
        return res.status(400).json({ error: 'Missing device_id or metrics' });
    }
    
    const timestamp = new Date().toISOString();
    const dataPoint = { timestamp, metrics };
    
    // Store latest telemetry
    if (!deviceTelemetry.has(device_id)) {
        deviceTelemetry.set(device_id, []);
    }
    const history = deviceTelemetry.get(device_id);
    history.push(dataPoint);
    
    // Keep only last 100 entries per device to prevent memory leak
    if (history.length > 100) {
        history.shift();
    }
    
    // Broadcast to connected SSE clients
    const eventData = JSON.stringify({ device_id, timestamp, metrics });
    sseClients.forEach(client => {
        client.write(`data: ${eventData}\n\n`);
    });
    
    res.status(202).json({ status: 'accepted' });
});

app.get('/telemetry/:device_id', (req, res) => {
    const deviceId = parseInt(req.params.device_id);
    const history = deviceTelemetry.get(deviceId) || [];
    res.json(history);
});

// SSE endpoint for real-time streaming
app.get('/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Send initial connection success message
    res.write('data: {"status":"connected"}\n\n');
    
    sseClients.push(res);
    
    req.on('close', () => {
        sseClients = sseClients.filter(client => client !== res);
    });
});

app.listen(PORT, () => {
    console.log(`Ingestion service running on port ${PORT}`);
});
