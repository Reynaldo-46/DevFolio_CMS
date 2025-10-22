import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Search, User, Eye, ArrowRight, Home } from 'lucide-react'

const BrowsePortfolios = () => {
  const [portfolios, setPortfolios] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPortfolios()
  }, [])

  const fetchPortfolios = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
      const response = await axios.get(`${API_URL}/portfolios/`)
      const portfoliosData = Array.isArray(response.data)
        ? response.data
        : response.data.results || []
      setPortfolios(portfoliosData)
    } catch (error) {
      console.error('Error fetching portfolios:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPortfolios = portfolios.filter(portfolio =>
    portfolio.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    portfolio.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    portfolio.tagline?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <Home className="h-6 w-6 text-blue-600" />
              DevFolio
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Discover Amazing Developer Portfolios
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Browse through portfolios from talented developers around the world
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, skills, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-12">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{portfolios.length}</p>
              <p className="text-gray-600">Portfolios</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{portfolios.length}</p>
              <p className="text-gray-600">Developers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolios Grid */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {filteredPortfolios.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                No portfolios found
              </h2>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search' : 'Be the first to create a portfolio!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPortfolios.map((portfolio) => (
                <Link
                  key={portfolio.id}
                  to={`/${portfolio.username}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Header with gradient */}
                  <div 
                    className="h-32 relative"
                    style={{
                      background: `linear-gradient(135deg, ${portfolio.primary_color || '#3B82F6'} 0%, ${portfolio.secondary_color || '#1E40AF'} 100%)`
                    }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-0 transition-all" />
                  </div>

                  {/* Content */}
                  <div className="p-6 -mt-8 relative">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center mb-4">
                      <User className="h-8 w-8 text-gray-600" />
                    </div>

                    {/* Info */}
                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {portfolio.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">@{portfolio.username}</p>
                    
                    {portfolio.tagline && (
                      <p className="text-gray-700 mb-4 line-clamp-2">
                        {portfolio.tagline}
                      </p>
                    )}

                    {/* Skills Preview */}
                    {portfolio.skills && portfolio.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {portfolio.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill.id}
                            className="px-2 py-1 text-xs font-medium rounded"
                            style={{
                              color: portfolio.primary_color || '#3B82F6',
                              backgroundColor: `${portfolio.primary_color || '#3B82F6'}15`
                            }}
                          >
                            {skill.name}
                          </span>
                        ))}
                        {portfolio.skills.length > 3 && (
                          <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                            +{portfolio.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        View Portfolio
                      </span>
                      <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to showcase your work?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Create your professional portfolio in minutes
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg text-lg font-medium text-blue-600 bg-white hover:bg-gray-50 transition-colors shadow-lg"
          >
            Create Your Portfolio
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} DevFolio. Built with ❤️ for developers.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default BrowsePortfolios