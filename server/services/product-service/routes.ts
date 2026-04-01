import { Router, Request, Response } from 'express';
import { pool } from './db';
import { ApiResponse, Product } from '../../shared/types';
import {
  upsertProductVector,
  searchSimilarProducts,
  askShoppingAssistant
} from '../../shared/aiService';

const router = Router();

router.get('/api/products', async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;

    let query = 'SELECT * FROM products';
    const conditions: string[] = [];
    const params: any[] = [];

    let categoryValue = category;

    if (Array.isArray(categoryValue)) {
      categoryValue = categoryValue[0];
    }

    if (categoryValue && String(categoryValue).toLowerCase() !== 'all') {
      params.push(String(categoryValue).trim());
      conditions.push(`LOWER(category) = LOWER($${params.length})`);
    }

    let searchValue = search;

    if (Array.isArray(searchValue)) {
      searchValue = searchValue[0];
    }

    if (searchValue) {
      params.push(`%${searchValue}%`);
      conditions.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1', [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/products', async (req: Request, res: Response) => {
  try {
    const { name, description, price, category, image_url } = req.body;
    if (!name || !price) {
      return res.status(400).json({ success: false, error: 'name and price are required' });
    }
    const result = await pool.query(
      `INSERT INTO products (name, description, price, category, image_url)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [name, description, price, category, image_url]
    );
    const product = result.rows[0];

    await upsertProductVector(
      product.id,
      `${name} ${description} ${category}`,
      { name, price, category }
    );

    res.status(201).json({ success: true, data: product, message: 'Product created' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const { name, description, price, category, image_url } = req.body;
    const result = await pool.query(
      `UPDATE products SET
        name=$1, description=$2, price=$3, category=$4, image_url=$5
       WHERE id=$6 RETURNING *`,
      [name, description, price, category, image_url, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: result.rows[0], message: 'Product updated' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM products WHERE id=$1 RETURNING *', [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/api/products/ai/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ success: false, error: 'q parameter required' });
    }
    const ids = await searchSimilarProducts(query);
    if (ids.length === 0) {
      return res.json({ success: true, data: [] });
    }
    const result = await pool.query(
      `SELECT * FROM products WHERE id = ANY($1::int[])`, [ids]
    );
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/products/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'message is required' });
    }
    const products = await pool.query('SELECT * FROM products LIMIT 20');
    const context = products.rows
      .map((p: Product) => `${p.name} - ₹${p.price} - ${p.description}`)
      .join('\n');
    const reply = await askShoppingAssistant(message, context);
    res.json({ success: true, data: { reply } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/api/categories', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC')
    res.json({ success: true, data: result.rows })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/api/categories', async (req: Request, res: Response) => {
  try {
    const { name, emoji, color } = req.body
    if (!name) return res.status(400).json({ success: false, error: 'name is required' })
    const result = await pool.query(
      `INSERT INTO categories (name, emoji, color) VALUES ($1, $2, $3) RETURNING *`,
      [name.trim(), emoji || '📦', color || 'bg-slate-100 text-slate-700']
    )
    res.status(201).json({ success: true, data: result.rows[0], message: 'Category created' })
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, error: 'Category already exists' })
    }
    res.status(500).json({ success: false, error: err.message })
  }
})

router.put('/api/categories/:id', async (req: Request, res: Response) => {
  try {
    const { name, emoji, color } = req.body

    if (!name) {
      return res.status(400).json({ success: false, error: 'name is required' })
    }

    const result = await pool.query(
      `UPDATE categories
       SET name = $1, emoji = $2, color = $3
       WHERE id = $4
       RETURNING *`,
      [name.trim(), emoji || '📦', color || 'bg-slate-100 text-slate-700', req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Category not found' })
    }

    res.json({ success: true, data: result.rows[0], message: 'Category updated' })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.delete('/api/categories/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1 RETURNING *', [req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Category not found' })
    }
    res.json({ success: true, message: 'Category deleted' })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router;