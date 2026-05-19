import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
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
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/register', registerRoutes);
app.use('/api/login', loginRoutes);
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

// Middleware de Erro Global
import { errorMiddleware } from './middlewares/error.js';
app.use(errorMiddleware);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));