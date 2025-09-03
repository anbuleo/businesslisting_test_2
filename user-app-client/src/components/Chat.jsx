import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Send, 
  Phone, 
  Video, 
  MapPin, 
  Image, 
  Paperclip,
  Smile,
  MoreVertical
} from 'lucide-react';
import { io } from 'socket.io-client';

const Chat = ({ booking, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5001');
    setSocket(newSocket);

    // Join booking room
    newSocket.emit('join_booking', {
      bookingId: booking._id,
      userId: user.id,
      userType: 'user'
    });

    // Listen for new messages
    newSocket.on('new_message', (data) => {
      setMessages(prev => [...prev, data.message]);
      scrollToBottom();
    });

    // Listen for typing indicators
    newSocket.on('user_typing', (data) => {
      if (data.userId !== user.id) {
        setTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTyping(false), 3000);
      }
    });

    newSocket.on('user_stopped_typing', (data) => {
      if (data.userId !== user.id) {
        setTyping(false);
      }
    });

    // Fetch existing messages
    fetchMessages();

    return () => {
      newSocket.disconnect();
    };
  }, [booking._id, user.id]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages/${booking._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      bookingId: booking._id,
      recipientId: booking.assignedEmployee,
      recipientType: 'employee',
      content: newMessage.trim(),
      messageType: 'text',
      senderInfo: {
        id: user.id,
        type: 'user',
        name: user.name
      }
    };

    // Send via socket for real-time delivery
    socket.emit('send_message', messageData);

    // Also send via HTTP for persistence
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify(messageData)
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }

    setNewMessage('');
  };

  const handleTyping = () => {
    socket.emit('typing_start', {
      bookingId: booking._id,
      userId: user.id,
      userName: user.name
    });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', {
        bookingId: booking._id,
        userId: user.id
      });
    }, 1000);
  };

  const handleVoiceCall = () => {
    socket.emit('initiate_call', {
      bookingId: booking._id,
      callType: 'voice',
      callerInfo: {
        id: user.id,
        name: user.name,
        type: 'user'
      }
    });
  };

  const handleVideoCall = () => {
    socket.emit('initiate_call', {
      bookingId: booking._id,
      callType: 'video',
      callerInfo: {
        id: user.id,
        name: user.name,
        type: 'user'
      }
    });
  };

  const shareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { longitude, latitude } = position.coords;
        
        socket.emit('share_location', {
          bookingId: booking._id,
          recipientId: booking.assignedEmployee,
          recipientType: 'employee',
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          senderInfo: {
            id: user.id,
            type: 'user',
            name: user.name
          }
        });
      });
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96 bg-white rounded-lg border border-gray-200">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-600">
              {booking.employeeDetails?.name?.charAt(0) || 'E'}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {booking.employeeDetails?.name || 'Employee'}
            </h3>
            <p className="text-xs text-gray-500">
              {booking.serviceDetails.name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleVoiceCall}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Voice Call"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={handleVideoCall}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Video Call"
          >
            <Video className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${message.sender.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                message.sender.type === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.messageType === 'location' ? (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Location shared</span>
                </div>
              ) : (
                <p className="text-sm">{message.content}</p>
              )}
              <p className={`text-xs mt-1 ${
                message.sender.type === 'user' ? 'text-primary-100' : 'text-gray-500'
              }`}>
                {formatTime(message.createdAt)}
              </p>
            </div>
          </div>
        ))}
        
        {typing && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-3 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <button
            type="button"
            onClick={shareLocation}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Share Location"
          >
            <MapPin className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Attach Image"
          >
            <Image className="w-4 h-4" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;