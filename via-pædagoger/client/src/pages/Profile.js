import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { da } from 'date-fns/locale';
import { UserIcon, AcademicCapIcon, CalendarIcon, TrophyIcon } from '@heroicons/react/24/outline';

function Profile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [username]);

  const fetchUser = async () => {
    try {
      const usersRes = await axios.get('/api/users', {
        params: { limit: 1 }
      });
      
      const foundUser = usersRes.data.users.find(u => u.username === username);
      if (foundUser) {
        setUser(foundUser);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
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

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Bruger ikke fundet</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-via-blue rounded-full flex items-center justify-center">
              <UserIcon className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {user.username}
            </h1>
            
            <div className="space-y-2 text-gray-600 mb-4">
              <div className="flex items-center space-x-2">
                <TrophyIcon className="h-5 w-5" />
                <span>{user.karma} karma point</span>
              </div>
              
              {user.semester && (
                <div className="flex items-center space-x-2">
                  <AcademicCapIcon className="h-5 w-5" />
                  <span>{user.semester}. semester</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5" />
                <span>
                  Medlem siden {formatDistanceToNow(new Date(user.createdAt), { 
                    addSuffix: true, 
                    locale: da 
                  })}
                </span>
              </div>
            </div>
            
            {user.bio && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold mb-2">Bio</h2>
                <p className="text-gray-700">{user.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;