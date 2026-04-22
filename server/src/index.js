require('dotenv').config();
const createApp = require('./app');

// Generate Prisma client at runtime if not exists
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const prismaClientPath = path.join(__dirname, '../node_modules/.prisma/client');
if (!fs.existsSync(prismaClientPath)) {
  console.log('Generating Prisma client...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to generate Prisma client:', error);
  }
}

const app = createApp();

// Add a test endpoint for Supabase connection
app.get('/api/test-db', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$connect();
    await prisma.$disconnect();
    res.json({ status: 'Database connection successful' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

// Export for Vercel serverless functions
module.exports = app;

// For local development
if (require.main === module) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`SmartSeason API listening on http://localhost:${port}`);
  });
}
