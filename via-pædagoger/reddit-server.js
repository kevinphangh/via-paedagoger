const express = require('express');
const path = require('path');
const proxy = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

// Proxy API requests to backend
app.use('/api', proxy.createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true
}));

// Serve React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Serve the React app for all routes (for client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   VIA Pædagoger Reddit Clone               ║
╠════════════════════════════════════════════╣
║   Running at: http://localhost:${PORT}        ║
║   Backend API: http://localhost:5000       ║
╚════════════════════════════════════════════╝

IMPORTANT: Clear your browser cache!
Chrome: Ctrl+Shift+R or Cmd+Shift+R
`);
});