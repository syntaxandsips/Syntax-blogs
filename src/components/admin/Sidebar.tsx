import React from 'react'
import {
  Coffee,
  Code,
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  BarChart,
  ShieldCheck,
} from 'lucide-react'

interface SidebarProps {
  currentView: string
  onNavigate: (view: string) => void
  onCreatePost: () => void
  onSignOut: () => Promise<void> | void
  displayName: string
  isAdmin: boolean
}

export const Sidebar = ({
  currentView,
  onNavigate,
  onCreatePost,
  onSignOut,
  displayName,
  isAdmin,
}: SidebarProps) => {
  const roleLabel = isAdmin ? 'Administrator' : 'Author'

  return (
    <div className="w-[280px] bg-[#2A2A2A] text-white border-r-4 border-[#FF5252]/50 h-full flex flex-col">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Coffee className="h-8 w-8 text-[#FF5252]" />
          <Code className="h-8 w-8 text-[#6C63FF]" />
        </div>
        <h1 className="text-2xl font-black">
          <span className="bg-[#6C63FF]/90 text-white px-2 py-1 mr-1 rotate-1 inline-block">
            Admin
          </span>
          <span className="bg-[#FF5252]/90 text-white px-2 py-1 ml-1 -rotate-1 inline-block">
            Dashboard
          </span>
        </h1>
        <div className="mt-4 text-sm text-white/70 space-y-1">
          <p className="font-semibold text-white">{displayName}</p>
          <p className="flex items-center gap-1 uppercase tracking-wide">
            <ShieldCheck className="h-4 w-4" /> {roleLabel}
          </p>
        </div>
      </div>
      <div className="p-6 flex-1">
        <nav className="space-y-2">
          <SidebarLink
            icon={<LayoutDashboard />}
            label="Overview"
            isActive={currentView === 'overview'}
            onClick={() => onNavigate('overview')}
          />
          <SidebarLink
            icon={<FileText />}
            label="Posts"
            isActive={currentView === 'posts'}
            onClick={() => onNavigate('posts')}
          />
          <SidebarLink
            icon={<BarChart />}
            label="Analytics"
            isActive={currentView === 'analytics'}
            onClick={() => onNavigate('analytics')}
          />
          <SidebarLink
            icon={<Settings />}
            label="Settings"
            isActive={currentView === 'settings'}
            onClick={() => onNavigate('settings')}
          />
        </nav>
        <div className="mt-8">
          <button
            onClick={onCreatePost}
            className="w-full bg-gradient-to-r from-[#FF5252]/90 to-[#FF5252] text-white font-bold py-3 px-4 border-3 border-white/20 rounded-md shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-y-[-2px] transition-all duration-200"
          >
            + New Post
          </button>
        </div>
      </div>
      <div className="p-6 border-t border-white/10">
        <button
          onClick={() => {
            void onSignOut()
          }}
          className="flex items-center gap-2 text-lg font-bold text-white/80 hover:text-red-500 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Log Out
        </button>
      </div>
    </div>
  )
}

interface SidebarLinkProps {
  icon: React.ReactNode
  label: string
  isActive?: boolean
  onClick: () => void
}

const SidebarLink = ({ icon, label, isActive, onClick }: SidebarLinkProps) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-md font-bold text-lg transition-all duration-200 ${isActive ? 'bg-white/10 text-white transform -rotate-1 border-2 border-white/20 shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
    >
      {icon}
      {label}
    </button>
  )
}
