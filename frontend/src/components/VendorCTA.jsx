import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, TrendingUp, Shield, Headphones } from 'lucide-react';

const VendorCTA = () => {
  const navigate = useNavigate();

  const handleRegisterVendor = () => {
    navigate('/vendor-registration');
  };

  const handleLearnMore = () => {
    navigate('/about');
  };

  return (
    <section id="partner" className="py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '60px 60px' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-semibold">For Event Vendors & Planners</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Are you an Event Vendor or Planner?
            </h2>

            <p className="text-xl text-purple-100 mb-8 leading-relaxed">
              Join India's fastest-growing managed event platform. Get verified leads, 
              zero spam, and full coordination support — all for free!
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              {[
                { icon: Shield, text: 'Free registration for Phase 1' },
                { icon: TrendingUp, text: 'Verified leads matching your budget' },
                { icon: Headphones, text: 'Managed inquiries by AIS team' },
                { icon: UserPlus, text: 'Build your reputation & grow business' }
              ].map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg text-purple-100">{benefit.text}</span>
                  </div>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleRegisterVendor}
                className="px-8 py-4 bg-white text-indigo-600 font-bold text-lg rounded-xl shadow-2xl hover:shadow-3xl hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-300"
              >
                Join as Partner
              </button>
              <button 
                onClick={handleLearnMore}
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold text-lg rounded-xl hover:bg-white/10 backdrop-blur-sm transform hover:-translate-y-1 transition-all duration-300"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Right Image/Graphic */}
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                  <div className="text-3xl font-bold text-white mb-2">500+</div>
                  <div className="text-sm text-purple-100">Active Vendors</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                  <div className="text-3xl font-bold text-white mb-2">₹2Cr+</div>
                  <div className="text-sm text-purple-100">Revenue Generated</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                  <div className="text-3xl font-bold text-white mb-2">1000+</div>
                  <div className="text-sm text-purple-100">Events Completed</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                  <div className="text-3xl font-bold text-white mb-2">4.8★</div>
                  <div className="text-sm text-purple-100">Average Rating</div>
                </div>
              </div>

              {/* Testimonial */}
              <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center font-bold text-white">
                    RS
                  </div>
                  <div>
                    <div className="font-semibold text-white">Rajesh Sharma</div>
                    <div className="text-sm text-purple-200">Wedding Planner, Indore</div>
                  </div>
                </div>
                <p className="text-purple-100 italic text-sm leading-relaxed">
                  "Best platform for verified leads. No time wasted on spam inquiries. 
                  AIS team handles everything professionally!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VendorCTA;
