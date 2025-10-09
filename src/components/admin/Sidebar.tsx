import React from 'react'
import {
  BarChart,
  CreditCard,
  Coffee,
  Code,
  FileText,
  LayoutDashboard,
  MessageCircle,
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
  Tag,
  Users,
  X,
  Cpu,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  currentView: string
  onNavigate: (view: string) => void
  onCreatePost: () => void
  onSignOut: () => Promise<void> | void
  displayName: string
  isAdmin: boolean
  className?: string
  showCloseButton?: boolean
  onClose?: () => void
}

export const Sidebar = ({
  currentView,
  onNavigate,
  onCreatePost,
  onSignOut,
  displayName,
  isAdmin,
  className,
  showCloseButton = false,
  onClose,
}: SidebarProps) => {
  const roleLabel = isAdmin ? 'Administrator' : 'Author'

  return (
    <div
      className={cn(
        'flex h-full max-h-screen w-[280px] flex-col overflow-hidden border-r-4 border-[#FF5252]/50 bg-[#2A2A2A] text-white shadow-xl lg:sticky lg:top-0 lg:h-screen',
        className,
      )}
    >
      <div className="relative border-b border-white/10 p-6">
        {showCloseButton && (
          <button
            type="button"
            onClick={() => onClose?.()}
            className="absolute right-4 top-4 inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 p-1.5 text-white transition hover:bg-white/10"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
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
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-8 px-6 py-6">
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
              icon={<LayoutDashboard />}
              label="Community"
              isActive={currentView === 'community'}
              onClick={() => onNavigate('community')}
            />
            {isAdmin && (
              <SidebarLink
                icon={<MessageCircle />}
                label="Comments"
                isActive={currentView === 'comments'}
                onClick={() => onNavigate('comments')}
              />
            )}
            {isAdmin && (
              <SidebarLink
                icon={<Users />}
                label="Users"
                isActive={currentView === 'users'}
                onClick={() => onNavigate('users')}
              />
            )}
            {isAdmin && (
              <SidebarLink
                icon={<Tag />}
                label="Taxonomy"
                isActive={currentView === 'taxonomy'}
                onClick={() => onNavigate('taxonomy')}
              />
            )}
            {isAdmin && (
              <SidebarLink
                icon={<Cpu />}
                label="Models"
                isActive={currentView === 'models'}
                onClick={() => onNavigate('models')}
              />
            )}
            {isAdmin && (
              <SidebarLink
                icon={<Sparkles />}
                label="Gamification"
                isActive={currentView === 'gamification'}
                onClick={() => onNavigate('gamification')}
              />
            )}
            <SidebarLink
              icon={<CreditCard />}
              label="Monetization"
              isActive={currentView === 'monetization'}
              onClick={() => onNavigate('monetization')}
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
          <div>
            <button
              onClick={onCreatePost}
              className="w-full rounded-md border-3 border-white/20 bg-gradient-to-r from-[#FF5252]/90 to-[#FF5252] px-4 py-3 font-bold text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] transition-all duration-200 hover:-translate-y-0.5"
            >
              + New Post
            </button>
          </div>
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
      className={`flex w-full items-center gap-3 rounded-md p-3 text-lg font-bold transition-all duration-200 ${isActive ? 'transform -rotate-1 border-2 border-white/20 bg-white/10 text-white shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
    >
      {icon}
      {label}
    </button>
  )
}
