'use client'

import { Users, Link as LinkIcon, Image as ImageIcon, BellOff, LogOut, Shield, PlusCircle, QrCode } from 'lucide-react'

export default function GroupInfoPanel({ groupData, onClose }: { groupData: any, onClose: () => void }) {
  if (!groupData) return null;

  const { groupDetails, chatDetails, memberCount, media } = groupData;

  return (
    <div className="w-80 md:w-96 border-l dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col h-full overflow-hidden shadow-xl z-20 absolute right-0 top-0 bottom-0 md:relative">
      {/* Header */}
      <div className="p-6 text-center border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-950 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white">✕</button>
        <div className="w-28 h-28 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-4xl font-bold shadow-inner mb-4 overflow-hidden">
          {groupDetails.avatar ? <img src={groupDetails.avatar} className="w-full h-full object-cover" /> : chatDetails.chatName[0]}
        </div>
        <h2 className="text-2xl font-bold dark:text-white">{chatDetails.chatName}</h2>
        <p className="text-sm text-gray-500 mt-1">Group · {memberCount} members</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 px-4">{groupDetails.description || 'No description provided.'}</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Quick Actions */}
        <div className="flex justify-around p-4 border-b dark:border-gray-800">
          <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors">
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full"><BellOff size={20} /></div>
            <span className="text-xs font-medium">Mute</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-green-500 transition-colors">
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full"><LinkIcon size={20} /></div>
            <span className="text-xs font-medium">Invite</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-purple-500 transition-colors">
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full"><QrCode size={20} /></div>
            <span className="text-xs font-medium">QR Code</span>
          </button>
        </div>

        {/* Media Section */}
        <div className="p-4 border-b dark:border-gray-800">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Media, Links, and Docs</h3>
            <span className="text-xs text-blue-500 cursor-pointer">{media?.length || 0} &gt;</span>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {media?.length > 0 ? media.map((m: any, i: number) => (
              <div key={i} className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                 {m.type === 'image' ? <img src={m.url} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-400" />}
              </div>
            )) : (
              <p className="text-xs text-gray-500 italic">No media shared yet.</p>
            )}
          </div>
        </div>

        {/* Members List */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Members</h3>
            <SearchIcon size={16} className="text-gray-400 cursor-pointer" />
          </div>
          
          <button className="flex items-center gap-4 w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors mb-2 text-blue-500">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><PlusCircle size={20} /></div>
            <span className="font-medium">Add members</span>
          </button>

          <div className="space-y-1">
            {chatDetails.participants.map((userId: string) => (
              <div key={userId} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500">
                    {userId.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium dark:text-white flex items-center gap-1">
                      User {userId.substring(0, 4)}
                      {groupDetails.admins.includes(userId) && <Shield size={12} className="text-green-500" />}
                    </p>
                    <p className="text-xs text-gray-500">Available</p>
                  </div>
                </div>
                {groupDetails.admins.includes(userId) && <span className="text-[10px] px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded border border-green-200 dark:border-green-800 font-bold uppercase">Admin</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
        <button className="w-full flex items-center justify-center gap-2 text-red-500 font-bold p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
          <LogOut size={18} /> Exit Group
        </button>
      </div>
    </div>
  )
}

function SearchIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
}
