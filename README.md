# 🚀 CollabBoard

**Real‑Time Collaborative Task Management**

A full‑stack web application that revolutionizes team collaboration with real‑time synchronization, intelligent task assignment, and conflict resolution.

---

## 🌟 Project Overview

CollabBoard is a modern task management tool designed for teams that need real‑time collaboration. It features a Kanban-style interface with drag-and-drop capabilities, real-time updates via WebSockets, activity logging, AI-powered workload distribution, and robust conflict handling.

---

## 🧩 Tech Stack

**Frontend**
- React 18
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- @hello‑pangea/dnd (drag and drop)
- Socket.IO Client
- Lucide React (icons)
- date-fns

**Backend**
- Next.js API Routes
- Node.js 20
- Socket.IO Server
- JWT Authentication
- bcryptjs (password hashing)
- In-memory storage (development; database-ready for production)

**Dev Tools**
- ESLint & Prettier
- Git & GitHub
- VS Code

---

## 🛠 Setup & Installation

### Prerequisites
- Node.js ≥ 18
- npm or pnpm

### Local Development

1. **Clone the repo**
   ```bash
   git clone <repository-url>
   cd collaborative-todo-board
````

2. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set environment variables**
   Create a `.env.local` file:

   ```env
   JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
   ```

4. **Start development server**

   * With real-time:

     ```bash
     npm run dev:socket
     ```
   * Without real-time:

     ```bash
     npm run dev
     ```

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000).

### Production Build & Deployment

```bash
npm run build
npm start
```

**Vercel Deployment (Recommended)**

1. Push to GitHub and import to Vercel.
2. Set `JWT_SECRET` and `NEXT_PUBLIC_SOCKET_URL`.
3. Deploy via Vercel’s automatic build process.

**Railway / Render Deployment**

1. Connect repo.
2. Define environment variables:

   ```env
   JWT_SECRET=your-production-jwt-secret
   PORT=3000
   NEXT_PUBLIC_SOCKET_URL=https://your-deployed-url
   ```
3. Configure:

   * Build command: `npm run build`
   * Start command: `npm start`

---

## 🚀 Features & Usage Guide

### ✅ Core Features

* **User Authentication**
  Register/login via JWT; passwords hashed with bcrypt.

* **Kanban Board**
  Columns: To Do, In Progress, Done. Drag-and-drop tasks easily.

* **Task Management**
  Create, edit, delete, assign, and set priority.

* **Live Collaboration**
  Changes viewable in real-time across all clients.

* **Activity Logging**
  See a live feed of recent user actions.

### 🧠 Smart Assignment

Click the ⚡ icon to assign the task automatically:

1. Counts active tasks per user.
2. Finds the user(s) with the fewest tasks.
3. Assigns task to maintain balance.
4. Updates instantly across all users.

### ⚔️ Conflict Handling

When multiple users edit the same task:

1. System detects concurrent edits.
2. Displays visual "editing by" indicators.
3. Offers merge or overwrite options.
4. Ensures no data is lost during simultaneous edits.

### 🎨 UI Highlights

* **Smooth animations** when flipping cards or dragging tasks.
* **Responsive** with mobile and desktop optimizations.
* **Custom-built** interface—no under-the-hood UI kits.

---

## 📚 Documentation

* API endpoints (under `api/`):

  * `POST /api/auth/register` – Register user
  * `POST /api/auth/login` – Authenticate
  * `GET /api/tasks` – Retrieve tasks
  * `POST /api/tasks` – Create a task
  * `PATCH /api/tasks/[id]` – Update task
  * `DELETE /api/tasks/[id]` – Remove task
  * `POST /api/tasks/[id]/smart-assign` – Auto-assign task
  * `GET /api/users` – List users
  * `GET /api/activities` – Get recent user actions

* **Drag & Drop**
  Implemented via `@hello-pangea/dnd` and integrated with Socket.IO.

* **Real-Time Sync**
  Uses Socket.IO events to broadcast task changes to all connected clients.

* **State Management**
  Uses React context + hooks for tasks, users, and activity feed.

---

## 🧪 Testing Checklist

* [ ] Register/login workflows
* [ ] Task lifecycle (create, update, delete)
* [ ] Drag & drop columns
* [ ] Real-time sync across tabs/browsers
* [ ] Smart assignment accuracy
* [ ] Conflict detection/resolution UI
* [ ] Responsive design on mobile
* [ ] Input validation/error handling

---

## 🌱 Future Enhancements

* MongoDB/PostgreSQL integration
* Email and push notifications
* File attachments & comments
* Multi-board support & team permissions
* Task templates and advanced search
* Native mobile apps
* Offline editing mode

---

## 💼 Contributing

1. Fork this repo
2. Create a branch (`git checkout -b feature/new-feature`)
3. Implement your changes with tests
4. Submit a pull request

---

## 📄 License

Open source under the **MIT License**. See the [LICENSE](LICENSE) file.

---
