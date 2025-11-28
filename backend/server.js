// Backend server - to be implemented by Lunga
// This is a placeholder file

const express = require('express');
const app = express();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend ready for implementation' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server ready on port ${PORT}`);
});

module.exports = app;

