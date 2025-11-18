// Simple test server to check if basic setup works
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend server is running!',
    timestamp: new Date().toISOString() 
  });
});

app.get('/test', (req, res) => {
  res.json({ 
    message: 'Test endpoint working!',
    env: {
      nodeVersion: process.version,
      platform: process.platform
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
  console.log(`🔗 Test health: http://localhost:${PORT}/health`);
  console.log(`🔗 Test endpoint: http://localhost:${PORT}/test`);
});