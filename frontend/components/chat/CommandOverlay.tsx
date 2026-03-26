'use client'

import { Terminal, CreditCard, BarChart3, Calendar, Bell, HelpCircle, Bot, Zap } from 'lucide-react'

interface CommandOverlayProps {
  type: 'command' | 'mention' | 'hashtag'
  query: string
  onSelect: (value: string) => void
}

export default function CommandOverlay({ type, query, onSelect }: CommandOverlayProps) {
  const commands = [
    { cmd: '/ask', desc: 'Ask AI a question', icon: Bot },
    { cmd: '/summarize', desc: 'Summarize recent chat history', icon: Zap },
    { cmd: '/pay', desc: 'Send money to this user', icon: CreditCard },
    { cmd: '/poll', desc: 'Create a new poll', icon: BarChart3 },
    { cmd: '/event', desc: 'Schedule a group event', icon: Calendar },
    { cmd: '/reminder', desc: 'Set a private reminder', icon: Bell },
    { cmd: '/help', desc: 'Show all available commands', icon: HelpCircle },
  ]

  const filtered = commands.filter(c => c.cmd.startsWith('/' + query))

  if (type !== 'command' || filtered.length === 0) return null

  return (
    <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 overflow-hidden z-50 animate-in slide-in-from-bottom-2">
      <div className="p-3 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
          <Terminal size={12} /> Commands
        </p>
      </div>
      <div className="max-h-60 overflow-y-auto">
        {filtered.map((item) => (
          <button
            key={item.cmd}
            onClick={() => onSelect(item.cmd)}
            className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 group-hover:text-blue-600 transition-colors">
              <item.icon size={18} />
            </div>
            <div>
              <p className="text-sm font-bold dark:text-white">{item.cmd}</p>
              <p className="text-[10px] text-gray-500">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
