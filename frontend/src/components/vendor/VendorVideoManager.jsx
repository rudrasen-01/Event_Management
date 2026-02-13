import React, { useState, useEffect } from 'react';
import { Video, Upload, Trash2, Eye, EyeOff, PlayCircle, Clock, Film, AlertCircle } from 'lucide-react';
import axios from 'axios';

/**
 * VendorVideoManager Component
 * Instagram Reels-style video content management for vendor dashboard
 * Upload, manage visibility, and delete video content
 */
const VendorVideoManager = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [planLimits, setPlanLimits] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/vendor-profile/dashboard/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('vendorToken')}`
        }
      });

      if (response.data.success) {
        setVideos(response.data.data.videos || []);
        setPlanLimits(response.data.data.planLimits);
      }
    } catch (error) {
      console.error('Fetch videos error:', error);
      setError('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid video file (MP4, MOV, AVI, WEBM)');
      return;
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setError('Video file must be less than 50MB');
      return;
    }

    // Check plan limits
    if (planLimits && videos.length >= planLimits.maxVideos && planLimits.maxVideos !== -1) {
      setError(`Your ${planLimits.planName} plan allows only ${planLimits.maxVideos} videos. Upgrade to upload more.`);
      return;
    }

    await uploadVideo(file);
  };

  const uploadVideo = async (file) => {
    const formData = new FormData();
    formData.append('media', file);

    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      const response = await axios.post('/api/vendor-profile/videos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('vendorToken')}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      if (response.data.success) {
        setVideos([response.data.data, ...videos]);
        setUploadProgress(100);
        setTimeout(() => {
          setUploadProgress(0);
        }, 2000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.message || 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const toggleVisibility = async (videoId, currentVisibility) => {
    try {
      const response = await axios.patch(
        `/api/vendor-profile/videos/${videoId}/toggle-visibility`,
        { visibility: currentVisibility === 'public' ? 'hidden' : 'public' },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('vendorToken')}`
          }
        }
      );

      if (response.data.success) {
        setVideos(videos.map(v =>
          v._id === videoId ? { ...v, visibility: response.data.data.visibility } : v
        ));
      }
    } catch (error) {
      console.error('Toggle visibility error:', error);
      setError('Failed to update visibility');
    }
  };

  const deleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/vendor-profile/videos/${videoId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('vendorToken')}`
        }
      });

      if (response.data.success) {
        setVideos(videos.filter(v => v._id !== videoId));
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete video');
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const mb = (bytes / (1024 * 1024)).toFixed(2);
    return `${mb} MB`;
  };

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Video Content</h2>
          <p className="text-sm text-gray-600">
            Showcase your work with video content (Instagram Reels style)
          </p>
        </div>
        <div className="flex items-center gap-4">
          {planLimits && (
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{videos.length}</span> / {planLimits.maxVideos === -1 ? '∞' : planLimits.maxVideos} videos
            </div>
          )}
          <label
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all cursor-pointer ${
              uploading || (planLimits && videos.length >= planLimits.maxVideos && planLimits.maxVideos !== -1)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg'
            }`}
          >
            <Upload className="w-5 h-5" />
            {uploading ? 'Uploading...' : 'Upload Video'}
            <input
              type="file"
              accept="video/mp4,video/mov,video/avi,video/webm"
              onChange={handleFileSelect}
              disabled={uploading || (planLimits && videos.length >= planLimits.maxVideos && planLimits.maxVideos !== -1)}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-purple-900">Uploading video...</span>
            <span className="text-sm font-bold text-purple-600">{uploadProgress}%</span>
          </div>
          <div className="w-full h-2 bg-purple-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-800">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
            ✕
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Film className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Videos Yet</h3>
          <p className="text-gray-600 mb-4">Upload your first video to showcase your work</p>
          <label className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 cursor-pointer">
            <Upload className="w-5 h-5" />
            Upload Your First Video
            <input
              type="file"
              accept="video/mp4,video/mov,video/avi,video/webm"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video._id}
              className="group relative bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
            >
              {/* Video Thumbnail */}
              <div className="relative aspect-[9/16] bg-black">
                {video.thumbnail?.url ? (
                  <img
                    src={video.thumbnail.url}
                    alt={video.title || 'Video thumbnail'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-16 h-16 text-gray-600" />
                  </div>
                )}
                
                {/* Play Overlay */}
                <a
                  href={video.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <PlayCircle className="w-20 h-20 text-white drop-shadow-lg" />
                </a>

                {/* Duration Badge */}
                {video.duration && (
                  <div className="absolute top-3 right-3 bg-black bg-opacity-75 text-white text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(video.duration)}
                  </div>
                )}

                {/* Visibility Badge */}
                {video.visibility === 'hidden' && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                    <EyeOff className="w-3 h-3" />
                    Hidden
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="p-4 bg-white">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                  {video.title || 'Untitled Video'}
                </h3>
                {video.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {formatViews(video.views || 0)} views
                  </span>
                  {video.metadata?.fileSize && (
                    <span>{formatFileSize(video.metadata.fileSize)}</span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleVisibility(video._id, video.visibility)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                      video.visibility === 'public'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {video.visibility === 'public' ? (
                      <>
                        <Eye className="w-4 h-4" />
                        Public
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Hidden
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => deleteVideo(video._id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Upload Date */}
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                  Uploaded {new Date(video.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plan Upgrade Hint */}
      {planLimits && videos.length >= planLimits.maxVideos && planLimits.maxVideos !== -1 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-900 mb-1">Video Limit Reached</h4>
          <p className="text-sm text-yellow-800">
            You've reached your plan limit of {planLimits.maxVideos} videos. 
            <a href="/vendor/plans" className="font-semibold underline ml-1">Upgrade your plan</a> to upload more videos.
          </p>
        </div>
      )}
    </div>
  );
};

export default VendorVideoManager;
