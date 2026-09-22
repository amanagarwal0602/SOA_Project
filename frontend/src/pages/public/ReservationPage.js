import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const ReservationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    guestName: user?.name || '',
    guestEmail: user?.email || '',
    guestPhone: '',
    numberOfGuests: 2,
    date: '',
    timeSlot: '',
    specialRequests: ''
  });

  const timeSlots = [
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '1:00 PM', '1:30 PM', '2:00 PM', '6:00 PM',
    '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reservations', formData);
      toast.success('✓ Reservation created successfully!');
      setTimeout(() => navigate('/customer/reservations'), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create reservation');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-brown-500 dark:bg-gray-800 text-white py-16">
        <div className="container-custom text-center">
          <h1 className="text-5xl font-serif font-bold mb-4">Reserve a Table</h1>
          <p className="text-xl">Book your unforgettable dining experience</p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="guestName" className="block text-sm font-medium mb-2 dark:text-gray-200">Name</label>
                <input
                  id="guestName"
                  type="text"
                  value={formData.guestName}
                  onChange={(e) => setFormData({...formData, guestName: e.target.value})}
                  placeholder={user?.name || 'Enter your name'}
                  className="input-field"
                  required
                  aria-label="Guest Name"
                  tabIndex={0}
                />
              </div>
              <div>
                <label htmlFor="guestEmail" className="block text-sm font-medium mb-2 dark:text-gray-200">Email</label>
                <input
                  id="guestEmail"
                  type="email"
                  value={formData.guestEmail}
                  onChange={(e) => setFormData({...formData, guestEmail: e.target.value})}
                  placeholder={user?.email || 'Enter your email'}
                  className="input-field"
                  required
                  aria-label="Guest Email"
                  tabIndex={0}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="guestPhone" className="block text-sm font-medium mb-2 dark:text-gray-200">Phone</label>
                <input
                  id="guestPhone"
                  type="tel"
                  value={formData.guestPhone}
                  onChange={(e) => setFormData({...formData, guestPhone: e.target.value})}
                  placeholder={user?.phone || 'Enter phone number'}
                  className="input-field"
                  required
                  aria-label="Guest Phone"
                  tabIndex={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Number of Guests</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.numberOfGuests}
                  onChange={(e) => setFormData({...formData, numberOfGuests: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Time Slot</label>
                <select
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({...formData, timeSlot: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Select time</option>
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Special Requests</label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                className="input-field"
                rows="3"
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              Confirm Reservation
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReservationPage;

