'use client'

import { Users, Shield, UserMinus, Link } from 'lucide-react'

export default function GroupSettings({ chat, members, user }: { chat: any, members: any[], user: any }) {
  const isAdmin = chat.groupAdmin === user?.id;

  return (
    <div className="w-80 border-l dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-6 overflow-y-auto">
      <div className="text-center space-y-2">
        <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full mx-auto flex items-center justify-center text-blue-600 text-3xl font-bold">
          {chat.chatName[0]}
        </div>
        <h2 className="text-xl font-bold dark:text-white">{chat.chatName}</h2>
        <p className="text-sm text-gray-500">Group · {chat.participants.length} members</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Members</h3>
        <div className="space-y-3">
          {members.map((member: any) => (
            <div key={member.userId} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-xs">
                  {member.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium dark:text-white flex items-center gap-1">
                    {member.username}
                    {chat.groupAdmin === member.userId && <Shield size={12} className="text-green-500" />}
                  </p>
                </div>
              </div>
              {isAdmin && member.userId !== user?.id && (
                <button className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <UserMinus size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t dark:border-gray-700 space-y-3">
        <button className="flex items-center gap-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
          <Link size={18} /> Copy Invite Link
        </button>
      </div>
    </div>
  )
}
