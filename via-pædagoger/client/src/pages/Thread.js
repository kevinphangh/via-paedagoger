import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { da } from 'date-fns/locale';
import VoteButtons from '../components/VoteButtons';
import CommentSection from '../components/CommentSection';
import { useAuth } from '../contexts/AuthContext';
import { TagIcon, UserIcon } from '@heroicons/react/24/outline';

function Thread() {
  const { id } = useParams();
  const { user } = useAuth();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThread();
  }, [id]);

  const fetchThread = async () => {
    try {
      const res = await axios.get(`/api/threads/${id}`);
      setThread(res.data);
    } catch (err) {
      console.error('Failed to fetch thread:', err);
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

  if (!thread) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Tråd ikke fundet</p>
      </div>
    );
  }

  const userVote = thread.upvotes?.includes(user?.id) ? 'upvote' : 
                  thread.downvotes?.includes(user?.id) ? 'downvote' : null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex">
          <div className="mr-4">
            <VoteButtons
              type="thread"
              id={thread._id}
              score={thread.score}
              upvotes={thread.upvotes?.length || 0}
              downvotes={thread.downvotes?.length || 0}
              userVote={userVote}
            />
          </div>
          
          <div className="flex-1">
            <div className="mb-4">
              <Link 
                to={`/c/${thread.category?.slug}`}
                className="text-sm font-medium hover:underline"
                style={{ color: thread.category?.color }}
              >
                {thread.category?.name}
              </Link>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {thread.title}
            </h1>
            
            <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
              <Link 
                to={`/u/${thread.author?.username}`}
                className="flex items-center space-x-1 hover:text-via-blue"
              >
                <UserIcon className="h-4 w-4" />
                <span>{thread.author?.username}</span>
              </Link>
              <span>•</span>
              <span>
                {formatDistanceToNow(new Date(thread.createdAt), { 
                  addSuffix: true, 
                  locale: da 
                })}
              </span>
              <span>•</span>
              <span>{thread.viewCount} visninger</span>
            </div>
            
            {thread.tags?.length > 0 && (
              <div className="flex items-center space-x-2 mb-4">
                <TagIcon className="h-4 w-4 text-gray-400" />
                {thread.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <div className="prose max-w-none">
              <ReactMarkdown>{thread.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
      
      <CommentSection threadId={thread._id} isLocked={thread.isLocked} />
    </div>
  );
}

export default Thread;