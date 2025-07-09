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

export async function GET(request: NextRequest) {
  const decoded = verifyToken(request)
  if (!decoded) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const tasks = Database.tasks.find()
  return NextResponse.json(tasks)
}

export async function POST(request: NextRequest) {
  const decoded = verifyToken(request)
  if (!decoded) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { title, description, priority, status } = await request.json()

    // Validate unique title
    const existingTask = Database.tasks.findOne({ title: title.toLowerCase() })
    if (existingTask) {
      return NextResponse.json({ message: "Task title must be unique" }, { status: 400 })
    }

    // Validate title doesn't match column names
    const columnNames = ["todo", "in progress", "done"]
    if (columnNames.includes(title.toLowerCase())) {
      return NextResponse.json({ message: "Task title cannot match column names" }, { status: 400 })
    }

    const task = Database.tasks.create({
      title,
      description,
      priority,
      status,
      assignedTo: null,
      createdBy: (decoded as any).userId,
    })

    logActivity((decoded as any).userId, "created", title)

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Create task error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
