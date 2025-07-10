import React, { useState } from 'react';

function CommentForm({ onSubmit, onCancel, placeholder = "Skriv en kommentar..." }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setLoading(true);
    const success = await onSubmit(content);
    
    if (success) {
      setContent('');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-via-blue resize-none"
        disabled={loading}
      />
      
      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="bg-via-blue text-white px-4 py-2 rounded-md hover:bg-via-light-blue disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {loading ? 'Sender...' : 'Send kommentar'}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm font-medium"
          >
            Annuller
          </button>
        )}
      </div>
    </form>
  );
}

export default CommentForm;