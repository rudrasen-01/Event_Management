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
      category: 'General FAQs',
      questions: [
        {
          question: 'What is AIS Signature Event?',
          answer: 'AIS Signature Event is a tech-enabled event ecosystem that combines smart vendor discovery with managed execution. The platform empowers customers to find and finalize event services based on location, budget, and preferences, while AIS ensures verified vendors, transparent pricing, financial enablement, and single-point accountability throughout the event lifecycle.'
        },
        {
          question: 'What does "Verified Vendor" mean?',
          answer: 'Every vendor on our platform undergoes a strict vetting process, including background checks, service quality audits, and past performance reviews to ensure your event is in safe hands.'
        },
        {
          question: 'Is AIS available in all cities?',
          answer: 'Currently, AIS is expanding phase-wise across selected cities. More locations will be added soon.'
        }
      ]
    },
    {
      category: 'Booking & Process',
      questions: [
        {
          question: 'How do I book an event through the platform?',
          answer: 'Simply enter your location, budget, and event preferences. Our smart discovery tool will suggest the best-matched vendors. Once you choose, our team helps you finalize the booking and manages the execution.'
        },
        {
          question: 'Can I customize my requirements?',
          answer: 'Absolutely! You can filter services based on your specific needs, or speak to our event consultants for a completely tailored package.'
        },
        {
          question: 'Do I have to talk to 10 different vendors?',
          answer: 'No. AIS acts as your single point of contact. We handle all vendor communications so you can focus on enjoying your event.'
        }
      ]
    },
    {
      category: 'Payments & Financials',
      questions: [
        {
          question: 'Is the pricing transparent?',
          answer: 'Yes. We believe in "Transparent Pricing." The quote you see is what you pay—no hidden costs or last-minute surprises.'
        }
      ]
    },
    {
      category: 'Customer FAQs',
      questions: [
        {
          question: 'How do I find vendors on AIS?',
          answer: 'Simply select your city, event type, and budget range to view verified vendor options.'
        },
        {
          question: 'Are vendors verified?',
          answer: 'Yes, vendors undergo a verification and profile screening process before being listed.'
        },
        {
          question: 'Can I contact vendors directly?',
          answer: 'AIS manages the coordination process to ensure quality control and smooth communication.'
        },
        {
          question: 'What types of events are covered?',
          answer: 'Weddings, birthdays, anniversaries, corporate events, exhibitions, private parties, and more.'
        }
      ]
    },
    {
      category: 'Vendor FAQs',
      questions: [
        {
          question: 'How do I register as a vendor?',
          answer: 'Click "Become a Partner" on our homepage and complete the 4-step registration process. Provide your business details, services, location, and required documents. Our team will review and approve your application within 24-48 hours.'
        },
        {
          question: 'Is there a listing fee?',
          answer: 'AIS offers multiple listing plans including basic and featured options. Pricing details are available in the Vendor Plans section.'
        },
        {
          question: 'How do I receive customer inquiries?',
          answer: 'Once approved, you will receive inquiries through your vendor dashboard. Our admin team may assign inquiries to you based on customer requirements and your service offerings. You can respond directly through the platform.'
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
            <Button size="lg" onClick={() => navigate('/contact-us')}>
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