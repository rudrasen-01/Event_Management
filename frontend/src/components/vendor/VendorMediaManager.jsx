import React, { useState, useEffect } from 'react';
import { 
  Upload, X, Star, Eye, EyeOff, Image as ImageIcon, 
  Move, Check, Sparkles, AlertCircle
} from 'lucide-react';
import axios from 'axios';

/**
 * VendorMediaManager Component
 * Instagram-style media management
 * Upload, reorder, toggle visibility, feature images
 */
const VendorMediaManager = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [limits, setLimits] = useState(null);
const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/vendor-profile/dashboard/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('vendorToken')}`
        }
      });

      if (response.data.success) {
        setMedia(response.data.data.media);
        setLimits(response.data.data.limits);
      }
    } catch (error) {
      console.error('Fetch media error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 10MB for images)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Check limits
    if (limits && limits.portfolioLimit !== -1 && media.length >= limits.portfolioLimit) {
      alert(`Portfolio limit reached. Your plan allows ${limits.portfolioLimit} images/videos.`);
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', file.type.startsWith('video/') ? 'video' : 'image');
      formData.append('caption', '');

      const response = await axios.post('/api/vendor-profile/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('vendorToken')}`
        }
      });

      if (response.data.success) {
        setMedia([...media, response.data.data]);
        alert('Media uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || 'Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (mediaId) => {
    if (!confirm('Are you sure you want to delete this media?')) return;

    try {
      await axios.delete(`/api/vendor-profile/media/${mediaId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('vendorToken')}`
        }
      });

      setMedia(media.filter(m => m._id !== mediaId));
      alert('Media deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete media');
    }
  };

  const handleToggleVisibility = async (mediaId) => {
    try {
      const response = await axios.patch(
        `/api/vendor-profile/media/${mediaId}/toggle-visibility`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('vendorToken')}`
          }
        }
      );

      if (response.data.success) {
        setMedia(media.map(m => 
          m._id === mediaId ? response.data.data : m
        ));
      }
    } catch (error) {
      console.error('Toggle visibility error:', error);
    }
  };

  const handleToggleFeatured = async (mediaId) => {
    try {
      const response = await axios.patch(
        `/api/vendor-profile/media/${mediaId}/feature`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('vendorToken')}`
          }
        }
      );

      if (response.data.success) {
        setMedia(media.map(m => 
          m._id === mediaId ? response.data.data : m
        ));
      }
    } catch (error) {
      console.error('Toggle featured error:', error);
    }
  };

  const handleDragStart = (item) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (targetItem) => {
    if (!draggedItem || draggedItem._id === targetItem._id) return;

    const newMedia = [...media];
    const draggedIndex = newMedia.findIndex(m => m._id === draggedItem._id);
    const targetIndex = newMedia.findIndex(m => m._id === targetItem._id);

    newMedia.splice(draggedIndex, 1);
    newMedia.splice(targetIndex, 0, draggedItem);

    // Update order indexes
    const mediaOrder = newMedia.map((m, index) => ({
      mediaId: m._id,
      orderIndex: index
    }));

    setMedia(newMedia);

    try {
      await axios.put(
        '/api/vendor-profile/media/reorder',
        { mediaOrder },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('vendorToken')}`
          }
        }
      );
    } catch (error) {
      console.error('Reorder error:', error);
      fetchMedia(); // Revert on error
    }

    setDraggedItem(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Media Gallery</h2>
          <p className="text-sm text-gray-600">
            {limits && limits.portfolioLimit !== -1
              ? `${media.length} / ${limits.portfolioLimit} images uploaded`
              : `${media.length} images uploaded`
            }
          </p>
        </div>
        <label className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 cursor-pointer transition-all shadow-md hover:shadow-lg flex items-center gap-2">
          <Upload className="w-5 h-5" />
          <span>{uploading ? 'Uploading...' : 'Upload Media'}</span>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading media...</p>
        </div>
      ) : media.length > 0 ? (
        <>
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <strong>Tip:</strong> Drag and drop images to reorder them. Click icons to toggle visibility and featured status.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((item) => (
              <div
                key={item._id}
                draggable
                onDragStart={() => handleDragStart(item)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(item)}
                className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-move hover:shadow-xl transition-shadow border-2 border-transparent hover:border-indigo-300"
              >
                <img
                  src={item.url}
                  alt={item.caption}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleFeatured(item._id)}
                      className={`p-2 rounded-full ${
                        item.isFeatured ? 'bg-yellow-500' : 'bg-white'
                      } hover:scale-110 transition-transform`}
                      title="Toggle Featured"
                    >
                      <Star className={`w-5 h-5 ${item.isFeatured ? 'text-white fill-current' : 'text-gray-700'}`} />
                    </button>
                    <button
                      onClick={() => handleToggleVisibility(item._id)}
                      className="p-2 bg-white rounded-full hover:scale-110 transition-transform"
                      title="Toggle Visibility"
                    >
                      {item.visibility === 'public' ? (
                        <Eye className="w-5 h-5 text-green-600" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 bg-red-500 rounded-full hover:scale-110 transition-transform"
                      title="Delete"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 text-white text-xs">
                    <Move className="w-4 h-4" />
                    <span>Drag to reorder</span>
                  </div>
                </div>

                {/* Status badges */}
                <div className="absolute top-2 left-2 flex gap-2">
                  {item.isFeatured && (
                    <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Featured
                    </span>
                  )}
                  {item.visibility === 'hidden' && (
                    <span className="px-2 py-1 bg-gray-700 text-white text-xs font-semibold rounded-full">
                      Hidden
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No media uploaded yet</h3>
          <p className="text-gray-600 mb-4">Start building your portfolio by uploading images and videos</p>
          <label className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 cursor-pointer">
            <Upload className="w-5 h-5" />
            <span>Upload Your First Image</span>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default VendorMediaManager;
