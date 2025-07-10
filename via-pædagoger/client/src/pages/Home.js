import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ThreadList from '../components/ThreadList';
import { FireIcon, ClockIcon, TrophyIcon } from '@heroicons/react/24/outline';

function Home() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('hot');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedThreads, setExpandedThreads] = useState(new Set());

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

  const toggleThread = (threadId) => {
    setExpandedThreads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(threadId)) {
        newSet.delete(threadId);
      } else {
        newSet.add(threadId);
      }
      return newSet;
    });
  };

  const sortOptions = [
    { value: 'hot', label: 'Hot', icon: FireIcon },
    { value: 'new', label: 'New', icon: ClockIcon },
    { value: 'top', label: 'Top', icon: TrophyIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Reddit-style header bar */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-bold text-gray-900">VIA Pædagoger</h1>
              <div className="flex space-x-1">
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSort(option.value);
                      setPage(1);
                    }}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                      sort === option.value
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <option.icon className="h-4 w-4" />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <Link 
              to="/create" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium"
            >
              Create Post
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex gap-6">
          {/* Main content */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <ThreadList 
                  threads={threads} 
                  expandedThreads={expandedThreads}
                  toggleThread={toggleThread}
                />
                
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6 space-x-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-80">
            <div className="bg-white rounded-lg p-4 mb-4">
              <h2 className="font-bold text-sm mb-3">About VIA Pædagoger</h2>
              <p className="text-sm text-gray-600 mb-3">
                A community for pedagogy students at VIA University College. 
                Share experiences, ask questions, and help each other.
              </p>
              <div className="text-xs text-gray-500 space-y-1">
                <div>Created Jun 24, 2024</div>
                <div>{threads.length} posts</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;