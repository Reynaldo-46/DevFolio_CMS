
import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = Cookies.get('refresh_token')
        const response = await axios.post(`${API_URL}/users/token/refresh/`, {
          refresh: refreshToken,
        })

        const { access } = response.data
        Cookies.set('access_token', access, { expires: 1 })

        originalRequest.headers.Authorization = `Bearer ${access}`
        return api(originalRequest)
      } catch (refreshError) {
        Cookies.remove('access_token')
        Cookies.remove('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email, password) =>
    api.post('/users/login/', { email, password }),
  
  register: (userData) =>
    api.post('/users/register/', userData),
  
  logout: (refreshToken) =>
    api.post('/users/logout/', { refresh_token: refreshToken }),
  
  getProfile: () =>
    api.get('/users/profile/'),
  
  // FIX: Update to handle both JSON and FormData
  updateProfile: (data) => {
    // If data is FormData (file upload), send as multipart
    if (data instanceof FormData) {
      return api.patch('/users/profile/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    }
    // Otherwise send as JSON
    return api.patch('/users/profile/', data)
  },
  
  changePassword: (oldPassword, newPassword) =>
    api.put('/users/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
      new_password2: newPassword,
    }),
  
  githubAuth: (code) =>
    api.post('/users/auth/github/', { code }),
}

// Portfolio API
export const portfolioAPI = {
  getMyPortfolio: () => api.get('/portfolios/my_portfolio/'),
  getByUsername: (username) => api.get(`/portfolios/by-username/${username}/`),
  create: (data) => api.post('/portfolios/', data),
  update: (id, data) => api.put(`/portfolios/${id}/`, data),
  
  // Social Links
  getSocialLinks: () => api.get('/portfolios/social-links/'),
  createSocialLink: (data) => api.post('/portfolios/social-links/', data),
  updateSocialLink: (id, data) => api.put(`/portfolios/social-links/${id}/`, data),
  deleteSocialLink: (id) => api.delete(`/portfolios/social-links/${id}/`),
  
  // Skills
  getSkills: () => api.get('/portfolios/skills/'),
  createSkill: (data) => api.post('/portfolios/skills/', data),
  updateSkill: (id, data) => api.put(`/portfolios/skills/${id}/`, data),
  deleteSkill: (id) => api.delete(`/portfolios/skills/${id}/`),
  
  // Experience
  getExperiences: () => api.get('/portfolios/experiences/'),
  createExperience: (data) => api.post('/portfolios/experiences/', data),
  updateExperience: (id, data) => api.put(`/portfolios/experiences/${id}/`, data),
  deleteExperience: (id) => api.delete(`/portfolios/experiences/${id}/`),
  
  // Education
  getEducation: () => api.get('/portfolios/education/'),
  createEducation: (data) => api.post('/portfolios/education/', data),
  updateEducation: (id, data) => api.put(`/portfolios/education/${id}/`, data),
  deleteEducation: (id) => api.delete(`/portfolios/education/${id}/`),
}

// Projects API
export const projectsAPI = {
  getAll: (username) => {
    const params = username ? { username } : {}
    return api.get('/projects/', { params })
  },
  getBySlug: (slug) => api.get(`/projects/${slug}/`),
  create: (data) => api.post('/projects/', data),
  update: (slug, data) => api.put(`/projects/${slug}/`, data),
  delete: (slug) => api.delete(`/projects/${slug}/`),
  importFromGitHub: () => api.post('/projects/import_from_github/'),
  syncGitHub: (slug) => api.post(`/projects/${slug}/sync_github/`),
}

// Blog API
export const blogAPI = {
  getAll: (params) => api.get('/blog/posts/', { params }),
  getMyPosts: (status) => {
    const params = status ? { status } : {}
    return api.get('/blog/posts/my_posts/', { params })
  },
  getBySlug: (slug) => api.get(`/blog/posts/${slug}/`),
  create: (data) => api.post('/blog/posts/', data),
  update: (slug, data) => api.put(`/blog/posts/${slug}/`, data),
  delete: (slug) => api.delete(`/blog/posts/${slug}/`),
  publish: (slug) => api.post(`/blog/posts/${slug}/publish/`),
  unpublish: (slug) => api.post(`/blog/posts/${slug}/unpublish/`),
  
  // Categories
  getCategories: () => api.get('/blog/categories/'),
  createCategory: (data) => api.post('/blog/categories/', data),
  
  // Tags
  getTags: () => api.get('/blog/tags/'),
}

// Analytics API
export const analyticsAPI = {
  getOverview: (days = 30) => api.get(`/analytics/overview/?days=${days}`),
  getProjects: (days = 30) => api.get(`/analytics/projects/?days=${days}`),
  trackPortfolio: (data) => api.post('/analytics/track/portfolio/', data),
  trackProject: (data) => api.post('/analytics/track/project/', data),
}

export default api