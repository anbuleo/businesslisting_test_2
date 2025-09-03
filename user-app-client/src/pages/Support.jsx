import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail,
  Search,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Book,
  CreditCard,
  Settings,
  Bug
} from 'lucide-react';

const Support = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium'
  });

  const faqs = [
    {
      question: 'How do I book a service?',
      answer: 'Browse services by category, select your preferred service, choose date/time, and pay 10% advance. The remaining amount is paid after service completion.',
      category: 'booking'
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept all major credit/debit cards, UPI, net banking, and wallet payments. You can also pay the remaining amount in cash after service completion.',
      category: 'payment'
    },
    {
      question: 'Can I track my service provider?',
      answer: 'Yes! Once your booking is accepted, you can track your service provider in real-time and communicate via chat or voice calls.',
      category: 'booking'
    },
    {
      question: 'How do I cancel a booking?',
      answer: 'You can cancel bookings from your booking details page. Cancellation policies vary based on timing and service type.',
      category: 'booking'
    },
    {
      question: 'What if I\'m not satisfied with the service?',
      answer: 'Contact our support team immediately. We offer refunds and will work to resolve any issues with service quality.',
      category: 'general'
    },
    {
      question: 'How do coupons work?',
      answer: 'Enter coupon codes during booking to get discounts. New users can use "FIRST10" for 10% off their first booking.',
      category: 'payment'
    }
  ];

  const categories = [
    { value: 'booking', label: 'Booking Issues', icon: Book, color: 'blue' },
    { value: 'payment', label: 'Payment & Billing', icon: CreditCard, color: 'green' },
    { value: 'technical', label: 'Technical Support', icon: Settings, color: 'purple' },
    { value: 'general', label: 'General Inquiry', icon: HelpCircle, color: 'gray' },
    { value: 'complaint', label: 'Complaint', icon: Bug, color: 'red' }
  ];

  useEffect(() => {
    fetchSupportTickets();
  }, []);

  const fetchSupportTickets = async () => {
    try {
      const response = await fetch('/api/support/tickets', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setTickets(data.data.tickets);
      }
    } catch (error) {
      console.error('Error fetching support tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify(ticketForm)
      });

      const data = await response.json();
      
      if (data.success) {
        setTickets(prev => [data.data, ...prev]);
        setShowCreateTicket(false);
        setTicketForm({
          subject: '',
          description: '',
          category: 'general',
          priority: 'medium'
        });
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'in_progress': return <AlertCircle className="w-4 h-4 text-blue-600" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'closed': return <CheckCircle className="w-4 h-4 text-gray-600" />;
      default: return <HelpCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Help & Support</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Get help with your bookings, payments, or any other questions. 
          Our support team is here to assist you 24/7.
        </p>
      </div>

      {/* Quick Contact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
          <p className="text-gray-600 mb-4">Chat with our support team in real-time</p>
          <button className="btn-primary w-full">Start Chat</button>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Phone className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Support</h3>
          <p className="text-gray-600 mb-4">Call us for immediate assistance</p>
          <a href="tel:+919551347970" className="btn-outline w-full">
            Call Now
          </a>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
          <p className="text-gray-600 mb-4">Send us an email for detailed queries</p>
          <a href="mailto:support@servicehub.com" className="btn-outline w-full">
            Send Email
          </a>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <details key={index} className="card group">
              <summary className="flex items-center justify-between cursor-pointer">
                <h3 className="font-medium text-gray-900 group-open:text-primary-600">
                  {faq.question}
                </h3>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Support Tickets */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Your Support Tickets</h2>
          <button
            onClick={() => setShowCreateTicket(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Ticket</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="card text-center py-12">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Support Tickets</h3>
            <p className="text-gray-600 mb-4">
              You haven't created any support tickets yet. If you need help, feel free to create one.
            </p>
            <button
              onClick={() => setShowCreateTicket(true)}
              className="btn-primary"
            >
              Create Your First Ticket
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Link
                key={ticket._id}
                to={`/support/ticket/${ticket._id}`}
                className="card hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        <span className="ml-1 capitalize">{ticket.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                      {ticket.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Ticket ID: {ticket.ticketId}</span>
                      <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      <span className="capitalize">{ticket.category}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreateTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Support Ticket</h3>
            
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Brief description of your issue"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
                  className="input-field"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={ticketForm.priority}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, priority: e.target.value }))}
                  className="input-field"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  required
                  rows="4"
                  className="input-field"
                  placeholder="Please describe your issue in detail..."
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateTicket(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;