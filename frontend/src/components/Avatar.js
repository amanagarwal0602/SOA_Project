import React from 'react';

const Avatar = ({ 
  src, 
  name = '', 
  size = 'md', 
  className = '',
  shape = 'circle' // 'circle' or 'square'
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
    '2xl': 'w-32 h-32 text-4xl'
  };

  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-lg'
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  // Generate consistent color based on name
  const getColorFromName = (name) => {
    if (!name) return 'bg-gray-400';
    
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-amber-500',
      'bg-yellow-500',
      'bg-lime-500',
      'bg-green-500',
      'bg-emerald-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-sky-500',
      'bg-blue-500',
      'bg-indigo-500',
      'bg-violet-500',
      'bg-purple-500',
      'bg-fuchsia-500',
      'bg-pink-500',
      'bg-rose-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

  if (src) {
    return (
      <div className={`${sizeClasses[size]} ${shapeClasses[shape]} ${className} overflow-hidden flex-shrink-0`}>
        <img 
          src={src} 
          alt={name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            // If image fails to load, hide it and show initials
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `
              <div class="w-full h-full ${bgColor} flex items-center justify-center text-white font-bold">
                ${initials}
              </div>
            `;
          }}
        />
      </div>
    );
  }

  // No image - show initials with colored background
  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        ${shapeClasses[shape]} 
        ${bgColor} 
        ${className}
        flex items-center justify-center 
        text-white font-bold 
        flex-shrink-0
        shadow-md
      `}
    >
      {initials}
    </div>
  );
};

export default Avatar;
