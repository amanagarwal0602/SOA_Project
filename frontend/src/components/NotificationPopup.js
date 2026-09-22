import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FiX, FiCheck, FiCheckCircle } from 'react-icons/fi';

const NotificationPopup = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;

    const checkNotifications = async () => {
      try {
        // Check for confirmed reservations
        const reservationsRes = await api.get('/reservations');
        const userReservations = (reservationsRes.data.data || []).filter(
          res => res.guestEmail === user.email && 
          res.status === 'confirmed' &&
          !localStorage.getItem(`notif_seen_res_${res.id}`)
        );

        // Check for orders with status updates
        const ordersRes = await api.get('/orders');
        const userOrders = (ordersRes.data.data || []).filter(
          order => order.customerEmail === user.email && 
          (order.status === 'confirmed' || order.status === 'preparing' || order.status === 'ready') &&
          !localStorage.getItem(`notif_seen_order_${order.id}`)
        );

        const newNotifications = [
          ...userReservations.map(res => ({
            id: `res_${res.id}`,
            type: 'reservation',
            status: 'Confirmed',
            details: `Table for ${parseInt(res.numberOfGuests) || parseInt(res.guests) || 'your party'}`,
            date: res.date,
            time: res.time,
            note: res.specialRequests
          })),
          ...userOrders.map(order => ({
            id: `order_${order.id}`,
            type: 'order',
            status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
            details: `Order #${order.id?.slice(0, 8).toUpperCase()}`,
            items: order.items?.length || 0
          }))
        ];

        setNotifications(newNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    checkNotifications();
  }, [user]);

  const dismissNotification = (notifId) => {
    localStorage.setItem(`notif_seen_${notifId}`, 'true');
    setNotifications(prev => prev.filter(n => n.id !== notifId));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notif) => (
        <div 
          key={notif.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-slide-in-right"
        >
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" size={20} />
                <span className="font-semibold text-gray-900 dark:text-gray-100">{notif.type === 'reservation' ? 'Reservation' : 'Order'}</span>
              </div>
              <button
                onClick={() => dismissNotification(notif.id)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>
            
            <div className="ml-7 space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                  {notif.status}
                </span>
              </div>
              
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{notif.details}</p>
              
              {notif.type === 'reservation' && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {notif.date} at {notif.time}
                </p>
              )}
              
              {notif.type === 'order' && notif.items > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {notif.items} {notif.items === 1 ? 'item' : 'items'}
                </p>
              )}
              
              {notif.note && (
                <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-2 pt-2 border-t">
                  {notif.note}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationPopup;

