import React from 'react';
import { FiInfo } from 'react-icons/fi';

const InfoTooltip = ({ content, title }) => {
  return (
    <div className="group relative inline-block ml-2">
      <button
        type="button"
        className="text-gray-400 hover:text-blue-500 transition-colors"
        aria-label="More information"
      >
        <FiInfo size={16} />
      </button>
      <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute z-50 left-6 top-0 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
        {title && <div className="font-semibold mb-1">{title}</div>}
        <div className="text-gray-200">{content}</div>
        <div className="absolute -left-1 top-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
      </div>
    </div>
  );
};

export default InfoTooltip;
