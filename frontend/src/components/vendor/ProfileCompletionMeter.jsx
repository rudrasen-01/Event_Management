import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, TrendingUp, Award, AlertCircle } from 'lucide-react';
import apiClient from '../../services/api';

/**
 * ProfileCompletionMeter Component
 * Shows vendor profile completion percentage with actionable tips
 * Gamified approach to encourage profile completion
 */
const ProfileCompletionMeter = () => {
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfileCompletion();
  }, []);

  const fetchProfileCompletion = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/vendor-profile/dashboard/me');

      if (response.success) {
        setCompletion(response.data.profileCompletion);
        setProfile(response.data);
      }
    } catch (error) {
      console.error('Fetch profile completion error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return 'from-green-500 to-emerald-500';
    if (percentage >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getCompletionMessage = (percentage) => {
    if (percentage >= 90) return { title: 'Excellent!', message: 'Your profile is nearly complete', icon: Award };
    if (percentage >= 70) return { title: 'Great Progress!', message: 'Keep going to maximize visibility', icon: TrendingUp };
    if (percentage >= 40) return { title: 'Good Start!', message: 'Complete more sections to boost discovery', icon: CheckCircle };
    return { title: 'Let\'s Get Started!', message: 'Complete your profile to attract customers', icon: AlertCircle };
  };

  const completionInfo = getCompletionMessage(completion);
  const Icon = completionInfo.icon;

  const checklistItems = [
    {
      key: 'basicInfo',
      label: 'Complete Business Information',
      completed: profile?.vendor?.businessName && profile?.vendor?.serviceType && profile?.vendor?.city,
      weight: 20
    },
    {
      key: 'contact',
      label: 'Add Contact Details',
      completed: profile?.vendor?.contact?.email && profile?.vendor?.contact?.phone,
      weight: 15
    },
    {
      key: 'description',
      label: 'Write Business Description (50+ words)',
      completed: profile?.vendor?.description && profile?.vendor?.description.length > 50,
      weight: 10
    },
    {
      key: 'pricing',
      label: 'Set Pricing Information',
      completed: profile?.vendor?.pricing?.min && profile?.vendor?.pricing?.max,
      weight: 10
    },
    {
      key: 'media',
      label: 'Upload 3+ Portfolio Images',
      completed: profile?.media && profile.media.length >= 3,
      weight: 25
    },
    {
      key: 'blogs',
      label: 'Publish Your First Blog Post',
      completed: profile?.blogs && profile.blogs.some(b => b.status === 'published'),
      weight: 10
    },
    {
      key: 'videos',
      label: 'Add Video Content',
      completed: profile?.videos && profile.videos.length > 0,
      weight: 10
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Profile Strength</h2>
          <p className="text-sm text-gray-600">Complete your profile to increase visibility</p>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-bold bg-gradient-to-r ${getCompletionColor(completion)} bg-clip-text text-transparent`}>
            {loading ? '...' : `${completion}%`}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getCompletionColor(completion)} transition-all duration-500 ease-out relative`}
            style={{ width: `${completion}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className={`flex items-center gap-3 p-4 rounded-lg mb-6 bg-gradient-to-r ${getCompletionColor(completion)} bg-opacity-10`}>
        <div className={`p-2 rounded-full bg-white shadow-md`}>
          <Icon className={`w-6 h-6 text-${completion >= 80 ? 'green' : completion >= 50 ? 'yellow' : 'red'}-600`} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{completionInfo.title}</h3>
          <p className="text-sm text-gray-600">{completionInfo.message}</p>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 mb-3">Completion Checklist</h3>
        {checklistItems.map((item) => (
          <div
            key={item.key}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
              item.completed
                ? 'bg-green-50 border border-green-200'
                : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <div>
              {item.completed ? (
                <CheckCircle className="w-6 h-6 text-green-600 fill-current" />
              ) : (
                <Circle className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <p className={`font-medium ${item.completed ? 'text-green-900' : 'text-gray-700'}`}>
                {item.label}
              </p>
              <p className="text-xs text-gray-500">Worth {item.weight}% completion</p>
            </div>
            {item.completed && (
              <div className="text-green-600 font-semibold text-sm">
                ✓ Done
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pro Tips */}
      {completion < 100 && (
        <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Pro Tips for Better Visibility
          </h4>
          <ul className="space-y-1 text-sm text-indigo-800">
            {completion < 50 && <li>• Upload high-quality portfolio images to showcase your work</li>}
            {!checklistItems.find(i => i.key === 'description')?.completed && (
              <li>• Add a detailed business description to attract customers</li>
            )}
            {!checklistItems.find(i => i.key === 'blogs')?.completed && (
              <li>• Publish blog posts to establish expertise and improve SEO</li>
            )}
            {completion >= 50 && completion < 80 && (
              <li>• Complete all sections to unlock premium placement in search results</li>
            )}
          </ul>
        </div>
      )}

      {completion === 100 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-green-600" />
            <div>
              <h4 className="font-bold text-green-900">Profile Complete! 🎉</h4>
              <p className="text-sm text-green-700">
                Your profile is fully optimized for maximum visibility and customer reach!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCompletionMeter;
