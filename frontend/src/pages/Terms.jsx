import React from 'react';
import { FileText, AlertTriangle, CheckCircle, Users, Shield, Gavel } from 'lucide-react';

const Terms = () => {
  const sections = [
    {
      icon: Users,
      title: 'Platform Overview',
      content: [
        'AIS Signature Event is a managed event planning platform that connects customers with verified vendors',
        'We facilitate inquiries and communication but do not provide event services directly',
        'All vendor services are provided by independent third-party businesses',
        'We operate as an intermediary and coordination service, not as an event planning company'
      ]
    },
    {
      icon: CheckCircle,
      title: 'User Responsibilities',
      content: [
        'Provide accurate and truthful information when creating accounts or submitting inquiries',
        'Use the platform in compliance with applicable laws and regulations',
        'Respect the intellectual property rights of others',
        'Maintain confidentiality of your account credentials',
        'Report any suspicious activity or policy violations to our support team'
      ]
    },
    {
      icon: Shield,
      title: 'Vendor Obligations',
      content: [
        'Maintain valid business licenses and comply with local regulations',
        'Provide services professionally and in accordance with industry standards',
        'Respond to customer inquiries promptly and professionally through our platform',
        'Maintain accurate business information and update changes promptly',
        'Honor quoted prices and service commitments made to customers'
      ]
    },
    {
      icon: AlertTriangle,
      title: 'Limitations and Disclaimers',
      content: [
        'We do not guarantee the quality, reliability, or performance of vendor services',
        'All transactions and agreements are between customers and vendors directly',
        'We are not liable for damages arising from vendor services or failures',
        'Platform availability may be subject to maintenance and technical issues',
        'We reserve the right to modify or discontinue services with reasonable notice'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FileText className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Terms & Conditions</h1>
          <p className="text-xl mb-4">
            Please read these terms carefully before using our platform. By using our service, you agree to these terms.
          </p>
          <p className="text-sm opacity-90">
            Last updated: January 30, 2026
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Acceptance */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceptance of Terms</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            By accessing or using the AIS Signature Event platform (\"Service\"), you agree to be bound by these Terms and Conditions (\"Terms\"). If you do not agree to these Terms, please do not use our Service.
          </p>
          <p className="text-gray-600 leading-relaxed">
            These Terms apply to all users of the Service, including customers seeking event services and vendors providing services through our platform.
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

        {/* Payment Terms */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment and Fees</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">For Customers</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• Using our platform is completely free</li>
                <li>• Pay vendors directly for their services</li>
                <li>• No hidden charges or platform fees</li>
                <li>• Payment terms are between you and the vendor</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">For Vendors</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• Commission-based pricing model</li>
                <li>• Fees charged only on successful projects</li>
                <li>• Transparent fee structure communicated upfront</li>
                <li>• No registration or monthly charges</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Intellectual Property */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            The AIS Signature Event platform, including its design, functionality, content, and trademarks, is owned by us and protected by intellectual property laws. You may not:
          </p>
          <ul className="space-y-2 text-gray-600">
            <li>• Copy, modify, or distribute our platform or content without permission</li>
            <li>• Use our trademarks or branding without authorization</li>
            <li>• Reverse engineer or attempt to extract our source code</li>
            <li>• Create derivative works based on our platform</li>
          </ul>
        </div>

        {/* Termination */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-center mb-6">
            <Gavel className="w-8 h-8 text-indigo-600 mr-4" />
            <h2 className="text-2xl font-bold text-gray-900">Account Termination</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">By You</h3>
              <p className="text-gray-600 text-sm mb-2">
                You may terminate your account at any time by contacting our support team. Upon termination:
              </p>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• Your access to the platform will be revoked</li>
                <li>• We may retain certain data as required by law</li>
                <li>• Outstanding obligations remain in effect</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">By Us</h3>
              <p className="text-gray-600 text-sm mb-2">
                We may terminate accounts for violations of these Terms, including:
              </p>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• Fraudulent or deceptive practices</li>
                <li>• Violation of platform policies</li>
                <li>• Abuse or harassment of other users</li>
                <li>• Legal or regulatory compliance issues</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Governing Law */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
          <p className="text-gray-600 leading-relaxed">
            These Terms are governed by the laws of India. Any disputes arising from these Terms or the use of our Service shall be subject to the exclusive jurisdiction of the courts in Indore, Madhya Pradesh, India.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About These Terms</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            If you have any questions about these Terms and Conditions, please contact us:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">legal@aissignatureevent.com</p>
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

        {/* Changes Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">Changes to Terms</h3>
          <p className="text-yellow-800 text-sm">
            We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or platform notifications. Continued use of our Service after changes constitutes acceptance of the updated Terms.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;