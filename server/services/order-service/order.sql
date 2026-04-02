CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO orders (user_id, product_id, quantity, total_price, status) VALUES
(1, 1, 2, 5998.00, 'delivered'),
(1, 4, 1, 5999.00, 'shipped'),
(2, 2, 1, 3499.00, 'confirmed'),
(2, 7, 2, 4998.00, 'pending'),
(3, 3, 1, 1899.00, 'delivered'),
(3, 8, 1, 4299.00, 'confirmed');