CREATE TABLE inventory (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL UNIQUE,
  quantity INTEGER NOT NULL DEFAULT 0,
  warehouse VARCHAR(100) DEFAULT 'Main Warehouse',
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO inventory (product_id, quantity, warehouse) VALUES
(1, 45,  'Main Warehouse'),
(2, 120, 'Main Warehouse'),
(3, 30,  'North Warehouse'),
(4, 15,  'Main Warehouse'),
(5, 200, 'South Warehouse'),
(6, 75,  'Main Warehouse'),
(7, 55,  'North Warehouse'),
(8, 20,  'Main Warehouse');