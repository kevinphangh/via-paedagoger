const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

// Parse JSON bodies
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-auth-token');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// API proxy routes
app.all('/api/*', async (req, res) => {
  try {
    const apiPath = req.path.replace('/api', '');
    const backendUrl = `http://localhost:5000/api${apiPath}`;
    
    console.log(`Proxying ${req.method} ${req.path} -> ${backendUrl}`);
    
    const config = {
      method: req.method,
      url: backendUrl,
      params: req.query,
      data: req.body,
      headers: {}
    };
    
    // Forward auth headers
    if (req.headers['x-auth-token']) {
      config.headers['x-auth-token'] = req.headers['x-auth-token'];
    }
    
    const response = await axios(config);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Proxy error: ' + error.message });
    }
  }
});

// Serve static files
app.use(express.static(__dirname));

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   VIA Pædagoger Reddit Clone               ║
╠════════════════════════════════════════════╣
║   Frontend: http://localhost:${PORT}         ║
║   Backend API: http://localhost:5000       ║
║   Proxy: ACTIVE                            ║
╚════════════════════════════════════════════╝

✅ Frontend server with custom proxy is running!
API calls will be proxied to backend automatically.
`);
});