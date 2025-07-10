import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { ChevronUpIcon as ChevronUpSolid, ChevronDownIcon as ChevronDownSolid } from '@heroicons/react/24/solid';

function VoteButtons({ type, id, score, upvotes, downvotes, userVote: initialUserVote }) {
  const { isAuthenticated } = useAuth();
  const [currentScore, setCurrentScore] = useState(score);
  const [userVote, setUserVote] = useState(initialUserVote);

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      toast.error('Du skal være logget ind for at stemme');
      return;
    }

    try {
      const endpoint = type === 'thread' 
        ? `/api/votes/thread/${id}/${voteType}`
        : `/api/votes/comment/${id}/${voteType}`;
      
      const res = await axios.post(endpoint);
      setCurrentScore(res.data.score);
      setUserVote(res.data.userVote);
    } catch (err) {
      toast.error('Kunne ikke registrere din stemme');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => handleVote('upvote')}
        className={`p-1 rounded hover:bg-gray-100 ${
          userVote === 'upvote' ? 'text-orange-500' : 'text-gray-400'
        }`}
      >
        {userVote === 'upvote' ? (
          <ChevronUpSolid className="h-6 w-6" />
        ) : (
          <ChevronUpIcon className="h-6 w-6" />
        )}
      </button>
      
      <span className={`font-medium ${
        currentScore > 0 ? 'text-orange-500' : 
        currentScore < 0 ? 'text-blue-500' : 
        'text-gray-700'
      }`}>
        {currentScore}
      </span>
      
      <button
        onClick={() => handleVote('downvote')}
        className={`p-1 rounded hover:bg-gray-100 ${
          userVote === 'downvote' ? 'text-blue-500' : 'text-gray-400'
        }`}
      >
        {userVote === 'downvote' ? (
          <ChevronDownSolid className="h-6 w-6" />
        ) : (
          <ChevronDownIcon className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}

export default VoteButtons;