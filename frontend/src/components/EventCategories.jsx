import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Cake, Briefcase, Music, Church, Monitor, ArrowRight } from 'lucide-react';

const EventCategories = () => {
  const navigate = useNavigate();
  const categories = [
    {
      id: 1,
      icon: Heart,
      name: 'Weddings & Pre-Wedding',
      emoji: '💍',
      description: 'Complete wedding planning from engagement to reception',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50',
      hoverColor: 'hover:bg-pink-100'
    },
    {
      id: 2,
      icon: Cake,
      name: 'Birthday & Private Parties',
      emoji: '🎂',
      description: 'Memorable celebrations for all ages',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100'
    },
    {
      id: 3,
      icon: Briefcase,
      name: 'Corporate Events',
      emoji: '🏢',
      description: 'Professional conferences, meetings & launches',
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100'
    },
    {
      id: 4,
      icon: Music,
      name: 'Public & Entertainment',
      emoji: '🎶',
      description: 'Concerts, festivals & large-scale events',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100'
    },
    {
      id: 5,
      icon: Church,
      name: 'Religious & Cultural',
      emoji: '🕌',
      description: 'Traditional ceremonies & cultural celebrations',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      hoverColor: 'hover:bg-amber-100'
    },
    {
      id: 6,
      icon: Monitor,
      name: 'Online / Hybrid Events',
      emoji: '💻',
      description: 'Virtual and hybrid event solutions',
      color: 'from-teal-500 to-green-500',
      bgColor: 'bg-teal-50',
      hoverColor: 'hover:bg-teal-100'
    }
  ];

  const handleCategoryClick = (category) => {
    // Map category names to our schema values
    const categoryMap = {
      'Weddings & Pre-Wedding': 'Wedding',
      'Birthday & Private Parties': 'Private',
      'Corporate Events': 'Corporate',
      'Public & Entertainment': 'Others',
      'Religious & Cultural': 'Religious',
      'Online / Hybrid Events': 'Others'
    };
    
    const categoryValue = categoryMap[category.name] || 'Others';
    navigate(`/search?category=${encodeURIComponent(categoryValue)}&city=Indore`);
  };

  return (
    <section id="events" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explore Event Categories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From intimate celebrations to grand productions, we've got you covered
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={`group relative ${category.bgColor} ${category.hoverColor} rounded-2xl p-8 border-2 border-transparent hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl text-left`}
              >
                {/* Gradient Background Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>

                {/* Content */}
                <div className="relative">
                  {/* Icon & Emoji */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-4xl">{category.emoji}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {category.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {category.description}
                  </p>

                  {/* Arrow */}
                  <div className="flex items-center text-indigo-600 font-semibold text-sm">
                    <span className="mr-2">Explore</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Can't find what you're looking for?
          </p>
          <button className="px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-600 hover:text-white transition-all duration-300">
            Contact Us for Custom Events
          </button>
        </div>
      </div>
    </section>
  );
};

export default EventCategories;
