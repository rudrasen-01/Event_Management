import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, Calendar, Eye, Clock, ChevronRight, 
  Filter, Tag, BookOpen, TrendingUp, Loader 
} from 'lucide-react';
import { fetchPublishedBlogs, getBlogCategories, getBlogTags } from '../services/blogService';

// Helper to safely get image URL from featuredImage (handles both string and object)
const getImageUrl = (featuredImage) => {
  if (typeof featuredImage === 'string') return featuredImage;
  if (typeof featuredImage === 'object' && featuredImage?.url) return featuredImage.url;
  return 'https://via.placeholder.com/800x400?text=No+Image';
};

const BlogListingPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || 'all');

  useEffect(() => {
    loadBlogs();
    loadFilters();
  }, [selectedCategory, selectedTag, pagination.page]);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 9
      };
      
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedTag !== 'all') params.tag = selectedTag;

      const response = await fetchPublishedBlogs(params);
      
      // Backend returns {data: [blogs], pagination: {...}} after response interceptor
      setBlogs(response.data || []);
      setPagination({
        page: response.pagination?.page || 1,
        totalPages: response.pagination?.pages || 1,
        total: response.pagination?.total || 0
      });
    } catch (error) {
      console.error('Error loading blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        getBlogCategories(),
        getBlogTags()
      ]);
      setCategories(categoriesRes.data || categoriesRes || []);
      setTags(tagsRes.data || tagsRes || []);
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPagination({ ...pagination, page: 1 });
    if (category !== 'all') {
      searchParams.set('category', category);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  const handleTagChange = (tag) => {
    setSelectedTag(tag);
    setPagination({ ...pagination, page: 1 });
    if (tag !== 'all') {
      searchParams.set('tag', tag);
    } else {
      searchParams.delete('tag');
    }
    setSearchParams(searchParams);
  };

  const filteredBlogs = blogs.filter(blog =>
    searchTerm === '' ||
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="w-12 h-12" />
              <h1 className="text-5xl font-bold">Event Planning Blog</h1>
            </div>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Expert tips, trends, and inspiration for your perfect event
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-12">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search Bar */}
            <div className="flex-1 min-w-[280px]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => {
                // Handle both string and object formats
                const categoryValue = typeof category === 'string' ? category : category.name;
                return (
                  <option key={categoryValue} value={categoryValue}>
                    {categoryValue}
                  </option>
                );
              })}
            </select>

            {/* Tag Filter */}
            <select
              value={selectedTag}
              onChange={(e) => handleTagChange(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
            >
              <option value="all">All Tags</option>
              {tags.map((tag) => {
                // Tags are objects with {name, count}
                const tagValue = typeof tag === 'string' ? tag : tag.name;
                const tagDisplay = typeof tag === 'object' ? `${tag.name} (${tag.count})` : tag;
                return (
                  <option key={tagValue} value={tagValue}>
                    {tagDisplay}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Active Filters */}
          {(selectedCategory !== 'all' || selectedTag !== 'all') && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 font-medium">Active filters:</span>
              {selectedCategory !== 'all' && (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  {selectedCategory}
                </span>
              )}
              {selectedTag !== 'all' && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {selectedTag}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Blog Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-12 h-12 animate-spin text-indigo-600" />
          </div>
        ) : filteredBlogs.length > 0 ? (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing <span className="font-bold text-gray-900">{filteredBlogs.length}</span> of{' '}
                <span className="font-bold text-gray-900">{pagination.total}</span> blogs
              </p>
            </div>

            {/* Blog Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog) => (
                <Link
                  key={blog._id}
                  to={`/blogs/${blog.slug}`}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  {/* Featured Image */}
                  {blog.featuredImage && (
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={getImageUrl(blog.featuredImage)}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-indigo-600 rounded-full text-sm font-bold">
                          {blog.category || 'Uncategorized'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {blog.excerpt}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{blog.readTime} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{blog.views || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {blog.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Read More */}
                    <div className="flex items-center gap-2 text-indigo-600 font-semibold group-hover:gap-4 transition-all">
                      <span>Read More</span>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:border-indigo-600 hover:text-indigo-600 transition-colors"
                >
                  Previous
                </button>
                
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPagination({ ...pagination, page: i + 1 })}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      pagination.page === i + 1
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border-2 border-gray-200 hover:border-indigo-600 hover:text-indigo-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setPagination({ ...pagination, page: Math.min(pagination.totalPages, pagination.page + 1) })}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:border-indigo-600 hover:text-indigo-600 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No blogs found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogListingPage;
