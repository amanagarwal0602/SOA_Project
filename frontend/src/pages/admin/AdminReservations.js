import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiCalendar, FiUsers, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/reservations');
      setReservations(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load reservations');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/reservations/${id}/status`, { status });
      toast.success(`✓ Reservation ${status}!`, { autoClose: 2000 });
      fetchReservations();
    } catch (error) {
      toast.error('Failed to update reservation');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      seated: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const filteredReservations = (filter === 'all'
    ? reservations
    : reservations.filter(res => res.status === filter)
  ).sort((a, b) => {
    // For pending reservations: sort by creation time (oldest first - first come, first serve)
    if (filter === 'pending') {
      const createdA = new Date(a.createdAt || a.created_at);
      const createdB = new Date(b.createdAt || b.created_at);
      return createdA - createdB; // Ascending (oldest first)
    }
    
    // For all other statuses: sort by when they were confirmed/updated (newest first)
    const updatedA = new Date(a.updatedAt || a.updated_at || a.createdAt || a.created_at);
    const updatedB = new Date(b.updatedAt || b.updated_at || b.createdAt || b.created_at);
    return updatedB - updatedA; // Descending (most recently updated first)
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 md:py-12">
      <div className="container-custom px-4">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-2">Reservation Management</h1>
          <p className="text-gray-600 dark:text-gray-400">{filteredReservations.length} reservations</p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow mb-6">
          <div className="flex gap-2 flex-wrap">
            <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center">Status:</span>
            {['all', 'pending', 'confirmed', 'seated', 'completed', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 md:px-4 py-2 rounded-lg font-medium transition text-sm ${
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading reservations...</p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-12 rounded-xl shadow text-center">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No reservations found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map(res => (
              <div key={res._id || res.id} className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow hover:shadow-lg transition">
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="mt-1">
                        <FiUsers className="text-primary-600" size={20} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{res.guestName || res.guest_name || 'Guest'}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{res.guestEmail || res.guest_email}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{res.guestPhone || res.guest_phone}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(res.status)}`}>
                        {(res.status || 'pending').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <FiCalendar size={16} className="text-gray-400" />
                        <span className="text-sm">
                          {res.date ? new Date(res.date).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) : 'Date TBD'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <FiClock size={16} className="text-gray-400" />
                        <span className="text-sm">{res.time || res.timeSlot || res.time_slot || 'Time TBD'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <FiUsers size={16} className="text-gray-400" />
                        <span className="text-sm">{res.guests || res.numberOfGuests || res.number_of_guests || 0} guests</span>
                      </div>
                    </div>
                    
                    {(res.specialRequests || res.special_requests) && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-900 dark:text-blue-300">
                          <span className="font-semibold">Special Requests:</span> {res.specialRequests || res.special_requests}
                        </p>
                      </div>
                    )}
                    
                    {/* Show cancellation reason if cancelled */}
                    {res.status === 'cancelled' && (res.cancellationReason || res.cancellation_reason) && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500">
                        <p className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">Cancellation Reason:</p>
                        <p className="text-sm text-red-800 dark:text-red-400">{res.cancellationReason || res.cancellation_reason}</p>
                        {(res.cancelledAt || res.cancelled_at) && (
                          <p className="text-xs text-red-600 dark:text-red-500 mt-2">
                            Cancelled: {new Date(res.cancelledAt || res.cancelled_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {res.order_id && (
                      <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-sm text-purple-900 dark:text-purple-300">
                          <span className="font-semibold">🛍️ Linked Order:</span> #{res.order_id}
                        </p>
                      </div>
                    )}
                    
                    {(res.tableNumber || res.table_number) && (
                      <div className="mt-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Table: <span className="font-semibold">#{res.tableNumber || res.table_number}</span>
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="md:ml-4 flex flex-col gap-2">
                    <select
                      value={res.status}
                      onChange={(e) => updateStatus(res._id || res.id, e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="seated">Seated</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReservations;

