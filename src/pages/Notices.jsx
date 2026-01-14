import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Navbar from '../components/dashboard/NavBar.jsx';
import { Plus, X, FileText } from 'lucide-react';

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', content: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    content: '',
    category: 'notice',
    eventDate: '',
    isPinned: false,
    pdfFile: null
  });
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotices();
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/me`, {
        withCredentials: true
      });
      setUser(res.data.user);
    } catch (err) {
      console.error('Failed to fetch user');
    }
  };

  const fetchNotices = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/notices`, {
        withCredentials: true
      });
      setNotices(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  };

  // ✅ ADMIN/FACULTY: DELETE NOTICE
  const handleDelete = async (noticeId) => {
    if (!confirm('Delete this notice?')) return;
    
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/notices/${noticeId}`, {
        withCredentials: true
      });
      setNotices(notices.filter(n => n._id !== noticeId));
    } catch (err) {
      alert('Delete failed');
    }
  };

  // ✅ ADMIN/FACULTY: START EDIT
  const handleEdit = (notice) => {
    setEditingId(notice._id);
    setEditForm({ title: notice.title, content: notice.content });
  };

  // ✅ ADMIN/FACULTY: UPDATE NOTICE
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/notices/${editingId}`, editForm, {
        withCredentials: true
      });
      
      // Update local state
      setNotices(notices.map(n => 
        n._id === editingId ? { ...n, ...editForm } : n
      ));
      setEditingId(null);
      setEditForm({ title: '', content: '' });
      toast.success('Notice updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  // ✅ ADMIN/FACULTY: CREATE NOTICE
  const handleCreateNotice = async (e) => {
    e.preventDefault();
    
    const submitData = new FormData();
    submitData.append('title', createForm.title);
    submitData.append('content', createForm.content);
    submitData.append('category', createForm.category);
    if (createForm.eventDate) submitData.append('eventDate', createForm.eventDate);
    submitData.append('isPinned', createForm.isPinned);
    if (createForm.pdfFile) submitData.append('pdfFile', createForm.pdfFile);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/notices`, submitData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Notice created successfully!');
      setShowCreateModal(false);
      setCreateForm({ title: '', content: '', category: 'notice', eventDate: '', isPinned: false, pdfFile: null });
      fetchNotices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create notice');
    }
  };

  const canManage = user?.role === 'admin' || user?.role === 'faculty';

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 to-blue-50">
      <Navbar user={user} />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-gray-900 to-emerald-600 bg-clip-text text-transparent">
            Notices
          </h1>
          {canManage && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Notice
            </button>
          )}
        </div>

        <div className="grid gap-6">
          {notices.map((notice) => (
            <div key={notice._id} className="bg-white rounded-2xl shadow-xl p-8 border-2 border-black hover:shadow-2xl transition-all">
              {canManage && editingId === notice._id ? (
                // ✅ EDIT FORM
                <form onSubmit={handleUpdate} className="space-y-4">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    placeholder="Notice Title"
                    className="w-full p-3 border-2 border-black rounded-xl focus:outline-2 focus:outline-black focus:ring-2 focus:ring-black text-xl font-semibold bg-white text-black"
                    required
                  />
                  <textarea
                    value={editForm.content}
                    onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                    placeholder="Notice Content"
                    rows="4"
                    className="w-full p-3 border-2 border-black rounded-xl focus:outline-2 focus:outline-black focus:ring-2 focus:ring-black bg-white text-black"
                    required
                  />
                  <div className="flex gap-3">
                    <button type="submit" className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-emerald-700 transition-all border-2 border-black">
                      💾 Update Notice
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setEditForm({ title: '', content: '' });
                      }}
                      className="px-6 bg-gray-200 text-gray-800 py-3 rounded-xl hover:bg-gray-300 transition-all"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </form>
              ) : (
                // ✅ VIEW MODE
                <>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">{notice.title}</h3>
                    {notice.isPinned && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                        📌 Pinned
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">{notice.content}</p>
                  {notice.fileUrl && (
                    <a
                      href={notice.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4"
                    >
                      <FileText className="w-4 h-4" />
                      View Attachment
                    </a>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex gap-4">
                      <span>📅 {new Date(notice.createdAt).toLocaleDateString()}</span>
                      {notice.category && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs capitalize">
                          {notice.category}
                        </span>
                      )}
                    </div>
                    {canManage && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(notice)}
                          className="p-2 hover:bg-emerald-100 rounded-lg transition-all"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(notice._id)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
          
          {notices.length === 0 && (
            <div className="text-center py-20">
              <p className="text-2xl text-gray-500 mb-4">📭 No notices found</p>
              {canManage && (
                <p className="text-emerald-600 font-semibold">
                  Create your first notice from backend admin panel!
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Notice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-black">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Create New Notice</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateNotice} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Title *</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
                  required
                  className="w-full px-4 py-2 border-2 border-black rounded-lg bg-white text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Content *</label>
                <textarea
                  value={createForm.content}
                  onChange={(e) => setCreateForm({...createForm, content: e.target.value})}
                  required
                  rows="6"
                  className="w-full px-4 py-2 border-2 border-black rounded-lg bg-white text-black"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Category</label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({...createForm, category: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-black rounded-lg bg-white text-black"
                  >
                    <option value="notice">Notice</option>
                    <option value="event">Event</option>
                    <option value="holiday">Holiday</option>
                    <option value="exam">Exam</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Event Date (Optional)</label>
                  <input
                    type="date"
                    value={createForm.eventDate}
                    onChange={(e) => setCreateForm({...createForm, eventDate: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-black rounded-lg bg-white text-black"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={createForm.isPinned}
                  onChange={(e) => setCreateForm({...createForm, isPinned: e.target.checked})}
                  className="w-4 h-4"
                />
                <label htmlFor="isPinned" className="text-sm font-semibold">Pin this notice</label>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">PDF Attachment (Optional)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setCreateForm({...createForm, pdfFile: e.target.files[0]})}
                  className="w-full px-4 py-2 border-2 border-black rounded-lg bg-white text-black"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 border-2 border-black"
                >
                  Create Notice
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 border-2 border-black"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
