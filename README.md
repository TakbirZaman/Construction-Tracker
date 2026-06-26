<<<<<<< HEAD
# 🏗️ ConstructTrack Pro — Enterprise Construction ERP

A full-stack Construction & Real Estate Project Management ERP system inspired by Procore/Buildertrend.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Database Setup

```sql
-- Connect to PostgreSQL and create the database
CREATE DATABASE constructtrack;
```

Or via terminal:
```bash
psql -U postgres -c "CREATE DATABASE constructtrack;"
```

### 2. Environment Configuration

Edit `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:1234a@localhost:5432/constructtrack
JWT_SECRET=constructtrack_super_secret_jwt_key_2024
PORT=5000
NODE_ENV=development
```

> ⚠️ Update the DATABASE_URL with your actual PostgreSQL credentials.

### 3. Install Dependencies

```bash
# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 4. Start the Application

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

The app auto-creates all tables and seeds demo data on first startup.

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health check:** http://localhost:5000/api/health

---

## 🔑 Demo Accounts

| Role    | Email                          | Password      |
|---------|-------------------------------|---------------|
| 👑 Admin   | admin@constructtrack.com    | password123   |
| 👩‍💼 Manager | sarah@constructtrack.com    | password123   |
| 👩‍💼 Manager | james@constructtrack.com    | password123   |
| 👷 Worker  | mike@constructtrack.com     | password123   |
| 👩‍🔧 Worker  | lisa@constructtrack.com     | password123   |

---

## 🏛️ Architecture

```
constructtrack/
├── backend/
│   ├── controllers/         # Business logic
│   │   ├── authController.js
│   │   ├── projectsController.js
│   │   ├── tasksController.js
│   │   ├── materialsController.js
│   │   ├── budgetController.js
│   │   ├── dashboardController.js
│   │   └── usersController.js
│   ├── routes/              # API endpoints
│   │   ├── auth.js
│   │   ├── projects.js      # Nested: /projects/:id/tasks|materials|budget
│   │   ├── tasks.js
│   │   ├── materials.js
│   │   ├── budget.js
│   │   ├── users.js
│   │   └── dashboard.js
│   ├── middleware/
│   │   ├── auth.js          # JWT + RBAC
│   │   └── middleware.js    # Logger, error handler
│   ├── db/
│   │   └── index.js         # Drizzle ORM + auto-migration + seed
│   ├── server.js            # Express + WebSocket server
│   └── .env
│
└── frontend/
    └── src/
        ├── api/             # Centralized Axios layer
        ├── context/         # AuthContext + WSContext
        ├── components/      # Shared UI + Layout
        ├── features/
        │   ├── auth/        # Login
        │   ├── dashboard/   # Analytics dashboard
        │   ├── projects/    # Projects list + detail
        │   ├── tasks/       # Tasks tab + My Tasks
        │   ├── materials/   # Materials tab + overview
        │   ├── budget/      # Budget tab + overview
        │   └── admin/       # Admin panel
        └── utils/           # Helpers, formatters
```

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| POST | /api/auth/register | Register |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/change-password | Change password |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/projects | List all projects |
| POST | /api/projects | Create project |
| GET | /api/projects/:id | Get project |
| PUT | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Delete project |
| GET | /api/projects/stats | Dashboard stats |

### Tasks (Nested)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/projects/:pid/tasks | List tasks |
| POST | /api/projects/:pid/tasks | Create task |
| PUT | /api/projects/:pid/tasks/:id | Update task |
| DELETE | /api/projects/:pid/tasks/:id | Delete task |
| GET | /api/tasks/my | My assigned tasks |

### Materials (Nested)
| Method | Endpoint |
|--------|----------|
| GET/POST | /api/projects/:pid/materials |
| GET/PUT/DELETE | /api/projects/:pid/materials/:id |
| GET | /api/projects/:pid/materials/summary |

### Budget (Nested)
| Method | Endpoint |
|--------|----------|
| GET/POST | /api/projects/:pid/budget |
| GET/PUT/DELETE | /api/projects/:pid/budget/:id |
| GET | /api/projects/:pid/budget/summary |

### Users (Admin only)
| Method | Endpoint |
|--------|----------|
| GET | /api/users |
| POST | /api/users |
| GET/PUT/DELETE | /api/users/:id |
| GET | /api/users/workers |

---

## 👥 Role Permissions

| Feature | Admin | Manager | Worker |
|---------|-------|---------|--------|
| View all projects | ✅ | ✅ (own) | ✅ (assigned) |
| Create projects | ✅ | ✅ | ❌ |
| Delete projects | ✅ | ❌ | ❌ |
| Manage tasks | ✅ | ✅ | Update own |
| Materials/Budget | ✅ | ✅ | ❌ |
| User management | ✅ | ❌ | ❌ |
| Admin panel | ✅ | ❌ | ❌ |

---

## ⚡ WebSocket Events

The server broadcasts real-time events:
- `connected` — Initial connection confirmation
- `ping/pong` — Heartbeat every 25s
- Auto-reconnect with 5s retry logic

---

## 🗄️ Database Schema

```
users → projects (manager_id)
projects → tasks (CASCADE DELETE)
projects → materials (CASCADE DELETE)
projects → budget_entries (CASCADE DELETE)
tasks → users (assigned_to)
```

All computations (budget variance, progress %, stock alerts) are calculated in **PostgreSQL** — not the frontend.
=======
# NNSEL Construction Tracker 
>>>>>>> dab4cbb524ed25b236e558fc4449b3e8361a0391
