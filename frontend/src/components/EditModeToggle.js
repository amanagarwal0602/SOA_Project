import React from 'react';
import { useEditMode } from '../contexts/EditModeContext';
import { FiEdit2, FiEye } from 'react-icons/fi';
import EditModal from './EditModal';

const EditModeToggle = () => {
  const { isEditMode, toggleEditMode, user } = useEditMode();
  const [editModal, setEditModal] = React.useState({ isOpen: false, type: '', data: null });

  const handleSave = () => {
    setEditModal({ isOpen: false, type: '', data: null });
  };

  // Only show for admin and staff
  if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
    return null;
  }

  return (
    <>
      {/* Edit Mode Banner */}
      {isEditMode && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-amber-600 to-orange-600 text-white py-2.5 px-4 text-center z-[9999] shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto">
            <FiEdit2 size={16} className="animate-pulse" />
            <span className="font-bold text-sm">ADMIN LIVE EDIT MODE</span>
            <span className="hidden sm:inline text-xs text-amber-100">- Hover and click on highlighted elements to edit</span>
          </div>
          <button
            onClick={toggleEditMode}
            className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded font-medium transition"
          >
            Exit Edit Mode
          </button>
        </div>
      )}

      {/* Toggle Button - Bottom Left - Non-intrusive */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={toggleEditMode}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-xl transition-all duration-300 font-medium text-sm ${
            isEditMode
              ? 'bg-amber-600 text-white hover:bg-amber-700 ring-4 ring-amber-300 dark:ring-amber-900'
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          title={isEditMode ? 'Exit In-Place Edit Mode' : 'Enter In-Place Edit Mode'}
        >
          {isEditMode ? (
            <>
              <FiEye size={16} />
              <span>Viewing Site</span>
            </>
          ) : (
            <>
              <FiEdit2 size={16} className="text-amber-600 dark:text-amber-400" />
              <span>Live Edit Mode</span>
            </>
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
