import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import batchRoutes from './routes/private/batch.routes.js';
import lossRoutes from './routes/private/loss.routes.js';
import saleRoutes from './routes/private/sale.routes.js';
import clientRoutes from './routes/private/client.routes.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.use('/api', batchRoutes);
app.use('/api', lossRoutes);
app.use('/api', saleRoutes);
app.use('/api', clientRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});