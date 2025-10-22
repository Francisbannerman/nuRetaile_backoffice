import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://hammerhead-app-68j7i.ondigitalocean.app/'
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5251/'


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default {
  // Category APIs
  category: {
    create: (data) => api.post('/api/Category/create', data),
    update: (data) => api.put('/api/Category/update', data),
    delete: (id) => api.delete(`/api/Category/delete?id=${id}`),
    get: (id) => api.get(`/api/Category/get?id=${id}`),
    getAll: () => api.get('/api/Category/getall')
  },

  // Product APIs
  product: {
    create: (data) => api.post('/api/Product/create', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    update: (data) => api.put('/api/Product/update', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    delete: (id) => api.delete(`/api/Product/delete?id=${id}`),
    get: (id) => api.get(`/api/Product/get?id=${id}`),
    getAll: () => api.get('/api/Product/getall')
  },

  // Cart APIs
  cart: {
    getAllCartProducts: () => api.get('/api/Cart/get_all_cart_products'),
    getAllCarts: () => api.get('/api/Cart/get_all_carts')
  },

  // Checkout APIs
  checkout: {
    manageCheckout: (data) => api.put('/api/Checkout/manage_checkout', data),
    getUserCheckout: (userId) => api.get(`/api/Checkout/get_user_checkout?userId=${userId}`),
    getAllCompleted: () => api.get('/api/Checkout/get_all_completed_checkout'),
    getAllOngoing: () => api.get('/api/Checkout/get_all_ongoing_checkout'),
    getById: (id) => api.get(`/api/Checkout/get_checkout_by_id?checkoutId=${id}`)
  },

  // Notification APIs
  notification: {
    create: (data) => api.post('/api/Notification/create', data)
  },

  // Transaction APIs
  transaction: {
    getAll: () => api.get('/api/Transaction/getAll'),
    getUserTransactions: (userId) => api.get(`/api/Transaction/getUsersTransactions?userId=${userId}`),
    getById: (id) => api.get(`/api/Transaction/getTransactionById?id=${id}`)
  },

  // User APIs
  user: {
    get: (id) => api.get(`/api/User/get?id=${id}`),
    getWithContact: (id) => api.get(`/api/User/get-with-contact?id=${id}`),
    getAll: () => api.get('/api/User/getall')
  },

  // Wallet APIs
  wallet: {
    get: (id) => api.get(`/api/Wallet/get?id=${id}`),
    getAll: () => api.get('/api/Wallet/getall'),
    getUserAll: (userId) => api.get(`/api/Wallet/getuserAll?userId=${userId}`)
  }
}