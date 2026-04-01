import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import axios from 'axios';
import dotenv from 'dotenv';
import { requestLogger, notFound, errorHandler } from '../shared/middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const SERVICES = {
  products: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001',
  orders: process.env.ORDER_SERVICE_URL || 'http://localhost:3002',
  payments: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003',
  inventory: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3004',
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3005',
};

app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}
));
app.use(express.json());
app.use(morgan('dev'));
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Gateway is running',
    services: SERVICES,
    timestamp: new Date().toISOString()
  });
});


async function proxyRequest(
  serviceUrl: string,
  req: express.Request,
  res: express.Response
) {
  try {
    const url = `${serviceUrl}${req.originalUrl}`;
    const response = await axios({
      method: req.method as any,
      url,
      data: req.body,
      params: req.query,
      headers: { 'Content-Type': 'application/json' },
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 503;
    const message = error.response?.data?.error || `Service unavailable`;
    res.status(status).json({ success: false, error: message });
  }
}

app.use('/api/products', (req, res) =>
  proxyRequest(SERVICES.products, req, res));

app.use('/api/categories', (req, res) =>
  proxyRequest(SERVICES.products, req, res));

app.use('/api/orders', (req, res) =>
  proxyRequest(SERVICES.orders, req, res));

app.use('/api/payments', (req, res) =>
  proxyRequest(SERVICES.payments, req, res));

app.use('/api/inventory', (req, res) =>
  proxyRequest(SERVICES.inventory, req, res));

app.use('/api/auth', (req, res) =>
  proxyRequest(SERVICES.auth, req, res));

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 API Gateway running on http://localhost:${PORT}`);
  console.log(`📦 Products  → ${SERVICES.products}`);
  console.log(`📋 Orders    → ${SERVICES.orders}`);
  console.log(`💳 Payments  → ${SERVICES.payments}`);
  console.log(`🏭 Inventory → ${SERVICES.inventory}`);
  console.log(`🔐 Auth      → ${SERVICES.auth}\n`);
});