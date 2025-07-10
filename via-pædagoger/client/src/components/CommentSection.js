import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import CommentForm from './CommentForm';
import Comment from './Comment';
import toast from 'react-hot-toast';

function CommentSection({ threadId, isLocked }) {
  const { isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [threadId]);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/api/comments/thread/${threadId}`);
      setComments(res.data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (content, parentCommentId = null) => {
    try {
      const res = await axios.post('/api/comments', {
        content,
        threadId,
        parentCommentId
      });
      
      toast.success('Kommentar tilføjet!');
      fetchComments();
      return true;
    } catch (err) {
      toast.error('Kunne ikke tilføje kommentar');
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-via-blue"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">
        {comments.length} {comments.length === 1 ? 'kommentar' : 'kommentarer'}
      </h2>
      
      {isAuthenticated && !isLocked && (
        <div className="mb-6">
          <CommentForm onSubmit={handleCommentSubmit} />
        </div>
      )}
      
      {isLocked && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <p className="text-sm text-yellow-800">
            Denne tråd er låst. Nye kommentarer kan ikke tilføjes.
          </p>
        </div>
      )}
      
      <div className="space-y-4">
        {comments.map(comment => (
          <Comment
            key={comment._id}
            comment={comment}
            onReply={handleCommentSubmit}
            isLocked={isLocked}
          />
        ))}
      </div>
      
      {comments.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          Ingen kommentarer endnu. Vær den første til at kommentere!
        </p>
      )}
    </div>
  );
}

export default CommentSection;