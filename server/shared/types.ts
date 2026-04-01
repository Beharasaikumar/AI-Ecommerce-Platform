export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  created_at: Date;
}

export interface Order {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: Date;
}

export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  method: 'card' | 'upi' | 'netbanking';
  transaction_id: string;
  created_at: Date;
}

export interface InventoryItem {
  id: number;
  product_id: number;
  quantity: number;
  warehouse: string;
  updated_at: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}