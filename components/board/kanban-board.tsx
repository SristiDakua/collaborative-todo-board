"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import TaskCard from "./task-card"
import { CollaborativePresence } from "./collaborative-presence"
import { ConflictResolution } from "./conflict-resolution"
import { useSocket } from "@/lib/socket-context"
import { Sparkles, Zap, CheckCircle, Clock } from "lucide-react"

interface KanbanBoardProps {
  tasks: any[]
  users: any[]
  currentUser: any
  onTasksUpdate: (tasks: any[]) => void
}

const columns = [
  { 
    id: "todo", 
    title: "To Do", 
    icon: Clock,
    gradient: "from-blue-400 to-blue-500",
    neonColor: "blue-400",
    bgClass: "bg-gradient-to-br from-blue-50 to-blue-100"
  },
  { 
    id: "inprogress", 
    title: "In Progress", 
    icon: Zap,
    gradient: "from-yellow-400 to-orange-400",
    neonColor: "yellow-400", 
    bgClass: "bg-gradient-to-br from-yellow-50 to-orange-100"
  },
  { 
    id: "done", 
    title: "Done", 
    icon: CheckCircle,
    gradient: "from-green-400 to-emerald-400",
    neonColor: "green-400",
    bgClass: "bg-gradient-to-br from-green-50 to-emerald-100"
  },
]

export default function KanbanBoard({ tasks, users, currentUser, onTasksUpdate }: KanbanBoardProps) {
  const [localTasks, setLocalTasks] = useState(tasks)
  const [conflictData, setConflictData] = useState<any>(null)
  const [showConflictDialog, setShowConflictDialog] = useState(false)
  const { socket, editingSessions } = useSocket()

  useEffect(() => {
    setLocalTasks(tasks)
  }, [tasks])

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    // Listen for real-time task updates
    socket.on('task-updated', (updatedTask: any) => {
      setLocalTasks(prev => prev.map(task => 
        task._id === updatedTask._id ? updatedTask : task
      ))
      onTasksUpdate(localTasks.map(task => 
        task._id === updatedTask._id ? updatedTask : task
      ))
    })

    socket.on('task-created', (newTask: any) => {
      setLocalTasks(prev => [...prev, newTask])
      onTasksUpdate([...localTasks, newTask])
    })

    socket.on('task-deleted', (taskId: string) => {
      setLocalTasks(prev => prev.filter(task => task._id !== taskId))
      onTasksUpdate(localTasks.filter(task => task._id !== taskId))
    })

    socket.on('task-moved', (moveData: any) => {
      setLocalTasks(prev => prev.map(task => 
        task._id === moveData.taskId ? { ...task, status: moveData.newStatus } : task
      ))
    })

    // Listen for editing conflicts
    socket.on('editing-conflict', (conflictInfo: any) => {
      setConflictData({
        taskId: conflictInfo.taskId,
        localVersion: localTasks.find(t => t._id === conflictInfo.taskId),
        remoteVersion: conflictInfo.remoteVersion,
        localUser: currentUser.username,
        remoteUser: conflictInfo.editingUser,
        timestamp: new Date()
      })
      setShowConflictDialog(true)
    })

    return () => {
      socket.off('task-updated')
      socket.off('task-created')
      socket.off('task-deleted')
      socket.off('task-moved')
      socket.off('editing-conflict')
    }
  }, [socket, localTasks, currentUser, onTasksUpdate])

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    const newStatus = destination.droppableId
    const taskId = draggableId

    // Optimistic update
    const updatedTasks = localTasks.map((task) => (task._id === taskId ? { ...task, status: newStatus } : task))
    setLocalTasks(updatedTasks)

    // Emit real-time update
    if (socket) {
      socket.emit('task-moved', { taskId, newStatus, userId: currentUser._id })
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        // Revert on error
        setLocalTasks(tasks)
      } else {
        const updatedTask = await response.json()
        if (socket) {
          socket.emit('task-updated', updatedTask)
        }
      }
    } catch (error) {
      console.error("Error updating task:", error)
      setLocalTasks(tasks)
    }
  }

  const handleSmartAssign = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/smart-assign`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        const updatedTask = await response.json()
        setLocalTasks((prev) => prev.map((task) => (task._id === taskId ? updatedTask : task)))
        
        // Emit real-time update
        if (socket) {
          socket.emit('task-updated', updatedTask)
        }
      }
    } catch (error) {
      console.error("Error smart assigning task:", error)
    }
  }

  const handleConflictResolution = (resolution: 'local' | 'remote' | 'merge') => {
    if (!conflictData) return

    switch (resolution) {
      case 'local':
        // Keep local version, no action needed
        break
      case 'remote':
        // Apply remote version
        setLocalTasks(prev => prev.map(task => 
          task._id === conflictData.taskId ? conflictData.remoteVersion : task
        ))
        break
      case 'merge':
        // For merge, we'll combine title and description
        const mergedTask = {
          ...conflictData.localVersion,
          title: `${conflictData.localVersion.title} | ${conflictData.remoteVersion.title}`,
          description: `Local: ${conflictData.localVersion.description || ''}\nRemote: ${conflictData.remoteVersion.description || ''}`
        }
        setLocalTasks(prev => prev.map(task => 
          task._id === conflictData.taskId ? mergedTask : task
        ))
        break
    }
    
    setConflictData(null)
  }

  const getTasksByStatus = (status: string) => {
    return localTasks.filter((task) => task.status === status)
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Collaborative Presence Indicator */}
      <div className="fixed top-4 right-4 z-50">
        <CollaborativePresence />
      </div>

      {/* Conflict Resolution Dialog */}
      <ConflictResolution
        isOpen={showConflictDialog}
        onClose={() => setShowConflictDialog(false)}
        conflictData={conflictData}
        onResolve={handleConflictResolution}
      />

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-100/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {columns.map((column, columnIndex) => {
            const IconComponent = column.icon
            const taskCount = getTasksByStatus(column.id).length
            
            return (
              <div 
                key={column.id} 
                className={`group relative slide-in-animation rounded-2xl ${column.bgClass} 
                  border border-white/60 shadow-lg hover:shadow-xl overflow-hidden 
                  transition-all duration-300 hover:scale-[1.02]`}
                style={{ animationDelay: `${columnIndex * 0.2}s` }}
              >
                {/* Subtle border effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${column.gradient} p-[1px] opacity-20 group-hover:opacity-30 transition-opacity duration-500`}>
                  <div className="w-full h-full rounded-2xl bg-white/90"></div>
                </div>
                
                {/* Content */}
                <div className="relative p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl bg-gradient-to-r ${column.gradient} shadow-md`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="font-bold text-xl text-slate-700">{column.title}</h2>
                    </div>
                    <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${column.gradient} 
                      shadow-md transform hover:scale-110 transition-transform duration-200`}>
                      <span className="text-white font-bold text-sm">{taskCount}</span>
                    </div>
                  </div>

                  {/* Droppable Area */}
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[400px] space-y-4 transition-all duration-300 rounded-xl p-3
                          ${snapshot.isDraggingOver 
                            ? "bg-white/70 scale-105 border-2 border-dashed border-slate-300" 
                            : "hover:bg-white/30"
                          }`}
                      >
                        {getTasksByStatus(column.id).map((task, index) => {
                          const isBeingEdited = editingSessions[task._id]
                          return (
                            <Draggable key={task._id} draggableId={task._id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`transition-all duration-300 ease-out
                                    ${snapshot.isDragging 
                                      ? "rotate-3 scale-105 shadow-2xl shadow-slate-300/50" 
                                      : "hover:scale-105 hover:shadow-lg hover:shadow-slate-200/50"
                                    }
                                    ${isBeingEdited ? "ring-2 ring-orange-400 ring-opacity-75" : ""}`}
                                  style={{
                                    ...provided.draggableProps.style,
                                    transform: snapshot.isDragging 
                                      ? `${provided.draggableProps.style?.transform} rotate(3deg)`
                                      : provided.draggableProps.style?.transform,
                                  }}
                                >
                                  <TaskCard
                                    task={task}
                                    users={users}
                                    currentUser={currentUser}
                                    onSmartAssign={() => handleSmartAssign(task._id)}
                                    isBeingEdited={isBeingEdited}
                                    editingUser={isBeingEdited ? editingSessions[task._id].username : null}
                                  />
                                </div>
                              )}
                            </Draggable>
                          )
                        })}
                        {provided.placeholder}
                        
                        {/* Empty state */}
                        {getTasksByStatus(column.id).length === 0 && (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-white/50 flex items-center justify-center mb-4 float-animation">
                              <Sparkles className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-slate-500 font-medium">No tasks yet</p>
                            <p className="text-slate-400 text-sm mt-1">Drag tasks here to organize</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            )
          })}
        </div>
      </DragDropContext>
    </div>
  )
}
