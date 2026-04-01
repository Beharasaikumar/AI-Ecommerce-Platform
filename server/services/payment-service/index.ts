import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import router from './routes';
import { errorHandler, notFound } from '../../shared/middleware';

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));
app.use(express.json());
app.use(router);
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`\n💳 Payment Service running on http://localhost:${PORT}`);
    console.log(`   GET  /api/payments`);
    console.log(`   GET  /api/payments/:id`);
    console.log(`   GET  /api/payments/order/:orderId`);
    console.log(`   POST /api/payments/process`);
    console.log(`   PUT  /api/payments/:id/refund`);
    console.log(`   GET  /api/payments/stats/summary\n`);
});