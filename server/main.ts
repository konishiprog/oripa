import { runtime } from './runtime/index';

let app: any;

async function initializeServer() {
  await runtime.init();
  app = runtime.app;
}

initializeServer().catch((err) => {
  console.error('Failed to initialize server:', err);
  process.exit(1);
});

export default app;
