'use client'

import { ExternalLink, FolderGit2 } from 'lucide-react'

export default function ProjectShowcase({ projects }: { projects: any[] }) {
  if (!projects || projects.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
        <FolderGit2 size={24} className="text-blue-500" /> Featured Projects
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.slice(0, 10).map((project, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700 hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold dark:text-white group-hover:text-blue-500 transition-colors">{project.title}</h3>
              {project.link && (
                <a href={project.link} target="_blank" className="text-gray-400 hover:text-blue-500">
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{project.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {project.techStack?.map((tech: string) => (
                <span key={tech} className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
