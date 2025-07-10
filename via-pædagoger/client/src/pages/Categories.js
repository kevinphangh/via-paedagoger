import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FolderIcon } from '@heroicons/react/24/outline';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-via-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Kategorier</h1>
      
      <div className="grid gap-4 md:grid-cols-2">
        {categories.map(category => (
          <Link
            key={category._id}
            to={`/c/${category.slug}`}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start">
              <div 
                className="p-3 rounded-lg mr-4"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <FolderIcon 
                  className="h-6 w-6" 
                  style={{ color: category.color }}
                />
              </div>
              
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {category.name}
                </h2>
                <p className="text-gray-600 mb-2">{category.description}</p>
                <p className="text-sm text-gray-500">
                  {category.threadCount} tråde
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Categories;