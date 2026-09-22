import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTarget, FiUsers, FiHeart } from 'react-icons/fi';
import api from '../../services/api';
import Avatar from '../../components/common/Avatar';
import EditableWrapper from '../../components/EditableWrapper';
import EditModal from '../../components/EditModal';

const AboutPage = () => {
  const [about, setAbout] = useState(null);
  const [values, setValues] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState({ isOpen: false, type: '', data: null });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [aboutRes, featuresRes, teamRes] = await Promise.all([
        api.get('/about'),
        api.get('/features'),
        api.get('/team')
      ]);
      
      setAbout(aboutRes.data);
      setValues(featuresRes.data.filter(f => f.is_active));
      // Filter team members that are active AND marked to show in about section
      setTeam(teamRes.data.filter(t => (t.is_active || t.isActive) && t.showInAbout));
    } catch (error) {
      console.error('Failed to load about page content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (type, data) => {
    setEditModal({ isOpen: true, type, data });
  };

  const handleSave = () => {
    fetchContent(); // Refresh content after edit
  };

  const iconMap = {
    '☕': <FiTarget />,
    '🏆': <FiUsers />,
    '❤️': <FiHeart />
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-gray-900">
      {/* Hero */}
      <EditableWrapper
        onEdit={() => handleEdit('about', about)}
      >
        <div className="bg-brown-500 dark:bg-gray-800 text-white py-20">
          <div className="container-custom text-center">
            <h1 className="text-5xl font-serif font-bold mb-4">{about?.title || 'About Us'}</h1>
            <p className="text-xl text-gray-200 dark:text-gray-300">{about?.description || 'Our story, passion, and commitment to excellence'}</p>
          </div>
        </div>
      </EditableWrapper>

      {/* Story Section */}
      <section className="section-padding">
        <div className="container-custom">
          <EditableWrapper
            onEdit={() => handleEdit('about-story', about)}
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-serif font-bold mb-6 dark:text-gray-100">{about?.heading || 'Our Story'}</h2>
                <div className="text-gray-700 dark:text-gray-300 space-y-4">
                  {about?.content && about.content.split('\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="h-96 rounded-xl overflow-hidden shadow-xl"
              >
                <img
                  src={about?.image || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800'}
                  alt="Café interior"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </EditableWrapper>
        </div>
      </section>

      {/* Values */}
      {values.length > 0 && (
      <section className="section-padding bg-primary-50 dark:bg-gray-800">
        <div className="container-custom">
          <h2 className="text-4xl font-serif font-bold text-center mb-12 dark:text-gray-100">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, i) => (
              <motion.div
                key={value.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center"
              >
                <div className="text-primary-500 text-5xl mb-4 flex justify-center">
                  {iconMap[value.icon] || value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 dark:text-gray-200">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Team */}
      {team.length > 0 && (
      <section className="section-padding">
        <div className="container-custom">
          <h2 className="text-4xl font-serif font-bold text-center mb-12 dark:text-gray-100">Meet Our Team</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {team.map((member) => (
              <EditableWrapper 
                key={member.id}
                onEdit={() => handleEdit('team-member', member)} 
                type="team-member"
              >
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar 
                    name={member.name} 
                    image={member.image} 
                    size="xl"
                    className="w-48 h-48"
                  />
                </div>
                <h3 className="font-semibold text-lg dark:text-gray-200">{member.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{member.position}</p>
              </div>
              </EditableWrapper>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Edit Modal */}
      <EditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, type: '', data: null })}
        type={editModal.type}
        data={editModal.data}
        onSave={handleSave}
      />
    </div>
  );
};

export default AboutPage;
