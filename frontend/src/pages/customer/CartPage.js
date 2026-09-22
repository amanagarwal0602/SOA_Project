import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FiTrash2, FiPlus, FiMinus, FiTag } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    try {
      const response = await api.post('/coupons/validate', { code: couponCode.toUpperCase() });
      const coupon = response.data.data || response.data;
      
      // Check minimum order amount
      if (coupon.minOrderAmount && getCartTotal() < coupon.minOrderAmount) {
        setCouponError(`Minimum order amount is ₹${coupon.minOrderAmount}`);
        return;
      }

      setAppliedCoupon(coupon);
      setCouponSuccess(`Coupon applied! You saved ₹${getDiscountAmount(coupon)}`);
      setCouponError('');
      toast.success(`✓ Coupon applied! You saved ₹${getDiscountAmount(coupon)}`, { autoClose: 2000 });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Invalid or expired coupon code';
      setCouponError(errorMsg);
      setAppliedCoupon(null);
      setCouponSuccess('');
      toast.error(errorMsg);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  const getDiscountAmount = (coupon) => {
    if (!coupon) return 0;
    if (coupon.discountType === 'percentage') {
      const discount = (getCartTotal() * coupon.discountValue) / 100;
      return Math.min(discount, coupon.maxDiscountAmount || discount);
    }
    return coupon.discountValue || 0;
  };

  const getFinalTotal = () => {
    const subtotal = getCartTotal();
    const discount = appliedCoupon ? getDiscountAmount(appliedCoupon) : 0;
    return Math.max(subtotal - discount, 0);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-3xl font-serif font-bold mb-4 text-gray-800 dark:text-gray-100">Your cart is empty</h2>
          <button onClick={() => navigate('/menu')} className="btn-primary">Browse Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container-custom max-w-4xl">
        <h1 className="text-4xl font-serif font-bold mb-8">Shopping Cart</h1>
        <div className="space-y-4">
          {cartItems.map(item => (
            <div key={item._id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center gap-4">
              <img src={item.image || 'https://via.placeholder.com/100'} alt={item.name} loading="lazy" className="w-24 h-24 object-cover rounded" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">{item.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">₹{Math.round(item.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300">
                  <FiMinus />
                </button>
                <span className="w-8 text-center text-gray-800 dark:text-gray-200">{item.quantity}</span>
                <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300">
                  <FiPlus />
                </button>
              </div>
              <button onClick={() => removeFromCart(item._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>

        {/* Coupon Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <FiTag className="text-primary-600" />
            Apply Coupon Code
          </h3>
          
          {appliedCoupon ? (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-green-800 dark:text-green-300">{appliedCoupon.code}</p>
                <p className="text-sm text-green-600 dark:text-green-400">{couponSuccess}</p>
              </div>
              <button 
                onClick={removeCoupon}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="input-field flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                />
                <button 
                  type="button"
                  onClick={handleApplyCoupon}
                  className="btn-secondary px-6 whitespace-nowrap"
                >
                  Apply
                </button>
              </div>
              {couponError && (
                <p className="text-sm text-red-600">{couponError}</p>
              )}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Order Summary</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal:</span>
              <span>₹{Math.round(getCartTotal())}</span>
            </div>
            
            {appliedCoupon && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Discount ({appliedCoupon.code}):</span>
                <span>- ₹{Math.round(getDiscountAmount(appliedCoupon))}</span>
              </div>
            )}
            
            <div className="border-t dark:border-gray-700 pt-3 flex justify-between text-2xl font-bold text-gray-900 dark:text-gray-100">
              <span>Total:</span>
              <span>₹{Math.round(getFinalTotal())}</span>
            </div>
          </div>

          <button 
            onClick={() => navigate('/checkout', { 
              state: { 
                appliedCoupon,
                discount: appliedCoupon ? getDiscountAmount(appliedCoupon) : 0
              } 
            })} 
            className="btn-primary w-full mt-6"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
