'use client'

import { useState } from 'react'
import { BarChart3, CheckCircle2 } from 'lucide-react'
import { votePoll } from '@/services/apiServices'

export default function PollCard({ poll, currentUserId }: { poll: any, currentUserId: string }) {
  const [localPoll, setLocalPoll] = useState(poll)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  
  const totalVotes = localPoll.options.reduce((acc: number, opt: any) => acc + (opt.votes?.length || 0), 0)
  const hasVoted = localPoll.options.some((opt: any) => opt.votes?.includes(currentUserId))

  const handleVote = async (optId: string) => {
    if (hasVoted && !localPoll.allowMultiple) return;
    
    // Save previous state for rollback
    const previousPoll = JSON.parse(JSON.stringify(localPoll));
    const previousSelected = selectedOption;

    // Optimistic Update
    const optIndex = localPoll.options.findIndex((o: any) => o.id === optId)
    const updatedOptions = [...localPoll.options]
    if (!updatedOptions[optIndex].votes) updatedOptions[optIndex].votes = []
    updatedOptions[optIndex].votes.push(currentUserId)
    
    setLocalPoll({ ...localPoll, options: updatedOptions })
    setSelectedOption(optId)

    try { 
      await votePoll(localPoll._id || localPoll.id, optIndex, currentUserId) 
    } catch { 
      // Rollback on failure
      setLocalPoll(previousPoll)
      setSelectedOption(previousSelected)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700 max-w-sm w-full">
      <div className="flex items-center gap-2 mb-3 text-blue-600 dark:text-blue-400">
        <BarChart3 size={18} />
        <span className="text-xs font-bold uppercase tracking-wider">Poll</span>
      </div>
      <h3 className="font-bold text-lg dark:text-white mb-4 leading-tight">{localPoll.question}</h3>
      
      <div className="space-y-2">
        {localPoll.options.map((opt: any) => {
          const votes = opt.votes?.length || 0
          const percentage = totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100)
          const isWinner = percentage > 0 && Math.max(...localPoll.options.map((o:any) => o.votes?.length || 0)) === votes
          const iVotedForThis = opt.votes?.includes(currentUserId) || selectedOption === opt.id

          return (
            <div 
              key={opt.id}
              onClick={() => handleVote(opt.id)}
              className="relative overflow-hidden rounded-lg border dark:border-gray-700 cursor-pointer group"
            >
              {/* Progress bar background */}
              {(hasVoted || localPoll.showResults === 'always') && (
                <div 
                  className={`absolute top-0 bottom-0 left-0 transition-all duration-1000 ease-out ${isWinner ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-gray-100 dark:bg-gray-800/80'}`} 
                  style={{ width: `${percentage}%` }} 
                />
              )}
              
              <div className="relative z-10 flex justify-between items-center p-3">
                <span className={`font-medium text-sm flex items-center gap-2 ${iVotedForThis ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>
                  {iVotedForThis && <CheckCircle2 size={16} />}
                  {opt.text}
                </span>
                {(hasVoted || localPoll.showResults === 'always') && (
                  <span className={`text-xs font-bold ${isWinner ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
                    {percentage}%
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-gray-500 mt-4">{totalVotes} votes • {localPoll.isAnonymous ? 'Anonymous voting' : 'Public voting'}</p>
    </div>
  )
}
