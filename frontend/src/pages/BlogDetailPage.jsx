import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, Eye, Clock, ChevronLeft, Share2, 
  Facebook, Twitter, Linkedin, Mail, Tag, User,
  BookOpen, Loader, ArrowRight
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { getBlogBySlug } from '../services/blogService';

const BlogDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBlog();
    window.scrollTo(0, 0);
  }, [slug]);

  const loadBlog = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getBlogBySlug(slug);
      setBlog(response.data?.blog || response.blog);
      setRelatedBlogs(response.data?.relatedBlogs || response.relatedBlogs || []);
    } catch (err) {
      console.error('Error loading blog:', err);
      setError('Blog not found');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = blog?.title;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Blog Not Found</h2>
          <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{blog.metaTitle || blog.title}</title>
        <meta name="description" content={blog.metaDescription || blog.excerpt} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.excerpt} />
        <meta property="og:image" content={blog.featuredImage} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={blog.excerpt} />
        <meta name="twitter:image" content={blog.featuredImage} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Back Button */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <button
            onClick={() => navigate('/blogs')}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Blogs
          </button>
        </div>

        {/* Blog Header */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Category Badge */}
          {blog.category && (
            <div className="mb-6">
              <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold">
                {blog.category}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {blog.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8 pb-8 border-b border-gray-200">
            {/* Author */}
            {blog.author && (
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="font-medium">{blog.author.name || 'Admin'}</span>
              </div>
            )}

            {/* Published Date */}
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>
                {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>

            {/* Read Time */}
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{blog.readTime} min read</span>
            </div>

            {/* Views */}
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              <span>{blog.views || 0} views</span>
            </div>
          </div>

          {/* Featured Image */}
          {blog.featuredImage && (
            <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={blog.featuredImage}
                alt={blog.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Excerpt */}
          <div className="mb-8">
            <p className="text-xl text-gray-700 leading-relaxed font-medium">
              {blog.excerpt}
            </p>
          </div>

          {/* Share Buttons */}
          <div className="flex items-center gap-4 mb-12 pb-8 border-b border-gray-200">
            <span className="text-gray-600 font-medium flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share:
            </span>
            <button
              onClick={() => handleShare('facebook')}
              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
              title="Share on Facebook"
            >
              <Facebook className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleShare('twitter')}
              className="p-2 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 transition-colors"
              title="Share on Twitter"
            >
              <Twitter className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleShare('linkedin')}
              className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
              title="Share on LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleShare('email')}
              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              title="Share via Email"
            >
              <Mail className="w-5 h-5" />
            </button>
          </div>

          {/* Blog Content */}
          <div className="prose prose-lg max-w-none mb-12">
            <div 
              className="text-gray-800 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 pt-8 border-t border-gray-200">
              <Tag className="w-5 h-5 text-gray-500" />
              {blog.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/blogs?tag=${encodeURIComponent(tag)}`}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </article>

        {/* Related Blogs */}
        {relatedBlogs && relatedBlogs.length > 0 && (
          <div className="bg-gray-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 mb-8">
                <BookOpen className="w-6 h-6 text-indigo-600" />
                <h2 className="text-3xl font-bold text-gray-900">Related Articles</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedBlogs.slice(0, 3).map((relatedBlog) => (
                  <Link
                    key={relatedBlog._id}
                    to={`/blogs/${relatedBlog.slug}`}
                    className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    {relatedBlog.featuredImage && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={relatedBlog.featuredImage}
                          alt={relatedBlog.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {relatedBlog.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {relatedBlog.excerpt}
                      </p>
                      <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm group-hover:gap-4 transition-all">
                        <span>Read More</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Plan Your Perfect Event?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Discover the best event vendors and make your celebration unforgettable
            </p>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-xl"
            >
              Start Planning
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetailPage;
