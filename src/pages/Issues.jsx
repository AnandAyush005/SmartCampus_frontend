import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Navbar from '../components/dashboard/NavBar.jsx';
import { AlertCircle, Plus, Filter, X, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [myIssues, setMyIssues] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [filters, setFilters] = useState({ category: '', status: '', priority: '' });
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    location: '',
    images: []
  });

  useEffect(() => {
    fetchUser();
    fetchIssues();
    if (user?.role === 'admin' || user?.role === 'faculty') {
      fetchFacultyList();
    }
  }, [user?.role]);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/me`, {
        withCredentials: true
      });
      setUser(res.data.user || res.data.data);
    } catch (err) {
      console.error('Failed to fetch user');
      navigate('/');
    }
  };

  const fetchIssues = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);

      const [allRes, myRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/issues?${params}`, {
          withCredentials: true
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/issues/my`, {
          withCredentials: true
        })
      ]);

      setIssues(allRes.data?.data || []);
      setMyIssues(myRes.data?.data || []);
    } catch (err) {
      toast.error('Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  const fetchFacultyList = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/faculty`, {
        withCredentials: true
      });
      setFacultyList(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch faculty');
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('category', formData.category);
    submitData.append('priority', formData.priority);
    if (formData.location) submitData.append('location', formData.location);
    
    formData.images.forEach((file) => {
      submitData.append('images', file);
    });

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/issues`, submitData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Issue reported successfully!');
      setShowCreateModal(false);
      setFormData({ title: '', description: '', category: '', priority: 'medium', location: '', images: [] });
      fetchIssues();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create issue');
    }
  };

  const handleAssignIssue = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const facultyEmail = formData.get('facultyEmail');

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/issues/${selectedIssue._id}/assign`, 
        { facultyEmail },
        { withCredentials: true }
      );
      toast.success('Issue assigned successfully!');
      setShowAssignModal(false);
      fetchIssues();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign issue');
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const status = formData.get('status');
    const resolutionNotes = formData.get('resolutionNotes');

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/issues/${selectedIssue._id}/status`, 
        { status, resolutionNotes },
        { withCredentials: true }
      );
      toast.success('Status updated successfully!');
      setShowStatusModal(false);
      fetchIssues();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isAdminOrFaculty = user?.role === 'admin' || user?.role === 'faculty';

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const displayIssues = isAdminOrFaculty ? issues : myIssues;

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 to-blue-50">
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-gray-900 to-emerald-600 bg-clip-text text-transparent">
            Issues
          </h1>
          {user?.role === 'student' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              Report Issue
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-black">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="px-4 py-2 border-2 border-black rounded-lg bg-white text-black"
            >
              <option value="">All Categories</option>
              <option value="wifi">WiFi</option>
              <option value="maintenance">Maintenance</option>
              <option value="canteen">Canteen</option>
              <option value="transport">Transport</option>
              <option value="lab">Lab</option>
              <option value="other">Other</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-4 py-2 border-2 border-black rounded-lg bg-white text-black"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
              className="px-4 py-2 border-2 border-black rounded-lg bg-white text-black"
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button
              onClick={fetchIssues}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 border-2 border-black"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Issues List */}
        <div className="grid gap-6">
          {displayIssues.map((issue) => (
            <div key={issue._id} className="bg-white rounded-2xl shadow-xl p-6 border-2 border-black">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{issue.title}</h3>
                  <p className="text-gray-700 mb-4">{issue.description}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(issue.status)}`}>
                    {issue.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(issue.priority)}`}>
                    {issue.priority}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                <div>
                  <strong>Category:</strong> {issue.category}
                </div>
                {issue.location && (
                  <div>
                    <strong>Location:</strong> {issue.location}
                  </div>
                )}
                <div>
                  <strong>Raised by:</strong> {issue.raisedBy?.fullName || 'Unknown'}
                </div>
                {issue.assignedTo && (
                  <div>
                    <strong>Assigned to:</strong> {issue.assignedTo.fullName}
                  </div>
                )}
                <div>
                  <strong>Date:</strong> {new Date(issue.createdAt).toLocaleDateString()}
                </div>
              </div>

              {issue.images && issue.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {issue.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`Issue ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                  ))}
                </div>
              )}

              {issue.resolutionNotes && (
                <div className="bg-green-50 border-2 border-black p-4 rounded mb-4">
                  <strong>Resolution Notes:</strong> {issue.resolutionNotes}
                </div>
              )}

              {isAdminOrFaculty && (
                <div className="flex gap-2 mt-4">
                  {!issue.assignedTo && (
                    <button
                      onClick={() => {
                        setSelectedIssue(issue);
                        setShowAssignModal(true);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 border-2 border-black"
                    >
                      Assign
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedIssue(issue);
                      setShowStatusModal(true);
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 border-2 border-black"
                  >
                    Update Status
                  </button>
                </div>
              )}
            </div>
          ))}

          {displayIssues.length === 0 && (
            <div className="text-center py-20">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-2xl text-gray-500">No issues found</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Issue Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-black">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Report New Issue</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateIssue} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="w-full px-4 py-2 border-2 border-black rounded-lg bg-white text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  rows="4"
                  className="w-full px-4 py-2 border-2 border-black rounded-lg bg-white text-black"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                    className="w-full px-4 py-2 border-2 border-black rounded-lg bg-white text-black"
                  >
                    <option value="">Select Category</option>
                    <option value="wifi">WiFi</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="canteen">Canteen</option>
                    <option value="transport">Transport</option>
                    <option value="lab">Lab</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-black rounded-lg bg-white text-black"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-black rounded-lg bg-white text-black"
                  placeholder="e.g., Building A, Room 101"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Images (max 5)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setFormData({...formData, images: Array.from(e.target.files).slice(0, 5)})}
                  className="w-full px-4 py-2 border-2 border-black rounded-lg bg-white text-black"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 border-2 border-black"
                >
                  Submit Issue
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

      {/* Assign Issue Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full border-2 border-black">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Assign Issue</h2>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAssignIssue} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Faculty Email *</label>
                <select
                  name="facultyEmail"
                  required
                  className="w-full px-4 py-2 border-2 border-black rounded-lg bg-white text-black"
                >
                  <option value="">Select Faculty</option>
                  {facultyList.map((faculty) => (
                    <option key={faculty._id} value={faculty.email}>
                      {faculty.fullName} ({faculty.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 border-2 border-black"
                >
                  Assign
                </button>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-6 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 border-2 border-black"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full border-2 border-black">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Update Status</h2>
              <button onClick={() => setShowStatusModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Status *</label>
                <select
                  name="status"
                  required
                  className="w-full px-4 py-2 border-2 border-black rounded-lg bg-white text-black"
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Resolution Notes</label>
                <textarea
                  name="resolutionNotes"
                  rows="4"
                  className="w-full px-4 py-2 border-2 border-black rounded-lg bg-white text-black"
                  placeholder="Add resolution notes..."
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 border-2 border-black"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
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
