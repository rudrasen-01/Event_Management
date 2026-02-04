import React from 'react';
import { Shield, MapPin, Award, Users, Phone, Clock } from 'lucide-react';

const WhyAIS = () => {
  const features = [
    {
      icon: MapPin,
      title: 'Budget-Based Discovery',
      description: 'Find vendors that match your exact budget — no hidden costs or surprises',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Shield,
      title: 'Location-Accurate Results',
      description: 'Get vendors near you with real-time distance calculations',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Award,
      title: 'Verified & Managed Vendors',
      description: 'Every vendor is vetted and approved by our expert team',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: Users,
      title: 'Single Point of Contact',
      description: 'One dedicated AIS expert manages everything for you',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: Phone,
      title: 'No Spam Calls',
      description: 'Your contact details stay private — we handle vendor communication',
      color: 'from-orange-500 to-amber-500'
    },
    {
      icon: Clock,
      title: '24/7 Expert Support',
      description: 'Round-the-clock assistance whenever you need help',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose AIS Signature Event?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're not just another listing platform — we're your event planning partner
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-indigo-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Icon */}
                <div className={`inline-flex w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl items-center justify-center mb-5 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Comparison Section */}
        <div className="mt-20">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 md:p-12 border border-indigo-100">
            <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
              AIS Signature Event vs Traditional Platforms
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Traditional */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">❌</div>
                  <h4 className="font-bold text-gray-900">Traditional Platforms</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Spam calls from vendors</li>
                  <li>• No budget filtering</li>
                  <li>• Unverified listings</li>
                  <li>• No coordination help</li>
                </ul>
              </div>

              {/* AIS */}
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 transform scale-105 shadow-2xl">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">✨</div>
                  <h4 className="font-bold text-white">AIS Signature Event</h4>
                </div>
                <ul className="space-y-2 text-sm text-white">
                  <li>• Zero spam guaranteed</li>
                  <li>• Budget-based matching</li>
                  <li>• Verified vendors only</li>
                  <li>• Full coordination</li>
                </ul>
              </div>

              {/* DIY */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">😰</div>
                  <h4 className="font-bold text-gray-900">DIY Planning</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Hours of research</li>
                  <li>• Multiple negotiations</li>
                  <li>• Coordination stress</li>
                  <li>• Risk of bad vendors</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyAIS;
