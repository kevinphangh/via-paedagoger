const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 3000;

// Proxy API requests to backend
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  logLevel: 'debug'
}));

// Serve static files
app.use(express.static(__dirname));

// Serve index.html for all other routes (for client-side routing)
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
╚════════════════════════════════════════════╝

✅ Frontend server with API proxy is running!
Open http://localhost:${PORT} to test the app.
`);
});