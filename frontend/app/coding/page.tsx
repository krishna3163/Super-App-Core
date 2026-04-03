'use client'

import { Code2, Terminal, Cpu, Globe, BookOpen, MessageSquare, Plus } from 'lucide-react'

const topics = [
  { id: 1, title: 'Data Structures & Algorithms', count: 124, color: 'bg-blue-500' },
  { id: 2, title: 'Web Development', count: 856, color: 'bg-orange-500' },
  { id: 3, title: 'Machine Learning', count: 342, color: 'bg-purple-500' },
  { id: 4, title: 'Mobile Apps', count: 198, color: 'bg-green-500' },
]

export default function CodingHubPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <header className="p-8 bg-indigo-600 text-white rounded-b-[3rem] shadow-xl overflow-hidden relative">
        <div className="relative z-10">
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                <Terminal size={32} />
                Coding Hub
            </h1>
            <p className="text-indigo-100 opacity-80 max-w-md">The ultimate collaboration space for developers. Solve problems, build projects, and grow together.</p>
            
            <div className="flex gap-4 mt-8">
                <button className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg">
                    <Plus size={20} />
                    New Project
                </button>
                <button className="bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 border border-indigo-400">
                    <BookOpen size={20} />
                    DSA Practice
                </button>
            </div>
        </div>
        <Cpu size={200} className="absolute -right-10 -bottom-10 opacity-10 rotate-12" />
      </header>

      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Popular Topics */}
        <section>
            <h2 className="text-xl font-bold dark:text-white mb-4">Popular Topics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {topics.map(topic => (
                    <div key={topic.id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                        <div className={`${topic.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                            <Code2 size={24} />
                        </div>
                        <h3 className="font-bold text-sm dark:text-white mb-1">{topic.title}</h3>
                        <p className="text-xs text-gray-500">{topic.count} discussions</p>
                    </div>
                ))}
            </div>
        </section>

        {/* Community Feed */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
                <h2 className="text-xl font-bold dark:text-white">Active Projects</h2>
                {[1, 2].map(i => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border dark:border-gray-700 shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">JD</div>
                                <div>
                                    <h4 className="font-bold dark:text-white text-sm">SuperApp Open Source UI</h4>
                                    <p className="text-[10px] text-gray-500">by John Doe • 2h ago</p>
                                </div>
                            </div>
                            <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Active</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            Looking for contributors to help build the documentation for the new SuperApp design system.
                        </p>
                        <div className="flex items-center gap-4 pt-4 border-t dark:border-gray-700">
                            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                                <MessageSquare size={16} />
                                <span>24 Comments</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                                <Globe size={16} />
                                <span>Public Repo</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold dark:text-white">Top Contributors</h2>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border dark:border-gray-700 shadow-sm">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 border-b last:border-0 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <img src={`https://i.pravatar.cc/150?u=dev${i}`} className="w-8 h-8 rounded-lg object-cover" alt="" />
                                <span className="text-xs font-bold dark:text-white">DevUser_{i}</span>
                            </div>
                            <span className="text-indigo-600 text-[10px] font-bold">{1000 - i * 100} XP</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
      </div>
    </div>
  )
}
