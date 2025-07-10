import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { da } from 'date-fns/locale';
import { 
  ChatBubbleLeftIcon, 
  ShareIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import VoteButtons from './VoteButtons';

function ThreadList({ threads }) {
  if (threads.length === 0) {
    return (
      <div className="bg-white rounded border border-gray-300 p-8 text-center">
        <p className="text-gray-500 text-sm">Der er ingen opslag endnu. Vær den første!</p>
      </div>
    );
  }

  const formatRedditTime = (date) => {
    const now = new Date();
    const posted = new Date(date);
    const diffInSeconds = Math.floor((now - posted) / 1000);
    
    if (diffInSeconds < 60) return 'lige nu';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min. siden`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} timer siden`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} dage siden`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} måneder siden`;
    return `${Math.floor(diffInSeconds / 31536000)} år siden`;
  };

  return (
    <div>
      {threads.map((thread, index) => (
        <div key={thread._id} className="reddit-post-card">
          <div className="flex">
            {/* Vote section */}
            <div className="reddit-vote-section">
              <VoteButtons
                type="thread"
                id={thread._id}
                score={thread.score || 0}
                upvotes={thread.upvotes?.length || 0}
                downvotes={thread.downvotes?.length || 0}
                userVote={thread.userVote}
              />
            </div>
            
            {/* Post content */}
            <div className="reddit-post-content">
              {/* Post meta */}
              <div className="reddit-post-meta">
                <Link to={`/r/${thread.category?.slug || 'viapædagoger'}`} className="font-bold hover:underline">
                  r/{thread.category?.slug || 'viapædagoger'}
                </Link>
                <span className="mx-1">•</span>
                <span className="text-xs">
                  Slået op af
                  {' '}
                  <Link to={`/u/${thread.author?.username}`} className="hover:underline">
                    u/{thread.author?.username}
                  </Link>
                  {' '}
                  {formatRedditTime(thread.createdAt)}
                </span>
                {thread.pinned && (
                  <>
                    <span className="mx-1">•</span>
                    <span className="text-green-600 font-bold text-xs">📌 FASTGJORT</span>
                  </>
                )}
              </div>
              
              {/* Post title */}
              <h3 className="mb-2">
                <Link to={`/thread/${thread._id}`} className="reddit-post-title">
                  {thread.title}
                </Link>
              </h3>

              {/* Post preview */}
              {thread.content && (
                <div className="text-sm text-gray-700 mb-2 max-w-2xl">
                  <p className="line-clamp-3">{thread.content}</p>
                </div>
              )}
              
              {/* Post actions */}
              <div className="reddit-post-actions">
                <Link to={`/thread/${thread._id}`} className="reddit-action-button">
                  <ChatBubbleLeftIcon className="h-5 w-5 mr-1.5" />
                  <span>{thread.commentCount || 0} Kommentarer</span>
                </Link>
                
                <button className="reddit-action-button">
                  <GiftIcon className="h-5 w-5 mr-1.5" />
                  <span>Award</span>
                </button>
                
                <button className="reddit-action-button">
                  <ShareIcon className="h-5 w-5 mr-1.5" />
                  <span>Del</span>
                </button>
                
                <button className="reddit-action-button">
                  <BookmarkIcon className="h-5 w-5 mr-1.5" />
                  <span>Gem</span>
                </button>
                
                <button className="reddit-action-button ml-auto">
                  <EllipsisHorizontalIcon className="h-5 w-5" />
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