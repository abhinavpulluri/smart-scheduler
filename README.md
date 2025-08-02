# Smart Calendar + Meeting Optimizer

A comprehensive solution for coordinating meetings across multiple people with intelligent scheduling and optimization.

## 🎯 Problem it Solves

Coordinating meetings for multiple people (e.g., faculty, team members) is a pain. This system:
- Syncs calendars
- Finds the best time slots
- Notifies all available participants
- Optimizes based on priority, availability, or constraints

## 🏗️ Tech Stack

| Layer | Tools |
|-------|-------|
| Frontend | Next.js (React) + Tailwind CSS |
| Backend | Express.js (Node.js) + REST/GraphQL |
| Database | PostgreSQL |
| Auth | JWT / Google OAuth |
| APIs | Google Calendar API |
| Real-time | Socket.IO |
| Deployment | Vercel (Frontend), Render (Backend) |

## ✨ Features

<!-- ### Core Features -->
- ✅ User Authentication (JWT or Google Sign-In)
- ✅ Create/Join a group (e.g., faculty, team)
- ✅ Add personal calendar events (manual or API)
- ✅ View other members' free/busy slots
- ✅ Auto-suggest best time for a group meeting
- ✅ Book meeting with title, agenda, duration
- ✅ Notifications / Reminders (email, popup)

### Advanced Features
- 🤖 AI assistant to summarize meeting clashes
- 🔄 Sync with Google Calendar / Outlook API
- 📅 Recurring meetings & custom rules
- ⚡ Priority-based participant scheduling
- 🎯 Conflict resolution suggestions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Smart-Calendar
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend (.env)
   cp backend/.env.example backend/.env
   
   # Frontend (.env.local)
   cp frontend/.env.example frontend/.env.local
   ```

4. **Start the development servers**
   ```bash
   # Start backend (from backend directory)
   npm run dev
   
   # Start frontend (from frontend directory)
   npm run dev
   ```

## 📁 Project Structure

```
Smart-Calendar/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── .env
├── frontend/               # Next.js React app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Next.js pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   └── styles/        # CSS styles
│   ├── package.json
│   └── .env.local
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Get current user

### Groups
- `GET /api/groups` - Get user's groups
- `POST /api/groups` - Create new group
- `GET /api/groups/:id` - Get group details
- `POST /api/groups/:id/join` - Join group

### Events
- `GET /api/events` - Get user's events
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Meetings
- `GET /api/meetings` - Get group meetings
- `POST /api/meetings` - Create new meeting
- `POST /api/meetings/suggest` - Get meeting suggestions
- `PUT /api/meetings/:id` - Update meeting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details 