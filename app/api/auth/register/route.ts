import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { Database } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    // Check if user already exists
    const existingUser = Database.users.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = Database.users.create({
      username,
      email,
      password: hashedPassword,
    })

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "fallback-secret", {
      expiresIn: "7d",
    })

    return NextResponse.json({
      token,
      user: { _id: user._id, username: user.username, email: user.email },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
