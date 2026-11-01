require('dotenv').config();
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');
const { autoSeedIfEmpty } = require('./utils/autoSeed');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
  try {
    // Production Security Sanity Checks
    if (NODE_ENV === 'production') {
      if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('fallback') || process.env.JWT_SECRET.length < 16) {
        console.warn('⚠️ [SECURITY WARNING] In production, JWT_SECRET should be a strong, cryptographically random secret string with at least 32 characters.');
      }
      if (!process.env.MONGODB_URI) {
        console.error('❌ [CONFIG ERROR] In production, MONGODB_URI is required. Please configure your MongoDB Atlas connection string.');
      }
    }

    // Connect to MongoDB (Atlas, Local, or in-memory fallback for dev)
    await connectDB();

    // Ensure database contains demonstration data (safely guarded in production)
    await autoSeedIfEmpty();

    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` StayNest API Server running in ${NODE_ENV} mode`);
      console.log(` Port: ${PORT}`);
      console.log(` Health check: http://localhost:${PORT}/api/health`);
      console.log(` Allowed Client Origin(s): ${process.env.CLIENT_URL || 'Default Local Origins'}`);
      console.log(`====================================================`);
    });

    // Graceful Shutdown on termination signals (Render, Heroku, Docker)
    const handleShutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
      server.close(async () => {
        console.log('[Server] HTTP connections closed.');
        await disconnectDB();
        console.log('[Server] Database connections closed. Process terminating cleanly.');
        process.exit(0);
      });

      // Force terminate if graceful shutdown takes longer than 10 seconds
      setTimeout(() => {
        console.error('[Server] Graceful shutdown timeout exceeded. Forcing termination.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));

    process.on('unhandledRejection', (err) => {
      console.error(`[Unhandled Rejection]: ${err.message}`);
    });
  } catch (err) {
    console.error(`[Fatal Startup Error]: ${err.message}`);
    process.exit(1);
  }
};

startServer();
