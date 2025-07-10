import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { da } from 'date-fns/locale';
import VoteButtons from './VoteButtons';
import CommentForm from './CommentForm';
import { useAuth } from '../contexts/AuthContext';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

function Comment({ comment, onReply, isLocked, depth = 0 }) {
  const { user, isAuthenticated } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const maxDepth = 3;
  
  const userVote = comment.upvotes?.includes(user?.id) ? 'upvote' : 
                  comment.downvotes?.includes(user?.id) ? 'downvote' : null;

  const handleReplySubmit = async (content) => {
    const success = await onReply(content, comment._id);
    if (success) {
      setShowReplyForm(false);
    }
    return success;
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="flex">
        <div className="mr-3">
          <VoteButtons
            type="comment"
            id={comment._id}
            score={comment.score}
            upvotes={comment.upvotes?.length || 0}
            downvotes={comment.downvotes?.length || 0}
            userVote={userVote}
          />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2 text-sm text-gray-600">
            <Link 
              to={`/u/${comment.author?.username}`}
              className="font-medium hover:text-via-blue"
            >
              {comment.author?.username}
            </Link>
            <span>•</span>
            <span>
              {formatDistanceToNow(new Date(comment.createdAt), { 
                addSuffix: true, 
                locale: da 
              })}
            </span>
            {comment.isEdited && (
              <>
                <span>•</span>
                <span className="italic">redigeret</span>
              </>
            )}
          </div>
          
          <div className="prose prose-sm max-w-none mb-2">
            <ReactMarkdown>{comment.content}</ReactMarkdown>
          </div>
          
          {isAuthenticated && !isLocked && depth < maxDepth && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-via-blue"
            >
              <ChatBubbleLeftIcon className="h-4 w-4" />
              <span>Svar</span>
            </button>
          )}
          
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                onSubmit={handleReplySubmit}
                onCancel={() => setShowReplyForm(false)}
                placeholder="Skriv dit svar..."
              />
            </div>
          )}
        </div>
      </div>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map(reply => (
            <Comment
              key={reply._id}
              comment={reply}
              onReply={onReply}
              isLocked={isLocked}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Comment;