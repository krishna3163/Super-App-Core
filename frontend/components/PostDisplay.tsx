'use client'

import React, { useState } from 'react'
import {
  Heart, MessageCircle, Share2, MoreHorizontal, Repeat2, Flag,
  Globe, X, Send, AlertCircle, Users, Calendar, Clock
} from 'lucide-react'
import clsx from 'clsx'

interface PostDisplayProps {
  post: any
  currentUserId?: string
  onLike: (postId: string) => void
  onRepost: (postId: string) => void
  onShare: (postId: string, targetUserIds: string[]) => void
  onReport: (postId: string, reason: string, description: string) => void
  onMention: (userId: string, userName: string) => void
  onComment?: (postId: string) => void
}

export default function PostDisplay({
  post,
  currentUserId,
  onLike,
  onRepost,
  onShare,
  onReport,
  onMention,
  onComment
}: PostDisplayProps) {
  const [showReportModal, setShowReportModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showMentionModal, setShowMentionModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDescription, setReportDescription] = useState('')

  const isLiked = post.likes?.includes(currentUserId) || false
  const isDeleted = post.isDeleted

  const handleReport = async () => {
    await onReport(post._id, reportReason, reportDescription)
    setShowReportModal(false)
    setReportReason('')
    setReportDescription('')
  }

  if (isDeleted) {
    return (
      <div className="bg-[var(--bg-card)] rounded-[2rem] border border-red-500/30 p-6 mb-4 flex items-center gap-3">
        <AlertCircle className="text-red-500" size={24} />
        <div>
          <p className="font-bold text-red-500">Post Removed</p>
          <p className="text-xs text-[var(--syn-comment)]">{post.deletionReason || 'This post has been removed'}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-[var(--bg-card)] rounded-[2rem] border border-gray-200/20 dark:border-gray-800/40 shadow-xl overflow-hidden mb-6">
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--bg-elevated)] overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500"
              onClick={() => onMention(post.userId, post.userName)}>
              <img src={post.userAvatar || `https://i.pravatar.cc/100?u=${post.userId}`} className="w-full h-full object-cover" alt="" />
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-tight text-[var(--text-primary)] cursor-pointer hover:text-blue-500"
                onClick={() => onMention(post.userId, post.userName)}>
                {post.userName || 'Anonymous User'}
              </p>
              <p className="text-[10px] text-[var(--syn-comment)] font-bold flex items-center gap-1">
                <Globe size={10} /> {new Date(post.createdAt).toLocaleDateString()} {post.location?.address && `· ${post.location.address}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {post.reportCount > 0 && (
              <span className="text-[10px] text-red-500 font-bold px-2 py-1 bg-red-500/10 rounded-lg">
                {post.reportCount} reports
              </span>
            )}
            <button className="p-2 hover:bg-[var(--bg-elevated)] rounded-xl transition-colors"
              onClick={() => setShowReportModal(true)}>
              <MoreHorizontal size={18} className="text-[var(--syn-comment)]" />
            </button>
          </div>
        </div>

        {/* Content - Varies by Type */}
        <div className="px-4 pb-3">
          {post.type === 'poll' && (
            <>
              <p className="font-black text-lg text-blue-500 mb-4">{post.content}</p>
              <div className="space-y-2">
                {post.metadata?.options?.map((opt: any, idx: number) => {
                  const votes = post.pollVotes?.[idx] || []
                  const percentage = post.metadata.options.reduce((sum: any) => sum + (votes?.length || 0), 0) > 0
                    ? Math.round((votes?.length || 0) / post.metadata.options.reduce((sum: any) => sum + (votes?.length || 0), 0) * 100)
                    : 0
                  return (
                    <button key={idx} className="w-full text-left p-2 rounded-lg border border-blue-500/30 hover:bg-blue-500/10 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-[var(--text-primary)]">{opt.text}</span>
                        <span className="text-xs text-blue-500 font-bold">{percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${percentage}%` }} />
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {post.type === 'event' && (
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 p-4 rounded-xl mb-3">
              <p className="font-black text-lg text-blue-500 mb-3">{post.metadata?.title || post.content}</p>
              <div className="space-y-2 text-sm text-[var(--text-primary)]">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-blue-500" />
                  <span>{post.metadata?.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-blue-500" />
                  <span>{post.metadata?.location}</span>
                </div>
              </div>
            </div>
          )}

          {post.type === 'reminder' && (
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 p-4 rounded-xl mb-3">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={20} className="text-purple-500" />
                <div>
                  <p className="font-black text-purple-500">{post.metadata?.date} at {post.metadata?.time}</p>
                </div>
              </div>
              <p className="text-[var(--text-primary)] font-medium">{post.metadata?.description}</p>
            </div>
          )}

          {post.type === 'alert' && (
            <div className={clsx(
              'border-l-4 p-4 rounded-lg mb-3',
              post.metadata?.level === 'critical' ? 'bg-red-500/10 border-red-500' :
              post.metadata?.level === 'warning' ? 'bg-yellow-500/10 border-yellow-500' :
              'bg-blue-500/10 border-blue-500'
            )}>
              <div className="flex items-start gap-2">
                <AlertCircle size={20} className={
                  post.metadata?.level === 'critical' ? 'text-red-500' :
                  post.metadata?.level === 'warning' ? 'text-yellow-500' :
                  'text-blue-500'
                } />
                <p className={clsx(
                  'font-black text-sm',
                  post.metadata?.level === 'critical' ? 'text-red-500' :
                  post.metadata?.level === 'warning' ? 'text-yellow-500' :
                  'text-blue-500'
                )}>
                  {post.metadata?.level?.toUpperCase()} - {post.content}
                </p>
              </div>
            </div>
          )}

          {post.type === 'notice' && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 p-4 rounded-xl mb-3">
              <p className="font-black text-lg text-yellow-600">{post.content}</p>
            </div>
          )}

          {['text', 'image', 'video'].includes(post.type) && (
            <p className="text-sm leading-relaxed text-[var(--text-primary)] font-medium mb-3">
              {post.content}
            </p>
          )}

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.hashtags.map((h: string) => (
                <a key={h} href={`/?hashtag=${h}`} className="text-[10px] font-black text-blue-500 uppercase hover:text-blue-600">
                  #{h}
                </a>
              ))}
            </div>
          )}

          {/* Mentions */}
          {post.mentions && post.mentions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.mentions.map((m: string) => (
                <button key={m} onClick={() => onMention('', m)}
                  className="text-[10px] font-black text-purple-500 uppercase hover:text-purple-600">
                  @{m}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className="px-2">
            <div className="rounded-[1.5rem] overflow-hidden bg-[var(--bg-elevated)]">
              {post.media[0]?.mediaType === 'video' ? (
                <video src={post.media[0].url} controls className="w-full h-auto" />
              ) : (
                <img src={post.media[0].url} className="w-full h-auto object-cover max-h-[500px]" alt="" />
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 flex items-center justify-between border-t border-gray-200/20 dark:border-gray-800/50 mt-2">
          <div className="flex items-center gap-4">
            <button onClick={() => onLike(post._id)}
              className={clsx(
                "flex items-center gap-1.5 p-2 rounded-xl transition-all active:scale-90",
                isLiked ? "text-red-500 bg-red-900/20" : "text-[var(--syn-comment)] hover:bg-[var(--bg-elevated)]"
              )}>
              <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
              <span className="text-xs font-black">{post.likes?.length || 0}</span>
            </button>
            <button onClick={() => onComment?.(post._id)}
              className="flex items-center gap-1.5 p-2 text-[var(--syn-comment)] hover:bg-[var(--bg-elevated)] rounded-xl transition-all">
              <MessageCircle size={20} />
              <span className="text-xs font-black">{post.commentCount || 0}</span>
            </button>
            <button onClick={() => onRepost(post._id)}
              className="flex items-center gap-1.5 p-2 text-[var(--syn-comment)] hover:bg-[var(--bg-elevated)] hover:text-green-500 rounded-xl transition-all">
              <Repeat2 size={20} />
              <span className="text-xs font-black">{post.reposts?.length || 0}</span>
            </button>
            <button onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 p-2 text-[var(--syn-comment)] hover:bg-[var(--bg-elevated)] hover:text-blue-500 rounded-xl transition-all">
              <Share2 size={20} />
            </button>
          </div>
          <button onClick={() => setShowReportModal(true)}
            className="p-2 text-[var(--syn-comment)] hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all">
            <Flag size={20} />
          </button>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="bg-[var(--bg-card)] rounded-[2rem] border border-gray-200/20 dark:border-gray-800/40 p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-[var(--text-primary)]">Report Post</h3>
              <button onClick={() => setShowReportModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3 mb-4">
              {['offensive', 'spam', 'inappropriate', 'scam', 'harassment'].map(reason => (
                <label key={reason} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-[var(--bg-elevated)] rounded-lg">
                  <input
                    type="radio"
                    name="reason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={e => setReportReason(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-bold text-[var(--text-primary)] capitalize">{reason}</span>
                </label>
              ))}
            </div>
            <textarea
              value={reportDescription}
              onChange={e => setReportDescription(e.target.value)}
              placeholder="Additional details..."
              className="w-full bg-[var(--bg-elevated)] border border-gray-200/20 dark:border-gray-800/40 rounded-lg p-2 text-sm mb-4"
              rows={3}
            />
            <div className="flex gap-2">
              <button onClick={() => setShowReportModal(false)}
                className="flex-1 py-2 border border-gray-200/20 dark:border-gray-800/40 rounded-lg font-bold hover:bg-[var(--bg-elevated)]">
                Cancel
              </button>
              <button onClick={handleReport}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg font-bold hover:brightness-110">
                Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
