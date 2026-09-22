import React, { useState, useEffect } from 'react';
import ImageUpload from '../../components/ImageUpload';
import Avatar from '../../components/Avatar';
import api from '../../services/api';
import { toast } from 'react-toastify';

const AdminTeam = () => {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    bio: '',
    image: '',
    email: '',
    phone: '',
    socialLinks: { facebook: '', instagram: '', twitter: '', linkedin: '' },
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data } = await api.get('/team/all');
      setMembers(data);
    } catch (error) {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await api.put(`/team/${editingMember._id}`, formData);
        toast.success('✓ Team member updated!', { autoClose: 2000 });
      } else {
        await api.post('/team', formData);
        toast.success('✓ Team member added!', { autoClose: 2000 });
      }
      setShowModal(false);
      resetForm();
      fetchMembers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this team member?')) {
      try {
        await api.delete(`/team/${id}`);
        toast.success('✓ Team member removed!', { autoClose: 2000 });
        fetchMembers();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleToggleActive = async (member) => {
    try {
      await api.put(`/team/${member._id}`, {
        ...member,
        is_active: !member.is_active
      });
      toast.success(`✓ Team member ${!member.is_active ? 'shown' : 'hidden'} on website`, { autoClose: 2000 });
      fetchMembers();
    } catch (error) {
      toast.error('Failed to update visibility');
    }
  };

  const handleToggleAbout = async (memberId) => {
    try {
      await api.put(`/team/${memberId}/toggle-about`);
      toast.success('✓ About section updated!', { autoClose: 2000 });
      fetchMembers();
    } catch (error) {
      toast.error('Failed to update about section display');
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      position: member.position,
      bio: member.bio || '',
      image: member.image,
      email: member.email || '',
      phone: member.phone || '',
      socialLinks: member.socialLinks || { facebook: '', instagram: '', twitter: '', linkedin: '' },
      order: member.order,
      isActive: member.isActive
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      position: '',
      bio: '',
      image: '',
      email: '',
      phone: '',
      socialLinks: { facebook: '', instagram: '', twitter: '', linkedin: '' },
      order: 0,
      isActive: true
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Team Members</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your team</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Member
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(member => (
            <div key={member._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-center mb-4">
                <Avatar 
                  src={member.image}
                  name={member.name} 
                  size="xl"
                  shape="circle"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 text-center">{member.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-3">{member.position}</p>
              {member.bio && <p className="text-gray-600 dark:text-gray-400 text-xs mb-3">{member.bio.substring(0, 100)}...</p>}
              
              {/* Visibility Status Badge */}
              <div className="flex flex-wrap justify-center gap-2 mb-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  member.is_active || member.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {member.is_active || member.isActive ? '👁️ Visible' : '🚫 Hidden'}
                </span>
                
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  member.showInAbout
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {member.showInAbout ? '📄 In About' : '📄 Not in About'}
                </span>
              </div>
              
              <div className="flex flex-col gap-2">
                {/* Visibility Toggle Button */}
                <button
                  onClick={() => handleToggleActive(member)}
                  className={`px-3 py-2 text-sm rounded font-medium transition ${
                    member.is_active || member.isActive
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                  }`}
                >
                  {member.is_active || member.isActive ? 'Hide from Website' : 'Show on Website'}
                </button>
                
                {/* Show in About Toggle Button */}
                <button
                  onClick={() => handleToggleAbout(member._id)}
                  className={`px-3 py-2 text-sm rounded font-medium transition flex items-center justify-center gap-2 ${
                    member.showInAbout
                      ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {member.showInAbout ? '✓ In About Section' : '+ Add to About Section'}
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(member)}
                    className="flex-1 px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(member._id)}
                    className="flex-1 px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {editingMember ? 'Edit Member' : 'Add Member'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Position *</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                label="Profile Image"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['facebook', 'instagram', 'twitter', 'linkedin'].map(platform => (
                    <div key={platform}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">{platform}</label>
                      <input
                        type="url"
                        value={formData.socialLinks[platform]}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, [platform]: e.target.value }
                        }))}
                        className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingMember ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeam;

