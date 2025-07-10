import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HomeIcon, UserGroupIcon, PlusIcon, UserIcon } from '@heroicons/react/24/outline';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-via-blue text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold flex items-center space-x-2">
              <UserGroupIcon className="h-8 w-8" />
              <span>VIA Pædagoger</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-1 hover:text-gray-200">
                <HomeIcon className="h-5 w-5" />
                <span>Hjem</span>
              </Link>
              <Link to="/categories" className="hover:text-gray-200">Kategorier</Link>
              {isAuthenticated && (
                <Link to="/create-thread" className="flex items-center space-x-1 hover:text-gray-200">
                  <PlusIcon className="h-5 w-5" />
                  <span>Ny Tråd</span>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to={`/u/${user?.username}`} className="flex items-center space-x-1 hover:text-gray-200">
                  <UserIcon className="h-5 w-5" />
                  <span>{user?.username}</span>
                  <span className="ml-1 text-sm text-gray-300">({user?.karma} karma)</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Log ud
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-gray-200">Log ind</Link>
                <Link 
                  to="/register" 
                  className="bg-via-light-blue hover:bg-blue-600 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Opret konto
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;