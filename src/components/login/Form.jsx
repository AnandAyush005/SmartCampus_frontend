// src/components/login/Form.jsx - Enhanced with AuthContext and cookie handling
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

export default function Form() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, checkAuthStatus } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Login request with credentials to receive cookies from backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/login`, 
        formData, 
        {
          withCredentials: true, // Critical: This allows cookies to be set and sent
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Backend response structure: { data: { user, accessToken }, message }
      // The cookie is automatically set by the browser from the Set-Cookie header
      const responseData = response.data?.data || response.data;
      const userData = responseData?.user;
      
      if (userData) {
        // Update AuthContext with user data immediately
        login(userData);
        
        toast.success('Login successful! Redirecting...');
        
        // Redirect to dashboard - cookies are already set by browser
        navigate('/dashboard', { replace: true });
      } else {
        toast.error('Login successful but user data not received');
        setLoading(false);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      toast.error(errorMessage);
      console.error('Login error:', error);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-black">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-black mb-2">Email</label>
          <div className="relative">
            <Mail className="w-5 h-5 text-black absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-11 pr-4 py-3 text-black border-2 border-black rounded-2xl focus:outline-2 focus:outline-black focus:ring-2 focus:ring-black bg-white"
              placeholder="student@college.edu"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-black mb-2">Password</label>
          <div className="relative">
            <Lock className="w-5 h-5 text-black absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full pl-11 pr-4 py-3 border-2 border-black text-black rounded-2xl focus:outline-2 focus:outline-black focus:ring-2 focus:ring-black bg-white"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-2xl hover:bg-blue-700 border-2 border-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p>Create Account ? <a href='/signup'>Sign Up</a></p>
      </div>
    </form>
  );
}
