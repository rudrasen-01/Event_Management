import React from 'react';
import { Shield, Eye, Lock, Users, Database, Mail } from 'lucide-react';

const Privacy = () => {
  const sections = [
    {
      icon: Eye,
      title: 'Information We Collect',
      content: [
        'Personal information you provide when registering (name, email, phone)',
        'Event inquiry details (event type, budget, location, requirements)',
        'Vendor business information (company details, services, documents)',
        'Usage data and analytics to improve our platform',
        'Communication records between customers and vendors through our platform'
      ]
    },
    {
      icon: Lock,
      title: 'How We Use Your Information',
      content: [
        'Connect customers with suitable vendors based on requirements',
        'Facilitate communication through our managed inquiry system',
        'Verify vendor credentials and maintain platform quality',
        'Send important updates about your inquiries and account',
        'Improve our services and develop new features',
        'Prevent fraud and ensure platform security'
      ]
    },
    {
      icon: Users,
      title: 'Information Sharing',
      content: [
        'We DO NOT sell or rent your personal information to third parties',
        'Customer contact details are NOT shared directly with vendors',
        'Vendor information is shared with customers only for inquiry purposes',
        'We may share aggregated, non-personal data for analytics',
        'Legal compliance: We may disclose information if required by law'
      ]
    },
    {
      icon: Database,
      title: 'Data Security',
      content: [
        'All data is encrypted in transit and at rest',
        'Regular security audits and monitoring',
        'Access controls and authentication for all systems',
        'Secure hosting infrastructure with backup systems',
        'Staff training on data protection best practices'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl mb-4">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-sm opacity-90">
            Last updated: January 30, 2026
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            AIS Signature Event (\"we\", \"our\", or \"us\") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our event planning platform.
          </p>
          <p className="text-gray-600 leading-relaxed">
            By using our service, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, do not use our service.
          </p>
        </div>

        {/* Main Sections */}
        {sections.map((section, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <div className="flex items-center mb-6">
              <section.icon className="w-8 h-8 text-indigo-600 mr-4" />
              <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
            </div>
            <ul className="space-y-3">
              {section.content.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Your Rights */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-center mb-6">
            <Users className="w-8 h-8 text-indigo-600 mr-4" />
            <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            You have the following rights regarding your personal information:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Access & Portability</h3>
              <p className="text-gray-600 text-sm">Request a copy of your personal data and download your information.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Correction</h3>
              <p className="text-gray-600 text-sm">Update or correct inaccurate personal information.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Deletion</h3>
              <p className="text-gray-600 text-sm">Request deletion of your personal data (subject to legal requirements).</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Objection</h3>
              <p className="text-gray-600 text-sm">Object to certain processing activities of your personal data.</p>
            </div>
          </div>
        </div>

        {/* Cookies */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can manage cookie preferences through your browser settings.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Essential cookies are necessary for the platform to function. Analytics cookies help us understand how users interact with our service to improve performance.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8">
          <div className="flex items-center mb-6">
            <Mail className="w-8 h-8 text-indigo-600 mr-4" />
            <h2 className="text-2xl font-bold text-gray-900">Contact Us About Privacy</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-6">
            If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">privacy@aissignatureevent.com</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
              <p className="text-gray-600">
                123 Business Center<br />
                Indore, Madhya Pradesh 452001<br />
                India
              </p>
            </div>
          </div>
        </div>

        {/* Updates */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mt-8">
          <h3 className="font-semibold text-yellow-900 mb-2">Policy Updates</h3>
          <p className="text-yellow-800 text-sm">
            We may update this Privacy Policy periodically. We will notify you of significant changes via email or through our platform. Continued use of our service after changes constitutes acceptance of the updated policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;