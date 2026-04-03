'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Heart, MessageCircle, Share2, MoreHorizontal, Repeat2, Flag,
  Globe, X, Send, AlertCircle, Users, Calendar, Clock, Loader2
} from 'lucide-react'
import clsx from 'clsx'
import api from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface PostDisplayProps {
  post: any
  currentUserId?: string
  currentUserName?: string
  currentUserAvatar?: string
  onLike: (postId: string) => void
  onRepost: (postId: string) => void
  onShare: (postId: string, targetUserIds: string[]) => void
  onReport: (postId: string, reason: string, description: string) => void
  onMention: (userId: string, userName: string) => void
  onComment?: (postId: string) => void
  onDelete?: (postId: string) => void
  onEdit?: (postId: string, newContent: string) => void
}

export default function PostDisplay({
  post,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  onLike,
  onRepost,
  onShare,
  onReport,
  onMention,
  onComment,
  onDelete,
  onEdit
}: PostDisplayProps) {
  const [showReportModal, setShowReportModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content || '')
  const [reportReason, setReportReason] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const queryClient = useQueryClient()

  const { data: comments = [], isLoading: loadingComments } = useQuery({
    queryKey: ['comments', post._id],
    queryFn: async () => {
      const { data } = await api.get(`/social/posts/${post._id}/comments`)
      return Array.isArray(data?.data) ? data.data : []
    },
    enabled: showComments
  })

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      await api.post('/social/posts/comment', {
        postId: post._id,
        userId: currentUserId,
        userName: currentUserName || 'Anonymous',
        userAvatar: currentUserAvatar || '',
        content
      })
    },
    onSuccess: () => {
      setNewComment('')
      queryClient.invalidateQueries({ queryKey: ['comments', post._id] })
    }
  })

  const isLiked = post.likes?.includes(currentUserId) || false
  const isOwner = currentUserId && post.userId === currentUserId
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
            <div className="relative">
              <button className="p-2 hover:bg-[var(--bg-elevated)] rounded-xl transition-all"
                onClick={() => setShowMenu(!showMenu)}>
                <MoreHorizontal size={18} className="text-[var(--syn-comment)]" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-12 w-48 bg-[var(--bg-card)] border border-gray-200/20 dark:border-gray-800/40 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                  {isOwner ? (
                    <>
                      <button onClick={() => { setIsEditing(true); setShowMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-[var(--bg-elevated)] text-sm font-bold flex items-center gap-2">
                        Edit Post
                      </button>
                      <button onClick={() => { onDelete?.(post._id); setShowMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-[var(--bg-elevated)] text-sm font-bold text-red-500 flex items-center gap-2">
                        Delete Post
                      </button>
                    </>
                  ) : (
                    <button onClick={() => { setShowReportModal(true); setShowMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-[var(--bg-elevated)] text-sm font-bold flex items-center gap-2">
                      Report Post
                    </button>
                  )}
                  <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/feed?post=${post._id}`); setShowMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-[var(--bg-elevated)] text-sm font-bold flex items-center gap-2">
                    Copy Link
                  </button>
                </div>
              )}
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

          {isEditing ? (
            <div className="space-y-3">
              <textarea 
                value={editContent} 
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-[var(--bg-elevated)] border border-gray-200/20 dark:border-gray-800/40 rounded-2xl p-4 text-sm font-medium focus:ring-2 ring-blue-500/20 outline-none h-32"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-xs font-black uppercase text-[var(--syn-comment)]">Cancel</button>
                <button onClick={() => { onEdit?.(post._id, editContent); setIsEditing(false); }} className="px-6 py-2 bg-blue-500 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-blue-500/20">Save</button>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-[var(--text-primary)] font-medium mb-3 whitespace-pre-wrap">
              {post.content?.split(/(\s+)/).map((word: string, i: number) => {
                if (word.startsWith('#')) return <Link key={i} href={`/feed?hashtag=${word.substring(1)}`} className="text-blue-500 hover:underline">{word}</Link>
                if (word.startsWith('@')) return <button key={i} onClick={() => onMention('', word.substring(1))} className="text-purple-500 hover:underline">{word}</button>
                return word
              })}
            </p>
          )}

          {/* Twitter-style Repost Rendering */}
          {post.type === 'repost' && post.quotedPostId && (
            <div className="mt-4 border border-gray-200/20 dark:border-gray-800/40 rounded-3xl overflow-hidden bg-[var(--bg-elevated)] p-4 pointer-events-none opacity-80 scale-95 origin-top">
               <div className="flex items-center gap-2 mb-2">
                  <img src={post.quotedPostId.userAvatar || `https://i.pravatar.cc/100?u=${post.quotedPostId.userId}`} className="w-6 h-6 rounded-full" />
                  <span className="font-black text-[10px] uppercase text-[var(--text-primary)]">{post.quotedPostId.userName || 'Anonymous'}</span>
               </div>
               <p className="text-xs line-clamp-3 text-[var(--text-primary)] font-medium">{post.quotedPostId.content}</p>
            </div>
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
            <button onClick={() => setShowComments(!showComments)}
              className={clsx(
                "flex items-center gap-1.5 p-2 rounded-xl transition-all",
                showComments ? "text-blue-500 bg-blue-500/10" : "text-[var(--syn-comment)] hover:bg-[var(--bg-elevated)]"
              )}>
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

        {/* Comment Section Placeholder */}
        {showComments && (
          <div className="px-5 pb-5 pt-2 border-t border-gray-200/5 dark:border-gray-800/20 bg-gray-50/30 dark:bg-black/20 animate-in slide-in-from-top-2 duration-300">
            <div className="flex gap-3 mb-6 bg-[var(--bg-card)] p-2 rounded-2xl border border-gray-200/10 dark:border-gray-800/40 mt-4">
              <input 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-transparent border-none outline-none text-xs font-medium px-2 py-1"
                onKeyDown={(e) => { if (e.key === 'Enter' && newComment.trim()) addCommentMutation.mutate(newComment) }}
              />
              <button 
                onClick={() => newComment.trim() && addCommentMutation.mutate(newComment)}
                disabled={addCommentMutation.isPending}
                className="p-2 bg-[var(--syn-function)] text-white rounded-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
              >
                {addCommentMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
              {loadingComments ? (
                <div className="flex justify-center py-4"><Loader2 size={20} className="animate-spin text-[var(--syn-comment)]" /></div>
              ) : comments.length > 0 ? (
                comments.map((c: any) => (
                  <div key={c._id} className="flex gap-3 group animate-in fade-in slide-in-from-bottom-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-[10px] shrink-0">
                      {c.userName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl rounded-tl-none border border-gray-200/5 dark:border-gray-800/40">
                         <p className="text-[10px] font-black uppercase text-[var(--syn-function)] mb-0.5 tracking-tight">{c.userName || 'User'}</p>
                         <p className="text-xs text-[var(--text-primary)] font-medium leading-normal whitespace-pre-wrap">{c.content}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-1 ml-2 text-[9px] font-bold text-[var(--syn-comment)] uppercase">
                        <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <button className="hover:text-[var(--syn-function)]">Reply</button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-[10px] font-black text-[var(--syn-comment)] uppercase tracking-widest opacity-50">No comments yet. Be the first!</p>
              )}
            </div>
          </div>
        )}
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
