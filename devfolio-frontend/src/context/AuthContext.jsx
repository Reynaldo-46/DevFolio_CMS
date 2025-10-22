import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = Cookies.get('access_token')
    if (token) {
      try {
        const response = await authAPI.getProfile()
        setUser(response.data)
      } catch (error) {
        Cookies.remove('access_token')
        Cookies.remove('refresh_token')
      }
    }
    setLoading(false)
  }

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password)
      const { access, refresh } = response.data
      
      Cookies.set('access_token', access, { expires: 1 })
      Cookies.set('refresh_token', refresh, { expires: 7 })
      
      const profileResponse = await authAPI.getProfile()
      setUser(profileResponse.data)
      
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed')
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      const { tokens } = response.data
      
      Cookies.set('access_token', tokens.access, { expires: 1 })
      Cookies.set('refresh_token', tokens.refresh, { expires: 7 })
      
      setUser(response.data.user)
      
      toast.success('Registration successful!')
      navigate('/dashboard')
    } catch (error) {
      const errorMessage = error.response?.data?.email?.[0] 
        || error.response?.data?.username?.[0]
        || 'Registration failed'
      toast.error(errorMessage)
      throw error
    }
  }

  const loginWithGitHub = async (code) => {
    try {
      const response = await authAPI.githubAuth(code)
      const { tokens } = response.data
      
      Cookies.set('access_token', tokens.access, { expires: 1 })
      Cookies.set('refresh_token', tokens.refresh, { expires: 7 })
      
      setUser(response.data.user)
      
      toast.success('GitHub login successful!')
      navigate('/dashboard')
    } catch (error) {
      toast.error('GitHub authentication failed')
      throw error
    }
  }

  const logout = async () => {
    try {
      const refreshToken = Cookies.get('refresh_token')
      await authAPI.logout(refreshToken)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      Cookies.remove('access_token')
      Cookies.remove('refresh_token')
      setUser(null)
      toast.success('Logged out successfully')
      navigate('/login')
    }
  }

  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data)
      setUser(response.data)
      toast.success('Profile updated successfully!')
      return response.data
    } catch (error) {
      toast.error('Failed to update profile')
      throw error
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    loginWithGitHub,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}