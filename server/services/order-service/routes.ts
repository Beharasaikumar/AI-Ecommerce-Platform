import { Router, Request, Response } from 'express';
import { pool } from './db';

const router = Router();

router.get('/api/orders/stats/summary', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)                                          AS total_orders,
        SUM(total_price)                                  AS total_revenue,
        COUNT(*) FILTER (WHERE status = 'pending')        AS pending,
        COUNT(*) FILTER (WHERE status = 'confirmed')      AS confirmed,
        COUNT(*) FILTER (WHERE status = 'shipped')        AS shipped,
        COUNT(*) FILTER (WHERE status = 'delivered')      AS delivered,
        COUNT(*) FILTER (WHERE status = 'cancelled')      AS cancelled
      FROM orders
    `);
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/api/orders', async (req: Request, res: Response) => {
  try {
    const rawUserId = req.query.user_id;

    let query = 'SELECT * FROM orders';
    const params: any[] = [];

    if (rawUserId) {
      const userId = Array.isArray(rawUserId)
        ? Number(rawUserId[0])
        : Number(rawUserId);

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid user_id'
        });
      }

      params.push(userId);
      query += ` WHERE user_id = $1`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    res.json({ success: true, data: result.rows });

  } catch (err: any) {
    console.error('Orders API error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/api/orders/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const { user_id, product_id, quantity, total_price } = req.body;
    if (!user_id || !product_id || !quantity || !total_price) {
      return res.status(400).json({ success: false, error: 'user_id, product_id, quantity and total_price are required' });
    }
    const result = await pool.query(
      `INSERT INTO orders (user_id, product_id, quantity, total_price, status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
      [user_id, product_id, quantity, total_price]
    );
    res.status(201).json({ success: true, data: result.rows[0], message: 'Order placed successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/api/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending','confirmed','shipped','delivered','cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Status must be one of: ${validStatuses.join(', ')}` });
    }
    const result = await pool.query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`, [status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, data: result.rows[0], message: `Order status updated to ${status}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/orders/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `UPDATE orders SET status = 'cancelled' WHERE id = $1 RETURNING *`, [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, message: 'Order cancelled', data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;