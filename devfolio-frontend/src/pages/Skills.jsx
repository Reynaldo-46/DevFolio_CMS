import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import { portfolioAPI } from '../services/api'
import { Plus, X, Save, Trash2, Edit2, Award } from 'lucide-react'
import toast from 'react-hot-toast'

const Skills = () => {
  const { user } = useAuth()
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSkill, setEditingSkill] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'frontend',
    proficiency: 50,
    display_order: 0
  })

  const categories = [
    { value: 'frontend', label: 'Frontend', color: 'blue' },
    { value: 'backend', label: 'Backend', color: 'green' },
    { value: 'mobile', label: 'Mobile', color: 'purple' },
    { value: 'database', label: 'Database', color: 'yellow' },
    { value: 'devops', label: 'DevOps', color: 'red' },
    { value: 'design', label: 'Design', color: 'pink' },
    { value: 'other', label: 'Other', color: 'gray' }
  ]

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      const response = await portfolioAPI.getSkills()
      console.log('Skills response:', response.data)
      
      // Handle both paginated and non-paginated responses
      const skillsData = response.data.results 
        ? response.data.results  // Paginated response
        : Array.isArray(response.data) 
          ? response.data  // Array response
          : []
      
      console.log('Parsed skills data:', skillsData)
      setSkills(skillsData)
    } catch (error) {
      console.error('Failed to fetch skills:', error)
      console.error('Error details:', error.response?.data)
      if (error.response?.status === 404) {
        setSkills([])
      } else {
        setSkills([])
        toast.error('Failed to load skills')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingSkill) {
        await portfolioAPI.updateSkill(editingSkill.id, formData)
        toast.success('Skill updated successfully!')
      } else {
        await portfolioAPI.createSkill(formData)
        toast.success('Skill added successfully!')
      }
      setShowModal(false)
      resetForm()
      fetchSkills()
    } catch (error) {
      console.error('Save skill error:', error.response?.data)
      const errorMsg = error.response?.data?.detail 
        || error.response?.data?.message 
        || JSON.stringify(error.response?.data)
        || 'Failed to save skill'
      toast.error(errorMsg)
    }
  }

  const handleEdit = (skill) => {
    setEditingSkill(skill)
    setFormData({
      name: skill.name || '',
      category: skill.category || 'frontend',
      proficiency_level: skill.proficiency_level || 50,
      display_order: skill.display_order || 0
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return
    
    try {
      await portfolioAPI.deleteSkill(id)
      toast.success('Skill deleted successfully!')
      fetchSkills()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete skill')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'frontend',
      proficiency_level: 50,
      display_order: 0
    })
    setEditingSkill(null)
  }

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.value === category)
    return cat ? cat.color : 'gray'
  }

  const getCategoryBgClass = (color) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      pink: 'bg-pink-500',
      gray: 'bg-gray-500'
    }
    return colors[color] || 'bg-gray-500'
  }

  const getCategoryTextClass = (color) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-50',
      green: 'text-green-600 bg-green-50',
      purple: 'text-purple-600 bg-purple-50',
      yellow: 'text-yellow-600 bg-yellow-50',
      red: 'text-red-600 bg-red-50',
      pink: 'text-pink-600 bg-pink-50',
      gray: 'text-gray-600 bg-gray-50'
    }
    return colors[color] || 'text-gray-600 bg-gray-50'
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Skills</h1>
            <p className="text-gray-600 mt-2">Manage your technical skills and expertise</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5" />
            Add Skill
          </button>
        </div>

        {skills.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No Skills Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start by adding your technical skills and expertise
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Your First Skill
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill) => {
              const color = getCategoryColor(skill.category)
              return (
                <div key={skill.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {skill.name}
                      </h3>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded capitalize ${getCategoryTextClass(color)}`}>
                        {skill.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(skill)}
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(skill.id)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Proficiency</span>
                      <span className="font-semibold">{skill.proficiency_level}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${getCategoryBgClass(color)}`}
                        style={{ width: `${skill.proficiency_level}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingSkill ? 'Edit Skill' : 'Add New Skill'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skill Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., React, Python, AWS"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proficiency Level: {formData.proficiency_level}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.proficiency_level}
                    onChange={(e) => setFormData({ ...formData, proficiency_level: parseInt(e.target.value) })}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Beginner</span>
                    <span>Intermediate</span>
                    <span>Expert</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lower numbers appear first
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    className="px-6 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    {editingSkill ? 'Update' : 'Add'} Skill
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Skills