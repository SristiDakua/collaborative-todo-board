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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Smart assign logic: find user with fewest active tasks
    const users = Database.users.find()
    const userTaskCounts = users.map((user) => ({
      user,
      activeTasks: Database.tasks.find({ assignedTo: user._id }).filter(task => task.status !== "done").length,
    }))

    const userWithFewestTasks = userTaskCounts.reduce((min, current) =>
      current.activeTasks < min.activeTasks ? current : min,
    )

    const updatedTask = Database.tasks.updateOne(
      { _id: id }, 
      { assignedTo: userWithFewestTasks.user._id }
    )
    
    if (!updatedTask) {
      return NextResponse.json({ message: "Failed to assign task" }, { status: 500 })
    }

    logActivity(
      (decoded as any).userId,
      "assigned",
      updatedTask.title,
      `smart assigned to ${userWithFewestTasks.user.username}`,
    )

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Smart assign error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
