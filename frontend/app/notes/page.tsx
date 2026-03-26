'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import useAuthStore from '@/store/useAuthStore'
import { getWorkspaces, createWorkspace, getWorkspacePages, createPage, updatePage } from '@/services/apiServices'
import { 
  Plus, ChevronLeft, FileText, FolderOpen, X, Bold, Italic, 
  List, ListOrdered, Heading1, Heading2, Code, Image, Link2, 
  Save, Trash2, ChevronRight, AlignLeft, Sparkles, BookOpen
} from 'lucide-react'
import Link from 'next/link'

interface Workspace {
  id: string
  name: string
  emoji?: string
  pages: Page[]
}

interface Page {
  id: string
  title: string
  content: string
  updatedAt: string
}

export default function NotionPage() {
  const { user } = useAuthStore()
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null)
  const [activePage, setActivePage] = useState<Page | null>(null)
  const [pageContent, setPageContent] = useState('')
  const [showCreateWS, setShowCreateWS] = useState(false)
  const [newWSName, setNewWSName] = useState('')
  const [newPageTitle, setNewPageTitle] = useState('')
  const [showCreatePage, setShowCreatePage] = useState(false)

  const { data: workspaces = [], isLoading } = useQuery({
    queryKey: ['workspaces', user?.id],
    queryFn: async () => {
      try {
        return await getWorkspaces(user!.id) || []
      } catch {
        return sampleWorkspaces
      }
    },
    enabled: !!user?.id
  })

  const handleCreateWorkspace = () => {
    if (!newWSName.trim()) return
    setShowCreateWS(false)
    setNewWSName('')
  }

  const handleCreatePage = () => {
    if (!newPageTitle.trim() || !selectedWorkspace) return
    const newPage: Page = {
      id: Date.now().toString(),
      title: newPageTitle,
      content: '',
      updatedAt: new Date().toISOString()
    }
    setActivePage(newPage)
    setPageContent('')
    setShowCreatePage(false)
    setNewPageTitle('')
  }

  const handleSave = async () => {
    if (!activePage) return
    try {
      await updatePage(activePage.id, { content: pageContent })
    } catch { /* fallback */ }
  }

  // Active page editor
  if (activePage) {
    return (
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
        {/* Editor Header */}
        <header className="sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b dark:border-gray-800 p-3 z-20">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setActivePage(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                <ChevronLeft size={18} className="dark:text-white" />
              </button>
              <input 
                value={activePage.title} 
                onChange={e => setActivePage({...activePage, title: e.target.value})}
                className="text-lg font-black dark:text-white bg-transparent outline-none" 
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 font-bold hidden md:block">
                Last edited {new Date(activePage.updatedAt).toLocaleDateString()}
              </span>
              <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-blue-700 transition-colors">
                <Save size={14} /> Save
              </button>
            </div>
          </div>
        </header>

        {/* Toolbar */}
        <div className="sticky top-[57px] bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b dark:border-gray-800 py-2 px-4 z-10">
          <div className="max-w-4xl mx-auto flex gap-1 overflow-x-auto no-scrollbar">
            {[
              { icon: Bold, label: 'Bold' },
              { icon: Italic, label: 'Italic' },
              { icon: Heading1, label: 'H1' },
              { icon: Heading2, label: 'H2' },
              { icon: List, label: 'Bullet' },
              { icon: ListOrdered, label: 'Number' },
              { icon: Code, label: 'Code' },
              { icon: Image, label: 'Image' },
              { icon: Link2, label: 'Link' },
              { icon: AlignLeft, label: 'Align' },
            ].map(tool => (
              <button key={tool.label} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors" title={tool.label}>
                <tool.icon size={16} />
              </button>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-8 py-8">
          <textarea
            value={pageContent}
            onChange={e => setPageContent(e.target.value)}
            placeholder="Start writing... Use / for commands"
            className="w-full min-h-[60vh] text-base leading-relaxed dark:text-gray-200 outline-none resize-none bg-transparent font-[system-ui] placeholder-gray-300 dark:placeholder-gray-700"
            autoFocus
          />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b dark:border-gray-800 p-4 md:p-6 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
              <ChevronLeft size={20} className="dark:text-white" />
            </Link>
            <div>
              <h1 className="text-xl font-black dark:text-white tracking-tight flex items-center gap-2">
                <BookOpen size={20} className="text-orange-500" /> Notes
              </h1>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Workspaces & Pages</p>
            </div>
          </div>
          <button onClick={() => setShowCreateWS(true)} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none active:scale-95">
            <Plus size={16} /> Workspace
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full p-4 md:p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-white dark:bg-gray-900 rounded-2xl animate-pulse" />)}
          </div>
        ) : selectedWorkspace ? (
          /* Pages in Workspace */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => setSelectedWorkspace(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <ChevronLeft size={16} className="dark:text-white" />
                </button>
                <h2 className="font-black text-lg dark:text-white">{selectedWorkspace.emoji} {selectedWorkspace.name}</h2>
              </div>
              <button onClick={() => setShowCreatePage(true)} className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline">
                <Plus size={14} /> New Page
              </button>
            </div>

            {(selectedWorkspace.pages || []).length > 0 ? (
              <div className="space-y-2">
                {(selectedWorkspace.pages || []).map(page => (
                  <button key={page.id} onClick={() => { setActivePage(page); setPageContent(page.content || '') }} className="w-full bg-white dark:bg-gray-900 rounded-2xl p-4 border dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex items-center gap-4 text-left group">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm dark:text-white group-hover:text-blue-600 transition-colors">{page.title}</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">{page.content ? page.content.substring(0, 80) + '...' : 'Empty page'}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 space-y-4">
                <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-600" />
                <p className="text-gray-400 font-medium">No pages in this workspace</p>
                <button onClick={() => setShowCreatePage(true)} className="text-blue-600 text-xs font-bold hover:underline">Create your first page</button>
              </div>
            )}
          </div>
        ) : (
          /* Workspaces Grid */ 
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(workspaces.length > 0 ? workspaces : sampleWorkspaces).map((ws: any) => (
              <button key={ws.id || ws._id} onClick={() => setSelectedWorkspace(ws)} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border dark:border-gray-800 shadow-sm hover:shadow-lg transition-all text-left group">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{ws.emoji || '📁'}</span>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors mt-1" />
                </div>
                <h3 className="font-bold text-sm dark:text-white group-hover:text-blue-600 transition-colors">{ws.name}</h3>
                <p className="text-[10px] text-gray-400 mt-1">{ws.pages?.length || 0} pages</p>
              </button>
            ))}

            {/* Create Workspace Card */}
            <button onClick={() => setShowCreateWS(true)} className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-blue-600 hover:border-blue-500/30 transition-all">
              <Plus size={24} />
              <span className="text-xs font-bold">New Workspace</span>
            </button>
          </div>
        )}
      </main>

      {/* Create Workspace Modal */}
      {showCreateWS && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm border dark:border-gray-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg dark:text-white">New Workspace</h3>
              <button onClick={() => setShowCreateWS(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X size={18} className="dark:text-white" /></button>
            </div>
            <input autoFocus value={newWSName} onChange={e => setNewWSName(e.target.value)} placeholder="Workspace name..." className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-xl p-3 outline-none dark:text-white text-sm font-medium" />
            <button onClick={handleCreateWorkspace} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">Create</button>
          </div>
        </div>
      )}

      {/* Create Page Modal */}
      {showCreatePage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm border dark:border-gray-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg dark:text-white">New Page</h3>
              <button onClick={() => setShowCreatePage(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X size={18} className="dark:text-white" /></button>
            </div>
            <input autoFocus value={newPageTitle} onChange={e => setNewPageTitle(e.target.value)} placeholder="Page title..." className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-xl p-3 outline-none dark:text-white text-sm font-medium" />
            <button onClick={handleCreatePage} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">Create</button>
          </div>
        </div>
      )}
    </div>
  )
}

const sampleWorkspaces: Workspace[] = [
  { id: '1', name: 'Project SuperApp', emoji: '🚀', pages: [
    { id: 'p1', title: 'Architecture Overview', content: 'The SuperApp uses a microservices architecture with an API Gateway pattern...', updatedAt: new Date().toISOString() },
    { id: 'p2', title: 'Sprint Planning', content: '## Sprint 5 Goals\n- Complete dating module\n- Fix notification sync\n- Deploy to production', updatedAt: new Date().toISOString() },
    { id: 'p3', title: 'Meeting Notes', content: 'Team standup notes from today...', updatedAt: new Date().toISOString() },
  ]},
  { id: '2', name: 'Personal Notes', emoji: '📝', pages: [
    { id: 'p4', title: 'Ideas', content: 'App ideas and feature brainstorming...', updatedAt: new Date().toISOString() },
  ]},
  { id: '3', name: 'Learning', emoji: '📚', pages: [
    { id: 'p5', title: 'Docker Cheat Sheet', content: '## Common Docker Commands\n`docker-compose up -d`\n`docker ps`', updatedAt: new Date().toISOString() },
    { id: 'p6', title: 'TypeScript Tips', content: 'Generics, utility types, and advanced patterns...', updatedAt: new Date().toISOString() },
  ]},
]
