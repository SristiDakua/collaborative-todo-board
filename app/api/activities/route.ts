import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { Database } from "@/lib/database"

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

  const activities = Database.activities.find(20)
  return NextResponse.json(activities)
}
