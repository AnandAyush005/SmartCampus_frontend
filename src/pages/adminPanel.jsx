import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Navbar from '../components/dashboard/NavBar.jsx';
import { Users, AlertCircle, FileText, CheckCircle, XCircle, Search, Shield } from 'lucide-react';

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'users', 'verifications'
  const [stats, setStats] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'faculty') {
      if (activeTab === 'dashboard') {
        fetchDashboardStats();
      } else if (activeTab === 'users') {
        fetchAllUsers();
      } else if (activeTab === 'verifications') {
        fetchPendingVerifications();
        fetchVerificationHistory();
      }
    }
  }, [user, activeTab]);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/me`, {
        withCredentials: true
      });
      const userData = res.data.user || res.data.data;
      setUser(userData);
      
      if (userData.role !== 'admin' && userData.role !== 'faculty') {
        toast.error('Access denied. Admin/Faculty only.');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error('Failed to fetch user data');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/admin-dashboard-stats`, {
        withCredentials: true
      });
      setStats(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch dashboard stats');
    }
  };

  const fetchAllUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/all-users?${params}`, {
        withCredentials: true
      });
      setAllUsers(res.data.data?.users || []);
    } catch (err) {
      toast.error('Failed to fetch users');
    }
  };

  const fetchPendingVerifications = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/pending-verifications`, {
        withCredentials: true
      });
      setPendingVerifications(res.data.data || []);
    } catch (err) {
      toast.error('Failed to fetch pending verifications');
    }
  };

  const fetchVerificationHistory = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/verification-history`, {
        withCredentials: true
      });
      setVerificationHistory(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch verification history');
    }
  };

  const handleVerifyUser = async (email, isAdmin = false) => {
    try {
      const endpoint = isAdmin 
        ? `${import.meta.env.VITE_API_URL}/users/admin/verify`
        : `${import.meta.env.VITE_API_URL}/users/faculty/verify-student`;
      
      await axios.put(endpoint, { email }, {
        withCredentials: true
      });
      toast.success('User verified successfully!');
      fetchPendingVerifications();
      fetchVerificationHistory();
      fetchDashboardStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify user');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (user?.role !== 'admin' && user?.role !== 'faculty') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-emerald-600 bg-clip-text text-transparent mb-8">
          Admin Panel
        </h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b-2 border-black">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 font-semibold transition-all border-b-2 ${
              activeTab === 'dashboard'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-600 hover:text-emerald-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-semibold transition-all border-b-2 ${
              activeTab === 'users'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-600 hover:text-emerald-600'
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => setActiveTab('verifications')}
            className={`px-6 py-3 font-semibold transition-all border-b-2 ${
              activeTab === 'verifications'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-600 hover:text-emerald-600'
            }`}
          >
            Verifications
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-black">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-blue-500" />
                <span className="text-3xl font-bold text-blue-600">{stats.verifiedStudents || 0}</span>
              </div>
              <p className="text-gray-600 font-semibold">Verified Students</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-black">
              <div className="flex items-center justify-between mb-4">
                <Shield className="w-8 h-8 text-purple-500" />
                <span className="text-3xl font-bold text-purple-600">{stats.verifiedFaculty || 0}</span>
              </div>
              <p className="text-gray-600 font-semibold">Verified Faculty</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-black">
              <div className="flex items-center justify-between mb-4">
                <AlertCircle className="w-8 h-8 text-yellow-500" />
                <span className="text-3xl font-bold text-yellow-600">{stats.openIssues || 0}</span>
              </div>
              <p className="text-gray-600 font-semibold">Open Issues</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-black">
              <div className="flex items-center justify-between mb-4">
                <AlertCircle className="w-8 h-8 text-orange-500" />
                <span className="text-3xl font-bold text-orange-600">{stats.inProgressIssues || 0}</span>
              </div>
              <p className="text-gray-600 font-semibold">In Progress Issues</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-black">
              <div className="flex items-center justify-between mb-4">
                <FileText className="w-8 h-8 text-emerald-500" />
                <span className="text-3xl font-bold text-emerald-600">{stats.activeNotices || 0}</span>
              </div>
              <p className="text-gray-600 font-semibold">Active Notices</p>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-black">
              <div className="flex items-center gap-4">
                <Search className="w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    fetchAllUsers();
                  }}
                  placeholder="Search users by name, email, or registration number..."
                  className="flex-1 px-4 py-2 border-2 border-black rounded-lg focus:outline-2 focus:outline-black focus:ring-2 focus:ring-black bg-white text-black"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-emerald-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Name</th>
                      <th className="px-6 py-4 text-left">Email</th>
                      <th className="px-6 py-4 text-left">Role</th>
                      <th className="px-6 py-4 text-left">Registration #</th>
                      <th className="px-6 py-4 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((u) => (
                      <tr key={u._id} className="border-b-2 border-black hover:bg-gray-100">
                        <td className="px-6 py-4">{u.fullName}</td>
                        <td className="px-6 py-4">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 capitalize">
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">{u.registrationNumber || 'N/A'}</td>
                        <td className="px-6 py-4">
                          {u.isVerified ? (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              ✓ Verified
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                              ⏳ Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {allUsers.length === 0 && (
                <div className="text-center py-20">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-2xl text-gray-500">No users found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Verifications Tab */}
        {activeTab === 'verifications' && (
          <div className="space-y-8">
            {/* Pending Verifications */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Pending Verifications</h2>
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-black">
                {pendingVerifications.length === 0 ? (
                  <div className="text-center py-20">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <p className="text-2xl text-gray-500">No pending verifications</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-emerald-600 text-white">
                        <tr>
                          <th className="px-6 py-4 text-left">Name</th>
                          <th className="px-6 py-4 text-left">Email</th>
                          <th className="px-6 py-4 text-left">Role</th>
                          <th className="px-6 py-4 text-left">Registration #</th>
                          <th className="px-6 py-4 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingVerifications.map((u) => (
                          <tr key={u._id} className="border-b-2 border-black hover:bg-gray-100">
                            <td className="px-6 py-4">{u.fullName}</td>
                            <td className="px-6 py-4">{u.email}</td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 capitalize">
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">{u.registrationNumber || 'N/A'}</td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleVerifyUser(u.email, user.role === 'admin')}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold border-2 border-black"
                              >
                                Verify
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Verification History */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Verification History</h2>
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-black">
                {verificationHistory.length === 0 ? (
                  <div className="text-center py-20">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-2xl text-gray-500">No verification history</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-emerald-600 text-white">
                        <tr>
                          <th className="px-6 py-4 text-left">Name</th>
                          <th className="px-6 py-4 text-left">Email</th>
                          <th className="px-6 py-4 text-left">Role</th>
                          <th className="px-6 py-4 text-left">Verified By</th>
                          <th className="px-6 py-4 text-left">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {verificationHistory.map((v) => (
                          <tr key={v._id} className="border-b-2 border-black hover:bg-gray-100">
                            <td className="px-6 py-4">{v.user?.fullName || 'N/A'}</td>
                            <td className="px-6 py-4">{v.user?.email || 'N/A'}</td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 capitalize">
                                {v.user?.role || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4">{v.verifiedBy?.fullName || 'N/A'}</td>
                            <td className="px-6 py-4">
                              {v.verifiedAt ? new Date(v.verifiedAt).toLocaleDateString() : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
