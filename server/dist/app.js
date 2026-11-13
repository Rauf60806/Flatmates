import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import itemRoutes from './routes/item.routes.js';
import suggestionRoutes from './routes/suggestion.routes.js';
import balanceRoutes from './routes/balance.routes.js';
import settlementRoutes from './routes/settlement.routes.js';
import statsRoutes from './routes/stats.routes.js';
export const app = express();
// Security and parsing middleware
app.use(helmet({
    contentSecurityPolicy: false, // Allows flexible inline fonts & scripts for client SPA
}));
app.use(cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Healthcheck endpoint
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'flatmates-api',
    });
});
// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/items/suggestions', suggestionRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/balances', balanceRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api', statsRoutes);
// Global Error Handler
app.use(errorHandler);
