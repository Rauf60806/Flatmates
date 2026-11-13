import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { app } from './app.js';
import { env } from './config/env.js';
import { seedAdmin } from './config/seedAdmin.js';
import { prisma } from './prisma.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Production static file serving
if (env.NODE_ENV === 'production') {
    const clientDistPath = path.resolve(__dirname, '../../client/dist');
    console.log(`[Production] Serving static client bundle from: ${clientDistPath}`);
    app.use(express.static(clientDistPath));
    // SPA fallback for client-side routing
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
            return next();
        }
        res.sendFile(path.join(clientDistPath, 'index.html'));
    });
}
// Start server
const server = app.listen(env.PORT, async () => {
    console.log(`[Flatmates Server] Running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
    // Seed default admin if missing
    await seedAdmin();
});
// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
    console.log(`\n[Shutdown] Received ${signal}. Closing server and database connections...`);
    server.close(async () => {
        try {
            await prisma.$disconnect();
            console.log('[Shutdown] Prisma disconnected. Process exiting cleanly.');
            process.exit(0);
        }
        catch (err) {
            console.error('[Shutdown Error]', err);
            process.exit(1);
        }
    });
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
