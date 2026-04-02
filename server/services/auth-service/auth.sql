CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert a default admin account (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@shop.com', '$2b$10$U9wnnmMo6tob5KYrDixiF.FiowxSrGa9gcPJf3rquk.Bl38BEawOu', 'admin');

