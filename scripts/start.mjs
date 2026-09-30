// Explicit startup remains reliable when a hosting shell disables adapter autostart.
process.env.ASTRO_NODE_AUTOSTART = 'disabled';
const { startServer } = await import('../dist/server/entry.mjs');
startServer();
