import React from 'react';
import { useEditMode } from '../contexts/EditModeContext';
import { FiEdit2, FiEye } from 'react-icons/fi';
import EditableWrapper from './EditableWrapper';
import EditModal from './EditModal';

const EditModeToggle = () => {
  console.log('🔧 EditModeToggle component rendered');
  
  const { isEditMode, toggleEditMode, user } = useEditMode();
  const [editModal, setEditModal] = React.useState({ isOpen: false, type: '', data: null });

  // Debug logging
  React.useEffect(() => {
    console.log('👤 EditModeToggle: user =', user);
    console.log('✏️ EditModeToggle: isEditMode =', isEditMode);
    console.log('🎯 EditModeToggle: user role =', user?.role);
  }, [user, isEditMode]);

  const handleEdit = (type, data) => {
    setEditModal({ isOpen: true, type, data });
  };

  const handleSave = () => {
    setEditModal({ isOpen: false, type: '', data: null });
  };

  // Only show for admin and staff
  if (!user) {
    console.log('❌ EditModeToggle: No user found');
    return null;
  }

  if (user.role !== 'admin' && user.role !== 'staff') {
    console.log('❌ EditModeToggle: User role not allowed:', user.role);
    return null;
  }

  console.log('✅ EditModeToggle: Button should be visible!');

  return (
    <>
      {/* Edit Mode Banner */}
      {isEditMode && (
        <EditableWrapper
          onEdit={() => handleEdit('edit-banner', { 
            text: 'EDIT MODE ACTIVE',
            subtitle: 'Click on any element to edit it'
          })}
        >
          <div className="fixed top-0 left-0 right-0 bg-orange-600 text-white py-3 px-4 text-center z-[9999] shadow-lg border-b-4 border-orange-700">
            <div className="flex items-center justify-center gap-2">
              <FiEdit2 size={20} />
              <span className="font-bold text-base">EDIT MODE ACTIVE</span>
              <span className="hidden sm:inline text-sm ml-2">- Click on any element to edit it</span>
            </div>
          </div>
        </EditableWrapper>
      )}

      {/* Toggle Button - TOP RIGHT - ALWAYS VISIBLE */}
      <div className="fixed top-4 right-4 z-[10000]">
        <button
          onClick={toggleEditMode}
          className={`p-3 rounded-lg shadow-2xl transition-all hover:scale-105 border-2 ${
            isEditMode
              ? 'bg-orange-600 text-white border-orange-700 hover:bg-orange-700'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-orange-500 hover:border-orange-600 hover:bg-orange-50'
          }`}
          title={isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
        >
          {isEditMode ? (
            <FiEye size={24} />
          ) : (
            <FiEdit2 size={24} />
          )}
        </button>
      </div>

      <EditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, type: '', data: null })}
        type={editModal.type}
        data={editModal.data}
        onSave={handleSave}
      />
    </>
  );
};

export default EditModeToggle;
