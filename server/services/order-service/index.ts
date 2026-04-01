// services/order-service/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import router from './routes';
import { errorHandler, notFound } from '../../shared/middleware';

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));
app.use(express.json());
app.use(router);
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`\n📋 Order Service running on http://localhost:${PORT}`);
    console.log(`   GET    /api/orders`);
    console.log(`   GET    /api/orders/:id`);
    console.log(`   POST   /api/orders`);
    console.log(`   PUT    /api/orders/:id/status`);
    console.log(`   DELETE /api/orders/:id`);
    console.log(`   GET    /api/orders/stats/summary\n`);
});