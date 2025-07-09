"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CreateTaskModalProps {
  open: boolean
  onClose: () => void
  onTaskCreated?: () => void
}

export default function CreateTaskModal({ open, onClose, onTaskCreated }: CreateTaskModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("medium")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Please log in again")
        return
      }

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          priority,
          status: "todo",
        }),
      })

      if (response.ok) {
        setTitle("")
        setDescription("")
        setPriority("medium")
        onTaskCreated?.() // Refresh tasks list
        onClose()
      } else {
        const data = await response.json()
        setError(data.message || "Failed to create task")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-md border border-slate-200 
        rounded-2xl shadow-2xl shadow-blue-500/10 overflow-hidden">
        
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 
          animate-gradient-shift"></div>
        
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-300 to-purple-300 p-[1px] opacity-30">
          <div className="w-full h-full rounded-2xl bg-white/95"></div>
        </div>
        
        <div className="relative z-10">
          <DialogHeader className="space-y-4 pb-6">
            <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 
              bg-clip-text text-transparent">
              ✨ Create New Task
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert className="bg-red-50 border-red-200 text-red-700 slide-in-animation">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-700 font-semibold">Task Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 
                  focus:border-blue-400 focus:ring-blue-400/20 rounded-xl h-12
                  transition-all duration-300 hover:border-slate-300"
                placeholder="Enter task title..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-700 font-semibold">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 
                  focus:border-blue-400 focus:ring-blue-400/20 rounded-xl resize-none
                  transition-all duration-300 hover:border-slate-300"
                placeholder="Describe your task in detail..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-slate-700 font-semibold">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-white border-slate-200 text-slate-700 
                  focus:border-blue-400 focus:ring-blue-400/20 rounded-xl h-12
                  transition-all duration-300 hover:border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 rounded-xl">
                  <SelectItem value="low" className="text-green-600 hover:bg-green-50 rounded-lg">
                    🟢 Low Priority
                  </SelectItem>
                  <SelectItem value="medium" className="text-yellow-600 hover:bg-yellow-50 rounded-lg">
                    🟡 Medium Priority
                  </SelectItem>
                  <SelectItem value="high" className="text-red-600 hover:bg-red-50 rounded-lg">
                    🔴 High Priority
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 
                  rounded-xl px-6 py-3 font-semibold transition-all duration-300 hover:scale-105"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-purple-500 
                  hover:from-blue-600 hover:to-purple-600 text-white font-semibold 
                  rounded-xl px-6 py-3 shadow-lg hover:shadow-blue-500/25 
                  transition-all duration-300 hover:scale-105 border-0 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                  translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating...
                  </div>
                ) : (
                  "Create Task"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
