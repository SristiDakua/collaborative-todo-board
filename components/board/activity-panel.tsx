"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { Activity, Clock, Zap, Target, Trash2, Edit, UserPlus, ArrowRight } from "lucide-react"

interface ActivityPanelProps {
  activities: any[]
}

const actionConfig = {
  created: {
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: Target
  },
  updated: {
    color: "text-blue-600", 
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: Edit
  },
  deleted: {
    color: "text-red-600",
    bgColor: "bg-red-50", 
    borderColor: "border-red-200",
    icon: Trash2
  },
  assigned: {
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200", 
    icon: UserPlus
  },
  moved: {
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    icon: ArrowRight
  },
}

export default function ActivityPanel({ activities }: ActivityPanelProps) {
  return (
    <div className="h-full flex flex-col bg-white/95 backdrop-blur-md">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h2 className="font-bold text-xl text-slate-700">Activity Feed</h2>
        </div>
        <p className="text-slate-500 text-sm">Live updates from your team</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto float-animation">
                <Clock className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No recent activity</p>
              <p className="text-slate-400 text-sm">Activity will appear here as your team works</p>
            </div>
          ) : (
            activities.map((activity, index) => {
              const config = actionConfig[activity.action as keyof typeof actionConfig] || actionConfig.updated
              const IconComponent = config.icon
              
              return (
                <div
                  key={index}
                  className={`group relative p-4 rounded-xl ${config.bgColor} border ${config.borderColor} 
                    hover:scale-[1.02] transition-all duration-300 slide-in-animation shadow-sm`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`absolute inset-0 rounded-xl ${config.bgColor} opacity-0 
                    group-hover:opacity-50 transition-opacity duration-300`}></div>
                  
                  <div className="relative z-10 flex items-start space-x-3">
                    <Avatar className="h-10 w-10 ring-2 ring-slate-200 ring-offset-2 ring-offset-white flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                        {activity.user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-700">{activity.user?.name || "Unknown"}</span>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${config.bgColor} 
                          ${config.borderColor} border`}>
                          <IconComponent className={`w-3 h-3 ${config.color}`} />
                          <span className={`text-xs font-medium ${config.color}`}>
                            {activity.action}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-600 leading-relaxed">
                        <span className="text-slate-500">task</span>{" "}
                        <span className="font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
                          "{activity.taskTitle}"
                        </span>
                      </p>

                      {activity.details && (
                        <p className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                          {activity.details}
                        </p>
                      )}

                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
