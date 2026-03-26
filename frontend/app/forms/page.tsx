'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import useAuthStore from '@/store/useAuthStore'
import { getUserForms, createForm } from '@/services/apiServices'
import { Plus, ChevronLeft, FileText, BarChart3, Copy, ExternalLink, Trash2, X, Eye, Send, GripVertical } from 'lucide-react'
import Link from 'next/link'

interface FormField {
  id: string
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkbox' | 'rating' | 'dropdown'
  label: string
  required: boolean
  options?: string[]
}

interface Form {
  id: string
  title: string
  description?: string
  fields: FormField[]
  responses: number
  createdAt: string
  isPublished: boolean
}

const FIELD_TYPES = [
  { value: 'short_text', label: 'Short Text' },
  { value: 'long_text', label: 'Long Text' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'rating', label: 'Rating' },
  { value: 'dropdown', label: 'Dropdown' },
]

export default function FormsPage() {
  const { user } = useAuthStore()
  const [showBuilder, setShowBuilder] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [fields, setFields] = useState<FormField[]>([])
  const [previewMode, setPreviewMode] = useState(false)

  // Fetch user forms
  const { data: forms = [], isLoading } = useQuery({
    queryKey: ['user-forms', user?.id],
    queryFn: async () => {
      try {
        return await getUserForms(user!.id) || []
      } catch {
        return sampleForms
      }
    },
    enabled: !!user?.id
  })

  const addField = (type: FormField['type']) => {
    const field: FormField = {
      id: Date.now().toString(),
      type,
      label: '',
      required: false,
      options: ['multiple_choice', 'checkbox', 'dropdown'].includes(type) ? ['Option 1', 'Option 2'] : undefined,
    }
    setFields([...fields, field])
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  const removeField = (id: string) => setFields(fields.filter(f => f.id !== id))

  const addOption = (fieldId: string) => {
    setFields(fields.map(f => {
      if (f.id === fieldId && f.options) return { ...f, options: [...f.options, `Option ${f.options.length + 1}`] }
      return f
    }))
  }

  const updateOption = (fieldId: string, idx: number, value: string) => {
    setFields(fields.map(f => {
      if (f.id === fieldId && f.options) {
        const newOptions = [...f.options]
        newOptions[idx] = value
        return { ...f, options: newOptions }
      }
      return f
    }))
  }

  const handlePublish = async () => {
    if (!formTitle.trim() || fields.length === 0) return
    try {
      await createForm({ userId: user?.id, title: formTitle, description: formDescription, fields })
    } catch { /* fallback */ }
    setShowBuilder(false)
    setFormTitle('')
    setFormDescription('')
    setFields([])
  }

  if (showBuilder) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
        {/* Builder Header */}
        <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b dark:border-gray-800 p-4 z-20">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setShowBuilder(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                <ChevronLeft size={20} className="dark:text-white" />
              </button>
              <h1 className="text-lg font-black dark:text-white">Form Builder</h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPreviewMode(!previewMode)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${previewMode ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                <Eye size={14} className="inline mr-1" /> {previewMode ? 'Editing' : 'Preview'}
              </button>
              <button onClick={handlePublish} disabled={!formTitle.trim() || fields.length === 0} className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1">
                <Send size={14} /> Publish
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto w-full p-4 md:p-6 space-y-4">
          {/* Form Title */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border dark:border-gray-800 shadow-sm space-y-3">
            <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Untitled Form" className="w-full text-2xl font-black dark:text-white outline-none bg-transparent placeholder-gray-300" />
            <input value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="Form description..." className="w-full text-sm text-gray-400 outline-none bg-transparent" />
          </div>

          {/* Fields */}
          {fields.map((field, idx) => (
            <div key={field.id} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border-2 border-transparent hover:border-blue-500/20 dark:border-gray-800 dark:hover:border-blue-500/20 shadow-sm transition-all group">
              <div className="flex items-start gap-3">
                <GripVertical size={16} className="text-gray-300 mt-3 cursor-grab" />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <input value={field.label} onChange={e => updateField(field.id, { label: e.target.value })} placeholder={`Question ${idx + 1}`} className="flex-1 font-bold text-sm dark:text-white outline-none bg-transparent border-b-2 border-transparent focus:border-blue-500 pb-1" />
                    <select value={field.type} onChange={e => updateField(field.id, { type: e.target.value as FormField['type'] })} className="bg-gray-50 dark:bg-gray-800 rounded-lg px-2 py-1 text-xs dark:text-white outline-none">
                      {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>

                  {/* Field preview based on type */}
                  {field.type === 'short_text' && <input disabled placeholder="Short answer text" className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-2.5 text-sm text-gray-400" />}
                  {field.type === 'long_text' && <textarea disabled placeholder="Long answer text" rows={2} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-2.5 text-sm text-gray-400 resize-none" />}
                  {field.type === 'rating' && <div className="flex gap-2">{[1,2,3,4,5].map(n => <span key={n} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">{n}</span>)}</div>}
                  
                  {field.options && (
                    <div className="space-y-2">
                      {field.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          {field.type === 'checkbox' ? <div className="w-4 h-4 rounded border-2 border-gray-300" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                          <input value={opt} onChange={e => updateOption(field.id, oi, e.target.value)} className="flex-1 text-sm dark:text-white outline-none bg-transparent border-b border-gray-200 dark:border-gray-700 pb-0.5" />
                        </div>
                      ))}
                      <button onClick={() => addOption(field.id)} className="text-blue-600 text-xs font-bold ml-6 hover:underline">+ Add Option</button>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t dark:border-gray-800">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={field.required} onChange={e => updateField(field.id, { required: e.target.checked })} className="w-3.5 h-3.5 accent-blue-600" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Required</span>
                    </label>
                    <button onClick={() => removeField(field.id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add Field */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border-2 border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">Add Question</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {FIELD_TYPES.map(t => (
                <button key={t.value} onClick={() => addField(t.value as FormField['type'])} className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-bold text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                  + {t.label}
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b dark:border-gray-800 p-4 md:p-6 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
              <ChevronLeft size={20} className="dark:text-white" />
            </Link>
            <div>
              <h1 className="text-xl font-black dark:text-white tracking-tight">Forms</h1>
              <p className="text-xs text-gray-400 font-bold">{forms.length} forms created</p>
            </div>
          </div>
          <button onClick={() => setShowBuilder(true)} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none active:scale-95">
            <Plus size={16} /> New Form
          </button>
        </div>
      </header>

      {/* Forms Grid */}
      <main className="max-w-4xl mx-auto w-full p-4 md:p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-40 bg-white dark:bg-gray-900 rounded-2xl animate-pulse" />)}
          </div>
        ) : forms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {forms.map((form: any) => (
              <div key={form.id || form._id} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border dark:border-gray-800 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><Copy size={14} className="text-gray-400" /></button>
                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><ExternalLink size={14} className="text-gray-400" /></button>
                  </div>
                </div>
                <h3 className="font-bold text-sm dark:text-white mb-1">{form.title}</h3>
                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{form.description || 'No description'}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><BarChart3 size={10} /> {form.responses || 0} responses</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${form.isPublished ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}>
                      {form.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 space-y-4">
            <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-600" />
            <p className="text-gray-400 font-medium">No forms yet</p>
            <button onClick={() => setShowBuilder(true)} className="text-blue-600 text-xs font-bold hover:underline">Create your first form</button>
          </div>
        )}
      </main>
    </div>
  )
}

const sampleForms: Form[] = [
  { id: '1', title: 'User Feedback Survey', description: 'Collecting feedback on the SuperApp experience', fields: [], responses: 42, createdAt: new Date().toISOString(), isPublished: true },
  { id: '2', title: 'Team Event RSVP', description: 'Sign up for the annual team picnic', fields: [], responses: 18, createdAt: new Date().toISOString(), isPublished: true },
  { id: '3', title: 'Bug Report Form', description: 'Report bugs and issues in the application', fields: [], responses: 7, createdAt: new Date().toISOString(), isPublished: false },
]
