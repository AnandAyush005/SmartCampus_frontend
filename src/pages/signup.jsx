// src/pages/Signup.jsx - PERFECT MATCH FOR YOUR CONTROLLER
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { User, Mail, Lock, Phone, Image, ArrowRight } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    registrationNumber: '',
    mobile: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // VALIDATE AVATAR FIRST (controller requires it)
    if (!fileInputRef.current?.files[0]) {
      toast.error('Avatar image is required');
      return;
    }

    setLoading(true);

    // FormData - EXACTLY matches req.body + req.files.avatar[0]
    const submitData = new FormData();
    submitData.append('fullName', formData.fullName);
    submitData.append('email', formData.email);
    submitData.append('password', formData.password);
    submitData.append('registrationNumber', formData.registrationNumber);
    submitData.append('mobile', formData.mobile);
    submitData.append('role', formData.role);
    submitData.append('avatar', fileInputRef.current.files[0]); // req.files.avatar[0]

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/register`, // Adjust endpoint as needed
        submitData,
        { 
          headers: { 
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('Student registered successfully!');
      navigate('/');
      
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message); // Shows exact backend errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-linear-to-br from-emerald-50 to-blue-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-linear-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 to-emerald-700 bg-clip-text text-transparent mb-2">
            Student Registration
          </h1>
          <p className="text-gray-600">Join SmartCampus Hub</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
          <div className="space-y-6">
            {/* AVATAR - REQUIRED BY CONTROLLER */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Image className="w-4 h-4 mr-2" />
                Profile Picture <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  required
                  className="w-full p-3 border border-gray-200 rounded-2xl bg-gray-50/50 focus:ring-2 focus:ring-emerald-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {avatarPreview && (
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-200 mx-auto">
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* fullName */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl bg-gray-50/50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl bg-gray-50/50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="student@college.edu"
                />
              </div>
            </div>

            {/* registrationNumber */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Registration Number</label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl bg-gray-50/50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="CS2023001"
                />
              </div>
            </div>

            {/* mobile */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile</label>
              <div className="relative">
                <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  type="tel"
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl bg-gray-50/50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="9876543210"
                />
              </div>
            </div>

            {/* role */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl bg-gray-50/50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
                >
                  <option value="">Select Role</option>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>
            </div>

            {/* password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type="password"
                  required
                  minLength={6}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl bg-gray-50/50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-emerald-600 to-green-600 text-white font-semibold py-4 px-6 rounded-2xl hover:from-emerald-700 hover:to-green-700 focus:ring-4 focus:ring-emerald-500/50 shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2 group"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                Sign in
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
