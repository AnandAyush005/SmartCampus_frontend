// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If no user, redirect to login BUT save intended destination
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
