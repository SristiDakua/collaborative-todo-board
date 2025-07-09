"use client"

import { useSocket } from "@/lib/socket-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Users, Wifi, WifiOff, Edit3 } from "lucide-react"

interface CollaborativePresenceProps {
  taskId?: string
  showEditingStatus?: boolean
}

export function CollaborativePresence({ taskId, showEditingStatus = false }: CollaborativePresenceProps) {
  const { activeUsers, editingSessions, isConnected } = useSocket()

  const editingUser = taskId ? editingSessions[taskId] : null
  const isBeingEdited = !!editingUser

  return (
    <div className="flex items-center gap-2">
      {/* Connection Status */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="flex items-center gap-1">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {isConnected ? 'Connected to collaborative session' : 'Disconnected from collaborative session'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Active Users Count */}
      {activeUsers.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {activeUsers.length}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-semibold">Active Users:</p>
                {activeUsers.map((user, index) => (
                  <p key={index} className="text-sm">{user.username}</p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Editing Status for specific task */}
      {showEditingStatus && isBeingEdited && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="secondary" className="flex items-center gap-1 animate-pulse">
                <Edit3 className="h-3 w-3" />
                Being edited
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{editingUser.username} is currently editing this task</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Active User Avatars */}
      <div className="flex -space-x-2">
        {activeUsers.slice(0, 3).map((user, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger>
                <Avatar className="h-6 w-6 border-2 border-white">
                  <AvatarImage src={user.avatar} alt={user.username} />
                  <AvatarFallback className="text-xs bg-gradient-to-r from-blue-400 to-purple-500 text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.username}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        {activeUsers.length > 3 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="h-6 w-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium">
                  +{activeUsers.length - 3}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  {activeUsers.slice(3).map((user, index) => (
                    <p key={index} className="text-sm">{user.username}</p>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}
