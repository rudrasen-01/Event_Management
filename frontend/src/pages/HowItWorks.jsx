import React from 'react';
import { FileText, Search, Users, CheckCircle, ArrowRight, Shield, Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      icon: FileText,
      title: 'Tell us your event & budget',
      description: 'Share your event details, budget range, and location through our simple form. Takes less than 2 minutes!',
      color: 'from-blue-500 to-indigo-500',
      details: ['Select event type and category', 'Set your budget range', 'Choose preferred location', 'Add special requirements']
    },
    {
      id: 2,
      icon: Search,
      title: 'We shortlist verified vendors',
      description: 'Our AI-powered system matches you with 3-5 verified vendors that perfectly fit your requirements.',
      color: 'from-purple-500 to-pink-500',
      details: ['Smart vendor matching', 'Quality verification checks', 'Portfolio review', 'Customer ratings analysis']
    },
    {
      id: 3,
      icon: Users,
      title: 'AIS manages coordination',
      description: 'Your dedicated AIS expert handles all communication, negotiations, and coordination with vendors.',
      color: 'from-pink-500 to-rose-500',
      details: ['Personal event coordinator', 'Vendor communication', 'Price negotiations', 'Timeline management']
    },
    {
      id: 4,
      icon: CheckCircle,
      title: 'Stress-free event execution',
      description: 'Relax and enjoy your special day while we ensure everything runs smoothly from start to finish.',
      color: 'from-green-500 to-teal-500',
      details: ['Pre-event vendor briefing', 'Day-of coordination', 'Issue resolution', 'Post-event follow-up']
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: 'No Spam Calls',
      description: 'Your contact details remain private. All vendor communication happens through our secure platform.'
    },
    {
      icon: Clock,
      title: 'Save Time',
      description: 'No more endless calls and meetings. We handle all coordination so you can focus on other things.'
    },
    {
      icon: Star,
      title: 'Quality Assured',
      description: 'All vendors are personally verified and monitored for consistent quality and professionalism.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              How AIS Signature Event Works
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Simple, transparent, and fully managed — that's our promise
            </p>
            <Link to="/search">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                Start Planning Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isEven = index % 2 === 0;

            return (
              <div key={step.id} className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}>
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-lg mr-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-indigo-600 mb-1">Step {step.id}</div>
                      <h2 className="text-3xl font-bold text-gray-900">{step.title}</h2>
                    </div>
                  </div>

                  <p className="text-lg text-gray-600 mb-6">
                    {step.description}
                  </p>

                  <ul className="space-y-3">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual */}
                <div className="flex-1">
                  <div className={`bg-gradient-to-br ${step.color} rounded-3xl shadow-2xl p-12 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-32 translate-x-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full translate-y-24 -translate-x-24"></div>
                    <div className="relative text-white text-center">
                      <div className="text-8xl font-bold opacity-30 mb-4">{step.id}</div>
                      <Icon className="w-24 h-24 mx-auto opacity-80" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Managed Service?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We handle the complexity so you can enjoy the experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-xl transition-all">
                  <Icon className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Plan Your Perfect Event?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trusted us with their special moments
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/search">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                Start Planning
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-indigo-600">
                Talk to an Expert
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Trust Badge */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-3 px-8 py-4 bg-white border border-gray-200 rounded-full shadow-sm">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span className="text-gray-900 font-semibold text-lg">Trusted by 1000+ happy customers</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
