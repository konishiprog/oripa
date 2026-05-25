import express from 'express';
import { runtime } from './runtime/index';

let app = express();

async function initializeServer() {
  try {
    await runtime.init();
    app = runtime.app;
    await runtime.start();
  } catch (err: any) {
    console.error('Failed to initialize server:', err);
    app.get('/health', (req, res) => {
      res.json({ status: 'error', error: err.message });
    });
    const PORT = parseInt(process.env.PORT || '3000', 10);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT} (error mode)`);
    });
  }
}

initializeServer();

export default app;
