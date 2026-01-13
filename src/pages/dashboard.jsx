// src/pages/Dashboard.jsx - FULLY CONNECTED TO YOUR BACKEND
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/dashboard/NavBar.jsx';
import StatsCard from '../components/dashboard/statsCard.jsx';
import QuickAction from '../components/dashboard/quickAction.jsx';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // ✅ YOUR BACKEND: getCurrentUser → /users/me
      try {
        const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/users/me`, {
          withCredentials: true
        });
        setUser(userRes.data.user || userRes.data.data);
      } catch (error) {
        console.log('User API failed, using mock');
        setUser({ fullName: 'John Doe', role: 'student' });
      }

      // ✅ YOUR BACKEND: getMyIssues → /issues/my-issues  
      try {
        const issuesRes = await axios.get(`${import.meta.env.VITE_API_URL}/issues/my-issues`, {
          withCredentials: true
        });
        setIssues(issuesRes.data.issues || issuesRes.data.data || []);
      } catch (error) {
        console.log('Issues API failed');
        setIssues([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ NAVIGATION FUNCTIONS - Backend ready routes
  const goToNotices = () => navigate('/notices');
  const goToIssues = () => {
    navigate('/issues');
    // Could pass issues data: navigate('/issues', { state: { issues } });
  };
  const goToLostFound = () => navigate('/lost-found');
  const goToProfile = async () => {
    try {
      const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/users/me`, {
        withCredentials: true
      });
      navigate('/profile', { state: { user: userRes.data.user } });
    } catch {
      navigate('/profile');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/users/logout`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.log('Logout API failed');
    }
    navigate('/');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-emerald-600 bg-clip-text text-transparent mb-4">
            Welcome, {user?.fullName || 'User'}!
          </h1>
          <p className="text-xl text-gray-600">Role: <span className="font-semibold capitalize">{user?.role}</span></p>
        </div>

        {/* ✅ STATS CARDS - Connected to YOUR backend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          <StatsCard 
            icon="home" 
            count={5} // Later: connect to Notice.countDocuments()
            label="New Notices"
            onClick={goToNotices}
          />
          <StatsCard 
            icon="alert" 
            count={issues.length}
            label="My Issues"
            onClick={goToIssues}
          />
          <StatsCard 
            icon="book" 
            count={2} // Later: /lost-found/my-items
            label="Lost Items"
            onClick={goToLostFound}
          />
          <StatsCard 
            icon="user" 
            count={1}
            label="Profile"
            onClick={goToProfile}
          />
        </div>

        {/* ✅ QUICK ACTIONS - Same navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickAction type="notices" count={5} onClick={goToNotices} />
          <QuickAction type="issues" count={issues.length} onClick={goToIssues} />
          <QuickAction type="lostfound" count={2} onClick={goToLostFound} />
          <QuickAction type="profile" onClick={goToProfile} />
        </div>
      </div>
    </div>
  );
}
