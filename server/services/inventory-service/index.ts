import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import router from './routes';
import { errorHandler, notFound } from '../../shared/middleware';

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));
app.use(express.json());
app.use(router);
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`\n🏭 Inventory Service running on http://localhost:${PORT}`);
    console.log(`   GET /api/inventory`);
    console.log(`   GET /api/inventory/:productId`);
    console.log(`   PUT /api/inventory/:productId/stock`);
    console.log(`   PUT /api/inventory/:productId/deduct`);
    console.log(`   GET /api/inventory/alerts/low-stock`);
    console.log(`   GET /api/inventory/stats/summary\n`);
});