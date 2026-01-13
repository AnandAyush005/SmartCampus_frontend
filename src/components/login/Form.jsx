// FIXED Form Component - COMPLETE LOGIN FORM
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useState } from 'react';                    // ✅ FIXED: useState from 'react'
import { useNavigate } from 'react-router-dom';     // ✅ useNavigate from 'react-router-dom'

export default function Form() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // ✅ useNavigate hook

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/login`,
        formData,
        { withCredentials: true } // ✅ Added cookies
      );

      toast.success('Login successful!');
      navigate('/dashboard'); // ✅ FIXED: navigate() not Router.push()
      
    } catch (error) {
      let errorMessage = 'Login failed';
      
      if (error.response?.status === 403) {
        const htmlResponse = error.response?.data;
        if (htmlResponse && typeof htmlResponse === 'string') {
          const match = htmlResponse.match(/Error: ([^<]+)/);
          if (match) {
            errorMessage = match[1].trim();
          }
        }
      } else {
        errorMessage = error.response?.data?.message || 'Login failed';
      }
      
      if (errorMessage.includes('verified') || 
          errorMessage.includes('verify') ||
          errorMessage.includes('not verified') ||
          errorMessage.includes('admin')) {
        toast.error('You are not verified'); // ✅ Your requirement
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
      <div className="space-y-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl bg-gray-50/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="student@college.edu"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl bg-gray-50/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-500/50 shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2 group"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </>
          )}
        </button>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/signup" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            Sign up
          </a>
        </p>
      </div>
    </form>
  );
}
