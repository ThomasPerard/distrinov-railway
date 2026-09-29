require('dotenv').config();
const express = require('express');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// =============== SETUP ===============
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => console.error('Unexpected error on idle client', err));

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// =============== API ROUTES ===============

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: NODE_ENV });
});

// GET /api/state — candidat lit l'état en direct du recruteur
app.get('/api/state', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT data FROM live_state WHERE id = \',
      ['current']
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No state found' });
    }
    res.json(result.rows[0].data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/state — recruteur change l'état (partie, slide, timer, etc.)
app.post('/api/state', async (req, res) => {
  const { evalId, patch } = req.body;

  // Vérifier que c'est bien le recruteur (évalId valide)
  if (!evalId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await pool.query(
      \UPDATE live_state
       SET data = jsonb_set(data, '{0}', \::jsonb), updated_at = now()
       WHERE id = \
       RETURNING data\,
      [JSON.stringify(patch), 'current']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'State not found' });
    }

    res.json(result.rows[0].data);

    // Notifier tous les clients WebSocket du changement
    broadcastStateUpdate(result.rows[0].data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/content/{contentId} — contenu privé (masqué, facts, fiches)
app.get('/api/content/:contentId', async (req, res) => {
  const { contentId } = req.params;
  const evalId = req.query.evalId; // recruteur seulement

  if (!evalId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await pool.query(
      'SELECT data FROM private_content WHERE id = \',
      [contentId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }
    res.json(result.rows[0].data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/evals/{evalId} — sauvegarder les notes du recruteur
app.post('/api/evals/:evalId', async (req, res) => {
  const { evalId } = req.params;
  const { notes, scores, fiches } = req.body;

  try {
    const result = await pool.query(
      \INSERT INTO evals (eval_id, data, updated_at)
       VALUES (\, \, now())
       ON CONFLICT (eval_id)
       DO UPDATE SET data = \, updated_at = now()
       RETURNING data\,
      [evalId, JSON.stringify({ notes, scores, fiches })]
    );
    res.json(result.rows[0].data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// =============== WEBSOCKET (real-time sync) ===============
const clients = new Set();

wss.on('connection', (ws) => {
  const clientId = Date.now().toString();
  clients.add({ ws, clientId });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      // Recevoir les messages du candidat ou du recruteur
      // Exemple : { type: 'state_update', payload: {...} }
      console.log(\[\] Message:\, data);
    } catch (err) {
      console.error('WebSocket parse error:', err);
    }
  });

  ws.on('close', () => {
    clients.delete([...clients].find(c => c.clientId === clientId));
  });

  ws.on('error', (err) => console.error('WebSocket error:', err));
});

function broadcastStateUpdate(state) {
  const message = JSON.stringify({ type: 'state_update', payload: state });
  clients.forEach(({ ws }) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(message);
    }
  });
}

// =============== SERVE INDEX ===============
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =============== START ===============
server.listen(PORT, '0.0.0.0', () => {
  console.log(\\n🚀 Distrinov server running on http://0.0.0.0:\\);
  console.log(\📊 Environment: \\);
  console.log(\🗄  Database: \\n\);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    pool.end(() => process.exit(0));
  });
});
