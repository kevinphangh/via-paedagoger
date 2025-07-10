const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Serve the new index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve static files
app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   VIA Pædagoger Forum UI                   ║
╠════════════════════════════════════════════╣
║   UI kører på: http://localhost:${PORT}       ║
║   Backend API: http://localhost:5000       ║
╚════════════════════════════════════════════╝

Åbn http://localhost:${PORT} i din browser!
`);
});