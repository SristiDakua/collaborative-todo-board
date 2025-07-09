"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Zap, Edit, Trash2, User, Clock, Sparkles, Target } from "lucide-react"
import EditTaskModal from "./edit-task-modal"

interface TaskCardProps {
  task: any
  users: any[]
  currentUser: any
  onSmartAssign: () => void
  isBeingEdited?: boolean
  editingUser?: string | null
}

const priorityConfig = {
  low: {
    gradient: "from-green-400 to-emerald-400",
    shadow: "shadow-green-200",
    border: "border-green-200",
    icon: "text-green-600"
  },
  medium: {
    gradient: "from-yellow-400 to-orange-400", 
    shadow: "shadow-yellow-200",
    border: "border-yellow-200",
    icon: "text-yellow-600"
  },
  high: {
    gradient: "from-red-400 to-pink-400",
    shadow: "shadow-red-200", 
    border: "border-red-200",
    icon: "text-red-600"
  },
}

export default function TaskCard({ task, users, currentUser, onSmartAssign, isBeingEdited, editingUser }: TaskCardProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const assignedUser = users.find((user) => user._id === task.assignedTo)
  const priorityStyle = priorityConfig[task.priority as keyof typeof priorityConfig]

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await fetch(`/api/tasks/${task._id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
      } catch (error) {
        console.error("Error deleting task:", error)
      }
    }
  }

  const handleCardClick = () => {
    setIsFlipped(!isFlipped)
    setTimeout(() => setIsFlipped(false), 3000)
  }

  return (
    <>
      <div
        className="group relative cursor-pointer transform-gpu perspective-1000"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        {/* Glowing background effect */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${priorityStyle.gradient} 
          opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl scale-110`}></div>
        
        {/* Main Card */}
        <Card className={`relative overflow-hidden bg-white/95 backdrop-blur-sm border ${priorityStyle.border}
          transition-all duration-500 hover:shadow-lg ${priorityStyle.shadow} hover:scale-[1.02]
          ${isFlipped ? 'card-flip-animation' : ''} ${isHovered ? 'hover-lift' : ''}
          group-hover:${priorityStyle.border} group-hover:shadow-xl`}
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Shimmer effect overlay */}
          <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-30 transition-opacity duration-700"></div>
          
          {/* Front of card */}
          <div className={`relative z-10 ${isFlipped ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}>
            <CardHeader className="pb-3">
              {/* Editing indicator */}
              {isBeingEdited && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-orange-700 font-medium">
                    {editingUser} is editing...
                  </span>
                </div>
              )}
              
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className={`w-4 h-4 ${priorityStyle.icon}`} />
                  <h3 className="font-semibold text-slate-700 text-sm leading-tight group-hover:text-slate-900">
                    {task.title}
                  </h3>
                </div>
                <Badge className={`px-2 py-1 text-xs font-medium bg-gradient-to-r ${priorityStyle.gradient} 
                  text-white shadow-md hover:scale-110 transition-transform duration-200`}>
                  {task.priority}
                </Badge>
              </div>
              
              {/* Priority indicator bar */}
              <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${priorityStyle.gradient} rounded-full
                  ${task.priority === 'high' ? 'w-full' : task.priority === 'medium' ? 'w-2/3' : 'w-1/3'}
                  shadow-sm`}></div>
              </div>
            </CardHeader>

            <CardContent className="pt-0 space-y-4">
              <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{task.description}</p>

              {/* Assignment section */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {assignedUser ? (
                    <div className="flex items-center space-x-2 group-hover:scale-105 transition-transform duration-200">
                      <Avatar className="h-8 w-8 ring-2 ring-slate-200 ring-offset-2 ring-offset-white">
                        <AvatarFallback className={`bg-gradient-to-r ${priorityStyle.gradient} text-white text-sm font-bold`}>
                          {assignedUser.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="text-sm font-medium text-slate-700">{assignedUser.name}</span>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>Assigned</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-slate-400 group-hover:text-slate-600 transition-colors duration-200">
                      <div className="p-2 rounded-full bg-slate-100 group-hover:bg-slate-200 transition-colors duration-200">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-sm">Unassigned</span>
                    </div>
                  )}
                </div>

                {/* Smart assign button */}
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSmartAssign()
                  }}
                  className={`relative overflow-hidden bg-gradient-to-r ${priorityStyle.gradient} 
                    hover:shadow-md hover:scale-110 transition-all duration-300 border-0
                    text-white font-medium group/btn`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                    translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                  <Zap className="w-4 h-4 mr-1" />
                  Auto
                </Button>
              </div>

              {/* Task metadata */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>ID: {task._id.slice(-6)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </div>

          {/* Back of card */}
          <div
            className={`absolute inset-0 ${isFlipped ? "opacity-100" : "opacity-0"} 
              transition-opacity duration-300 rounded-lg flex items-center justify-center`}
            style={{ 
              transform: "rotateY(180deg)",
              background: `linear-gradient(135deg, ${priorityStyle.gradient.split(' ')[1]} 0%, ${priorityStyle.gradient.split(' ')[3]} 100%)`
            }}
          >
            <div className="text-center p-6 space-y-4">
              <div className="mb-4">
                <Sparkles className="w-12 h-12 mx-auto text-white mb-2 animate-spin" />
                <h4 className="font-bold text-white text-lg">Task Actions</h4>
              </div>
              <div className="space-y-3">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowEditModal(true)
                  }}
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 
                    hover:scale-105 transition-all duration-200"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Task
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete()
                  }}
                  className="w-full bg-red-500/80 hover:bg-red-500 hover:scale-105 
                    transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <EditTaskModal task={task} users={users} open={showEditModal} onClose={() => setShowEditModal(false)} />
    </>
  )
}
