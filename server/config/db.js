const mongoose = require('mongoose');

let memoryServerInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/staynest';
  
  try {
    // Attempt standard connection with 2.5s timeout for local/Atlas
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (primaryErr) {
    console.warn(`[Database] Could not connect to primary MongoDB at "${uri}": ${primaryErr.message}`);

    // If in development or test, fall back seamlessly to MongoMemoryServer
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[Database] Initializing seamless in-memory MongoDB fallback for evaluation...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServerInstance = await MongoMemoryServer.create();
        const memUri = memoryServerInstance.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`[Database] In-memory MongoDB Connected successfully: ${memUri}`);
        return conn;
      } catch (memErr) {
        console.error('[Database] Failed to start in-memory MongoDB fallback:', memErr);
        throw memErr;
      }
    } else {
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
