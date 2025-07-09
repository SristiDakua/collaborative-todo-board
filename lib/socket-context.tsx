"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  activeUsers: any[]
  editingSessions: Record<string, any>
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  activeUsers: [],
  editingSessions: {}
})

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

interface SocketProviderProps {
  children: React.ReactNode
  user?: any
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children, user }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [activeUsers, setActiveUsers] = useState<any[]>([])
  const [editingSessions, setEditingSessions] = useState<Record<string, any>>({})

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      transports: ['websocket'],
      upgrade: true
    })

    socketInstance.on('connect', () => {
      console.log('Connected to socket server')
      setIsConnected(true)
      
      // Join with user data if available
      if (user) {
        socketInstance.emit('join', {
          userId: user._id,
          username: user.username,
          avatar: user.avatar
        })
      }
    })

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from socket server')
      setIsConnected(false)
    })

    // Listen for active users updates
    socketInstance.on('users-updated', (users: any[]) => {
      setActiveUsers(users)
    })

    // Listen for editing sessions updates
    socketInstance.on('editing-sessions', (sessions: Record<string, any>) => {
      setEditingSessions(sessions)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [user])

  return (
    <SocketContext.Provider value={{ socket, isConnected, activeUsers, editingSessions }}>
      {children}
    </SocketContext.Provider>
  )
}
