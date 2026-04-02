CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  method VARCHAR(50) DEFAULT 'card',
  transaction_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO payments (order_id, amount, status, method, transaction_id) VALUES
(1, 5998.00, 'success',  'card',       'TXN_001_' || extract(epoch from now())::text),
(2, 5999.00, 'success',  'upi',        'TXN_002_' || extract(epoch from now())::text),
(3, 3499.00, 'success',  'netbanking', 'TXN_003_' || extract(epoch from now())::text),
(4, 4998.00, 'pending',  'card',       'TXN_004_' || extract(epoch from now())::text),
(5, 1899.00, 'success',  'upi',        'TXN_005_' || extract(epoch from now())::text),
(6, 4299.00, 'failed',   'card',       'TXN_006_' || extract(epoch from now())::text);