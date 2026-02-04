import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp } from 'lucide-react';

const PopularScenarios = () => {
  const navigate = useNavigate();
  const scenarios = [
    { id: 1, text: 'Wedding under ₹10 Lakhs', icon: '💍', category: 'Wedding', budget: 1000000 },
    { id: 2, text: 'Birthday party at home', icon: '🎂', category: 'Private', budget: 50000 },
    { id: 3, text: 'Corporate conference in Indore', icon: '🏢', category: 'Corporate', budget: 300000 },
    { id: 4, text: 'Pool party for 20 people', icon: '🏊', category: 'Private', budget: 75000 },
    { id: 5, text: 'Engagement ceremony', icon: '💐', category: 'Wedding', budget: 200000 },
    { id: 6, text: 'Virtual product launch', icon: '💻', category: 'Corporate', budget: 150000 },
    { id: 7, text: 'Temple festival event', icon: '🕉️', category: 'Religious', budget: 100000 },
    { id: 8, text: 'Anniversary celebration', icon: '🎉', category: 'Private', budget: 80000 }
  ];

  const handleScenarioClick = (scenario) => {
    // Navigate to search funnel with category and city
    navigate(`/search?category=${encodeURIComponent(scenario.category)}&city=Indore`);
  };

  const handleCustomEvent = () => {
    const searchSection = document.getElementById('event-search');
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-50 rounded-full mb-4">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-600">Trending Searches</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Popular Event Scenarios
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get inspired by what others are planning
          </p>
        </div>

        {/* Scenarios Pills */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => handleScenarioClick(scenario)}
              className="group px-6 py-3 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:border-indigo-300 rounded-full hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2"
            >
              <span className="text-2xl transform group-hover:scale-125 transition-transform">
                {scenario.icon}
              </span>
              <span className="text-gray-700 font-medium group-hover:text-indigo-600">
                {scenario.text}
              </span>
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Can't find your event type?
          </p>
          <button 
            onClick={handleCustomEvent}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2 mx-auto"
          >
            <Sparkles className="w-5 h-5" />
            <span>Tell us what you need</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default PopularScenarios;
