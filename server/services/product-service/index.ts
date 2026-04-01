import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import router from './routes';
import { errorHandler, notFound } from '../../shared/middleware';

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));
app.use(express.json());
app.use(router);
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`\n📦 Product Service running on http://localhost:${PORT}`);
    console.log(`   GET  /api/products`);
    console.log(`   GET  /api/products/:id`);
    console.log(`   POST /api/products`);
    console.log(`   PUT  /api/products/:id`);
    console.log(`   DELETE /api/products/:id`);
    console.log(`   GET  /api/products/ai/search?q=`);
    console.log(`   POST /api/products/ai/chat`);
    console.log(`   GET  /api/categories`);
    console.log(`   POST /api/categories`);
    console.log(`   DELETE /api/categories/:id\n`);
});