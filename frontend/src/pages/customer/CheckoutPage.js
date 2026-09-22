import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  
  // Get coupon from cart page
  const appliedCoupon = location.state?.appliedCoupon || null;
  const discount = location.state?.discount || 0;
  const [formData, setFormData] = useState({
    orderType: 'dine-in',
    contactPhone: '',
    paymentMethod: 'upi',
    specialInstructions: '',
    hasReservation: false,
    reservationDate: '',
    reservationTime: '',
    numberOfGuests: 2,
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      toast.error('Your cart is empty. Please add items before checkout.');
      return;
    }

    // Validate phone number (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.contactPhone.replace(/[^0-9]/g, ''))) {
      toast.error('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    // Validate reservation details if selected
    if (formData.hasReservation) {
      if (!formData.reservationDate || !formData.reservationTime) {
        toast.error('Please select both date and time for your reservation.');
        return;
      }
      
      const selectedDate = new Date(formData.reservationDate + 'T' + formData.reservationTime);
      const now = new Date();
      
      if (selectedDate < now) {
        toast.error('Reservation time must be in the future.');
        return;
      }
    }

    const subtotal = getCartTotal();
    const finalTotal = subtotal - discount;
    
    // Prepare order details
    const orderDetails = {
      items: cartItems.map(item => ({
        name: item.name,
        menuItem: item._id,
        quantity: item.quantity,
        price: item.price
      })),
      orderType: formData.orderType,
      contactPhone: formData.contactPhone,
      paymentMethod: formData.paymentMethod,
      specialInstructions: formData.specialInstructions,
      customerEmail: user?.email,
      hasReservation: formData.hasReservation,
      reservationDate: formData.hasReservation ? formData.reservationDate : null,
      reservationTime: formData.hasReservation ? formData.reservationTime : null,
      numberOfGuests: formData.hasReservation ? formData.numberOfGuests : null,
      subtotal: subtotal,
      discount: discount,
      couponCode: appliedCoupon?.code || null,
      total: finalTotal,
      totalPrice: finalTotal,
      userId: user?.id || user?._id,
      userName: user?.name,
      userEmail: user?.email,
      userPhone: formData.contactPhone,
      deliveryType: formData.orderType
    };

    // If payment method is UPI, redirect to payment page
    if (formData.paymentMethod === 'upi') {
      navigate('/payment', { 
        state: { 
          orderDetails,
          totalAmount: finalTotal,
          appliedCoupon,
          discount
        } 
      });
      return;
    }

    // For other payment methods, create order directly
    try {
      await api.post('/orders', orderDetails);
      clearCart();
      toast.success('✓ Order placed! Redirecting to your orders...');
      setTimeout(() => navigate('/customer/orders'), 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Failed to place order. Please try again.';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container-custom max-w-4xl">
        <h1 className="text-4xl font-serif font-bold mb-8 dark:text-gray-100">Checkout</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 className="text-2xl font-semibold mb-4">Order Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Order Type</label>
                <select
                  value={formData.orderType}
                  onChange={(e) => setFormData({...formData, orderType: e.target.value})}
                  className="input-field"
                >
                  <option value="dine-in">Dine In</option>
                  <option value="takeout">Take Away</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Contact Phone</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                  placeholder={user?.phone || 'Enter phone number'}
                  className="input-field"
                  required
                />
              </div>

              {/* Reservation Option - Available for both dine-in and takeaway */}
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasReservation}
                      onChange={(e) => setFormData({...formData, hasReservation: e.target.checked})}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-900 dark:text-gray-100">Include Table Reservation</span>
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 ml-8">
                    Reserve a table for dining when you arrive
                  </p>
                </div>

              {formData.hasReservation && (
                <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Reservation Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Date</label>
                      <input
                        type="date"
                        value={formData.reservationDate}
                        onChange={(e) => setFormData({...formData, reservationDate: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        className="input-field"
                        required={formData.hasReservation}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Time</label>
                      <select
                        value={formData.reservationTime}
                        onChange={(e) => setFormData({...formData, reservationTime: e.target.value})}
                        className="input-field"
                        required={formData.hasReservation}
                      >
                        <option value="">Select time</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="11:30 AM">11:30 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                        <option value="12:30 PM">12:30 PM</option>
                        <option value="1:00 PM">1:00 PM</option>
                        <option value="1:30 PM">1:30 PM</option>
                        <option value="2:00 PM">2:00 PM</option>
                        <option value="6:00 PM">6:00 PM</option>
                        <option value="6:30 PM">6:30 PM</option>
                        <option value="7:00 PM">7:00 PM</option>
                        <option value="7:30 PM">7:30 PM</option>
                        <option value="8:00 PM">8:00 PM</option>
                        <option value="8:30 PM">8:30 PM</option>
                        <option value="9:00 PM">9:00 PM</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Number of Guests</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.numberOfGuests}
                      onChange={(e) => setFormData({...formData, numberOfGuests: e.target.value})}
                      className="input-field"
                      required={formData.hasReservation}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  className="input-field"
                >
                  <option value="upi">UPI Payment (Recommended)</option>
                  <option value="cash">Pay on Store</option>
                </select>
                {formData.paymentMethod === 'upi' && (
                  <p className="mt-2 text-sm text-green-600 flex items-center gap-2">
                    <span>✓</span>
                    <span>Secure UPI payment with QR code</span>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Special Instructions (Optional)</label>
                <textarea
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})}
                  className="input-field"
                  rows="3"
                  placeholder="Any special requests or dietary requirements..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              {cartItems.map(item => (
                <div key={item._id} className="flex justify-between">
                  <span>{item.name} x{item.quantity}</span>
                  <span>₹{Math.round(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>₹{Math.round(getCartTotal())}</span>
                </div>
                {appliedCoupon && discount > 0 && (
                  <>
                    <div className="flex justify-between text-green-600 mb-2">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>-₹{Math.round(discount)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Final Total</span>
                      <span>₹{Math.round(getCartTotal() - discount)}</span>
                    </div>
                  </>
                )}
                {(!appliedCoupon || discount === 0) && (
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{Math.round(getCartTotal())}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full">
            {formData.paymentMethod === 'upi' ? 'Proceed to Payment' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
