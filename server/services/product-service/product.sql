CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO products (name, description, price, category, image_url) VALUES
('Wireless Headphones', 'Premium noise-cancelling headphones with 30hr battery', 2999.00, 'Electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'),
('Running Shoes', 'Lightweight breathable shoes for marathon runners', 3499.00, 'Footwear', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'),
('Backpack', 'Waterproof 40L hiking backpack with laptop sleeve', 1899.00, 'Bags', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'),
('Smart Watch', 'Fitness tracker with heart rate monitor and GPS', 5999.00, 'Electronics', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'),
('Sunglasses', 'UV400 polarized sunglasses for outdoor activities', 1299.00, 'Accessories', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400'),
('Yoga Mat', 'Non-slip 6mm thick eco-friendly yoga mat', 899.00, 'Fitness', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'),
('Coffee Maker', 'Programmable 12-cup drip coffee maker with timer', 2499.00, 'Kitchen', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400'),
('Mechanical Keyboard', 'RGB backlit mechanical keyboard with blue switches', 4299.00, 'Electronics', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400');


CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  emoji VARCHAR(10) DEFAULT '📦',
  color VARCHAR(50) DEFAULT 'bg-slate-100 text-slate-700',
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO categories (name, emoji, color) VALUES
('Electronics', '💻', 'bg-blue-50 text-blue-700'),
('Footwear',    '👟', 'bg-rose-50 text-rose-700'),
('Bags',        '🎒', 'bg-amber-50 text-amber-700'),
('Accessories', '⌚', 'bg-violet-50 text-violet-700'),
('Fitness',     '🏋️', 'bg-emerald-50 text-emerald-700'),
('Kitchen',     '☕', 'bg-orange-50 text-orange-700')
ON CONFLICT (name) DO NOTHING;