'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import useAuthStore from '@/store/useAuthStore'
import { getJobs, getProfessionalProfile, getConnections } from '@/services/apiServices'
import { Briefcase, ChevronLeft, MapPin, Clock, DollarSign, Search, Building2, Users, BookOpen, Award, ExternalLink, UserPlus, MessageCircle, Star, Filter, Plus, X } from 'lucide-react'
import Link from 'next/link'

export default function ProfessionalPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'jobs' | 'network' | 'profile'>('jobs')
  const [searchQuery, setSearchQuery] = useState('')
  const [showApplyModal, setShowApplyModal] = useState<any>(null)
  const [coverLetter, setCoverLetter] = useState('')

  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['professional-jobs'],
    queryFn: async () => {
      try { return await getJobs() || [] } catch { return sampleJobs }
    }
  })

  const { data: connections = [] } = useQuery({
    queryKey: ['professional-connections', user?.id],
    queryFn: async () => {
      try { return await getConnections(user!.id) || [] } catch { return sampleConnections }
    },
    enabled: !!user?.id
  })

  const { data: profile } = useQuery({
    queryKey: ['professional-profile', user?.id],
    queryFn: async () => {
      try { return await getProfessionalProfile(user!.id) } catch { return sampleProfile }
    },
    enabled: !!user?.id
  })

  const filteredJobs = jobs.filter((j: any) => !searchQuery || j.title?.toLowerCase().includes(searchQuery.toLowerCase()) || j.company?.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b dark:border-gray-800 p-4 md:p-6 z-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                <ChevronLeft size={20} className="dark:text-white" />
              </Link>
              <div>
                <h1 className="text-xl font-black dark:text-white tracking-tight">Professional</h1>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Career & Network</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {([
              { key: 'jobs', label: 'Jobs', icon: Briefcase },
              { key: 'network', label: 'Network', icon: Users },
              { key: 'profile', label: 'Profile', icon: Award },
            ] as const).map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 rounded-lg transition-all ${activeTab === tab.key ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600'}`}>
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full p-4 md:p-6">
        {/* JOBS TAB */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search jobs, companies..." className="w-full bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none dark:text-white" />
              </div>
              <button className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500">
                <Filter size={18} />
              </button>
            </div>

            {/* Job Cards */}
            {jobsLoading ? (
              <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-40 bg-white dark:bg-gray-900 rounded-2xl animate-pulse" />)}</div>
            ) : filteredJobs.length > 0 ? (
              <div className="space-y-3">
                {filteredJobs.map((job: any) => (
                  <div key={job.id || job._id} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                        {(job.company || 'C')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm dark:text-white">{job.title}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Building2 size={12} /> {job.company || 'Unknown Company'}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          {job.location && <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><MapPin size={10} /> {job.location}</span>}
                          {job.salary && <span className="text-[10px] font-bold text-green-600 flex items-center gap-1"><DollarSign size={10} /> {job.salary}</span>}
                          {job.type && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg">{job.type}</span>}
                          <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><Clock size={10} /> {job.postedAgo || '2d ago'}</span>
                        </div>
                        {job.skills && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {job.skills.slice(0, 5).map((skill: string, i: number) => (
                              <span key={i} className="bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-lg">{skill}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button onClick={() => { setShowApplyModal(job); setCoverLetter('') }} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all active:scale-95 flex-shrink-0">
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 space-y-4">
                <Briefcase size={48} className="mx-auto text-gray-300" />
                <p className="text-gray-400 font-medium">No jobs found</p>
              </div>
            )}
          </div>
        )}

        {/* NETWORK TAB */}
        {activeTab === 'network' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm dark:text-white">{connections.length} Connections</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(connections.length > 0 ? connections : sampleConnections).map((conn: any) => (
                <div key={conn.id || conn._id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border dark:border-gray-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                  <img src={conn.avatar || `https://i.pravatar.cc/150?u=${conn.id}`} className="w-12 h-12 rounded-2xl object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm dark:text-white truncate">{conn.name}</h3>
                    <p className="text-xs text-gray-400 truncate">{conn.headline || conn.title || 'Professional'}</p>
                  </div>
                  <Link href={`/chat/${conn.id || conn._id}`} className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
                    <MessageCircle size={16} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border dark:border-gray-800 shadow-sm">
              <div className="flex items-start gap-4">
                <img src={profile?.avatar || user?.avatar || `https://i.pravatar.cc/150?u=${user?.id}`} className="w-20 h-20 rounded-2xl object-cover border-2 dark:border-gray-700" alt="" />
                <div className="flex-1">
                  <h2 className="text-xl font-black dark:text-white">{profile?.name || user?.name || 'Your Name'}</h2>
                  <p className="text-sm text-gray-500">{profile?.headline || 'Full Stack Developer'}</p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><MapPin size={12} /> {profile?.location || 'India'}</p>
                </div>
              </div>
              {profile?.bio && <p className="text-sm text-gray-500 mt-4 leading-relaxed">{profile.bio}</p>}
            </div>

            {/* Skills */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border dark:border-gray-800 shadow-sm">
              <h3 className="font-bold text-sm dark:text-white mb-3 flex items-center gap-2"><Star size={16} className="text-yellow-500" /> Skills</h3>
              <div className="flex flex-wrap gap-2">
                {(profile?.skills || ['JavaScript', 'TypeScript', 'React', 'Node.js', 'MongoDB', 'Docker', 'AWS']).map((skill: string, i: number) => (
                  <span key={i} className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-xl">{skill}</span>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border dark:border-gray-800 shadow-sm">
              <h3 className="font-bold text-sm dark:text-white mb-3 flex items-center gap-2"><Briefcase size={16} className="text-blue-500" /> Experience</h3>
              <div className="space-y-4">
                {(profile?.experience || sampleExperience).map((exp: any, i: number) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">
                      {exp.company?.[0] || 'C'}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm dark:text-white">{exp.title}</h4>
                      <p className="text-xs text-gray-400">{exp.company} · {exp.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md border dark:border-gray-700 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg dark:text-white">Apply to {showApplyModal.company}</h3>
              <button onClick={() => setShowApplyModal(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X size={18} className="dark:text-white" /></button>
            </div>
            <p className="text-sm text-gray-500 font-medium">{showApplyModal.title}</p>
            <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} placeholder="Write a cover letter..." rows={5} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-sm dark:text-white outline-none resize-none" />
            <button onClick={() => { setShowApplyModal(null) }} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">Submit Application</button>
          </div>
        </div>
      )}
    </div>
  )
}

const sampleJobs = [
  { id: '1', title: 'Senior Full Stack Developer', company: 'Google', location: 'Bangalore, India', salary: '₹25-40 LPA', type: 'Full-time', postedAgo: '1d ago', skills: ['React', 'Node.js', 'TypeScript', 'GCP', 'MongoDB'] },
  { id: '2', title: 'Frontend Engineer', company: 'Microsoft', location: 'Hyderabad, India', salary: '₹18-30 LPA', type: 'Full-time', postedAgo: '3d ago', skills: ['React', 'TypeScript', 'CSS', 'Testing'] },
  { id: '3', title: 'DevOps Engineer', company: 'Amazon', location: 'Remote', salary: '₹20-35 LPA', type: 'Remote', postedAgo: '5d ago', skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform'] },
  { id: '4', title: 'Backend Developer', company: 'Flipkart', location: 'Bangalore, India', salary: '₹15-28 LPA', type: 'Full-time', postedAgo: '2d ago', skills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL'] },
  { id: '5', title: 'Mobile App Developer', company: 'Swiggy', location: 'Bangalore, India', salary: '₹12-22 LPA', type: 'Hybrid', postedAgo: '1w ago', skills: ['React Native', 'Flutter', 'Kotlin', 'Swift'] },
]

const sampleConnections = [
  { id: 'c1', name: 'Rahul Sharma', headline: 'Engineering Lead at Google', avatar: 'https://i.pravatar.cc/150?u=rahul' },
  { id: 'c2', name: 'Priya Gupta', headline: 'Product Manager at Meta', avatar: 'https://i.pravatar.cc/150?u=priya' },
  { id: 'c3', name: 'Amit Singh', headline: 'DevOps at AWS', avatar: 'https://i.pravatar.cc/150?u=amit' },
  { id: 'c4', name: 'Sneha Patel', headline: 'Frontend Dev at Razorpay', avatar: 'https://i.pravatar.cc/150?u=sneha' },
]

const sampleExperience = [
  { title: 'Senior Developer', company: 'TechCorp', duration: '2024 - Present' },
  { title: 'Software Engineer', company: 'StartupXYZ', duration: '2022 - 2024' },
  { title: 'Junior Developer', company: 'CodeBase Inc', duration: '2020 - 2022' },
]

const sampleProfile = {
  name: 'Krishna Kumar',
  headline: 'Full Stack Developer | Building SuperApp',
  location: 'India',
  bio: 'Passionate developer building the future of unified applications. Experienced in React, Node.js, and cloud infrastructure.',
  skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'MongoDB', 'Docker', 'AWS', 'Next.js'],
  experience: sampleExperience,
}
