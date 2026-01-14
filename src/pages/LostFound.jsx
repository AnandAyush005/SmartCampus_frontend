import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Navbar from '../components/dashboard/NavBar.jsx';
import { Search, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';

export default function LostFound() {
  const [items, setItems] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'my'
  const [filters, setFilters] = useState({ type: '', category: '' });
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'lost', // 'lost' or 'found'
    category: '',
    location: '',
    contactNumber: '',
    images: []
  });

  useEffect(() => {
    fetchUser();
    fetchItems();
  }, [filters]);

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

  const fetchItems = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.category) params.append('category', filters.category);
      params.append('status', 'approved');

      const baseUrl = import.meta.env.VITE_API_URL?.replace('/v1', '') || import.meta.env.VITE_API_URL;
      const [allRes, myRes] = await Promise.all([
        axios.get(`${baseUrl}/lost-found?${params}`, {
          withCredentials: true
        }),
        axios.get(`${baseUrl}/lost-found/my-posts`, {
          withCredentials: true
        })
      ]);

      setItems(allRes.data?.data || []);
      setMyItems(myRes.data?.data || []);
    } catch (err) {
      toast.error('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('type', formData.type);
    submitData.append('category', formData.category);
    submitData.append('location', formData.location);
    if (formData.contactNumber) submitData.append('contactNumber', formData.contactNumber);
    
    formData.images.forEach((file) => {
      submitData.append('images', file);
    });

    try {
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/v1', '') || import.meta.env.VITE_API_URL;
      await axios.post(`${baseUrl}/lost-found`, submitData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Post created successfully! Pending admin approval.');
      setShowCreateModal(false);
      setFormData({ title: '', description: '', type: 'lost', category: '', location: '', contactNumber: '', images: [] });
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    }
  };

  const handleClaim = async (itemId) => {
    if (!confirm('Are you sure you want to claim this item?')) return;

    try {
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/v1', '') || import.meta.env.VITE_API_URL;
      await axios.patch(`${baseUrl}/lost-found/${itemId}/claim`, {}, {
        withCredentials: true
      });
      toast.success('Item claimed successfully!');
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to claim item');
    }
  };

  const handleApprove = async (itemId, status) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/v1', '') || import.meta.env.VITE_API_URL;
      await axios.patch(`${baseUrl}/lost-found/${itemId}/approve`, 
        { status },
        { withCredentials: true }
      );
      toast.success(`Item ${status} successfully!`);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const isAdminOrFaculty = user?.role === 'admin' || user?.role === 'faculty';
  const displayItems = activeTab === 'my' ? myItems : items;

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 to-blue-50">
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-gray-900 to-emerald-600 bg-clip-text text-transparent">
            Lost & Found
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            Post Item
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'all' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'my' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            My Posts
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-black">
          <div className="flex items-center gap-4 flex-wrap">
            <Search className="w-5 h-5 text-gray-500" />
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="px-4 py-2 border-2 border-black rounded-lg bg-white text-black"
            >
              <option value="">All Types</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="px-4 py-2 border-2 border-black rounded-lg bg-white text-black"
            >
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="documents">Documents</option>
              <option value="clothing">Clothing</option>
              <option value="keys">Keys</option>
              <option value="other">Other</option>
            </select>
            <button
              onClick={fetchItems}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 border-2 border-black"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayItems.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-black">
              {item.images && item.images.length > 0 && (
                <img 
                  src={item.images[0]} 
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.type === 'lost' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {item.type}
                  </span>
                </div>
                <p className="text-gray-700 mb-4 line-clamp-2">{item.description}</p>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div><strong>Category:</strong> {item.category}</div>
                  <div><strong>Location:</strong> {item.location}</div>
                  <div><strong>Posted by:</strong> {item.postedBy?.fullName || 'Unknown'}</div>
                  <div><strong>Date:</strong> {new Date(item.createdAt).toLocaleDateString()}</div>
                  {item.claimStatus && (
                    <div>
                      <strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        item.claimStatus === 'claimed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.claimStatus}
                      </span>
                    </div>
                  )}
                </div>

                {item.images && item.images.length > 1 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {item.images.slice(1, 4).map((img, idx) => (
                      <img key={idx} src={img} alt={`${idx + 1}`} className="w-full h-20 object-cover rounded" />
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  {item.type === 'found' && item.claimStatus !== 'claimed' && (
                    <button
                      onClick={() => handleClaim(item._id)}
                      className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 text-sm font-semibold border-2 border-black"
                    >
                      Claim Item
                    </button>
                  )}
                  {isAdminOrFaculty && activeTab === 'all' && item.status !== 'approved' && (
                    <>
                      <button
                        onClick={() => handleApprove(item._id, 'approved')}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 text-sm font-semibold border-2 border-black"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApprove(item._id, 'rejected')}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 text-sm font-semibold border-2 border-black"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {displayItems.length === 0 && (
            <div className="col-span-full text-center py-20">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-2xl text-gray-500">No items found</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-black">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Post Lost/Found Item</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="lost">Lost</option>
                  <option value="found">Found</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="e.g., Lost iPhone 13"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  rows="4"
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Describe the item..."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select Category</option>
                    <option value="electronics">Electronics</option>
                    <option value="documents">Documents</option>
                    <option value="clothing">Clothing</option>
                    <option value="keys">Keys</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="e.g., Hostel A Block 2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Contact Number</label>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Images (max 5)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setFormData({...formData, images: Array.from(e.target.files).slice(0, 5)})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 border-2 border-black"
                >
                  Post Item
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
