import express from 'express';
import { runtime } from './runtime/index';

let app = express();

async function initializeServer() {
  try {
    await runtime.init();
    app = runtime.app;
  } catch (err) {
    console.error('Failed to initialize server:', err);
    app.get('/health', (req, res) => {
      res.json({ status: 'error', error: err.message });
    });
  }
}

initializeServer();

export default app;
