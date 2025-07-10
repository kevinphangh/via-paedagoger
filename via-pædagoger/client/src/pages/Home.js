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

  useEffect(() => {
    fetchThreads();
  }, [sort, page]);

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/threads', {
        params: { sort, page, limit: 20 }
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
    { value: 'hot', label: 'Populære', icon: FireIcon },
    { value: 'new', label: 'Nye', icon: ClockIcon },
    { value: 'top', label: 'Top', icon: TrophyIcon }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md mb-6 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Velkommen til VIA Pædagoger Forum
        </h1>
        <p className="text-gray-600">
          Et fællesskab for pædagogstuderende på VIA University College. 
          Del erfaringer, stil spørgsmål og hjælp hinanden gennem studiet.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Sorter efter:</span>
          <div className="flex space-x-2">
            {sortOptions.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  setSort(option.value);
                  setPage(1);
                }}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  sort === option.value
                    ? 'bg-via-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <option.icon className="h-4 w-4" />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-via-blue"></div>
        </div>
      ) : (
        <>
          <ThreadList threads={threads} />
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-4 py-2 rounded-md ${
                    page === i + 1
                      ? 'bg-via-blue text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Home;