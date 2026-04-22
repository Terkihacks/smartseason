require('dotenv').config();

let app;
try {
  const createApp = require('./app');
  app = createApp();
} catch (error) {
  console.error('Failed to create app:', error);
  // Fallback minimal app
  const express = require('express');
  app = express();
  app.get('/api/health', (req, res) => {
    res.status(500).json({ 
      error: 'App initialization failed', 
      message: error.message 
    });
  });
}

// Export for Vercel serverless functions
module.exports = app;

// For local development
if (require.main === module) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`SmartSeason API listening on http://localhost:${port}`);
  });
}
