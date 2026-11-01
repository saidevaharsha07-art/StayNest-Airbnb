const mongoose = require('mongoose');

let memoryServerInstance = null;

// Helper to mask credentials in MongoDB URI for safe logging
const maskUri = (uri) => {
  if (!uri) return 'undefined';
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/staynest';
  const isProduction = process.env.NODE_ENV === 'production';
  const safeUri = maskUri(uri);

  try {
    // 10s timeout for remote cloud Atlas connection, 3s for local dev
    const timeoutMs = isProduction ? 10000 : 3000;
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: timeoutMs,
    });
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (primaryErr) {
    console.warn(`[Database] Could not connect to primary MongoDB at "${safeUri}": ${primaryErr.message}`);

    // If in development or test, fall back seamlessly to MongoMemoryServer
    if (!isProduction) {
      try {
        console.log('[Database] Initializing seamless in-memory MongoDB fallback for evaluation...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServerInstance = await MongoMemoryServer.create();
        const memUri = memoryServerInstance.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`[Database] In-memory MongoDB Connected successfully: ${memUri}`);
        return conn;
      } catch (memErr) {
        console.error('[Database] Failed to start in-memory MongoDB fallback:', memErr.message);
        throw memErr;
      }
    } else {
      console.error('[Database Fatal Error] In production, valid MONGODB_URI (e.g. MongoDB Atlas) is required.');
      throw primaryErr;
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
      memoryServerInstance = null;
    }
  } catch (err) {
    console.error('[Database] Error during disconnect:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
