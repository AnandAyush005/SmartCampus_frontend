// src/components/QuickAction.jsx
import { useNavigate } from 'react-router-dom';
import { Home, AlertCircle, Book, User } from 'lucide-react';

export default function QuickAction({ type, count, onClick }) {
  const navigate = useNavigate();
  const icons = { notices: Home, issues: AlertCircle, lostfound: Book, profile: User };
  const Icon = icons[type] || Home;

  const handleClick = (e) => {
    e.preventDefault();
    console.log(`🎯 Clicked ${type}`);
    if (onClick) onClick();
    else navigate(`/${type}`);
  };

  return (
    <div 
      className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl cursor-pointer transition-all hover:-translate-y-1 border border-gray-100"
      onClick={handleClick}
    >
      <Icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2 capitalize">{type.replace('-', ' ')}</h3>
      {count !== undefined && (
        <p className="text-2xl font-bold text-emerald-600">{count}</p>
      )}
    </div>
  );
}
