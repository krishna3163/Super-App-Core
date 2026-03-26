'use client'

import { Code2, Trophy, Flame, Target } from 'lucide-react'

export default function DevStats({ handles }: { handles: any }) {
  if (!handles) return null;

  // Mock stats - in production, these would come from an aggregation service
  const stats = [
    { label: 'LeetCode', value: '450 Solved', rank: 'Top 5%', icon: Code2, color: 'text-orange-500' },
    { label: 'Codeforces', value: '1600 Rating', rank: 'Expert', icon: Trophy, color: 'text-blue-500' },
    { label: 'Streak', value: '15 Days', rank: 'Active', icon: Flame, color: 'text-red-500' },
    { label: 'Global Rank', value: '#1,240', rank: 'Global', icon: Target, color: 'text-purple-500' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm">
          <stat.icon className={`${stat.color} mb-2`} size={20} />
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
          <p className="text-sm font-bold dark:text-white">{stat.value}</p>
          <p className="text-[10px] text-gray-400 mt-1">{stat.rank}</p>
        </div>
      ))}
    </div>
  )
}
