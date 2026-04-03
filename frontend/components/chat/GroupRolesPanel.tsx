'use client'

import { useState } from 'react'
import { Shield, Plus, X, Check } from 'lucide-react'

// Mocks the Role UI requested in Phase R11
export default function GroupRolesPanel({ targetId, roles, users }: { targetId: string, roles: any[], users: any[] }) {
  const [activeRole, setActiveRole] = useState(roles[0])

  return (
    <div className="flex h-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden border dark:border-gray-700">
      {/* Roles List Sidebar */}
      <div className="w-1/3 border-r dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-bold dark:text-white">Roles</h3>
          <button className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200">
            <Plus size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {roles.map(role => (
            <button
              key={role._id}
              onClick={() => setActiveRole(role)}
              className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors ${
                activeRole?._id === role._id 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }}></div>
                {role.name}
              </span>
              {role.level === 0 && <Shield size={14} className="text-yellow-500" />}
            </button>
          ))}
        </div>
      </div>

      {/* Role Permissions Editor */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h3 className="font-bold dark:text-white flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: activeRole?.color }}></div>
            {activeRole?.name} Permissions
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {['send_message', 'delete_message', 'pin_message', 'add_member', 'remove_member', 'manage_roles', 'broadcast_message'].map(perm => (
            <div key={perm} className="flex items-center justify-between">
              <div>
                <p className="font-medium dark:text-white capitalize">{perm.replace(/_/g, ' ')}</p>
                <p className="text-xs text-gray-500">Allow members with this role to {perm.replace(/_/g, ' ')}.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={activeRole?.permissions?.includes(perm) || activeRole?.level === 0} 
                  disabled={activeRole?.level === 0} // Owner has all permissions
                  readOnly
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
