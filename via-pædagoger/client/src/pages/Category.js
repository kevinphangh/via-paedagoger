import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ThreadList from '../components/ThreadList';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

function Category() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const [category, setCategory] = useState(null);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('hot');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategory();
  }, [slug]);

  useEffect(() => {
    if (category) {
      fetchThreads();
    }
  }, [category, sort, page]);

  const fetchCategory = async () => {
    try {
      const res = await axios.get(`/api/categories/${slug}`);
      setCategory(res.data);
    } catch (err) {
      console.error('Failed to fetch category:', err);
    }
  };

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/threads', {
        params: { category: slug, sort, page, limit: 20 }
      });
      setThreads(res.data.threads);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch threads:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!category) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-via-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md mb-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-3xl font-bold mb-2"
              style={{ color: category.color }}
            >
              {category.name}
            </h1>
            <p className="text-gray-600">{category.description}</p>
            <p className="text-sm text-gray-500 mt-2">{category.threadCount} tråde</p>
          </div>
          
          {isAuthenticated && (
            <Link
              to="/create-thread"
              state={{ categoryId: category._id }}
              className="bg-via-blue text-white px-4 py-2 rounded-md hover:bg-via-light-blue flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Ny tråd</span>
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Sorter efter:</span>
          <div className="flex space-x-2">
            {['hot', 'new', 'top'].map(sortOption => (
              <button
                key={sortOption}
                onClick={() => {
                  setSort(sortOption);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  sort === sortOption
                    ? 'bg-via-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {sortOption === 'hot' ? 'Populære' : 
                 sortOption === 'new' ? 'Nye' : 'Top'}
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

export default Category;