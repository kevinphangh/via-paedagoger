import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { ArrowUpIcon as ArrowUpSolid, ArrowDownIcon as ArrowDownSolid } from '@heroicons/react/24/solid';

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

  const formatScore = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <>
      <button
        onClick={() => handleVote('upvote')}
        className={`reddit-vote-button ${userVote === 'upvote' ? 'upvoted' : ''}`}
        aria-label="Upvote"
      >
        {userVote === 'upvote' ? (
          <ArrowUpSolid className="h-5 w-5" />
        ) : (
          <ArrowUpIcon className="h-5 w-5" />
        )}
      </button>
      
      <div className="reddit-vote-score">
        {formatScore(currentScore)}
      </div>
      
      <button
        onClick={() => handleVote('downvote')}
        className={`reddit-vote-button ${userVote === 'downvote' ? 'downvoted' : ''}`}
        aria-label="Downvote"
      >
        {userVote === 'downvote' ? (
          <ArrowDownSolid className="h-5 w-5" />
        ) : (
          <ArrowDownIcon className="h-5 w-5" />
        )}
      </button>
    </>
  );
}

export default VoteButtons;