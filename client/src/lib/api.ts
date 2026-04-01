import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const productApi = {
    getAll: (params?: { category?: string; search?: string }) =>
        api.get('/products', { params }),
    getById: (id: number) => api.get(`/products/${id}`),
    create: (data: any) => api.post('/products', data),
    update: (id: number, data: any) => api.put(`/products/${id}`, data),
    delete: (id: number) => api.delete(`/products/${id}`),
    aiSearch: (q: string) => api.get('/products/ai/search', { params: { q } }),
    aiChat: (message: string) => api.post('/products/ai/chat', { message }),
};

export const orderApi = {
    getAll: (user_id?: number) =>
        api.get('/orders', { params: user_id ? { user_id } : {} }),
    getById: (id: number) => api.get(`/orders/${id}`),
    create: (data: any) => api.post('/orders', data),
    updateStatus: (id: number, status: string) =>
        api.put(`/orders/${id}/status`, { status }),
    cancel: (id: number) => api.delete(`/orders/${id}`),
    getStats: () => api.get('/orders/stats/summary'),
};

export const paymentApi = {
    getAll: () => api.get('/payments'),
    getById: (id: number) => api.get(`/payments/${id}`),
    getByOrder: (orderId: number) => api.get(`/payments/order/${orderId}`),
    process: (data: any) => api.post('/payments/process', data),
    refund: (id: number) => api.put(`/payments/${id}/refund`),
    getStats: () => api.get('/payments/stats/summary'),
};

export const inventoryApi = {
    getAll: () => api.get('/inventory'),
    getByProduct: (productId: number) => api.get(`/inventory/${productId}`),
    updateStock: (productId: number, data: any) =>
        api.put(`/inventory/${productId}/stock`, data),
    deductStock: (productId: number, quantity: number) =>
        api.put(`/inventory/${productId}/deduct`, { quantity }),
    getLowStock: (threshold?: number) =>
        api.get('/inventory/alerts/low-stock', { params: { threshold } }),
    getStats: () => api.get('/inventory/stats/summary'),
};


export const categoryApi = {
  getAll:  () => api.get('/categories'),
  create:  (data: any) => api.post('/categories', data),
  update: (id: number, data: any) => api.put(`/categories/${id}`, data),
  delete:  (id: number) => api.delete(`/categories/${id}`),
}