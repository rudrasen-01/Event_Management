import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Eye, FileText, Save, X, 
  Image as ImageIcon, Send, Clock, Tag
} from 'lucide-react';
import axios from 'axios';

/**
 * VendorBlogManager Component
 * LinkedIn-style blog/post management
 * Create, edit, publish, delete blogs
 */
const VendorBlogManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBlog, setEditingBlog] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/vendor-profile/dashboard/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('vendorToken')}`
        }
      });

      if (response.data.success) {
        setBlogs(response.data.data.blogs);
      }
    } catch (error) {
      console.error('Fetch blogs error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingBlog(null);
    setFormData({ title: '', content: '', tags: '', status: 'draft' });
    setShowEditor(true);
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      tags: blog.tags?.join(', ') || '',
      status: blog.status
    });
    setShowEditor(true);
  };

  const handleSave = async () => {
    try {
      const blogData = {
        title: formData.title,
        content: formData.content,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        status: formData.status
      };

      let response;
      if (editingBlog) {
        response = await axios.put(
          `/api/vendor-profile/blogs/${editingBlog._id}`,
          blogData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('vendorToken')}`
            }
          }
        );
      } else {
        response = await axios.post(
          '/api/vendor-profile/blogs',
          blogData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('vendorToken')}`
            }
          }
        );
      }

      if (response.data.success) {
        alert(editingBlog ? 'Blog updated successfully!' : 'Blog created successfully!');
        fetchBlogs();
        setShowEditor(false);
      }
    } catch (error) {
      console.error('Save blog error:', error);
      alert('Failed to save blog');
    }
  };

  const handleDelete = async (blogId) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      await axios.delete(`/api/vendor-profile/blogs/${blogId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('vendorToken')}`
        }
      });

      setBlogs(blogs.filter(b => b._id !== blogId));
      alert('Blog deleted successfully');
    } catch (error) {
      console.error('Delete blog error:', error);
      alert('Failed to delete blog');
    }
  };

  const handlePublish = async (blogId) => {
    try {
      const response = await axios.patch(
        `/api/vendor-profile/blogs/${blogId}/publish`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('vendorToken')}`
          }
        }
      );

      if (response.data.success) {
        alert('Blog published successfully!');
        fetchBlogs();
      }
    } catch (error) {
      console.error('Publish blog error:', error);
      alert('Failed to publish blog');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Blog Posts</h2>
          <p className="text-sm text-gray-600">Share your expertise and stories</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Blog Post
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading blogs...</p>
        </div>
      ) : (
        <>
          {blogs.length > 0 ? (
            <div className="space-y-4">
              {blogs.map((blog) => (
                <div key={blog._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{blog.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(blog.status)}`}>
                          {blog.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">{blog.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{blog.metadata?.readTime || 0} min read</span>
                        </div>
                        {blog.tags && blog.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            <span>{blog.tags.length} tags</span>
                          </div>
                        )}
                        {blog.publishedAt && (
                          <span>Published: {new Date(blog.publishedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(blog)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5 text-gray-600" />
                      </button>
                      {blog.status === 'draft' && (
                        <button
                          onClick={() => handlePublish(blog._id)}
                          className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                          title="Publish"
                        >
                          <Send className="w-5 h-5 text-green-600" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No blog posts yet</h3>
              <p className="text-gray-600 mb-4">Share your expertise and connect with customers</p>
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-5 h-5" />
                Create Your First Post
              </button>
            </div>
          )}
        </>
      )}

      {/* Blog Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
              </h3>
              <button
                onClick={() => setShowEditor(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Blog Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter an engaging title..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your blog content here..."
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.content.split(/\s+/).filter(Boolean).length} words
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., wedding, photography, tips"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setFormData({ ...formData, status: 'draft' });
                    handleSave();
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => {
                    setFormData({ ...formData, status: 'published' });
                    handleSave();
                  }}
                  disabled={!formData.title || !formData.content}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Publish Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorBlogManager;
