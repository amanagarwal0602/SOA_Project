import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FiPackage, FiClock, FiCheckCircle, FiTruck, FiCalendar, FiStar } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const OrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // orders or reservations
  const [filter, setFilter] = useState('all'); // all, pending, completed, cancelled

  const fetchOrdersAndReservations = async () => {
    try {
      setLoading(true);
      const [ordersRes, reservationsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/reservations')
      ]);
      
      const ordersData = ordersRes.data.data || [];
      const reservationsData = reservationsRes.data.data || [];
      
      // Filter orders to show only current user's orders
      const userOrders = ordersData.filter(order => 
        order.userId === user?.id || 
        order.user_id === user?.id ||
        order.userEmail === user?.email ||
        order.user_email === user?.email
      );
      
      // Filter reservations to show only current user's reservations
      const userReservations = reservationsData.filter(res => 
        res.userId === user?.id || 
        res.user_id === user?.id ||
        res.email === user?.email ||
        res.userEmail === user?.email
      );
      
      setOrders(userOrders);
      setReservations(userReservations);
    } catch (error) {
      console.error('Failed to load data:', error);
      setOrders([]);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return <FiCheckCircle className="text-green-600" />;
      case 'processing':
      case 'preparing':
        return <FiClock className="text-yellow-600" />;
      case 'ready':
        return <FiCheckCircle className="text-blue-600" />;
      default:
        return <FiPackage className="text-gray-600 dark:text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return ['pending', 'confirmed', 'processing', 'preparing', 'ready'].includes(order.status?.toLowerCase());
    if (filter === 'completed') return ['delivered', 'completed'].includes(order.status?.toLowerCase());
    if (filter === 'cancelled') return order.status?.toLowerCase() === 'cancelled';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-4">My Orders & Reservations</h1>
          <p className="text-gray-600 dark:text-gray-400">{orders.length} orders • {reservations.length} reservations</p>
        </div>

        {/* Main Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 font-semibold transition relative ${activeTab === 'orders' ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'}`}
          >
            <FiPackage className="inline mr-2" />
            Orders ({orders.length})
            {activeTab === 'orders' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></div>}
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-6 py-3 font-semibold transition relative ${activeTab === 'reservations' ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'}`}
          >
            <FiCalendar className="inline mr-2" />
            Reservations ({reservations.length})
            {activeTab === 'reservations' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></div>}
          </button>
        </div>

        {/* Filter Tabs for Orders */}
        {activeTab === 'orders' && <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'pending', 'completed', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading orders...</p>
          </div>
        ) : activeTab === 'orders' ? (
          filteredOrders.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-12 rounded-xl shadow text-center">
              <FiPackage className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 dark:text-gray-400 text-lg">No orders found</p>
              <p className="text-gray-500 mt-2">
                {filter !== 'all' ? `You have no ${filter} orders` : 'Start ordering to see your order history'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
            {filteredOrders.map(order => (
              <div key={order._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                          {getStatusIcon(order.status)}
                        </div>
                        Order #{order.dailyOrderNumber || order.orderNumber || order._id?.slice(-6)}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 flex items-center gap-1.5">
                        <FiClock className="w-4 h-4" />
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Date unknown'}
                      </p>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-3">
                      <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold shadow-sm ${
                        order.status?.toLowerCase() === 'delivered' || order.status?.toLowerCase() === 'completed'
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200'
                          : order.status?.toLowerCase() === 'cancelled'
                          ? 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200'
                          : order.status?.toLowerCase() === 'processing' || order.status?.toLowerCase() === 'preparing'
                          ? 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border border-yellow-200'
                          : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200'
                      }`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          order.status?.toLowerCase() === 'delivered' || order.status?.toLowerCase() === 'completed'
                            ? 'bg-green-500 animate-pulse'
                            : order.status?.toLowerCase() === 'cancelled'
                            ? 'bg-red-500'
                            : 'bg-blue-500 animate-pulse'
                        }`}></span>
                        {(order.status || 'pending').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Amount</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          ₹{Math.round(order.total || order.totalPrice || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <h4 className="font-bold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <FiPackage className="text-primary-600" />
                        Order Items
                      </h4>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center py-3 px-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-gray-100">{item.name || item.itemName || 'Unknown Item'}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded text-xs font-bold border border-purple-200">
                                  Qty: {item.quantity || 1}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  @ ₹{Math.round(item.price || item.itemPrice || 0)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                ₹{Math.round((item.price || item.itemPrice || 0) * (item.quantity || 1)).toLocaleString()}
                              </p>
                              {(order.status?.toLowerCase() === 'delivered' || order.status?.toLowerCase() === 'completed') && (
                                <button
                                  onClick={() => navigate('/write-review', { 
                                    state: { 
                                      menuItem: { 
                                        _id: item.menuItem || item._id,
                                        name: item.name || item.itemName,
                                        price: item.price || item.itemPrice,
                                        image: item.image
                                      },
                                      orderId: order._id 
                                    } 
                                  })}
                                  className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition flex items-center gap-1"
                                >
                                  <FiStar size={14} />
                                  Review
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Delivery Info */}
                  {order.deliveryAddress && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                      <h4 className="font-bold mb-2 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <FiTruck className="text-primary-600" />
                        Delivery Address
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">{order.deliveryAddress}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            </div>
          )
        ) : (
          reservations.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-12 rounded-xl shadow text-center">
              <FiCalendar className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 dark:text-gray-400 text-lg">No reservations found</p>
              <p className="text-gray-500 mt-2">Book a table to see your reservations here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map(reservation => (
                <div key={reservation._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl flex items-center gap-2 text-gray-900 dark:text-gray-100">
                          <div className="p-2 bg-gradient-to-br from-primary-50 to-indigo-50 rounded-lg">
                            <FiCalendar className="text-primary-600" size={24} />
                          </div>
                          Reservation #{reservation._id?.slice(-6)}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 flex items-center gap-1.5">
                          <FiClock className="w-4 h-4" />
                          Created: {reservation.createdAt ? new Date(reservation.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Date unknown'}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold shadow-sm ${
                        reservation.status === 'confirmed' 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200' 
                          : reservation.status === 'pending' 
                          ? 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border border-yellow-200'
                          : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200'
                      }`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          reservation.status === 'confirmed' 
                            ? 'bg-green-500 animate-pulse' 
                            : reservation.status === 'pending'
                            ? 'bg-yellow-500 animate-pulse'
                            : 'bg-red-500'
                        }`}></span>
                        {(reservation.status || 'pending').charAt(0).toUpperCase() + (reservation.status || 'pending').slice(1)}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Date & Time</p>
                        <p className="font-bold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <FiCalendar className="text-blue-600" />
                          {reservation.date}
                        </p>
                        <p className="font-semibold text-gray-700 dark:text-gray-300 mt-1 flex items-center gap-2">
                          <FiClock className="text-blue-600" />
                          {reservation.time}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">Number of Guests</p>
                        <p className="font-bold text-3xl text-gray-900 dark:text-gray-100">
                          {reservation.guests || reservation.numberOfGuests || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {(reservation.guests || reservation.numberOfGuests) === 1 ? 'guest' : 'guests'}
                        </p>
                      </div>
                      {reservation.specialRequests && (
                        <div className="md:col-span-2 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Special Requests</p>
                          <p className="text-gray-800 dark:text-gray-200 font-medium">{reservation.specialRequests}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default OrdersPage;

