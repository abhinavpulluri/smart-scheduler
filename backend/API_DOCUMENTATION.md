# Smart Calendar API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "token": "jwt-token-here"
}
```

### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "token": "jwt-token-here"
}
```

### Get Current User Profile
```http
GET /auth/me
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 👥 Group Endpoints

### Create Group
```http
POST /groups
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "Development Team",
  "description": "Our development team for project X"
}
```

**Response:**
```json
{
  "message": "Group created successfully",
  "group": {
    "id": 1,
    "name": "Development Team",
    "description": "Our development team for project X",
    "created_by": 1,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get User's Groups
```http
GET /groups
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "groups": [
    {
      "id": 1,
      "name": "Development Team",
      "description": "Our development team for project X",
      "created_by": 1,
      "role": "admin",
      "creator_name": "John Doe",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Group Details
```http
GET /groups/:id
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "group": {
    "id": 1,
    "name": "Development Team",
    "description": "Our development team for project X",
    "created_by": 1,
    "creator_name": "John Doe",
    "created_at": "2024-01-01T00:00:00.000Z",
    "members": [
      {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "role": "admin",
        "joined_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Add User to Group
```http
POST /groups/:groupId/members
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "email": "jane@example.com",
  "role": "member"
}
```

### Remove User from Group
```http
DELETE /groups/:groupId/members/:userId
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

### Update Group
```http
PUT /groups/:id
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "Updated Team Name",
  "description": "Updated description"
}
```

### Delete Group
```http
DELETE /groups/:id
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

---

## 📅 Event Endpoints

### Create Event
```http
POST /events
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "title": "Team Meeting",
  "description": "Weekly team sync",
  "start_time": "2024-01-15T10:00:00.000Z",
  "end_time": "2024-01-15T11:00:00.000Z",
  "location": "Conference Room A",
  "is_busy": true
}
```

**Response:**
```json
{
  "message": "Event created successfully",
  "event": {
    "id": 1,
    "user_id": 1,
    "title": "Team Meeting",
    "description": "Weekly team sync",
    "start_time": "2024-01-15T10:00:00.000Z",
    "end_time": "2024-01-15T11:00:00.000Z",
    "location": "Conference Room A",
    "is_busy": true,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get User Events
```http
GET /events
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `start_date` (optional): Filter events from this date
- `end_date` (optional): Filter events until this date

**Response:**
```json
{
  "events": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Team Meeting",
      "description": "Weekly team sync",
      "start_time": "2024-01-15T10:00:00.000Z",
      "end_time": "2024-01-15T11:00:00.000Z",
      "location": "Conference Room A",
      "is_busy": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Event by ID
```http
GET /events/:id
```

### Update Event
```http
PUT /events/:id
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "title": "Updated Meeting Title",
  "description": "Updated description",
  "start_time": "2024-01-15T11:00:00.000Z",
  "end_time": "2024-01-15T12:00:00.000Z",
  "location": "Conference Room B",
  "is_busy": false
}
```

### Delete Event
```http
DELETE /events/:id
```

### Get User's Busy Times
```http
GET /events/busy-times?start_date=2024-01-15&end_date=2024-01-16
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "busyTimes": [
    {
      "start_time": "2024-01-15T10:00:00.000Z",
      "end_time": "2024-01-15T11:00:00.000Z"
    }
  ]
}
```

---

## 🤝 Meeting Endpoints

### Create Meeting
```http
POST /meetings
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "group_id": 1,
  "title": "Project Review",
  "description": "Monthly project review meeting",
  "start_time": "2024-01-20T14:00:00.000Z",
  "end_time": "2024-01-20T15:00:00.000Z",
  "location": "Virtual Meeting"
}
```

**Response:**
```json
{
  "message": "Meeting created successfully",
  "meeting": {
    "id": 1,
    "group_id": 1,
    "title": "Project Review",
    "description": "Monthly project review meeting",
    "start_time": "2024-01-20T14:00:00.000Z",
    "end_time": "2024-01-20T15:00:00.000Z",
    "location": "Virtual Meeting",
    "created_by": 1,
    "status": "scheduled",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get User's Meetings
```http
GET /meetings/user
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "meetings": [
    {
      "id": 1,
      "group_id": 1,
      "title": "Project Review",
      "description": "Monthly project review meeting",
      "start_time": "2024-01-20T14:00:00.000Z",
      "end_time": "2024-01-20T15:00:00.000Z",
      "location": "Virtual Meeting",
      "created_by": 1,
      "status": "scheduled",
      "group_name": "Development Team",
      "creator_name": "John Doe",
      "participation_status": "pending"
    }
  ]
}
```

### Get Group Meetings
```http
GET /meetings/group/:groupId
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

### Get Meeting Details
```http
GET /meetings/:id
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "meeting": {
    "id": 1,
    "group_id": 1,
    "title": "Project Review",
    "description": "Monthly project review meeting",
    "start_time": "2024-01-20T14:00:00.000Z",
    "end_time": "2024-01-20T15:00:00.000Z",
    "location": "Virtual Meeting",
    "created_by": 1,
    "status": "scheduled",
    "creator_name": "John Doe",
    "created_at": "2024-01-01T00:00:00.000Z",
    "participants": [
      {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "status": "accepted",
        "joined_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Update Meeting
```http
PUT /meetings/:id
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "title": "Updated Meeting Title",
  "description": "Updated description",
  "start_time": "2024-01-20T15:00:00.000Z",
  "end_time": "2024-01-20T16:00:00.000Z",
  "location": "Conference Room A",
  "status": "scheduled"
}
```

### Delete Meeting
```http
DELETE /meetings/:id
```

### Update Participant Status
```http
PUT /meetings/:meetingId/status
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "status": "accepted"
}
```

**Possible status values:** `accepted`, `declined`, `pending`

### Find Available Time Slots
```http
GET /meetings/group/:groupId/available-slots?start_date=2024-01-20&end_date=2024-01-21&duration=60
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `start_date`: Start date for search
- `end_date`: End date for search
- `duration`: Duration in minutes (default: 60)

**Response:**
```json
{
  "availableSlots": [
    {
      "start_time": "2024-01-20T10:00:00.000Z",
      "end_time": "2024-01-20T11:00:00.000Z"
    },
    {
      "start_time": "2024-01-20T14:00:00.000Z",
      "end_time": "2024-01-20T15:00:00.000Z"
    }
  ]
}
```

---

## 🧪 Testing the API

### 1. Test Database Connection
```http
GET /test-db
```

### 2. Test Server Status
```http
GET /
```

### 3. Complete Flow Example

1. **Register a user:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","first_name":"Test","last_name":"User"}'
   ```

2. **Login:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

3. **Create a group (use token from login):**
   ```bash
   curl -X POST http://localhost:3001/api/groups \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -d '{"name":"Test Group","description":"A test group"}'
   ```

4. **Create an event:**
   ```bash
   curl -X POST http://localhost:3001/api/events \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -d '{"title":"Test Event","description":"A test event","start_time":"2024-01-15T10:00:00.000Z","end_time":"2024-01-15T11:00:00.000Z"}'
   ```

---

## 📝 Error Responses

All endpoints return consistent error responses:

```json
{
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error 