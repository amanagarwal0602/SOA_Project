import React from 'react';
import { useEditMode } from '../contexts/EditModeContext';
import { FiEdit3 } from 'react-icons/fi';

/**
 * EditableWrapper - Makes any content editable in Edit Mode
 * 
 * Usage:
 * <EditableWrapper onEdit={() => handleEdit(item)} type="menu-item">
 *   <YourContent />
 * </EditableWrapper>
 */
const EditableWrapper = ({ 
  children, 
  onEdit, 
  type = 'default',
  className = '',
  disabled = false 
}) => {
  const { canEdit } = useEditMode();

  // If not in edit mode or editing is disabled, just render children
  if (!canEdit() || disabled) {
    return <>{children}</>;
  }

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    }
  };

  return (
    <div 
      className={`relative group cursor-pointer ${className}`}
      onClick={handleClick}
      style={{ outline: 'none' }}
    >
      {/* Hover overlay with edit icon */}
      <div className="absolute inset-0 bg-primary-500 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 pointer-events-none rounded-lg z-10">
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-primary-600 text-white p-2 rounded-full shadow-lg flex items-center gap-1 text-xs font-semibold">
            <FiEdit3 size={16} />
            <span className="hidden sm:inline">Edit</span>
          </div>
        </div>
      </div>
      
      {/* Border highlight on hover */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary-500 group-hover:border-dashed rounded-lg pointer-events-none transition-all duration-200 z-10" />
      
      {/* Original content */}
      <div className="relative z-0">
        {children}
      </div>
    </div>
  );
};

export default EditableWrapper;
