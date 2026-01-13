// src/components/StatsCard.jsx
import { useNavigate } from 'react-router-dom';
import { Home, AlertCircle, BookOpen, Users } from 'lucide-react';

export default function StatsCard({ icon, count, label, onClick }) {
  const navigate = useNavigate();
  const icons = { home: Home, alert: AlertCircle, book: BookOpen, user: Users };
  const Icon = icons[icon] || Home;

  const handleClick = () => {
    console.log(`📊 Stats clicked: ${label}`);
    if (onClick) onClick();
  };

  return (
    <div 
      className="bg-linear-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl cursor-pointer transition-all hover:scale-105"
      onClick={handleClick}
    >
      <Icon className="w-12 h-12 mx-auto mb-4 opacity-90" />
      <div className="text-center">
        <div className="text-3xl font-bold mb-1">{count}</div>
        <div className="text-blue-100 font-medium">{label}</div>
      </div>
    </div>
  );
}
