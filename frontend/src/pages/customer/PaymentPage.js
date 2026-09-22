import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiCheck, FiCopy, FiDownload } from 'react-icons/fi';
import QRCode from 'qrcode';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { toast } from 'react-toastify';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { settings } = useSiteSettings();
  const [qrCode, setQrCode] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const orderDetails = location.state?.orderDetails;
  const totalAmount = location.state?.totalAmount || 0;

  const UPI_ID = 'amanagarwal0602-3@oksbi';
  const MERCHANT_NAME = settings?.siteName || 'Cafe';

  useEffect(() => {
    if (!orderDetails || !totalAmount) {
      toast.error('Invalid payment request. Redirecting to cart...');
      setTimeout(() => navigate('/cart'), 2000);
      return;
    }
    generateQRCode();
  }, [orderDetails, totalAmount, navigate]);

  const generateQRCode = async () => {
    try {
      // UPI Payment URL format
      const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${Math.round(totalAmount)}&cu=INR&tn=${encodeURIComponent(`Order Payment - ${orderDetails?.orderId || 'New Order'}`)}`;
      
      const qrDataUrl = await QRCode.toDataURL(upiUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCode(qrDataUrl);
    } catch (error) {
      toast.error('Failed to generate QR code. Please refresh the page.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('✓ UPI ID copied!', { autoClose: 2000 });
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `payment-qr-${orderDetails?.orderId || 'order'}.png`;
    link.click();
    toast.success('✓ QR Code downloaded!', { autoClose: 2000 });
  };

  const handlePaymentConfirmation = async (e) => {
    e.preventDefault();
    
    // Validate UTR number format (12 digits alphanumeric)
    const cleanedUtr = utrNumber.trim();
    if (!cleanedUtr || cleanedUtr.length < 12) {
      toast.error('Please enter a valid UTR/Transaction ID (minimum 12 characters)');
      return;
    }

    setSubmitting(true);
    try {
      // Create order with payment pending status
      const orderData = {
        ...orderDetails,
        paymentMethod: 'UPI',
        paymentStatus: 'pending',
        utrNumber: cleanedUtr,
        amount: totalAmount,
        customerName: user?.name,
        customerEmail: user?.email,
        status: 'pending'
      };

      const response = await api.post('/orders', orderData);
      
      toast.success('✓ Payment confirmed! Redirecting to orders...');
      setTimeout(() => {
        navigate('/customer/orders', { 
          state: { 
            showPaymentSuccess: true,
            orderId: response.data?.data?.id 
          } 
        });
      }, 1500);
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Failed to confirm payment. Please check your UTR number and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!orderDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container-custom max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-6">
            <h1 className="text-2xl font-serif font-bold mb-2">Complete Payment</h1>
            <p className="text-amber-100">Scan QR code or use UPI ID to pay</p>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: QR Code Section */}
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-4">Scan QR Code</h2>
                  {qrCode && (
                    <div className="bg-white dark:bg-gray-800 border-4 border-gray-200 rounded-xl p-4 inline-block shadow-sm">
                      <img src={qrCode} alt="UPI QR Code" className="w-72 h-72" />
                    </div>
                  )}
                  <button
                    onClick={downloadQR}
                    className="mt-4 flex items-center justify-center gap-2 mx-auto px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:bg-gray-800 transition-colors"
                  >
                    <FiDownload size={16} />
                    Download QR Code
                  </button>
                </div>

                {/* UPI ID Section */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Or Pay Using UPI ID
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={UPI_ID}
                      readOnly
                      className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(UPI_ID)}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
                    >
                      {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Amount Display */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Total Amount:</span>
                    <span className="text-2xl font-bold text-amber-700">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Right: UTR Confirmation Section */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">After Payment</h2>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                      <li>Open any UPI app (PhonePe, Paytm, Google Pay, etc.)</li>
                      <li>Scan the QR code or enter UPI ID manually</li>
                      <li>The amount ₹{totalAmount.toFixed(2)} will be pre-filled</li>
                      <li>Complete the payment</li>
                      <li>Enter the UTR/Transaction ID below</li>
                      <li>Click "Confirm Payment" to place your order</li>
                    </ol>
                  </div>
                </div>

                {/* UTR Input Form */}
                <form onSubmit={handlePaymentConfirmation} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      UTR / Transaction ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.toUpperCase())}
                      placeholder="Enter 12-digit UTR number"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                      minLength={12}
                      maxLength={30}
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Find UTR/Transaction ID in your payment app after successful payment
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !utrNumber}
                    className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FiCheck size={20} />
                        Confirm Payment & Place Order
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/cart')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </form>

                {/* Security Note */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-xs text-green-800">
                    <strong>🔒 Secure Payment:</strong> Your payment will be verified by our team. 
                    Order confirmation will be sent to your email once verified.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        {orderDetails && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              {orderDetails.items?.map((item, index) => (
                <div key={index} className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;

