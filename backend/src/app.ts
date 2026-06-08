import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import loginRoutes from './routes/public/login.routes.js';
import registerRoutes from './routes/public/register.routes.js';
import batchRoutes from './routes/private/batch.routes.js';
import lossRoutes from './routes/private/loss.routes.js';
import saleRoutes from './routes/private/sale.routes.js';
import clientRoutes from './routes/private/client.routes.js';
import paymentRoutes from './routes/private/payment.routes.js';
import fixedExpenseRoutes from './routes/private/fixedExpense.routes.js';
import dashboardRoutes from './routes/private/dashboard.routes.js';
import configRoutes from './routes/private/config.routes.js';
import reportRoutes from './routes/private/report.routes.js';
import batchExpenseRoutes from './routes/private/batchExpense.routes.js';
import adminRoutes from './routes/private/admin.routes.js';
import profileRoutes from './routes/private/profile.routes.js';
import maintenanceRoutes from './routes/public/maintenance.routes.js';
import { maintenanceMiddleware } from './middlewares/maintenance.js';
import { env } from './config/env.js';
import { ensureDefaultAdmin } from './services/startupService.js';

const app = express();

const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Muitas tentativas. Tente novamente em alguns minutos.',
        message: 'Muitas tentativas. Tente novamente em alguns minutos.',
    },
});

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(cors({
    origin: env.CORS_ORIGINS.length > 0 ? env.CORS_ORIGINS : true,
    credentials: true,
}));

app.get('/api/health', (_req, res) => {
    res.status(200).json({
        ok: true,
        service: 'aviarios-backend',
        timestamp: new Date().toISOString(),
    });
});

// Middleware global de manutenção — bloqueia requisições de não-admins quando em manutenção
app.use(maintenanceMiddleware);

app.use('/api/register', authRateLimiter, registerRoutes);
app.use('/api/login', authRateLimiter, loginRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/losses', lossRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/fixed-expenses', fixedExpenseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/config', configRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/batch-expenses', batchExpenseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// Middleware de Erro Global
import { errorMiddleware } from './middlewares/error.js';
app.use(errorMiddleware);

const PORT = env.PORT;

async function startServer() {
    await ensureDefaultAdmin();
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
}

startServer().catch((error) => {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
});
