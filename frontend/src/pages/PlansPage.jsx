import React, { useState } from 'react';
import { Check, X, Star, Shield, Zap, TrendingUp, Users, Crown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PlansPage = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const navigate = useNavigate();

  // Plans array (ids preserved where routing depends on them)
  const plans = [
    {
      id: 'free',
      name: 'Free Plan — Unlisted Vendor',
      tagline: 'Entry-level presence — organic discovery',
      icon: Users,
      iconColor: 'text-gray-600',
      bgGradient: 'from-gray-50 to-gray-100',
      borderColor: 'border-gray-200',
      price: { monthly: 0, yearly: 0 },
      popular: false,
      features: [
        { text: 'Platform registration', included: true },
        { text: 'Service & city listing', included: true },
        { text: 'Portfolio showcase: Up to 5 images', included: true },
        { text: 'Appears in general search results', included: true },
        { text: 'Discoverable via category & location', included: true },
        { text: 'Verified badge', included: false },
        { text: 'Priority visibility', included: false },
        { text: 'Marketing push', included: false }
      ],
      cta: 'Get Started',
      description: 'Entry-level platform presence with organic discovery.'
    },
    {
      id: 'basic',
      name: 'Starter',
      tagline: 'Verified visibility — entry level',
      icon: Zap,
      iconColor: 'text-blue-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200',
      price: { monthly: 499, yearly: 4990 },
      popular: false,
      trialDays: 30,
      features: [
        { text: 'First 30 days free trial', included: true, highlight: true },
        { text: 'Verified vendor badge', included: true },
        { text: 'Portfolio showcase: Up to 15 images / videos', included: true },
        { text: 'Improved placement in search results', included: true },
        { text: 'Category + location SEO optimization', included: true },
        { text: 'Profile reviewed & managed by AIS team', included: true }
      ],
      cta: 'Start Starter Plan',
      description: 'Enhanced credibility and improved discoverability. Try free for 30 days.'
    },
    {
      id: 'professional',
      name: 'Growth',
      tagline: 'High visibility vendor',
      icon: Star,
      iconColor: 'text-purple-600',
      bgGradient: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-300',
      price: { monthly: 999, yearly: 9990 },
      popular: true,
      trialDays: 30,
      features: [
        { text: 'First 30 days free trial', included: true, highlight: true },
        { text: 'Portfolio showcase: Up to 30 images / videos', included: true },
        { text: 'Everything in Starter', included: true },
        { text: 'Higher ranking in category searches', included: true },
        { text: 'Featured placement in recommended vendors', included: true },
        { text: 'Portfolio enhancement', included: true },
        { text: 'Basic social media promotion', included: true }
      ],
      cta: 'Start Growth Plan',
      description: 'Designed to increase discovery and inbound inquiries. Try free for 30 days.',
      badge: 'MOST POPULAR'
    },
    {
      id: 'enterprise',
      name: 'Premium',
      tagline: 'Maximum visibility & brand push',
      icon: Crown,
      iconColor: 'text-amber-600',
      bgGradient: 'from-amber-50 to-orange-50',
      borderColor: 'border-amber-300',
      price: { monthly: 1499, yearly: 14990 },
      popular: false,
      trialDays: 30,
      features: [
        { text: 'First 30 days free trial', included: true, highlight: true },
        { text: 'Unlimited portfolio showcase (images & videos)', included: true },
        { text: 'Top-tier visibility in search results', included: true },
        { text: 'Premium verified badge', included: true },
        { text: 'Social media shoutouts & promotions', included: true },
        { text: 'Dedicated profile optimization', included: true },
        { text: 'Priority placement during high-demand searches', included: true }
      ],
      cta: 'Contact Sales',
      description: 'For vendors seeking strong brand presence and maximum reach. Try free for 30 days.',
      badge: 'PREMIUM'
    }
  ];

  const handlePlanSelect = (planId) => {
    if (planId === 'free') {
      navigate('/vendor-registration');
    } else if (planId === 'enterprise') {
      navigate('/contact-us?subject=Premium Plan Inquiry');
    } else {
      // Redirect to vendor registration with plan info
      navigate(`/vendor-registration?plan=${planId}&billing=${billingCycle}`);
    }
  };

  const getPriceDisplay = (price) => {
    if (price === 0) return 'Free';
    const displayPrice = billingCycle === 'yearly' ? price / 12 : price;
    return `₹${displayPrice.toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AIS — Vendor Visibility Plans</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Vendor Visibility Plans — Search Engine Discovery Model
          </h1>

          <p className="text-xl md:text-2xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            AIS operates like a search engine for events. Vendor visibility, ranking, and discovery improve based on plan selection and profile optimization. We enable genuine discovery — we do not guarantee leads.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                billingCycle === 'monthly' ? 'bg-white text-indigo-600 shadow-lg' : 'text-white hover:text-indigo-100'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                billingCycle === 'yearly' ? 'bg-white text-indigo-600 shadow-lg' : 'text-white hover:text-indigo-100'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-400 text-green-900 px-2 py-0.5 rounded-full">Save 16%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${
                  plan.popular ? 'transform scale-105 lg:scale-110' : ''
                } ${plan.borderColor}`}
              >
                {/* Popular Badge */}
                {plan.badge && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">{plan.badge}</div>
                )}

                {/* Plan Header */}
                <div className={`bg-gradient-to-br ${plan.bgGradient} p-6 text-center`}>
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-lg mb-4`}>
                    <Icon className={`w-7 h-7 ${plan.iconColor}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{plan.tagline}</p>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-gray-900">{getPriceDisplay(plan.price[billingCycle])}</span>
                      {plan.price.monthly > 0 && <span className="text-gray-600 text-sm">/month</span>}
                    </div>
                    {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                      <p className="text-xs text-gray-500 mt-1">Billed ₹{plan.price.yearly.toLocaleString('en-IN')} annually</p>
                    )}
                    {plan.trialDays && (
                      <div className="mt-2 inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                        <Sparkles className="w-3 h-3" />
                        <span>{plan.trialDays} Days Free</span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-600">{plan.description}</p>
                </div>

                {/* Features List */}
                <div className="p-6">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${feature.highlight ? 'text-purple-600' : 'text-green-600'}`} />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'} ${feature.highlight ? 'font-semibold text-purple-700' : ''}`}>{feature.text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
                        : plan.id === 'enterprise'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Important Notes - Discovery Model */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-indigo-600">
          <h3 className="text-lg font-bold mb-2">Important — How AIS Discovery Works</h3>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
            <li>Vendor contact numbers are not displayed publicly; all inquiries are routed through the AIS platform.</li>
            <li>Lead volume is not guaranteed — AIS enables genuine discovery and improves visibility based on plan level and profile optimization.</li>
            <li>AIS does not sell fake leads or promise guaranteed inquiries.</li>
            <li>Visibility and ranking depend on plan selection and quality of profile optimization.</li>
            <li><strong>Free Trial:</strong> All paid plans include a 30-day free trial. No payment charged during trial. Vendors can upgrade, downgrade, or cancel anytime.</li>
            <li><strong>Portfolio Limits:</strong> Each plan has specific portfolio limits per vendor profile. File type support for images and videos varies by plan tier.</li>
          </ul>
        </div>
      </div>

      {/* Comparison Table Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Compare All Features</h2>
          <p className="text-lg text-gray-600">Find the perfect plan for your business needs</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                  {plans.map(plan => (
                    <th key={plan.id} className="px-6 py-4 text-center text-sm font-semibold text-gray-900">{plan.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  'Business listing',
                  'Service categories',
                  'Image gallery',
                  'Video showcase',
                  'Lead notifications',
                  'Analytics dashboard',
                  'Verified badge',
                  'Featured placement',
                  'Priority support',
                  'Custom branding'
                ].map((feature, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{feature}</td>
                    {plans.map(plan => {
                      const hasFeature = plan.features.find(f => f.text.toLowerCase().includes(feature.toLowerCase().split(' ')[0]));
                      return (
                        <td key={plan.id} className="px-6 py-4 text-center">
                          {hasFeature?.included ? (
                            <Check className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Trust Signals */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Secure & Trusted</h3>
            <p className="text-gray-600">Industry-standard security with SSL encryption and data protection</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white mb-4">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Proven Results</h3>
            <p className="text-gray-600">Our vendors see improved discovery and platform exposure</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Support</h3>
            <p className="text-gray-600">Dedicated support to help optimize your profile and visibility</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-6">
            {[
              {
                q: 'What is the 30-day free trial?',
                a: "All paid plans (Starter, Growth, and Premium) include a 30-day free trial. You won't be charged during the trial period, and you can upgrade, downgrade, or cancel anytime without any obligation."
              },
              {
                q: 'What are the portfolio limits for each plan?',
                a: "Free Plan: Up to 5 images | Starter Plan: Up to 15 images/videos | Growth Plan: Up to 30 images/videos | Premium Plan: Unlimited images and videos. Portfolio limits apply per vendor profile."
              },
              {
                q: 'Can I upgrade or downgrade my plan anytime?',
                a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the difference."
              },
              {
                q: 'Is there a contract or can I cancel anytime?',
                a: "No contracts required! You can cancel your subscription anytime. Your plan remains active until the end of your billing period."
              },
              {
                q: 'What payment methods do you accept?',
                a: "We accept all major credit/debit cards, UPI, net banking, and digital wallets. All payments are processed securely."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="text-xl text-indigo-100 mb-8">Join successful vendors on our platform to improve discovery and reach</p>
          <button onClick={() => navigate('/vendor-registration')} className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">Get Started Now</button>
        </div>
      </div>
    </div>
  );
};

export default PlansPage;
