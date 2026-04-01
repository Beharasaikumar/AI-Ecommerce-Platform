import { Router, Request, Response } from 'express';
import { pool } from './db';

const router = Router();

router.get('/api/payments/stats/summary', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)                                            AS total_payments,
        SUM(amount) FILTER (WHERE status = 'success')      AS total_collected,
        COUNT(*) FILTER (WHERE status = 'success')         AS successful,
        COUNT(*) FILTER (WHERE status = 'failed')          AS failed,
        COUNT(*) FILTER (WHERE status = 'pending')         AS pending,
        COUNT(*) FILTER (WHERE status = 'refunded')        AS refunded
      FROM payments
    `);
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/api/payments', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM payments ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/api/payments/order/:orderId', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM payments WHERE order_id = $1', [req.params.orderId]
    );
    res.json({ success: true, data: result.rows[0] || null });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/api/payments/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM payments WHERE id = $1', [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/payments/process', async (req: Request, res: Response) => {
  try {
    const { order_id, amount, method } = req.body;
    if (!order_id || !amount || !method) {
      return res.status(400).json({ success: false, error: 'order_id, amount and method are required' });
    }
    const isSuccess     = Math.random() > 0.1;
    const status        = isSuccess ? 'success' : 'failed';
    const transaction_id = `TXN_${Date.now()}_${Math.random().toString(36).slice(2,8).toUpperCase()}`;
    const result = await pool.query(
      `INSERT INTO payments (order_id, amount, status, method, transaction_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [order_id, amount, status, method, transaction_id]
    );
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: isSuccess ? `Payment of ₹${amount} processed successfully` : 'Payment failed. Please try again.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/api/payments/:id/refund', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `UPDATE payments SET status = 'refunded' WHERE id = $1 RETURNING *`, [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }
    res.json({ success: true, data: result.rows[0], message: 'Payment refunded' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;