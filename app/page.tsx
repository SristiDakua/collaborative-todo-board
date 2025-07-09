"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(true)
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    if (token && userData) {
      setUser(JSON.parse(userData))
      router.push("/board")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register"
      const body = isLogin 
        ? { email, password }
        : { name, email, password }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        router.push("/board")
      } else {
        setError(data.message || "Authentication failed")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    return null // Will redirect to board
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 
      flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-purple-100/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-100/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Floating particles */}
        <div className="absolute top-10 left-10 w-2 h-2 bg-blue-300 rounded-full animate-ping opacity-60"></div>
        <div className="absolute top-20 right-20 w-1 h-1 bg-purple-300 rounded-full animate-pulse delay-500 opacity-60"></div>
        <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-pink-300 rounded-full animate-bounce delay-1000 opacity-60"></div>
        <div className="absolute bottom-32 right-32 w-1 h-1 bg-green-300 rounded-full animate-ping delay-1500 opacity-60"></div>
        
        {/* Light bubbles */}
        <div className="absolute top-16 left-1/3 w-8 h-8 bg-blue-200/40 rounded-full animate-bounce opacity-70" style={{animationDuration: '3s', animationDelay: '0s'}}></div>
        <div className="absolute top-32 right-1/3 w-6 h-6 bg-purple-200/40 rounded-full animate-bounce opacity-60" style={{animationDuration: '4s', animationDelay: '1s'}}></div>
        <div className="absolute top-48 left-1/5 w-10 h-10 bg-pink-200/30 rounded-full animate-bounce opacity-50" style={{animationDuration: '5s', animationDelay: '2s'}}></div>
        <div className="absolute top-64 right-1/5 w-4 h-4 bg-green-200/50 rounded-full animate-bounce opacity-65" style={{animationDuration: '3.5s', animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-48 left-1/4 w-7 h-7 bg-blue-200/35 rounded-full animate-bounce opacity-55" style={{animationDuration: '4.5s', animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-64 right-1/4 w-5 h-5 bg-purple-200/45 rounded-full animate-bounce opacity-60" style={{animationDuration: '3.8s', animationDelay: '2.5s'}}></div>
        <div className="absolute bottom-80 left-1/6 w-9 h-9 bg-pink-200/25 rounded-full animate-bounce opacity-45" style={{animationDuration: '5.2s', animationDelay: '3s'}}></div>
        <div className="absolute bottom-96 right-1/6 w-3 h-3 bg-green-200/60 rounded-full animate-bounce opacity-70" style={{animationDuration: '3.2s', animationDelay: '0.8s'}}></div>
        
        {/* Medium bubbles with slower movement */}
        <div className="absolute top-1/3 left-1/2 w-12 h-12 bg-blue-100/25 rounded-full float-animation opacity-40"></div>
        <div className="absolute top-2/3 left-1/6 w-14 h-14 bg-purple-100/20 rounded-full float-animation opacity-35" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/6 right-1/2 w-16 h-16 bg-pink-100/15 rounded-full float-animation opacity-30" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/3 right-1/6 w-11 h-11 bg-green-100/30 rounded-full float-animation opacity-45" style={{animationDelay: '3s'}}></div>
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo/Title */}
        <div className="text-center space-y-4 slide-in-animation">
          <div className="relative inline-block">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 
              bg-clip-text text-transparent">
              CollabBoard
            </h1>
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg 
              blur-lg opacity-20 animate-pulse"></div>
          </div>
          <p className="text-slate-600 text-lg font-medium">
            Collaborate • Create • Accomplish
          </p>
        </div>

        {/* Auth Card */}
        <Card className="bg-white/90 backdrop-blur-md border border-slate-200 
          shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow duration-500">
          
          {/* Subtle border effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-200 to-purple-200 p-[1px] opacity-30">
            <div className="w-full h-full rounded-2xl bg-white/90"></div>
          </div>
          
          <div className="relative z-10">
            <CardHeader className="space-y-4 pb-6">
              <CardTitle className="text-2xl font-bold text-center text-slate-700">
                {isLogin ? "✨ Welcome Back" : "🚀 Join CollabBoard"}
              </CardTitle>
              <CardDescription className="text-center text-slate-600 text-base">
                {isLogin ? "Sign in to your workspace" : "Create your account and start collaborating"}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert className="bg-red-50 border-red-200 text-red-700">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700 font-medium">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                      className="bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl h-11"
                      placeholder="Enter your full name"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl h-11"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl h-11"
                    placeholder="Enter your password"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 
                    text-white font-semibold rounded-xl h-11 shadow-md hover:shadow-blue-200 hover:scale-[1.02] 
                    transition-all duration-300 border-0"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {isLogin ? "Signing in..." : "Creating account..."}
                    </div>
                  ) : (
                    isLogin ? "Sign In" : "Create Account"
                  )}
                </Button>
              </form>

              <div className="text-center pt-4 border-t border-slate-200">
                <Button 
                  variant="link" 
                  onClick={() => setIsLogin(!isLogin)} 
                  className="text-slate-600 hover:text-slate-800 transition-colors duration-200 
                    hover:bg-slate-50 rounded-xl px-4 py-2"
                >
                  {isLogin ? "Don't have an account? Sign up →" : "← Already have an account? Sign in"}
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  )
}
