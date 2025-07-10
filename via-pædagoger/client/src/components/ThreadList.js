import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { da } from 'date-fns/locale';
import { ChatBubbleLeftIcon, ShareIcon } from '@heroicons/react/24/outline';
import VoteButtons from './VoteButtons';

function ThreadList({ threads, expandedThreads, toggleThread }) {
  if (threads.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <p className="text-gray-500">No posts yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {threads.map(thread => (
        <div key={thread._id} className="bg-white rounded border hover:border-gray-400 transition-colors">
          <div className="flex">
            {/* Upvote/Downvote section */}
            <div className="w-10 bg-gray-50 py-2 flex flex-col items-center">
              <VoteButtons
                type="thread"
                id={thread._id}
                score={thread.score || 0}
                upvotes={thread.upvotes?.length || 0}
                downvotes={thread.downvotes?.length || 0}
                userVote={thread.userVote}
              />
            </div>
            
            {/* Main content */}
            <div className="flex-1 p-2">
              <div className="flex items-center space-x-1 text-xs text-gray-500 mb-1">
                <span className="font-medium text-gray-700 hover:underline cursor-pointer">
                  r/{thread.category?.slug || 'general'}
                </span>
                <span>•</span>
                <span>Posted by</span>
                <Link to={`/u/${thread.author?.username}`} className="hover:underline">
                  u/{thread.author?.username}
                </Link>
                <span>
                  {formatDistanceToNow(new Date(thread.createdAt), { 
                    addSuffix: true,
                    locale: da 
                  })}
                </span>
              </div>
              
              <h3 className="text-md font-medium text-gray-900 mb-1">
                <Link 
                  to={`/thread/${thread._id}`}
                  className="hover:text-blue-600"
                  onClick={(e) => {
                    if (expandedThreads && expandedThreads.has(thread._id)) {
                      e.preventDefault();
                      toggleThread(thread._id);
                    }
                  }}
                >
                  {thread.title}
                </Link>
              </h3>
              
              {/* Preview content */}
              {thread.content && expandedThreads && expandedThreads.has(thread._id) && (
                <div className="text-sm text-gray-700 mb-2 max-w-3xl">
                  <p className="line-clamp-3">{thread.content}</p>
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <button 
                  onClick={() => toggleThread && toggleThread(thread._id)}
                  className="flex items-center space-x-1 p-1 hover:bg-gray-100 rounded"
                >
                  <ChatBubbleLeftIcon className="h-4 w-4" />
                  <span>{thread.commentCount || 0} Comments</span>
                </button>
                <button className="flex items-center space-x-1 p-1 hover:bg-gray-100 rounded">
                  <ShareIcon className="h-4 w-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ThreadList;