'use client'

import { useState } from 'react'
import useAuthStore from '@/store/useAuthStore'
import { Plus, Check, Circle, Trash2, Calendar, ChevronLeft, Flag, Clock, Search, X, ListTodo, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  list: string
  createdAt: string
}

const PRIORITY_CONFIG = {
  low: { color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800', label: 'Low' },
  medium: { color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'Medium' },
  high: { color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', label: 'High' },
  urgent: { color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', label: 'Urgent' },
}

export default function TasksPage() {
  const { user } = useAuthStore()
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Complete API integration for dating module', completed: false, priority: 'high', dueDate: '2026-03-26', list: 'Development', createdAt: new Date().toISOString() },
    { id: '2', title: 'Review PR for chat service', completed: false, priority: 'urgent', dueDate: '2026-03-25', list: 'Development', createdAt: new Date().toISOString() },
    { id: '3', title: 'Design calendar UI mockup', completed: true, priority: 'medium', list: 'Design', createdAt: new Date().toISOString() },
    { id: '4', title: 'Deploy services to production', completed: false, priority: 'high', dueDate: '2026-03-28', list: 'DevOps', createdAt: new Date().toISOString() },
    { id: '5', title: 'Write unit tests for marketplace', completed: false, priority: 'medium', dueDate: '2026-03-30', list: 'Development', createdAt: new Date().toISOString() },
    { id: '6', title: 'Fix notification WebSocket sync', completed: false, priority: 'medium', list: 'Development', createdAt: new Date().toISOString() },
    { id: '7', title: 'Update project documentation', completed: true, priority: 'low', list: 'General', createdAt: new Date().toISOString() },
  ])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' as Task['priority'], dueDate: '', list: 'General' })
  const [activeList, setActiveList] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'name'>('priority')

  const lists = ['All', ...Array.from(new Set(tasks.map(t => t.list)))]

  const toggleTask = (id: string) => setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  const deleteTask = (id: string) => setTasks(tasks.filter(t => t.id !== id))

  const handleCreate = () => {
    if (!newTask.title.trim()) return
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      completed: false,
      priority: newTask.priority,
      dueDate: newTask.dueDate || undefined,
      list: newTask.list || 'General',
      createdAt: new Date().toISOString(),
    }
    setTasks([task, ...tasks])
    setShowCreateModal(false)
    setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', list: 'General' })
  }

  const filteredTasks = tasks
    .filter(t => activeList === 'All' || t.list === activeList)
    .filter(t => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      if (sortBy === 'priority') {
        const order = { urgent: 0, high: 1, medium: 2, low: 3 }
        return order[a.priority] - order[b.priority]
      }
      if (sortBy === 'date') return (a.dueDate || 'z').localeCompare(b.dueDate || 'z')
      return a.title.localeCompare(b.title)
    })

  const pendingCount = tasks.filter(t => !t.completed).length
  const completedCount = tasks.filter(t => t.completed).length

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b dark:border-gray-800 p-4 md:p-6 z-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                <ChevronLeft size={20} className="dark:text-white" />
              </Link>
              <div>
                <h1 className="text-xl font-black dark:text-white tracking-tight">Tasks</h1>
                <p className="text-xs text-gray-400 font-bold">{pendingCount} pending · {completedCount} completed</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSortBy(sortBy === 'priority' ? 'date' : sortBy === 'date' ? 'name' : 'priority')} className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500 hover:text-blue-600 transition-colors" title={`Sort by ${sortBy}`}>
                <ArrowUpDown size={18} />
              </button>
              <button onClick={() => setShowCreateModal(true)} className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all active:scale-95">
                <Plus size={18} />
              </button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search tasks..." className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none dark:text-white" />
          </div>

          {/* List Tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {lists.map(list => (
              <button key={list} onClick={() => setActiveList(list)} className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeList === list ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700'}`}>
                {list}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Task List */}
      <main className="max-w-4xl mx-auto w-full p-4 md:p-6 space-y-2">
        {filteredTasks.length > 0 ? filteredTasks.map(task => (
          <div key={task.id} className={`bg-white dark:bg-gray-900 rounded-2xl p-4 border dark:border-gray-800 shadow-sm hover:shadow-md transition-all group ${task.completed ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-3">
              <button onClick={() => toggleTask(task.id)} className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'}`}>
                {task.completed && <Check size={14} />}
              </button>
              
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-sm dark:text-white ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>{task.title}</h3>
                {task.description && <p className="text-xs text-gray-400 mt-0.5">{task.description}</p>}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider ${PRIORITY_CONFIG[task.priority].bg} ${PRIORITY_CONFIG[task.priority].color}`}>
                    <Flag size={8} className="inline mr-1" />{task.priority}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-lg">{task.list}</span>
                  {task.dueDate && (
                    <span className={`text-[10px] font-bold flex items-center gap-1 ${new Date(task.dueDate) < new Date() && !task.completed ? 'text-red-500' : 'text-gray-400'}`}>
                      <Clock size={10} /> {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>

              <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                <Trash2 size={14} className="text-red-500" />
              </button>
            </div>
          </div>
        )) : (
          <div className="text-center py-20 space-y-4">
            <ListTodo size={48} className="mx-auto text-gray-300 dark:text-gray-600" />
            <p className="text-gray-400 font-medium">No tasks {activeList !== 'All' ? `in "${activeList}"` : ''}</p>
            <button onClick={() => setShowCreateModal(true)} className="text-blue-600 text-xs font-bold hover:underline">Create one</button>
          </div>
        )}
      </main>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md border dark:border-gray-700 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg dark:text-white">New Task</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <X size={18} className="dark:text-white" />
              </button>
            </div>

            <input autoFocus value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder="Task title..." className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-xl p-3 outline-none dark:text-white text-sm font-medium" />
            <textarea value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} placeholder="Description (optional)..." rows={2} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-sm dark:text-white outline-none resize-none" />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Priority</label>
                <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-sm dark:text-white outline-none">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Due Date</label>
                <input type="date" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-sm dark:text-white outline-none" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">List</label>
              <input value={newTask.list} onChange={e => setNewTask({ ...newTask, list: e.target.value })} placeholder="e.g. Development" className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-sm dark:text-white outline-none" />
            </div>

            <button onClick={handleCreate} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none active:scale-[0.98]">
              Create Task
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
