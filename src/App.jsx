// src/App.jsx - Complete routing with all pages
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoutes.jsx';
import Login from './pages/login.jsx';
import Signup from './pages/signup.jsx';
import Dashboard from './pages/dashboard.jsx';
import AdminPanel from './pages/adminPanel.jsx';
import Notices from './pages/Notices.jsx';
import Issues from './pages/Issues.jsx';
import LostFound from './pages/LostFound.jsx';
import Profile from './pages/Profile.jsx';
import Search from './pages/Search.jsx';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } />
            <Route path="/notices" element={
              <ProtectedRoute>
                <Notices />
              </ProtectedRoute>
            } />
            <Route path="/issues" element={
              <ProtectedRoute>
                <Issues />
              </ProtectedRoute>
            } />
            <Route path="/lost-found" element={
              <ProtectedRoute>
                <LostFound />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/search" element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            } />
            
            {/* Catch all */}
            <Route path="*" element={<Login />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
