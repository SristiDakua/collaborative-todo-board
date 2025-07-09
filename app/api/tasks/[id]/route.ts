import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { Database, logActivity } from "@/lib/database"

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")
  } catch {
    return null
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const decoded = verifyToken(request)
  if (!decoded) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = params
    const updates = await request.json()

    const existingTask = Database.tasks.findOne({ _id: id })
    if (!existingTask) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 })
    }

    const oldTask = { ...existingTask }
    const updatedTask = Database.tasks.updateOne({ _id: id }, updates)
    if (!updatedTask) {
      return NextResponse.json({ message: "Failed to update task" }, { status: 500 })
    }

    // Log activity based on what changed
    if (updates.status && updates.status !== oldTask.status) {
      logActivity(
        (decoded as any).userId,
        "moved",
        updatedTask.title,
        `from ${oldTask.status} to ${updates.status}`,
      )
    } else if (updates.assignedTo !== oldTask.assignedTo) {
      const assignedUser = Database.users.findOne({ _id: updates.assignedTo })
      logActivity(
        (decoded as any).userId,
        "assigned",
        updatedTask.title,
        assignedUser ? `to ${assignedUser.username}` : "unassigned",
      )
    } else {
      logActivity((decoded as any).userId, "updated", updatedTask.title)
    }

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Update task error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const decoded = verifyToken(request)
  if (!decoded) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = params

    const existingTask = Database.tasks.findOne({ _id: id })
    if (!existingTask) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 })
    }

    const deletedTask = Database.tasks.deleteOne({ _id: id })
    if (!deletedTask) {
      return NextResponse.json({ message: "Failed to delete task" }, { status: 500 })
    }

    logActivity((decoded as any).userId, "deleted", deletedTask.title)

    return NextResponse.json({ message: "Task deleted" })
  } catch (error) {
    console.error("Delete task error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
