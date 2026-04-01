import { Router, Request, Response } from 'express';
import { pool } from './db';

const router = Router();

router.get('/api/inventory/stats/summary', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT
        COUNT(*)          AS total_products,
        SUM(quantity)     AS total_units,
        MIN(quantity)     AS min_stock,
        MAX(quantity)     AS max_stock,
        ROUND(AVG(quantity), 1) AS avg_stock,
        COUNT(*) FILTER (WHERE quantity < 25)  AS low_stock_count,
        COUNT(*) FILTER (WHERE quantity = 0)   AS out_of_stock
      FROM inventory
    `);
        res.json({ success: true, data: result.rows[0] });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/api/inventory/alerts/low-stock', async (req: Request, res: Response) => {
    try {
        const threshold = Number(req.query.threshold) || 25;
        const result = await pool.query(
            `SELECT * FROM inventory WHERE quantity < $1 ORDER BY quantity ASC`, [threshold]
        );
        res.json({ success: true, data: result.rows, message: `${result.rows.length} items below threshold of ${threshold}` });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/api/inventory', async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM inventory ORDER BY updated_at DESC');
        res.json({ success: true, data: result.rows });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/api/inventory/:productId', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM inventory WHERE product_id = $1', [req.params.productId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Inventory item not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.put('/api/inventory/:productId/stock', async (req: Request, res: Response) => {
    try {
        const { quantity, warehouse } = req.body;
        if (quantity === undefined) {
            return res.status(400).json({ success: false, error: 'quantity is required' });
        }
        const result = await pool.query(
            `INSERT INTO inventory (product_id, quantity, warehouse, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (product_id)
       DO UPDATE SET quantity = $2, warehouse = COALESCE($3, inventory.warehouse), updated_at = NOW()
       RETURNING *`,
            [req.params.productId, quantity, warehouse]
        );
        res.json({ success: true, data: result.rows[0], message: 'Stock updated' });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.put('/api/inventory/:productId/deduct', async (req: Request, res: Response) => {
    try {
        const { quantity } = req.body;
        if (!quantity) {
            return res.status(400).json({ success: false, error: 'quantity is required' });
        }
        const check = await pool.query(
            'SELECT quantity FROM inventory WHERE product_id = $1', [req.params.productId]
        );
        if (check.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Product not in inventory' });
        }
        if (check.rows[0].quantity < quantity) {
            return res.status(400).json({ success: false, error: `Insufficient stock. Available: ${check.rows[0].quantity}` });
        }
        const result = await pool.query(
            `UPDATE inventory SET quantity = quantity - $1, updated_at = NOW() WHERE product_id = $2 RETURNING *`,
            [quantity, req.params.productId]
        );
        res.json({ success: true, data: result.rows[0], message: `Deducted ${quantity} units from stock` });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;