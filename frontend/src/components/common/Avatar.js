import React from 'react';

/**
 * Avatar component that displays user profile image or initials
 * @param {Object} props
 * @param {string} props.name - User's full name
 * @param {string} props.image - URL to user's profile image (optional)
 * @param {string} props.size - Size of avatar: 'xs', 'sm', 'md', 'lg', 'xl' (default: 'md')
 * @param {string} props.className - Additional CSS classes
 */
const Avatar = ({ name, image, size = 'md', className = '' }) => {
  // Get initials from name
  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Generate consistent color based on name
  const getColorFromName = (fullName) => {
    if (!fullName) return 'bg-gray-500';
    
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < fullName.length; i++) {
      hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Size mappings
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };

  const initials = getInitials(name);
  const bgColor = getColorFromName(name);
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  if (image) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden flex-shrink-0 ${className}`}>
        <img
          src={image}
          alt={name || 'User avatar'}
          className="w-full h-full object-cover"
          onError={(e) => {
            // If image fails to load, hide it and show initials
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `
              <div class="w-full h-full flex items-center justify-center ${bgColor} text-white font-semibold">
                ${initials}
              </div>
            `;
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full ${bgColor} text-white font-semibold flex items-center justify-center flex-shrink-0 ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
};

export default Avatar;
