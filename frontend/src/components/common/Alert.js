import React from 'react';

/**
 * Professional inline alert component for messages, errors, warnings, and success notifications
 * @param {Object} props
 * @param {string} props.type - Alert type: 'error', 'success', 'warning', 'info'
 * @param {string} props.title - Alert title (optional)
 * @param {string} props.message - Alert message
 * @param {Function} props.onClose - Close handler (optional)
 * @param {string} props.className - Additional CSS classes
 */
const Alert = ({ type = 'info', title, message, onClose, className = '' }) => {
  const typeStyles = {
    error: {
      container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      icon: '❌',
      iconColor: 'text-red-500 dark:text-red-400',
      titleColor: 'text-red-800 dark:text-red-200',
      messageColor: 'text-red-700 dark:text-red-300'
    },
    success: {
      container: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      icon: '✓',
      iconColor: 'text-green-500 dark:text-green-400',
      titleColor: 'text-green-800 dark:text-green-200',
      messageColor: 'text-green-700 dark:text-green-300'
    },
    warning: {
      container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      icon: '⚠',
      iconColor: 'text-yellow-500 dark:text-yellow-400',
      titleColor: 'text-yellow-800 dark:text-yellow-200',
      messageColor: 'text-yellow-700 dark:text-yellow-300'
    },
    info: {
      container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      icon: 'ℹ',
      iconColor: 'text-blue-500 dark:text-blue-400',
      titleColor: 'text-blue-800 dark:text-blue-200',
      messageColor: 'text-blue-700 dark:text-blue-300'
    }
  };

  const styles = typeStyles[type] || typeStyles.info;

  return (
    <div
      className={`rounded-lg border p-4 ${styles.container} ${className}`}
      role="alert"
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 text-xl ${styles.iconColor}`}>
          {styles.icon}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-semibold ${styles.titleColor} mb-1`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${styles.messageColor}`}>
            {message}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-3 flex-shrink-0 ${styles.iconColor} hover:opacity-70 transition-opacity`}
            aria-label="Close"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
