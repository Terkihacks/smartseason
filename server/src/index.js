require('dotenv').config();
const createApp = require('./app');

const app = createApp();

// Export for Vercel serverless functions
module.exports = app;

// For local development
if (require.main === module) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`SmartSeason API listening on http://localhost:${port}`);
  });
}
