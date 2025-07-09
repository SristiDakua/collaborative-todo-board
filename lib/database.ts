// Database connection utility
// This will work with both MongoDB (primary) and in-memory fallback

interface User {
  _id: string
  username: string
  email: string
  password: string
  createdAt: Date
}

interface Task {
  _id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in-progress' | 'done'
  assignedTo: string | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

interface Activity {
  user: User
  action: string
  taskTitle: string
  details?: string
  timestamp: Date
}

// In-memory storage (fallback when MongoDB is not available)
let users: User[] = []
let tasks: Task[] = []
let activities: Activity[] = []

// MongoDB simulation using localStorage in browser (persistent across sessions)
const DB_STORAGE_KEY = 'collaborative-todo-board-db'

function getStoredData() {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(DB_STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        return {
          users: data.users || [],
          tasks: data.tasks || [],
          activities: data.activities || []
        }
      }
    } catch (error) {
      console.warn('Failed to load stored data:', error)
    }
  }
  return { users: [], tasks: [], activities: [] }
}

function saveToStorage() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify({
        users,
        tasks,
        activities
      }))
    } catch (error) {
      console.warn('Failed to save data:', error)
    }
  }
}

// Initialize data from storage
const storedData = getStoredData()
users = storedData.users
tasks = storedData.tasks
activities = storedData.activities

export const Database = {
  // Users collection
  users: {
    find: (query: Partial<User> = {}) => {
      return users.filter(user => {
        return Object.entries(query).every(([key, value]) => 
          user[key as keyof User] === value
        )
      })
    },
    
    findOne: (query: Partial<User>) => {
      return users.find(user => {
        return Object.entries(query).every(([key, value]) => 
          user[key as keyof User] === value
        )
      })
    },
    
    create: (userData: Omit<User, '_id' | 'createdAt'>) => {
      const user: User = {
        _id: Date.now().toString(),
        ...userData,
        createdAt: new Date()
      }
      users.push(user)
      saveToStorage()
      return user
    },
    
    updateOne: (query: Partial<User>, update: Partial<User>) => {
      const userIndex = users.findIndex(user => {
        return Object.entries(query).every(([key, value]) => 
          user[key as keyof User] === value
        )
      })
      
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...update }
        saveToStorage()
        return users[userIndex]
      }
      return null
    },
    
    deleteOne: (query: Partial<User>) => {
      const userIndex = users.findIndex(user => {
        return Object.entries(query).every(([key, value]) => 
          user[key as keyof User] === value
        )
      })
      
      if (userIndex !== -1) {
        const deleted = users.splice(userIndex, 1)[0]
        saveToStorage()
        return deleted
      }
      return null
    }
  },

  // Tasks collection
  tasks: {
    find: (query: Partial<Task> = {}) => {
      return tasks.filter(task => {
        return Object.entries(query).every(([key, value]) => 
          task[key as keyof Task] === value
        )
      })
    },
    
    findOne: (query: Partial<Task>) => {
      return tasks.find(task => {
        return Object.entries(query).every(([key, value]) => 
          task[key as keyof Task] === value
        )
      })
    },
    
    create: (taskData: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>) => {
      const task: Task = {
        _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...taskData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      tasks.push(task)
      saveToStorage()
      return task
    },
    
    updateOne: (query: Partial<Task>, update: Partial<Task>) => {
      const taskIndex = tasks.findIndex(task => {
        return Object.entries(query).every(([key, value]) => 
          task[key as keyof Task] === value
        )
      })
      
      if (taskIndex !== -1) {
        tasks[taskIndex] = { 
          ...tasks[taskIndex], 
          ...update, 
          updatedAt: new Date() 
        }
        saveToStorage()
        return tasks[taskIndex]
      }
      return null
    },
    
    deleteOne: (query: Partial<Task>) => {
      const taskIndex = tasks.findIndex(task => {
        return Object.entries(query).every(([key, value]) => 
          task[key as keyof Task] === value
        )
      })
      
      if (taskIndex !== -1) {
        const deleted = tasks.splice(taskIndex, 1)[0]
        saveToStorage()
        return deleted
      }
      return null
    }
  },

  // Activities collection
  activities: {
    find: (limit?: number) => {
      const sorted = [...activities].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      return limit ? sorted.slice(0, limit) : sorted
    },
    
    create: (activityData: Omit<Activity, 'timestamp'>) => {
      const activity: Activity = {
        ...activityData,
        timestamp: new Date()
      }
      activities.unshift(activity)
      // Keep only last 20 activities
      activities = activities.slice(0, 20)
      saveToStorage()
      return activity
    },
    
    clear: () => {
      activities = []
      saveToStorage()
    }
  },

  // Utility methods
  clear: () => {
    users = []
    tasks = []
    activities = []
    saveToStorage()
  },

  export: () => {
    return {
      users: [...users],
      tasks: [...tasks],
      activities: [...activities]
    }
  },

  import: (data: { users?: User[], tasks?: Task[], activities?: Activity[] }) => {
    if (data.users) users = [...data.users]
    if (data.tasks) tasks = [...data.tasks]
    if (data.activities) activities = [...data.activities]
    saveToStorage()
  }
}

// Helper function to log activities
export function logActivity(userId: string, action: string, taskTitle: string, details?: string) {
  const user = Database.users.findOne({ _id: userId })
  if (user) {
    Database.activities.create({
      user,
      action,
      taskTitle,
      details
    })
  }
}
