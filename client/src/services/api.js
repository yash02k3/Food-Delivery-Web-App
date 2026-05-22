import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const getAuthToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem('agrilink_user') || 'null');
    if (user?.token) return user.token;
    const persist = JSON.parse(localStorage.getItem('persist:agrilink') || '{}');
    const auth = typeof persist.auth === 'string' ? JSON.parse(persist.auth) : persist.auth;
    return auth?.user?.token || null;
  } catch {
    return null;
  }
};

export const syncAuthToStorage = (user) => {
  if (user?.token) localStorage.setItem('agrilink_user', JSON.stringify(user));
};

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Network error';
    if (err.code === 'ERR_NETWORK') {
      err.friendlyMessage = 'Cannot reach AgriLink API. Start server: npm run dev:server';
    } else {
      err.friendlyMessage = message;
    }
    return Promise.reject(err);
  }
);

export const checkApiHealth = () => api.get('/health');

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const addressAPI = {
  getAll: () => api.get('/addresses'),
  create: (data) => api.post('/addresses', data),
  update: (id, data) => api.put(`/addresses/${id}`, data),
  remove: (id) => api.delete(`/addresses/${id}`),
  setDefault: (id) => api.put(`/addresses/${id}/default`),
};

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  getTrending: () => api.get('/products/trending'),
  getFeatured: () => api.get('/products/featured'),
};

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/myorders'),
  getById: (id) => api.get(`/orders/${id}`),
  pay: (id, data) => api.put(`/orders/${id}/pay`, data),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  getSupplierOrders: () => api.get('/orders/supplier/list'),
};

export const supplierAPI = {
  getAll: () => api.get('/suppliers'),
  getById: (id) => api.get(`/suppliers/${id}`),
  getDashboard: () => api.get('/suppliers/dashboard/me'),
};

export const supplierPanelAPI = {
  getMe: () => api.get('/supplier-panel/me'),
  updateProfile: (data) => api.put('/supplier-panel/profile', data),
  getDashboard: () => api.get('/supplier-panel/dashboard'),
  getProducts: (params) => api.get('/supplier-panel/products', { params }),
  createProduct: (data) => api.post('/supplier-panel/products', data),
  updateProduct: (id, data) => api.put(`/supplier-panel/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/supplier-panel/products/${id}`),
  updateStock: (id, data) => api.patch(`/supplier-panel/products/${id}/stock`, data),
  getCategories: () => api.get('/supplier-panel/categories'),
  getOrders: () => api.get('/supplier-panel/orders'),
  updateOrderStatus: (id, data) => api.put(`/supplier-panel/orders/${id}/status`, data),
  getInvoice: (id) => api.get(`/supplier-panel/orders/${id}/invoice`),
  getOffers: () => api.get('/supplier-panel/offers'),
  createOffer: (data) => api.post('/supplier-panel/offers', data),
  updateOffer: (id, data) => api.put(`/supplier-panel/offers/${id}`, data),
  deleteOffer: (id) => api.delete(`/supplier-panel/offers/${id}`),
  getReviews: () => api.get('/supplier-panel/reviews'),
  updateDelivery: (data) => api.put('/supplier-panel/delivery', data),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  getOrders: () => api.get('/admin/orders'),
  updateOrder: (id, data) => api.put(`/admin/orders/${id}`, data),
  getSuppliers: (params) => api.get('/admin/suppliers', { params }),
  approveSupplier: (id) => api.put(`/admin/suppliers/${id}/approve`),
  rejectSupplier: (id, reason) => api.put(`/admin/suppliers/${id}/reject`, { reason }),
  suspendSupplier: (id) => api.put(`/admin/suppliers/${id}/suspend`),
  getProducts: () => api.get('/admin/products'),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  featureProduct: (id, isFeatured) => api.put(`/admin/products/${id}/feature`, { isFeatured }),
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data) => api.post('/admin/coupons', data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),
  getBanners: () => api.get('/admin/banners'),
  createBanner: (data) => api.post('/admin/banners', data),
  updateBanner: (id, data) => api.put(`/admin/banners/${id}`, data),
  deleteBanner: (id) => api.delete(`/admin/banners/${id}`),
  broadcastNotification: (data) => api.post('/admin/notifications/broadcast', data),
  getCategories: () => api.get('/admin/categories'),
};

export const paymentAPI = {
  calculate: (data) => api.post('/payments/calculate', data),
  createRazorpayOrder: (data) => api.post('/payments/razorpay/create-order', data),
  verifyRazorpay: (data) => api.post('/payments/razorpay/verify', data),
};

export const couponAPI = {
  validate: (data) => api.post('/coupons/validate', data),
  getAll: () => api.get('/coupons'),
};

export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post(`/wishlist/${productId}`),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
};

export default api;
