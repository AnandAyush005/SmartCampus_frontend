// src/components/Navbar.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ChevronDown } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-gray-900">SmartCampus</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <span>{user?.fullName}</span>
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border">
                <button 
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-lg"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
