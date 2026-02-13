import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, MapPin, Verified, Phone, Mail, Globe, Calendar, 
  Image as ImageIcon, Video, FileText, ChevronRight, Award,
  Heart, Share2, Send, Play, ExternalLink, Clock, AlertTriangle,
  X, Check, Building2, Users, TrendingUp, Shield
} from 'lucide-react';
import axios from 'axios';
import InquiryModal from '../components/InquiryModal';

/**
 * VendorProfilePage - Professional Instagram + LinkedIn Style
 * Fully dynamic, database-driven vendor profile
 * Beautiful, modern, and professional design
 */
const VendorProfilePage = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('gallery');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);

  useEffect(() => {
    if (vendorId) {
      fetchVendorProfile();
    }
  }, [vendorId]);

  const fetchVendorProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/vendor-profile/${vendorId}`);
      
      if (response.data.success && response.data.data) {
        setProfile(response.data.data);
      } else {
        setError('Vendor profile not found');
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
      setError(err.response?.data?.message || 'Failed to load vendor profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInquiry = () => {
    setShowInquiryModal(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: profile.vendor.businessName,
        text: `Check out ${profile.vendor.businessName} on AIS Events`,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vendor profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Available</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/search')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Browse Vendors
          </button>
        </div>
      </div>
    );
  }

  const { vendor, media, blogs, videos, reviews, stats } = profile;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Cover Image / Banner */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYweiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-30"></div>
      </div>

      {/* Profile Header Section */}
      <div className="bg-white shadow-lg -mt-20 relative z-10">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Profile Picture / Logo */}
            <div className="flex-shrink-0 -mt-16 md:-mt-20">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-5xl md:text-6xl font-bold shadow-2xl border-4 border-white">
                {vendor.businessName.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Vendor Info */}
            <div className="flex-1 md:mt-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                      {vendor.businessName}
                    </h1>
                    {vendor.verified && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                        <Shield className="w-4 h-4" />
                        <span className="text-xs font-semibold">Verified</span>
                      </div>
                    )}
                    {vendor.planType === 'premium' && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-md">
                        <Award className="w-4 h-4" />
                        <span className="text-xs font-semibold">Premium Partner</span>
                      </div>
                    )}
                  </div>

                  <p className="text-lg text-gray-600 mb-3 capitalize">{vendor.serviceType.replace(/-/g, ' ')}</p>

                  {/* Location & Experience */}
                  <div className="flex flex-wrap gap-4 mb-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-5 h-5 text-indigo-600" />
                      <span className="font-medium">{vendor.area ? `${vendor.area}, ${vendor.city}` : vendor.city}</span>
                    </div>
                    {vendor.yearsInBusiness > 0 && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="font-medium">{vendor.yearsInBusiness}+ Years Experience</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats Cards - Desktop */}
                <div className="hidden md:flex gap-4">
                  <div className="text-center px-4 py-2 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <div className="text-2xl font-bold text-indigo-600">{stats.totalMedia}</div>
                    <div className="text-xs text-gray-600">Portfolio</div>
                  </div>
                  <div className="text-center px-4 py-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <div className="text-2xl font-bold text-green-600">{stats.totalReviews}</div>
                    <div className="text-xs text-gray-600">Reviews</div>
                  </div>
                  <div className="text-center px-4 py-2 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-100">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="text-2xl font-bold text-yellow-600">{stats.avgRating}</span>
                    </div>
                    <div className="text-xs text-gray-600">Rating</div>
                  </div>
                </div>
              </div>

              {/* Mobile Stats */}
              <div className="md:hidden flex gap-3 mb-4">
                <div className="flex-1 text-center py-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                  <div className="text-xl font-bold text-indigo-600">{stats.totalMedia}</div>
                  <div className="text-xs text-gray-600">Posts</div>
                </div>
                <div className="flex-1 text-center py-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <div className="text-xl font-bold text-green-600">{stats.totalReviews}</div>
                  <div className="text-xs text-gray-600">Reviews</div>
                </div>
                <div className="flex-1 text-center py-3 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-xl font-bold text-yellow-600">{stats.avgRating}</span>
                  </div>
                  <div className="text-xs text-gray-600">Rating</div>
                </div>
              </div>

              {/* Description */}
              {vendor.description && (
                <p className="text-gray-700 mb-4 leading-relaxed max-w-3xl">{vendor.description}</p>
              )}

              {/* Pricing */}
              {vendor.pricing?.min && vendor.pricing?.max && (
                <div className="mb-5">
                  <div className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-sm">
                    <Building2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-semibold text-gray-700">Starting from</span>
                    <span className="text-xl font-bold text-green-700">
                      ₹{(vendor.pricing.min / 1000).toFixed(0)}K - ₹{(vendor.pricing.max / 1000).toFixed(0)}K
                    </span>
                    <span className="text-sm text-gray-600">{vendor.pricing.unit || 'per event'}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSendInquiry}
                  className="flex-1 md:flex-none px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Inquiry
                </button>
                <button 
                  onClick={handleShare}
                  className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  title="Share Profile"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowContactInfo(!showContactInfo)}
                  className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  title="Show Contact"
                >
                  <Phone className="w-5 h-5" />
                </button>
              </div>
              
              {/* Contact Info (Toggle) */}
              {showContactInfo && vendor.contact && (
                <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-indigo-600" />
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    {vendor.contact.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-600" />
                        <a href={`tel:${vendor.contact.phone}`} className="text-indigo-600 hover:text-indigo-700 font-medium">
                          {vendor.contact.phone}
                        </a>
                      </div>
                    )}
                    {vendor.contact.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <a href={`mailto:${vendor.contact.email}`} className="text-indigo-600 hover:text-indigo-700 font-medium">
                          {vendor.contact.email}
                        </a>
                      </div>
                    )}
                    {vendor.contact.whatsapp && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-600" />
                        <a 
                          href={`https://wa.me/${vendor.contact.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 font-medium flex items-center gap-2"
                        >
                          WhatsApp: {vendor.contact.whatsapp}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-20 backdrop-blur-sm bg-white/95">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-4 md:gap-8 overflow-x-auto scrollbar-hide">
            {[
              { id: 'gallery', label: 'Portfolio', icon: ImageIcon, count: stats.totalMedia },
              { id: 'videos', label: 'Videos', icon: Video, count: stats.totalVideos },
              { id: 'blogs', label: 'Blog Posts', icon: FileText, count: stats.totalBlogs },
              { id: 'reviews', label: 'Reviews', icon: Star, count: stats.totalReviews }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 border-b-3 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 font-semibold'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-indigo-600' : ''}`} />
                <span className="font-medium">{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div>
            {media.length > 0 ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Gallery</h2>
                  <p className="text-gray-600">Browse through our work and get inspired</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {media.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedMedia(item)}
                      className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform group relative bg-gray-100 shadow-md hover:shadow-2xl"
                    >
                      <img
                        src={item.url}
                        alt={item.caption || 'Portfolio image'}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.caption && (
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <p className="text-white text-sm font-medium">{item.caption}</p>
                          </div>
                        )}
                      </div>
                      {item.isFeatured && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
                          <Award className="w-3 h-3" />
                          Featured
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Images Yet</h3>
                  <p className="text-gray-600">This vendor hasn't uploaded any portfolio images yet.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div>
            {videos.length > 0 ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Video Showcase</h2>
                  <p className="text-gray-600">Watch our work in action</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video) => (
                    <div key={video.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
                      <div className="relative aspect-video bg-gray-900">
                        <img
                          src={video.thumbnail || video.videoUrl}
                          alt={video.title}
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center hover:bg-white cursor-pointer shadow-xl hover:scale-110 transform transition-all">
                            <Play className="w-8 h-8 text-indigo-600 ml-1" />
                          </div>
                        </div>
                        {video.duration && (
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2.5 py-1 rounded-md text-xs font-medium">
                            {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 mb-2 text-lg">{video.title}</h3>
                        {video.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Videos Yet</h3>
                  <p className="text-gray-600">This vendor hasn't uploaded any videos yet.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Blogs Tab */}
        {activeTab === 'blogs' && (
          <div>
            {blogs.length > 0 ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Latest Articles & Insights</h2>
                  <p className="text-gray-600">Read our blog posts and industry insights</p>
                </div>
                <div className="space-y-6">
                  {blogs.map((blog) => (
                    <div key={blog.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden transform hover:-translate-y-1">
                      <div className="flex flex-col md:flex-row">
                        {blog.coverImage && (
                          <div className="md:w-1/3 h-56 md:h-auto">
                            <img
                              src={blog.coverImage}
                              alt={blog.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 p-6">
                      <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{blog.readTime} min read</span>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-3">{blog.title}</h2>
                      <p className="text-gray-600 mb-4">{blog.excerpt}</p>
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {blog.tags.map((tag, idx) => (
                            <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <button className="flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700">
                        Read More <ChevronRight className="w-4 h-4" />
                      </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Blog Posts Yet</h3>
                  <p className="text-gray-600">This vendor hasn't published any blog posts yet.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            {reviews.length > 0 ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
                  <p className="text-gray-600">See what our clients say about us</p>
                </div>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {review.userName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            {review.isVerified && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{review.comment}</p>
                      {review.vendorResponse && (
                        <div className="mt-3 pl-4 border-l-2 border-indigo-200 bg-indigo-50 p-3 rounded">
                          <p className="text-sm font-semibold text-gray-900 mb-1">Vendor Response:</p>
                          <p className="text-sm text-gray-700">{review.vendorResponse.comment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
                  <p className="text-gray-600">Be the first to review this vendor!</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Inquiry Button (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
        <button
          onClick={handleSendInquiry}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          Send Inquiry Now
        </button>
      </div>

      {/* Media Lightbox */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="max-w-5xl max-h-full">
            <img
              src={selectedMedia.url}
              alt={selectedMedia.caption}
              className="max-w-full max-h-screen object-contain"
            />
            {selectedMedia.caption && (
              <p className="text-white text-center mt-4 text-lg">{selectedMedia.caption}</p>
            )}
          </div>
          <button
            onClick={() => setSelectedMedia(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
      )}

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <InquiryModal
          isOpen={showInquiryModal}
          onClose={() => setShowInquiryModal(false)}
          vendor={{
            _id: vendor.id,
            businessName: vendor.businessName,
            serviceType: vendor.serviceType,
            city: vendor.city,
            contact: vendor.contact,
            pricing: vendor.pricing
          }}
        />
      )}
    </div>
  );
};

export default VendorProfilePage;
