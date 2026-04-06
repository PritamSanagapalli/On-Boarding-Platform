import axios from 'axios'
import { auth } from '../config/firebase'

/**
 * Pre-configured Axios instance for API calls.
 * - Base URL from env or default to /api (proxied by Vite in dev)
 * - Automatically attaches Firebase ID token to every request
 * - Handles token refresh automatically
 */
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach Firebase token
api.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser
      if (user) {
        const token = await user.getIdToken()
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error('Error getting auth token:', error)
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized — redirecting to login')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
