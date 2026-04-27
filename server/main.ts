import { runtime } from './runtime/index';

async function main() {
  await runtime.init();
  await runtime.start();
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
