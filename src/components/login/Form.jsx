// src/components/login/Form.jsx - NO CRASH VERSION
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Form() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/users/login`, formData, {
        withCredentials: true
      });
      
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <div className="relative">
            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-11 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500"
              placeholder="student@college.edu"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
          <div className="relative">
            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full pl-11 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-2xl hover:from-blue-700"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    </form>
  );
}
