import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { da } from 'date-fns/locale';
import VoteButtons from './VoteButtons';
import { ChatBubbleLeftIcon, EyeIcon, TagIcon } from '@heroicons/react/24/outline';

function ThreadList({ threads }) {
  if (threads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">Ingen tråde fundet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {threads.map(thread => (
        <div key={thread._id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
          <div className="flex">
            <div className="mr-4">
              <VoteButtons
                type="thread"
                id={thread._id}
                score={thread.score}
                upvotes={thread.upvotes?.length || 0}
                downvotes={thread.downvotes?.length || 0}
              />
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link 
                    to={`/thread/${thread._id}`}
                    className="text-xl font-semibold text-gray-900 hover:text-via-blue"
                  >
                    {thread.title}
                  </Link>
                  
                  <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600">
                    <Link 
                      to={`/c/${thread.category?.slug}`}
                      className="font-medium hover:text-via-blue"
                      style={{ color: thread.category?.color }}
                    >
                      {thread.category?.name}
                    </Link>
                    <span>•</span>
                    <Link to={`/u/${thread.author?.username}`} className="hover:text-via-blue">
                      {thread.author?.username}
                    </Link>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(thread.createdAt), { 
                        addSuffix: true, 
                        locale: da 
                      })}
                    </span>
                  </div>
                  
                  {thread.tags?.length > 0 && (
                    <div className="flex items-center space-x-2 mt-2">
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
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <ChatBubbleLeftIcon className="h-4 w-4" />
                  <span>{thread.commentCount} kommentarer</span>
                </div>
                <div className="flex items-center space-x-1">
                  <EyeIcon className="h-4 w-4" />
                  <span>{thread.viewCount} visninger</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ThreadList;