import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiAlertCircle, FiInfo } from 'react-icons/fi';

// Inline status message that appears near the action
const InlineStatus = ({ message, type = 'success', onClose, duration = 3000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!visible || !message) return null;

  const styles = {
    success: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700',
    error: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700',
    warning: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700',
    info: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700'
  };

  const icons = {
    success: <FiCheck className="w-4 h-4" />,
    error: <FiX className="w-4 h-4" />,
    warning: <FiAlertCircle className="w-4 h-4" />,
    info: <FiInfo className="w-4 h-4" />
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium animate-fade-in ${styles[type]}`}>
      {icons[type]}
      <span>{message}</span>
    </div>
  );
};

export default InlineStatus;
