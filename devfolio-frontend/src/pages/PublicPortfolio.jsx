import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { portfolioAPI, projectsAPI, blogAPI } from "../services/api";
import {
  Mail,
  MapPin,
  Globe,
  Github,
  Linkedin,
  Twitter,
  Facebook,
  ExternalLink,
  Calendar,
  Clock,
  ArrowLeft,
  X,
  Send,
  ChevronDown,
  ChevronUp,
  Share2,
  Download,
  Filter,
  Moon,
  Sun
} from "lucide-react";
import toast from "react-hot-toast";

const PublicPortfolio = () => {
  const { username } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [projects, setProjects] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedProject, setExpandedProject] = useState(null);
  const [expandedPost, setExpandedPost] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [darkMode, setDarkMode] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  useEffect(() => {
    fetchPortfolioData();
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
  }, [username]);

  useEffect(() => {
    // Apply dark mode class to body
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const fetchPortfolioData = async () => {
    try {
      const portfolioResponse = await portfolioAPI.getByUsername(username);
      setPortfolio(portfolioResponse.data);

      const projectsResponse = await projectsAPI.getAll(username);
      const projectsData = Array.isArray(projectsResponse.data)
        ? projectsResponse.data
        : projectsResponse.data.results || [];
      setProjects(projectsData);

      const blogResponse = await blogAPI.getAll({
        author: username,
        status: "published"
      });
      const blogData = Array.isArray(blogResponse.data)
        ? blogResponse.data
        : blogResponse.data.results || [];
      setBlogPosts(blogData);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      setError("Portfolio not found or not published");
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    console.log("Contact form submitted:", contactForm);
    toast.success("Message sent successfully!");
    setShowContactModal(false);
    setContactForm({ name: "", email: "", subject: "", message: "" });
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = `Check out ${portfolio.title}`;

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url
      )}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url
      )}`,
      copy: url
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } else {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // If it's already a full URL, return as is
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // Otherwise, construct full URL
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
    return `${API_BASE.replace("/api", "")}${imagePath}`;
  };

  const generateResume = () => {
    // Create resume HTML
    const resumeContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${portfolio.title} - Resume</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; }
          h1 { color: ${portfolio.primary_color}; margin-bottom: 5px; }
          h2 { color: ${portfolio.primary_color}; border-bottom: 2px solid ${
      portfolio.primary_color
    }; padding-bottom: 5px; margin-top: 30px; }
          .tagline { color: #666; font-size: 18px; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .item { margin-bottom: 15px; }
          .item-title { font-weight: bold; }
          .item-subtitle { color: #666; font-style: italic; }
          .skills { display: flex; flex-wrap: wrap; gap: 10px; }
          .skill-tag { background: ${portfolio.primary_color}20; color: ${
      portfolio.primary_color
    }; padding: 5px 10px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>${portfolio.title}</h1>
        <p class="tagline">${portfolio.tagline || ""}</p>
        <p>${portfolio.bio || ""}</p>
        
        <h2>Skills</h2>
        <div class="skills">
          ${
            portfolio.skills
              ?.map((s) => `<span class="skill-tag">${s.name}</span>`)
              .join("") || ""
          }
        </div>
        
        <h2>Experience</h2>
        ${
          portfolio.experiences
            ?.map(
              (exp) => `
          <div class="item">
            <div class="item-title">${exp.position} at ${exp.company}</div>
            <div class="item-subtitle">${exp.location || ""} | ${new Date(
                exp.start_date
              ).getFullYear()} - ${
                exp.is_current
                  ? "Present"
                  : new Date(exp.end_date).getFullYear()
              }</div>
            <p>${exp.description || ""}</p>
          </div>
        `
            )
            .join("") || ""
        }
        
        <h2>Projects</h2>
        ${projects
          .slice(0, 5)
          .map(
            (proj) => `
          <div class="item">
            <div class="item-title">${proj.title}</div>
            <p>${proj.short_description || proj.description}</p>
            <p><strong>Tech:</strong> ${proj.tech_stack?.join(", ") || ""}</p>
          </div>
        `
          )
          .join("")}
        
        <h2>Education</h2>
        ${
          portfolio.education
            ?.map(
              (edu) => `
          <div class="item">
            <div class="item-title">${edu.degree} in ${edu.field_of_study}</div>
            <div class="item-subtitle">${edu.institution} | ${new Date(
                edu.start_date
              ).getFullYear()} - ${
                edu.end_date ? new Date(edu.end_date).getFullYear() : "Present"
              }</div>
          </div>
        `
            )
            .join("") || ""
        }
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([resumeContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${username}_resume.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Resume downloaded!");
  };

  const getSocialIcon = (platform) => {
    const icons = {
      github: <Github className="h-5 w-5" />,
      linkedin: <Linkedin className="h-5 w-5" />,
      twitter: <Twitter className="h-5 w-5" />
    };
    return icons[platform] || <Globe className="h-5 w-5" />;
  };

  // Get unique categories from projects
  const categories = [
    "all",
    ...new Set(projects.map((p) => p.status).filter(Boolean))
  ];

  const filteredProjects =
    selectedCategory === "all"
      ? projects
      : projects.filter((p) => p.status === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Portfolio Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            This portfolio doesn't exist or hasn't been published yet.
          </p>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse Other Portfolios
          </Link>
        </div>
      </div>
    );
  }

  const primaryColor = portfolio.primary_color || "#3B82F6";

  return (
    <div
      className={`min-h-screen ${darkMode ? "dark bg-gray-900" : "bg-gray-50"}`}
    >
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              to="/browse"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </Link>
            <div className="flex items-center gap-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              {/* Share Button */}
              <button
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>

              {/* Download Resume */}
              <button
                onClick={generateResume}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Download className="h-4 w-4" />
                Resume
              </button>

              {/* Social Links */}
              {portfolio.social_links?.slice(0, 3).map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {getSocialIcon(link.platform)}
                </a>
              ))}

              {/* Contact Button */}
              <button
                onClick={() => setShowContactModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                <Mail className="h-4 w-4" />
                Contact
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="relative py-20 text-white overflow-hidden"
        style={{
          background: darkMode
            ? `linear-gradient(135deg, ${portfolio.primary_color}dd 0%, ${portfolio.secondary_color}dd 100%)`
            : `linear-gradient(135deg, ${portfolio.primary_color} 0%, ${portfolio.secondary_color} 100%)`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              {portfolio.user?.avatar ? (
                <img
                  src={getImageUrl(portfolio.user.avatar)}
                  alt={username}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-2xl object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-2xl bg-white bg-opacity-20 flex items-center justify-center">
                  <span className="text-6xl font-bold text-white">
                    {username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                {portfolio.title}
              </h1>
              {portfolio.tagline && (
                <p className="text-xl md:text-2xl text-blue-100 mb-4">
                  {portfolio.tagline}
                </p>
              )}
              {portfolio.bio && (
                <p className="text-lg text-blue-50 max-w-3xl">
                  {portfolio.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      {portfolio.skills && portfolio.skills.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Skills & Expertise
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {skill.name}
                    </h3>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {skill.proficiency}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${skill.proficiency}%`,
                        backgroundColor: primaryColor
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 inline-block capitalize">
                    {skill.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects Section with Filters */}
      {projects.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
                Featured Projects
              </h2>

              {/* Category Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === cat
                        ? "text-white"
                        : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    style={
                      selectedCategory === cat
                        ? { backgroundColor: primaryColor }
                        : {}
                    }
                  >
                    {cat.charAt(0).toUpperCase() +
                      cat.slice(1).replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {project.cover_image && (
                    <img
                      src={project.cover_image}
                      alt={project.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    {project.is_featured && (
                      <span className="inline-block px-2 py-1 text-xs font-medium text-yellow-600 bg-yellow-50 dark:bg-yellow-900 dark:text-yellow-300 rounded mb-2">
                        Featured
                      </span>
                    )}
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {project.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {expandedProject === project.id
                        ? project.description
                        : `${(
                            project.short_description || project.description
                          ).substring(0, 100)}...`}
                    </p>

                    {project.description.length > 100 && (
                      <button
                        onClick={() =>
                          setExpandedProject(
                            expandedProject === project.id ? null : project.id
                          )
                        }
                        className="text-sm font-medium mb-4 flex items-center gap-1"
                        style={{ color: primaryColor }}
                      >
                        {expandedProject === project.id ? (
                          <>
                            Show Less <ChevronUp className="h-4 w-4 text-gray-100" />
                          </>
                        ) : (
                          <>
                            Read More <ChevronDown className="h-4 w-4 text-gray-100" />
                          </>
                        )}
                      </button>
                    )}

                    {expandedProject === project.id &&
                      project.features &&
                      project.features.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                            Key Features:
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                            {project.features.map((feature, idx) => (
                              <li key={idx}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {project.tech_stack && project.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tech_stack.map((tech, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs font-medium rounded"
                            style={{
                              color: primaryColor,
                              backgroundColor: darkMode
                                ? `${primaryColor}30`
                                : `${primaryColor}15`
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <ExternalLink className="h-4 w-4" />
                          Live Demo
                        </a>
                      )}
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Github className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Experience Section */}
      {portfolio.experiences && portfolio.experiences.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Work Experience
            </h2>
            <div className="space-y-8 max-w-3xl mx-auto">
              {portfolio.experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="relative pl-8 border-l-2 border-gray-200 dark:border-gray-600"
                >
                  <div
                    className="absolute left-0 top-0 w-4 h-4 rounded-full -ml-2"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {exp.position}
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    {exp.company}
                  </p>
                  {exp.location && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4" />
                      {exp.location}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(exp.start_date).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric"
                    })}
                    {" - "}
                    {exp.is_current
                      ? "Present"
                      : new Date(exp.end_date).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric"
                        })}
                  </p>
                  {exp.description && (
                    <p className="text-gray-600 dark:text-gray-300 mt-3">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog Section */}
      {blogPosts.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Latest Blog Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.slice(0, 6).map((post) => (
                <div
                  key={post.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {post.cover_image && (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {post.title}
                    </h3>

                    {post.excerpt && (
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {expandedPost === post.id
                          ? post.excerpt
                          : `${post.excerpt.substring(0, 120)}...`}
                      </p>
                    )}

                    {post.excerpt && post.excerpt.length > 120 && (
                      <button
                        onClick={() =>
                          setExpandedPost(
                            expandedPost === post.id ? null : post.id
                          )
                        }
                        className="text-sm font-medium mb-4 flex items-center gap-1"
                        style={{ color: primaryColor }}
                      >
                        {expandedPost === post.id ? (
                          <>
                            Show Less <ChevronUp className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Read More <ChevronDown className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {post.reading_time} min read
                      </span>
                      <span>
                        {new Date(post.published_at).toLocaleDateString()}
                      </span>
                    </div>

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900 rounded"
                          >
                            {tag.name || tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer
        className="text-white py-16"
        style={{
          background: darkMode
            ? `linear-gradient(135deg, ${portfolio.secondary_color}dd 0%, ${portfolio.primary_color}dd 100%)`
            : `linear-gradient(135deg, ${portfolio.secondary_color} 0%, ${portfolio.primary_color} 100%)`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Let's Work Together</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Have a project in mind? Let's discuss how we can work together to
            bring your ideas to life.
          </p>

          <button
            onClick={() => setShowContactModal(true)}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg text-lg font-medium bg-white hover:bg-gray-50 transition-colors shadow-lg mb-8"
            style={{ color: primaryColor }}
          >
            <Mail className="h-5 w-5" />
            Get In Touch
          </button>

          <div className="flex justify-center gap-6 mb-8">
            {portfolio.social_links?.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-100 hover:text-white transition-colors"
              >
                {getSocialIcon(link.platform)}
              </a>
            ))}
          </div>

          <p className="text-blue-200 text-sm">
            © {new Date().getFullYear()} {username}. Built with DevFolio.
          </p>
        </div>
      </footer>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Contact Me
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Your Email *
                </label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.subject}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, subject: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Project Collaboration"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message *
                </label>
                <textarea
                  required
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell me about your project..."
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                <Send className="h-4 w-4" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Share Portfolio
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleShare("twitter")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Twitter className="h-5 w-5 text-blue-400" />
                Share on Twitter
              </button>

              <button
                onClick={() => handleShare("linkedin")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Linkedin className="h-5 w-5 text-blue-600" />
                Share on LinkedIn
              </button>

              <button
                onClick={() => handleShare("facebook")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Facebook className="h-5 w-5 text-blue-700" />
                Share on Facebook
              </button>

              <button
                onClick={() => handleShare("copy")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Share2 className="h-5 w-5" />
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicPortfolio;
