import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  ChevronDownIcon,
  ArrowTrendingUpIcon,
  FireIcon,
  SparklesIcon,
  Bars3Icon,
  ArrowUpTrayIcon,
  ChatBubbleLeftIcon,
  GiftIcon,
  ShareIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import {
  UserCircleIcon
} from '@heroicons/react/24/solid';
import ThreadList from '../components/ThreadList';

function Home() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('hot');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchThreads();
  }, [sort, page]);

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/threads', {
        params: { sort, page, limit: 25 }
      });
      setThreads(res.data.threads);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch threads:', err);
    } finally {
      setLoading(false);
    }
  };

  const sortOptions = [
    { value: 'hot', label: 'Hot', icon: FireIcon },
    { value: 'new', label: 'New', icon: SparklesIcon },
    { value: 'top', label: 'Top', icon: ArrowTrendingUpIcon }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#DAE0E6' }}>
      {/* Reddit Header */}
      <header className="reddit-header">
        <div className="flex items-center h-full px-5 mx-auto" style={{ maxWidth: '1280px' }}>
          {/* Logo */}
          <Link to="/" className="flex items-center mr-5">
            <div className="w-8 h-8 bg-orange-500 rounded-full mr-2 flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="font-bold text-xl hidden sm:block">VIAPædagoger</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-4 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Søg VIAPædagoger"
              className="reddit-search"
            />
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Popular/All buttons */}
            <button className="reddit-dropdown-button hidden md:flex">
              <ArrowTrendingUpIcon className="h-5 w-5 mr-1" />
              <span>Popular</span>
            </button>

            {/* Create Post */}
            <Link to="/create" className="reddit-button reddit-button-secondary hidden sm:flex">
              <PlusIcon className="h-5 w-5 mr-1" />
              <span>Create Post</span>
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="reddit-dropdown">
                <button className="reddit-dropdown-button flex items-center">
                  <UserCircleIcon className="h-6 w-6 text-gray-400 mr-2" />
                  <span className="text-sm mr-1">{user?.username}</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="reddit-button reddit-button-primary">
                Log In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-12">
        <div className="mx-auto px-4" style={{ maxWidth: '976px' }}>
          <div className="flex gap-6 pt-5">
            {/* Feed */}
            <div className="flex-1">
              {/* Sort Bar */}
              <div className="bg-white rounded border border-gray-300 mb-4 px-3 py-2.5 flex items-center">
                <div className="flex space-x-2">
                  {sortOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSort(option.value);
                        setPage(1);
                      }}
                      className={`flex items-center px-3 py-1.5 rounded-full text-sm font-bold ${
                        sort === option.value
                          ? 'bg-gray-100 text-blue-600'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <option.icon className="h-5 w-5 mr-1.5" />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
                
                <div className="ml-auto flex items-center space-x-2">
                  <button className="p-1.5 rounded hover:bg-gray-100">
                    <Bars3Icon className="h-5 w-5 text-gray-500" />
                  </button>
                  <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                </div>
              </div>

              {/* Posts */}
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  <ThreadList threads={threads} />
                  
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-4 mb-8">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-l text-sm hover:bg-gray-50 disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <span className="px-4 py-2 bg-white border-t border-b border-gray-300 text-sm">
                        {page} / {totalPages}
                      </span>
                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-r text-sm hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block" style={{ width: '312px' }}>
              {/* Community Info */}
              <div className="reddit-sidebar">
                <div className="reddit-sidebar-header">
                  Om r/viapædagoger
                </div>
                
                <p className="text-sm mb-4">
                  Et fællesskab for pædagogstuderende på VIA University College. 
                  Del erfaringer, stil spørgsmål og hjælp hinanden gennem studiet.
                </p>

                <div className="flex items-center justify-between text-sm mb-4">
                  <div>
                    <div className="font-bold">{threads.length * 42}</div>
                    <div className="text-xs text-gray-500">Medlemmer</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                      {Math.floor(Math.random() * 50) + 10}
                    </div>
                    <div className="text-xs text-gray-500">Online</div>
                  </div>
                </div>

                <hr className="my-3" />

                <div className="text-xs text-gray-500 mb-3">
                  Created Jun 24, 2024
                </div>

                <Link to="/create" className="reddit-button reddit-button-primary w-full justify-center">
                  Create Post
                </Link>
              </div>

              {/* Rules */}
              <div className="reddit-sidebar">
                <div className="font-bold text-sm mb-3">r/viapædagoger Rules</div>
                <ol className="text-sm space-y-2">
                  <li>1. Vær respektfuld</li>
                  <li>2. Ingen personlige oplysninger</li>
                  <li>3. Relevant indhold</li>
                  <li>4. Ingen spam</li>
                  <li>5. Følg VIAs retningslinjer</li>
                </ol>
              </div>

              {/* Footer */}
              <div className="text-xs text-gray-500 px-3 space-y-1">
                <div className="flex flex-wrap gap-x-2">
                  <a href="#" className="hover:underline">Hjælp</a>
                  <a href="#" className="hover:underline">Reddit Coins</a>
                  <a href="#" className="hover:underline">Reddit Premium</a>
                </div>
                <div className="flex flex-wrap gap-x-2">
                  <a href="#" className="hover:underline">Om</a>
                  <a href="#" className="hover:underline">Karriere</a>
                  <a href="#" className="hover:underline">Presse</a>
                </div>
                <div className="pt-2">
                  <p>VIAPædagoger Clone © 2024. En Reddit-klon til VIA.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;