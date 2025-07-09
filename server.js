const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// Create the Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // Create HTTP server
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Create Socket.IO server
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
      methods: ["GET", "POST"],
      credentials: true
    }
  })

  // Store active users and their editing states
  const activeUsers = new Map()
  const editingSessions = new Map() // taskId -> { userId, timestamp }

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // User joins with authentication
    socket.on('join', (userData) => {
      activeUsers.set(socket.id, {
        userId: userData.userId,
        username: userData.username,
        avatar: userData.avatar
      })
      
      // Broadcast updated user list
      io.emit('users-updated', Array.from(activeUsers.values()))
      
      // Send current editing sessions to new user
      socket.emit('editing-sessions', Object.fromEntries(editingSessions))
    })

    // Handle task updates
    socket.on('task-updated', (taskData) => {
      socket.broadcast.emit('task-updated', taskData)
    })

    // Handle task creation
    socket.on('task-created', (taskData) => {
      socket.broadcast.emit('task-created', taskData)
    })

    // Handle task deletion
    socket.on('task-deleted', (taskId) => {
      socket.broadcast.emit('task-deleted', taskId)
      // Remove any editing session for deleted task
      editingSessions.delete(taskId)
      io.emit('editing-sessions', Object.fromEntries(editingSessions))
    })

    // Handle task movement (drag & drop)
    socket.on('task-moved', (moveData) => {
      socket.broadcast.emit('task-moved', moveData)
    })

    // Handle editing session start
    socket.on('start-editing', (data) => {
      const { taskId } = data
      const user = activeUsers.get(socket.id)
      
      if (user) {
        // Check if someone else is already editing
        const existingSession = editingSessions.get(taskId)
        if (existingSession && existingSession.userId !== user.userId) {
          // Send conflict notification
          socket.emit('editing-conflict', {
            taskId,
            editingUser: existingSession.username,
            message: `${existingSession.username} is currently editing this task`
          })
          return
        }
        
        // Start editing session
        editingSessions.set(taskId, {
          userId: user.userId,
          username: user.username,
          timestamp: Date.now()
        })
        
        // Broadcast editing state
        io.emit('editing-sessions', Object.fromEntries(editingSessions))
      }
    })

    // Handle editing session end
    socket.on('stop-editing', (data) => {
      const { taskId } = data
      editingSessions.delete(taskId)
      io.emit('editing-sessions', Object.fromEntries(editingSessions))
    })

    // Handle activity updates
    socket.on('activity-created', (activityData) => {
      socket.broadcast.emit('activity-created', activityData)
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      const user = activeUsers.get(socket.id)
      activeUsers.delete(socket.id)
      
      // Remove any editing sessions by this user
      for (const [taskId, session] of editingSessions.entries()) {
        if (user && session.userId === user.userId) {
          editingSessions.delete(taskId)
        }
      }
      
      // Broadcast updated lists
      io.emit('users-updated', Array.from(activeUsers.values()))
      io.emit('editing-sessions', Object.fromEntries(editingSessions))
      
      console.log('User disconnected:', socket.id)
    })

    // Handle typing indicators
    socket.on('typing', (data) => {
      socket.broadcast.emit('user-typing', {
        taskId: data.taskId,
        userId: data.userId,
        username: data.username
      })
    })

    socket.on('stop-typing', (data) => {
      socket.broadcast.emit('user-stopped-typing', {
        taskId: data.taskId,
        userId: data.userId
      })
    })
  })

  // Clean up stale editing sessions every 30 seconds
  setInterval(() => {
    const now = Date.now()
    const staleThreshold = 30000 // 30 seconds
    
    let changed = false
    for (const [taskId, session] of editingSessions.entries()) {
      if (now - session.timestamp > staleThreshold) {
        editingSessions.delete(taskId)
        changed = true
      }
    }
    
    if (changed) {
      io.emit('editing-sessions', Object.fromEntries(editingSessions))
    }
  }, 30000)

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
