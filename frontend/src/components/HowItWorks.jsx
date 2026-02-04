import React from 'react';
import { FileText, Search, Users, CheckCircle } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      icon: FileText,
      title: 'Tell us your event & budget',
      description: 'Share your event details, budget range, and location through our simple form',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      id: 2,
      icon: Search,
      title: 'We shortlist verified vendors',
      description: 'Our AI matches you with verified vendors that fit your requirements perfectly',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 3,
      icon: Users,
      title: 'AIS manages coordination',
      description: 'Your dedicated AIS expert handles all communication and coordination',
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 4,
      icon: CheckCircle,
      title: 'Stress-free event execution',
      description: 'Relax while we ensure everything runs smoothly on your special day',
      color: 'from-green-500 to-teal-500'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How AIS Signature Event Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Simple, transparent, and fully managed — that's our promise
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="relative">
                {/* Connector Line (hidden on mobile, last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-indigo-200 to-purple-200 -z-10"></div>
                )}

                {/* Step Card */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                  {/* Step Number */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-5xl font-bold text-gray-100">{step.id}</div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Message */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-green-50 border border-green-200 rounded-full">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-semibold">Trusted by 1000+ happy customers</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;