import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { io } from 'socket.io-client';

const VoiceCall = ({ booking, onClose, callType = 'voice' }) => {
  const [callState, setCallState] = useState('connecting'); // connecting, ringing, active, ended
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [peerConnection, setPeerConnection] = useState(null);
  const [socket, setSocket] = useState(null);
  
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const callStartTimeRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000'); // Connect to employee app backend
    setSocket(newSocket);

    newSocket.emit('join_booking', {
      bookingId: booking._id,
      userId: booking.assignedEmployee, // Employee's ID
      userType: 'employee'
    });

    initializeWebRTC(newSocket);
    
    // Socket event listeners
    newSocket.on('call_response', handleCallResponse);
    newSocket.on('webrtc_offer', handleOffer);
    newSocket.on('webrtc_answer', handleAnswer);
    newSocket.on('webrtc_ice_candidate', handleIceCandidate);
    newSocket.on('call_ended', handleCallEnded);

    return () => {
      cleanup();
      newSocket.disconnect();
    };
  }, []);

  const initializeWebRTC = async (socketInstance) => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: callType === 'video' });
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
      }

      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Add local stream
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream
      pc.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams;
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketInstance.emit('webrtc_ice_candidate', {
            bookingId: booking._id,
            candidate: event.candidate
          });
        }
      };

      setPeerConnection(pc);

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      socketInstance.emit('webrtc_offer', {
        bookingId: booking._id,
        offer: offer
      });

      setCallState('ringing');
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      setCallState('ended');
    }
  };

  const handleCallResponse = (data) => {
    if (data.response === 'accept') {
      setCallState('active');
      startCallTimer();
    } else {
      setCallState('ended');
    }
  };

  const handleOffer = async (data) => {
    try {
      await peerConnection.setRemoteDescription(data.offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      socket.emit('webrtc_answer', {
        bookingId: booking._id,
        answer: answer
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (data) => {
    try {
      await peerConnection.setRemoteDescription(data.answer);
      setCallState('active');
      startCallTimer();
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (data) => {
    try {
      await peerConnection.addIceCandidate(data.candidate);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  const handleCallEnded = () => {
    setCallState('ended');
    cleanup();
  };

  const startCallTimer = () => {
    callStartTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000));
    }, 1000);
  };

  const endCall = () => {
    if (socket) {
      socket.emit('call_ended', { bookingId: booking._id });
    }
    setCallState('ended');
    cleanup();
    onClose();
  };

  const toggleMute = () => {
    if (localAudioRef.current && localAudioRef.current.srcObject) {
      const audioTracks = localAudioRef.current.srcObject.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // Note: Speaker control is limited in web browsers
    // This is more of a UI indicator
  };

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (peerConnection) {
      peerConnection.close();
    }
    if (localAudioRef.current && localAudioRef.current.srcObject) {
      localAudioRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallStateText = () => {
    switch (callState) {
      case 'connecting': return 'Connecting...';
      case 'ringing': return 'Ringing...';
      case 'active': return formatDuration(callDuration);
      case 'ended': return 'Call Ended';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm mx-4">
        {/* Hidden audio elements */}
        <audio ref={localAudioRef} muted autoPlay />
        <audio ref={remoteAudioRef} autoPlay />
        
        {/* Call Interface */}
        <div className="text-center space-y-6">
          {/* User Info */}
          <div>
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">
                {booking.customerContact?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              {booking.customerContact?.name || 'User'}
            </h3>
            <p className="text-gray-600">{booking.serviceType}</p>
          </div>

          {/* Call Status */}
          <div>
            <p className="text-lg font-medium text-gray-900">
              {getCallStateText()}
            </p>
            {callState === 'ringing' && (
              <p className="text-sm text-gray-600">
                Calling user...
              </p>
            )}
          </div>

          {/* Call Controls */}
          <div className="flex justify-center space-x-4">
            {callState === 'active' && (
              <>
                <button
                  onClick={toggleMute}
                  className={`p-3 rounded-full transition-colors ${
                    isMuted 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                
                <button
                  onClick={toggleSpeaker}
                  className={`p-3 rounded-full transition-colors ${
                    isSpeakerOn 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
              </>
            )}
            
            <button
              onClick={endCall}
              className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>

          {callState === 'ended' && (
            <button
              onClick={onClose}
              className="btn-primary w-full"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceCall;