import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import { analyticsAPI, projectsAPI, blogAPI } from '../services/api'
import { Eye, Users, TrendingUp, FolderGit2, BookOpen, LayoutDashboard, Settings, Plus } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    portfolioViews: 0,
    projects: 0,
    blogPosts: 0,
    visitors: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    // Refresh every 30 seconds for real-time feel
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch analytics
      const analyticsResponse = await analyticsAPI.getOverview(30)
      
      // Fetch projects count
      const projectsResponse = await projectsAPI.getAll(user?.username)
      const projectsData = Array.isArray(projectsResponse.data)
        ? projectsResponse.data
        : projectsResponse.data.results || []
      
      // Fetch blog posts count
      const blogResponse = await blogAPI.getMyPosts()
      const blogData = Array.isArray(blogResponse.data)
        ? blogResponse.data
        : blogResponse.data.results || []

      setStats({
        portfolioViews: analyticsResponse.data.total_views || 0,
        projects: projectsData.length,
        blogPosts: blogData.length,
        visitors: analyticsResponse.data.unique_visitors || 0,
      })

      // Generate recent activity from analytics
      const activity = []
      
      if (analyticsResponse.data.total_views > 0) {
        activity.push({
          type: 'view',
          title: 'Portfolio viewed',
          description: `${analyticsResponse.data.total_views} views in the last 30 days`,
          time: 'Recent',
          color: 'blue'
        })
      }

      if (projectsData.length > 0) {
        const latestProject = projectsData[0]
        activity.push({
          type: 'project',
          title: 'New project added',
          description: `You added "${latestProject.title}" to your portfolio`,
          time: new Date(latestProject.created_at).toLocaleDateString(),
          color: 'green'
        })
      }

      if (blogData.filter(post => post.status === 'published').length > 0) {
        const latestPost = blogData.filter(post => post.status === 'published')[0]
        activity.push({
          type: 'blog',
          title: 'Blog post published',
          description: `Your article "${latestPost.title}" is now live`,
          time: new Date(latestPost.published_at).toLocaleDateString(),
          color: 'purple'
        })
      }

      setRecentActivity(activity)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { 
      label: 'Portfolio Views', 
      value: stats.portfolioViews.toLocaleString(), 
      icon: Eye, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Projects', 
      value: stats.projects, 
      icon: FolderGit2, 
      color: 'bg-green-500' 
    },
    { 
      label: 'Blog Posts', 
      value: stats.blogPosts, 
      icon: BookOpen, 
      color: 'bg-purple-500' 
    },
    { 
      label: 'Unique Visitors', 
      value: stats.visitors.toLocaleString(), 
      icon: Users, 
      color: 'bg-orange-500' 
    },
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.first_name || user?.username}!
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening with your portfolio
              </p>
            </div>
            
              <a href={`/${user?.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Eye className="h-4 w-4" />
              View Portfolio
            </a>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                  <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/portfolio"
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <LayoutDashboard className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Edit Portfolio</h3>
            </Link>

            <Link
              to="/projects"
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Add Project</h3>
            </Link>

            <Link
              to="/blog"
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Write Post</h3>
            </Link>

            <Link
              to="/settings"
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
                <Settings className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Settings</h3>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 bg-${activity.color}-500 rounded-full mt-2`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent activity yet</p>
              <p className="text-sm text-gray-400 mt-2">Start by creating your portfolio or adding projects!</p>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  )
}

export default Dashboard