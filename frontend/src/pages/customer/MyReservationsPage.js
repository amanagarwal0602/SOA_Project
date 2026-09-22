import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiX, FiStar } from 'react-icons/fi';
import { toast } from 'react-toastify';

const MyReservationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');

  const fetchReservations = async () => {
    try {
      const response = await api.get('/reservations');
      const allReservations = response.data.data || [];
      
      // Filter to show only current user's reservations
      const userReservations = allReservations.filter(res => 
        res.userId === user?.id || 
        res.user_id === user?.id ||
        res.email === user?.email ||
        res.userEmail === user?.email
      );
      
      setReservations(userReservations);
    } catch (error) {
      console.error('Failed to load reservations');
      setReservations([]);
    }
  };

  useEffect(() => {
    fetchReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancelReservation = async (reservationId) => {
    setSelectedReservation(reservationId);
    setShowCancelModal(true);
  };

  const confirmCancellation = async () => {
    if (!cancellationReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    try {
      await api.put(`/reservations/${selectedReservation}/status`, { 
        status: 'cancelled',
        cancellationReason: cancellationReason.trim(),
        cancelledAt: new Date().toISOString()
      });
      toast.success('✓ Reservation cancelled!');
      setShowCancelModal(false);
      setSelectedReservation(null);
      setCancellationReason('');
      fetchReservations();
    } catch (error) {
      toast.error('Failed to cancel reservation. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container-custom">
        <h1 className="text-4xl font-serif font-bold mb-8 dark:text-gray-100">My Reservations</h1>
        
        {reservations.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-12 rounded-xl shadow text-center">
            <p className="text-gray-600 dark:text-gray-400">No reservations yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map(res => (
              <div key={res._id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg dark:text-gray-100">Reservation #{res.reservationNumber || res._id.slice(-6)}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      <span className="font-medium">Date:</span> {new Date(res.date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Time:</span> {res.timeSlot || res.time_slot || res.time}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Guests:</span> {res.guests || res.numberOfGuests || res.number_of_guests}
                    </p>
                    {res.specialRequests && (
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        <span className="font-medium">Special Requests:</span> {res.specialRequests}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      res.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                      res.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 
                      res.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {res.status?.charAt(0).toUpperCase() + res.status?.slice(1)}
                    </span>
                    
                    {/* Write Review button for completed reservations */}
                    {res.status?.toLowerCase() === 'completed' && (
                      <button
                        onClick={() => navigate('/write-review', { 
                          state: { 
                            reservationId: res._id,
                            isReservationReview: true
                          } 
                        })}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition font-medium text-sm shadow-md flex items-center gap-2"
                      >
                        <FiStar size={16} />
                        Write Review
                      </button>
                    )}
                    
                    {/* Cancel button - only show for confirmed or pending reservations */}
                    {(res.status?.toLowerCase() === 'confirmed' || res.status?.toLowerCase() === 'pending') && (
                      <button
                        onClick={() => handleCancelReservation(res._id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition font-medium text-sm shadow-md"
                      >
                        Cancel Reservation
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Show cancellation reason if cancelled */}
                {res.status === 'cancelled' && res.cancellationReason && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500">
                    <p className="text-sm font-medium text-red-800 dark:text-red-400">Cancellation Reason:</p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{res.cancellationReason}</p>
                    {res.cancelledAt && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Cancelled on: {new Date(res.cancelledAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Cancellation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Cancel Reservation</h3>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedReservation(null);
                    setCancellationReason('');
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Please provide a reason for cancelling your reservation:
              </p>
              
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="e.g., Change of plans, Emergency, Found another venue..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                rows="4"
                required
              />
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedReservation(null);
                    setCancellationReason('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium text-gray-700 dark:text-gray-300"
                >
                  Keep Reservation
                </button>
                <button
                  onClick={confirmCancellation}
                  disabled={!cancellationReason.trim()}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReservationsPage;

