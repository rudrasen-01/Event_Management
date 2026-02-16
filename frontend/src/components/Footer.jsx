import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Company: [
      { name: 'About Us', href: '/about' },
      { name: 'How It Works', href: '/how-it-works' },
      { name: 'Contact', href: '/contact-us' },
      { name: 'Plans', href: '/plans' }
    ],
    'For Customers': [
      { name: 'Browse Events', href: '/search' },
      { name: 'Search Vendors', href: '/search' },
      { name: 'FAQs', href: '/faq' },
      { name: 'Support', href: '/contact-us' }
    ],
    'For Vendors': [
      { name: 'Become a Partner', href: '/vendor-registration' },
      { name: 'View Plans', href: '/plans' },
      { name: 'Partner Benefits', href: '/about' },
      { name: 'Vendor Support', href: '/contact-us' }
    ],
    Legal: [
      { name: 'Privacy Policy', href: '/privacy-policy' },
      { name: 'Terms of Service', href: '/terms-and-conditions' },
      { name: 'Contact Legal', href: '/contact-us' },
      { name: 'Cookie Policy', href: '/cookie-policy' }
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/AISSignatureEvent/', label: 'Facebook' },
    { icon: Twitter, href: 'https://x.com/AISSignature', label: 'Twitter' },
    { icon: Instagram, href: 'https://www.instagram.com/aissignatureevent/', label: 'Instagram' },
    { icon: Youtube, href: 'https://www.youtube.com/@AISSignatureEvent', label: 'YouTube' },
    { icon: Linkedin, href: 'https://www.linkedin.com/company/ais-signature-event/', label: 'LinkedIn' }
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* City Focus Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <MapPin className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-lg">Currently serving in: Indore</span>
          </div>
          <p className="text-purple-100 text-sm">
            More cities coming soon! Stay tuned for updates.
          </p>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">AIS Signature</h3>
                <p className="text-xs text-gray-400">Event Management</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Premium managed event platform connecting customers with verified vendors.
            </p>
            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 transition-colors duration-300"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link, index) => (
                  <li key={index}>
                    {link.href.startsWith('#') ? (
                      <a
                        href={link.href}
                        className="text-sm hover:text-indigo-400 transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-sm hover:text-indigo-400 transition-colors duration-200"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-indigo-400 mt-1" />
              <div>
                <div className="text-white font-semibold text-sm">Email</div>
                <a href="mailto:info@aissignatureevent.com" className="text-sm hover:text-indigo-400">
                  info@aissignatureevent.com
                </a>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-indigo-400 mt-1" />
              <div>
                <div className="text-white font-semibold text-sm">Phone</div>
                <a href="tel:+919220836393" className="text-sm hover:text-indigo-400">
                  +91 9220836393
                </a>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-indigo-400 mt-1" />
              <div>
                <div className="text-white font-semibold text-sm">Company</div>
                <p className="text-sm">
                  ORBOSIS VIBEZ EVENT & MARKETING PRIVATE LIMITED
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-gray-400 mb-4 md:mb-0">
            © {currentYear} AIS Signature Event. All rights reserved.
          </p>
          <div className="flex items-center space-x-1 text-sm text-gray-400">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
