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
        className={`vote-button ${userVote === 'upvote' ? 'upvoted' : ''}`}
      >
        {userVote === 'upvote' ? (
          <ChevronUpSolid className="h-5 w-5" />
        ) : (
          <ChevronUpIcon className="h-5 w-5 text-gray-400 hover:text-orange-500" />
        )}
      </button>
      
      <span className={`text-xs font-bold py-1 ${
        userVote === 'upvote' ? 'text-orange-500' : 
        userVote === 'downvote' ? 'text-blue-600' : 
        'text-gray-700'
      }`}>
        {currentScore}
      </span>
      
      <button
        onClick={() => handleVote('downvote')}
        className={`vote-button ${userVote === 'downvote' ? 'downvoted' : ''}`}
      >
        {userVote === 'downvote' ? (
          <ChevronDownSolid className="h-5 w-5" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-400 hover:text-blue-600" />
        )}
      </button>
    </div>
  );
}

export default VoteButtons;