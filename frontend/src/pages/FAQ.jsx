import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, HelpCircle, Search, MessageCircle } from 'lucide-react';
import Button from '../components/Button';

const FAQ = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState(new Set([0])); // First item open by default

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (openItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const faqs = [
    {
      category: 'General',
      questions: [
        {
          question: 'What is AIS Signature Event?',
          answer: 'AIS Signature Event is a managed event discovery platform that connects customers with verified event vendors. Unlike traditional listing sites, we manage the entire process from vendor selection to coordination, ensuring a hassle-free experience.'
        },
        {
          question: 'How is this different from other event platforms?',
          answer: 'We are not a classifieds or directory platform. We operate as a managed service where our experts handle vendor coordination, your contact details remain private, and vendors are personally verified for quality and reliability.'
        },
        {
          question: 'Which cities do you serve?',
          answer: 'Currently, we serve Indore, Madhya Pradesh. We are expanding to other major cities including Bhopal, Mumbai, Delhi, Bangalore, and Pune. Check our homepage for the latest city availability.'
        }
      ]
    },
    {
      category: 'For Customers',
      questions: [
        {
          question: 'How do I find vendors for my event?',
          answer: 'Use our guided search tool on the homepage. Select your event type, sub-category, budget range, and location. Our system will show you verified vendors that match your criteria. You can then submit an inquiry through our platform.'
        },
        {
          question: 'Is the service free for customers?',
          answer: 'Yes, our service is completely free for customers. You pay only the vendors directly for their services. We charge vendors a small commission to maintain and improve our platform.'
        },
        {
          question: 'Will vendors get my phone number?',
          answer: 'No, your contact details remain private. All communication happens through our managed inquiry system. This eliminates spam calls and ensures professional, coordinated communication.'
        },
        {
          question: 'How do I track my inquiry status?',
          answer: 'Log into your dashboard to view all your inquiries, their current status, and any vendor responses. You will also receive email notifications for important updates.'
        }
      ]
    },
    {
      category: 'For Vendors',
      questions: [
        {
          question: 'How do I register as a vendor?',
          answer: 'Click "Become a Partner" on our homepage and complete the 4-step registration process. Provide your business details, services, location, and required documents. Our team will review and approve your application within 24-48 hours.'
        },
        {
          question: 'What are the requirements to become a vendor?',
          answer: 'You need a legitimate business, relevant experience in event services, proper documentation (business license, GST if applicable), and the ability to serve customers professionally in your declared service areas.'
        },
        {
          question: 'How do I receive customer inquiries?',
          answer: 'Once approved, you will receive inquiries through your vendor dashboard. Our admin team may assign inquiries to you based on customer requirements and your service offerings. You can respond directly through the platform.'
        },
        {
          question: 'What commission do you charge?',
          answer: 'We charge a small commission only when you successfully complete a project through our platform. Commission rates vary by service category and are clearly communicated during registration. No upfront fees or monthly charges.'
        }
      ]
    },
    {
      category: 'Booking & Payments',
      questions: [
        {
          question: 'How do payments work?',
          answer: 'Currently, payments are handled directly between customers and vendors. We provide a communication platform but do not process payments. Integrated payment features will be available in future updates.'
        },
        {
          question: 'Can I cancel or modify my inquiry?',
          answer: 'Yes, you can modify or cancel inquiries from your dashboard before vendors respond. Once a vendor responds, contact our support team to help coordinate any changes with the vendor.'
        },
        {
          question: 'What if I am not satisfied with a vendor?',
          answer: 'Contact our support team immediately. We take vendor quality seriously and will help resolve issues. Vendors not meeting our standards may be removed from the platform.'
        }
      ]
    }
  ];

  const filteredFAQs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      item => 
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <HelpCircle className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl mb-8">
            Find answers to common questions about AIS Signature Event
          </p>
          
          {/* Search Box */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No questions found matching "{searchTerm}". Try a different search term.
            </p>
          </div>
        ) : (
          filteredFAQs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {category.category}
              </h2>
              
              <div className="space-y-4">
                {category.questions.map((faq, faqIndex) => {
                  const globalIndex = categoryIndex * 100 + faqIndex;
                  const isOpen = openItems.has(globalIndex);
                  
                  return (
                    <div key={faqIndex} className="bg-white rounded-xl shadow-sm border border-gray-200">
                      <button
                        onClick={() => toggleItem(globalIndex)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <span className="font-medium text-gray-900 pr-4">
                          {faq.question}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        )}
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 pb-4">
                          <p className="text-gray-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 text-center mt-12">
          <MessageCircle className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Cannot find what you are looking for? Our support team is here to help you with any questions about our platform or services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/contact')}>
              Contact Support
            </Button>
            <Button variant="outline" size="lg" onClick={() => window.location.href = 'mailto:support@aissignatureevent.com'}>
              Email Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;