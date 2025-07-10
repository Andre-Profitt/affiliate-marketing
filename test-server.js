// Simple test server to verify the build works
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
});
