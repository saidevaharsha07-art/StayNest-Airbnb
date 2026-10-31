require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const { autoSeedIfEmpty } = require('./utils/autoSeed');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB (Atlas, Local, or in-memory fallback)
    await connectDB();

    // Ensure database contains demonstration data
    await autoSeedIfEmpty();

    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` StayNest API Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(` URL: http://localhost:${PORT}`);
      console.log(` Health check: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });

    process.on('unhandledRejection', (err) => {
      console.error(`[Unhandled Rejection]: ${err.message}`);
    });
  } catch (err) {
    console.error(`[Fatal Startup Error]: ${err.message}`);
    process.exit(1);
  }
};

startServer();
