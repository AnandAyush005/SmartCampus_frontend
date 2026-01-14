import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Navbar from '../components/dashboard/NavBar.jsx';
import { User, Mail, Phone, Key, Save, Edit2, X, Camera } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [changingAvatar, setChangingAvatar] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    registrationNumber: ''
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const userFromState = location.state?.user;
    if (userFromState) {
      setUser(userFromState);
      setFormData({
        fullName: userFromState.fullName || '',
        email: userFromState.email || '',
        mobile: userFromState.mobile || '',
        registrationNumber: userFromState.registrationNumber || ''
      });
      setLoading(false);
    } else {
      fetchUser();
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/me`, {
        withCredentials: true
      });
      const userData = res.data.user || res.data.data;
      setUser(userData);
      setFormData({
        fullName: userData.fullName || '',
        email: userData.email || '',
        mobile: userData.mobile || '',
        registrationNumber: userData.registrationNumber || ''
      });
    } catch (err) {
      toast.error('Failed to fetch user data');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/users/update-details`, formData, {
        withCredentials: true
      });
      setUser(res.data.user || res.data.data);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/users/change-password`, {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      }, {
        withCredentials: true
      });
      toast.success('Password changed successfully!');
      setChangingPassword(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const submitData = new FormData();
    submitData.append('avatar', file);

    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/users/update-avatar`, submitData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(res.data.user || res.data.data);
      toast.success('Avatar updated successfully!');
      setChangingAvatar(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update avatar');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 to-blue-50">
      <Navbar user={user} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-gray-900 to-emerald-600 bg-clip-text text-transparent mb-8">
          My Profile
        </h1>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8 pb-8 border-b-2 border-black">
            <div className="relative">
              <img
                src={user?.avatar || 'https://via.placeholder.com/150'}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-black"
              />
              <label className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full cursor-pointer hover:bg-emerald-700">
                <Camera className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <h2 className="text-2xl font-bold mt-4">{user?.fullName}</h2>
            <p className="text-gray-600 capitalize">{user?.role}</p>
            {user?.isVerified ? (
              <span className="mt-2 px-4 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                ✓ Verified
              </span>
            ) : (
              <span className="mt-2 px-4 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                ⏳ Pending Verification
              </span>
            )}
          </div>

          {/* Profile Details */}
          {!editing ? (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <User className="w-6 h-6 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-lg font-semibold">{user?.fullName}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-lg font-semibold">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Mobile</p>
                  <p className="text-lg font-semibold">{user?.mobile}</p>
                </div>
              </div>
              {user?.registrationNumber && (
                <div className="flex items-start gap-4">
                  <User className="w-6 h-6 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Registration Number</p>
                    <p className="text-lg font-semibold">{user?.registrationNumber}</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all border-2 border-black"
              >
                <Edit2 className="w-5 h-5" />
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdateDetails} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required
                  className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-2 focus:outline-black focus:ring-2 focus:ring-black bg-white text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-2 focus:outline-black focus:ring-2 focus:ring-black bg-white text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Mobile</label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  required
                  className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-2 focus:outline-black focus:ring-2 focus:ring-black bg-white text-black"
                />
              </div>
              {formData.registrationNumber && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Registration Number</label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-2 focus:outline-black focus:ring-2 focus:ring-black bg-white text-black"
                    readOnly
                  />
                </div>
              )}
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all border-2 border-black"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      fullName: user?.fullName || '',
                      email: user?.email || '',
                      mobile: user?.mobile || '',
                      registrationNumber: user?.registrationNumber || ''
                    });
                  }}
                  className="flex items-center gap-2 bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all border-2 border-black"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Change Password Section */}
          <div className="mt-8 pt-8 border-t-2 border-black">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Key className="w-5 h-5" />
                Change Password
              </h3>
              {!changingPassword && (
                <button
                  onClick={() => setChangingPassword(true)}
                  className="text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  Change Password
                </button>
              )}
            </div>
            {changingPassword && (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Old Password</label>
                  <input
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                    required
                    className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-2 focus:outline-black focus:ring-2 focus:ring-black bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-2 focus:outline-black focus:ring-2 focus:ring-black bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-2 focus:outline-black focus:ring-2 focus:ring-black bg-white text-black"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 border-2 border-black"
                  >
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setChangingPassword(false);
                      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
