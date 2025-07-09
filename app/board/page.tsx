"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import KanbanBoard from "@/components/board/kanban-board"
import ActivityPanel from "@/components/board/activity-panel"
import Header from "@/components/board/header"
import { SocketProvider } from "@/lib/socket-context"

export default function BoardPage() {
  const [user, setUser] = useState<any>(null)
  const [socket, setSocket] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [showActivityPanel, setShowActivityPanel] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    setSocket(null)

    fetchTasks()
    fetchUsers()
    fetchActivities()
  }, [router])

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/activities", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setActivities(data)
      }
    } catch (error) {
      console.error("Error fetching activities:", error)
    }
  }

  const handleTasksUpdate = (updatedTasks: any[]) => {
    setTasks(updatedTasks)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 
        flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full 
              animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-purple-200 border-b-purple-500 
              rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 
              bg-clip-text text-transparent">Loading CollabBoard</h2>
            <p className="text-slate-600">Preparing your workspace...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <SocketProvider user={user}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 
        relative overflow-hidden">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-purple-100/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-100/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <Header
          user={user}
          onToggleActivity={() => setShowActivityPanel(!showActivityPanel)}
          showActivityPanel={showActivityPanel}
          onTaskCreated={fetchTasks}
        />

        <div className="flex relative z-10">
          <div className={`flex-1 transition-all duration-500 ease-out ${showActivityPanel ? "mr-80" : ""}`}>
            <KanbanBoard 
              tasks={tasks} 
              users={users} 
              currentUser={user} 
              onTasksUpdate={handleTasksUpdate}
            />
          </div>

          {showActivityPanel && (
            <div className="fixed right-0 top-20 h-[calc(100vh-5rem)] w-80 
              bg-white/95 backdrop-blur-md border-l border-slate-200 shadow-xl 
              slide-in-animation z-40">
              <ActivityPanel activities={activities} />
            </div>
          )}
        </div>
      </div>
    </SocketProvider>
  )
}
