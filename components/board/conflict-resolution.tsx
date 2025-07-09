"use client"

import { useState, useEffect } from "react"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, User, Clock } from "lucide-react"

interface ConflictData {
  taskId: string
  localVersion: any
  remoteVersion: any
  localUser: string
  remoteUser: string
  timestamp: Date
}

interface ConflictResolutionProps {
  isOpen: boolean
  onClose: () => void
  conflictData: ConflictData | null
  onResolve: (resolution: 'local' | 'remote' | 'merge') => void
}

export function ConflictResolution({ isOpen, onClose, conflictData, onResolve }: ConflictResolutionProps) {
  const [selectedResolution, setSelectedResolution] = useState<'local' | 'remote' | 'merge'>('local')

  useEffect(() => {
    if (isOpen) {
      setSelectedResolution('local')
    }
  }, [isOpen])

  if (!conflictData) return null

  const { localVersion, remoteVersion, localUser, remoteUser, timestamp } = conflictData

  const handleResolve = () => {
    onResolve(selectedResolution)
    onClose()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Editing Conflict Detected
          </AlertDialogTitle>
          <AlertDialogDescription>
            Multiple users have edited this task simultaneously. Please choose how to resolve the conflict.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          {/* Local Version */}
          <div 
            className={`cursor-pointer transition-all duration-200 ${
              selectedResolution === 'local' 
                ? 'ring-2 ring-blue-500 scale-105' 
                : 'hover:scale-102 hover:shadow-md'
            }`}
            onClick={() => setSelectedResolution('local')}
          >
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <User className="h-4 w-4" />
                  Your Version
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Badge variant="outline">{localUser}</Badge>
                  <Clock className="h-3 w-3" />
                  <span>Current</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Title:</label>
                  <p className="text-sm bg-gray-50 p-2 rounded border">{localVersion.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Description:</label>
                  <p className="text-sm bg-gray-50 p-2 rounded border min-h-[60px]">
                    {localVersion.description || "No description"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Priority:</label>
                    <Badge variant={localVersion.priority === 'high' ? 'destructive' : 'secondary'}>
                      {localVersion.priority}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status:</label>
                    <Badge variant="outline">{localVersion.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Remote Version */}
          <div 
            className={`cursor-pointer transition-all duration-200 ${
              selectedResolution === 'remote' 
                ? 'ring-2 ring-green-500 scale-105' 
                : 'hover:scale-102 hover:shadow-md'
            }`}
            onClick={() => setSelectedResolution('remote')}
          >
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <User className="h-4 w-4" />
                  Remote Version
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Badge variant="outline">{remoteUser}</Badge>
                  <Clock className="h-3 w-3" />
                  <span>{new Date(timestamp).toLocaleTimeString()}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Title:</label>
                  <p className="text-sm bg-gray-50 p-2 rounded border">{remoteVersion.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Description:</label>
                  <p className="text-sm bg-gray-50 p-2 rounded border min-h-[60px]">
                    {remoteVersion.description || "No description"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Priority:</label>
                    <Badge variant={remoteVersion.priority === 'high' ? 'destructive' : 'secondary'}>
                      {remoteVersion.priority}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status:</label>
                    <Badge variant="outline">{remoteVersion.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Merge Option */}
        <div 
          className={`cursor-pointer transition-all duration-200 ${
            selectedResolution === 'merge' 
              ? 'ring-2 ring-purple-500 scale-105' 
              : 'hover:scale-102 hover:shadow-md'
          }`}
          onClick={() => setSelectedResolution('merge')}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-600">
                Merge Both Versions
              </CardTitle>
              <p className="text-sm text-gray-500">
                Combine the best parts of both versions (you'll be able to edit the merged result)
              </p>
            </CardHeader>
          </Card>
        </div>

        <AlertDialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleResolve} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            {selectedResolution === 'local' && 'Use My Version'}
            {selectedResolution === 'remote' && 'Use Their Version'}
            {selectedResolution === 'merge' && 'Merge Versions'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
