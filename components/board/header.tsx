"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, Activity, Plus } from "lucide-react"
import CreateTaskModal from "./create-task-modal"

interface HeaderProps {
  user: any
  onToggleActivity: () => void
  showActivityPanel: boolean
  onTaskCreated?: () => void
}

export default function Header({ user, onToggleActivity, showActivityPanel, onTaskCreated }: HeaderProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <>
      <header className="relative overflow-hidden bg-white/95 backdrop-blur-md border-b border-slate-200 h-20 flex items-center justify-between px-8 z-50 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-pink-50/50"></div>
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-4 left-1/4 w-2 h-2 bg-blue-300 rounded-full animate-ping opacity-60"></div>
          <div className="absolute top-8 right-1/3 w-1 h-1 bg-purple-300 rounded-full animate-pulse delay-500 opacity-60"></div>
          <div className="absolute bottom-6 left-1/2 w-1.5 h-1.5 bg-pink-300 rounded-full animate-bounce delay-1000 opacity-60"></div>
        </div>

        <div className="relative z-10 flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 
                bg-clip-text text-transparent">
                CollabBoard
              </h1>
            </div>
          </div>
          
          <Button 
            onClick={() => setShowCreateModal(true)} 
            className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 
              hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-6 py-3
              rounded-xl shadow-md hover:shadow-blue-200 hover:scale-105 
              transition-all duration-300 border-0 group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
              translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add Task
          </Button>
        </div>

        <div className="relative z-10 flex items-center space-x-6">
          <Button
            variant={showActivityPanel ? "default" : "outline"}
            onClick={onToggleActivity}
            className={`relative overflow-hidden px-6 py-3 rounded-xl font-semibold transition-all duration-300
              ${showActivityPanel 
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-200' 
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:scale-105'
              }`}
          >
            <Activity className={`w-5 h-5 mr-2 ${showActivityPanel ? 'animate-pulse' : ''}`} />
            Activity
          </Button>

          <div className="flex items-center space-x-4 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 
            border border-slate-200 hover:bg-white/90 transition-all duration-300 group shadow-sm">
            <Avatar className="h-10 w-10 ring-2 ring-slate-200 ring-offset-2 ring-offset-white 
              group-hover:ring-blue-300 transition-all duration-300">
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="text-slate-700 font-semibold text-sm">{user?.name || 'User'}</span>
              <div className="text-xs text-slate-500">Online</div>
            </div>
          </div>

          <Button 
            variant="ghost" 
            onClick={handleLogout} 
            className="text-slate-500 hover:text-slate-700 hover:bg-red-50 rounded-xl p-3
              hover:scale-110 transition-all duration-300 group"
          >
            <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
          </Button>
        </div>
      </header>

      <CreateTaskModal 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onTaskCreated={onTaskCreated}
      />
    </>
  )
}
