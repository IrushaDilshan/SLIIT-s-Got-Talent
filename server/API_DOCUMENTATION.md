# Judge Scoring Dashboard - API Documentation

**Backend Base URL:** `http://localhost:5000/api`

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## API Endpoints

### 1. Authentication

#### Login (Judge)
```
POST /auth/login
Content-Type: application/json

{
  "email": "john.smith@judging.com",
  "password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Smith",
    "email": "john.smith@judging.com",
    "role": "judge",
    "panel": "Panel A",
    "photo": "https://via.placeholder.com/150/0000FF/808080?text=John+Smith"
  }
}
```

---

#### Register Judge (Admin)
```
POST /auth/register
Content-Type: application/json

{
  "name": "Emma Wilson",
  "email": "emma.wilson@judging.com",
  "password": "SecurePass123!",
  "panel": "Panel C",
  "photo": "https://via.placeholder.com/150/FFA500/FFFFFF?text=Emma"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Judge registered successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Emma Wilson",
    "email": "emma.wilson@judging.com",
    "panel": "Panel C",
    "photo": "https://via.placeholder.com/150/FFA500/FFFFFF?text=Emma"
  }
}
```

---

#### Get Logged-In Judge Profile
```
GET /auth/profile
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Smith",
    "email": "john.smith@judging.com",
    "role": "judge",
    "panel": "Panel A",
    "photo": "https://via.placeholder.com/150/0000FF/808080?text=John+Smith",
    "isActive": true,
    "createdAt": "2026-04-06T10:30:00.000Z"
  }
}
```

---

### 2. Contestants

#### Get All Contestants
```
GET /contestants?round=Preliminary&status=pending&limit=100
```

**Query Parameters:**
- `round` (optional): `Preliminary`, `Semi-Final`, or `Final`
- `status` (optional): `pending`, `performed`, or `disqualified`
- `limit` (optional): Maximum results (default: 100)
- `sort` (optional): Sort field (default: `timeSlot`)

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "contestants": [
    {
      "id": "507f1f77bcf86cd799439020",
      "name": "Emma Williams",
      "category": "Dance",
      "round": "Preliminary",
      "performanceTitle": "Contemporary Flow",
      "photo": "https://via.placeholder.com/300x400/FF6B6B/FFFFFF?text=Emma+Dance",
      "status": "pending",
      "timeSlot": "09:00 AM"
    },
    {
      "id": "507f1f77bcf86cd799439021",
      "name": "Rajesh Kumar",
      "category": "Singing",
      "round": "Preliminary",
      "performanceTitle": "Soul Melodies",
      "photo": "https://via.placeholder.com/300x400/4ECDC4/FFFFFF?text=Rajesh+Singing",
      "status": "pending",
      "timeSlot": "09:30 AM"
    }
  ]
}
```

---

#### Get Single Contestant
```
GET /contestants/507f1f77bcf86cd799439020
```

**Response (200):**
```json
{
  "success": true,
  "contestant": {
    "id": "507f1f77bcf86cd799439020",
    "name": "Emma Williams",
    "category": "Dance",
    "round": "Preliminary",
    "performanceTitle": "Contemporary Flow",
    "photo": "https://via.placeholder.com/300x400/FF6B6B/FFFFFF?text=Emma+Dance",
    "status": "pending",
    "timeSlot": "09:00 AM",
    "regNumber": "SLIIT-001",
    "contactNumber": "+94701234567"
  }
}
```

---

### 3. Judge Scores

#### Submit Judge Score
```
POST /scores/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "contestantId": "507f1f77bcf86cd799439020",
  "creativity": 20,
  "presentation": 22,
  "skillLevel": 23,
  "audienceImpact": 21
}
```

**Validation:**
- All fields required
- Each score must be 0-25 (integers)
- Total cannot exceed 100
- No duplicate submissions per judge per contestant per round

**Response (201):**
```json
{
  "success": true,
  "message": "Score submitted successfully.",
  "score": {
    "id": "507f1f77bcf86cd799439030",
    "creativity": 20,
    "presentation": 22,
    "skillLevel": 23,
    "audienceImpact": 21,
    "totalScore": 86,
    "submittedAt": "2026-04-06T11:30:00.000Z"
  }
}
```

**Error Response (400) - Duplicate Submission:**
```json
{
  "success": false,
  "message": "You have already submitted a score for this contestant in this round.",
  "existingSubmission": "2026-04-06T10:30:00.000Z"
}
```

**Error Response (400) - Missing Criteria:**
```json
{
  "success": false,
  "message": "Please complete all criteria before submitting.",
  "required": ["creativity", "presentation", "skillLevel", "audienceImpact"]
}
```

---

#### Get My Submitted Scores
```
GET /scores/my-scores?round=Preliminary&limit=50
Authorization: Bearer <token>
```

**Query Parameters:**
- `round` (optional): Filter by round
- `limit` (optional): Maximum results (default: 50)

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "scores": [
    {
      "id": "507f1f77bcf86cd799439030",
      "contestant": {
        "_id": "507f1f77bcf86cd799439020",
        "name": "Emma Williams",
        "category": "Dance",
        "performanceTitle": "Contemporary Flow",
        "photo": "https://via.placeholder.com/300x400/FF6B6B/FFFFFF?text=Emma+Dance"
      },
      "round": "Preliminary",
      "creativity": 20,
      "presentation": 22,
      "skillLevel": 23,
      "audienceImpact": 21,
      "totalScore": 86,
      "submittedAt": "2026-04-06T11:30:00.000Z"
    }
  ]
}
```

---

#### Get Leaderboard / Scoreboard
```
GET /scores/leaderboard?round=Preliminary&limit=50
```

**Query Parameters:**
- `round` (optional): `Preliminary`, `Semi-Final`, or `Final` (default: Preliminary)
- `limit` (optional): Maximum results (default: 50)

**Response (200):**
```json
{
  "success": true,
  "round": "Preliminary",
  "count": 5,
  "leaderboard": [
    {
      "rank": 1,
      "contestantId": "507f1f77bcf86cd799439020",
      "contestant": {
        "name": "Emma Williams",
        "category": "Dance",
        "performanceTitle": "Contemporary Flow",
        "photo": "https://via.placeholder.com/300x400/FF6B6B/FFFFFF?text=Emma+Dance"
      },
      "averageScore": 85.67,
      "totalScore": 257,
      "judgeCount": 3
    },
    {
      "rank": 2,
      "contestantId": "507f1f77bcf86cd799439021",
      "contestant": {
        "name": "Rajesh Kumar",
        "category": "Singing",
        "performanceTitle": "Soul Melodies",
        "photo": "https://via.placeholder.com/300x400/4ECDC4/FFFFFF?text=Rajesh+Singing"
      },
      "averageScore": 82.33,
      "totalScore": 247,
      "judgeCount": 3
    }
  ]
}
```

---

#### Get Single Score
```
GET /scores/507f1f77bcf86cd799439030
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "score": {
    "id": "507f1f77bcf86cd799439030",
    "contestant": {
      "_id": "507f1f77bcf86cd799439020",
      "name": "Emma Williams",
      "category": "Dance",
      "performanceTitle": "Contemporary Flow",
      "photo": "https://via.placeholder.com/300x400/FF6B6B/FFFFFF?text=Emma+Dance",
      "round": "Preliminary"
    },
    "creativity": 20,
    "presentation": 22,
    "skillLevel": 23,
    "audienceImpact": 21,
    "totalScore": 86,
    "submittedAt": "2026-04-06T11:30:00.000Z"
  }
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Access denied (role check failed) |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

---

## Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "Detailed error info (development only)"
}
```

---

## Frontend Integration

### Setting Up Axios Client

```javascript
import axios from 'axios';

// Create Axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### Example API Calls in React

```javascript
// Login
async function handleLogin(email, password) {
  const { data } = await apiClient.post('/auth/login', { email, password });
  localStorage.setItem('token', data.token);
  return data.user;
}

// Get contestants
async function getContestants(round) {
  const { data } = await apiClient.get('/contestants', {
    params: { round, limit: 100 }
  });
  return data.contestants;
}

// Submit score
async function submitScore(contestantId, scores) {
  const { data } = await apiClient.post('/scores/submit', {
    contestantId,
    ...scores
  });
  return data.score;
}

// Get leaderboard
async function getLeaderboard(round) {
  const { data } = await apiClient.get('/scores/leaderboard', {
    params: { round }
  });
  return data.leaderboard;
}
```

---

## Running the Backend

### Prerequisites
- Node.js (v14+)
- MongoDB (local or cloud)

### Installation
```bash
cd server
npm install
```

### Configuration
Create `.env` file with:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/judge-scoring-db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

### Start Development Server
```bash
npm run dev
```

### Seed Sample Data
```bash
npm run seed
```

### Production
```bash
npm start
```

---

## Schema Details

### User (Judge)
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['judge', 'admin'], default: 'judge'),
  panel: String,
  photo: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Contestant
```javascript
{
  _id: ObjectId,
  name: String (required),
  category: String (required),
  round: String (required, enum: ['Preliminary', 'Semi-Final', 'Final']),
  performanceTitle: String (required),
  photo: String (required),
  status: String (enum: ['pending', 'performed', 'disqualified'], default: 'pending'),
  timeSlot: String (required),
  regNumber: String,
  contactNumber: String,
  createdAt: Date,
  updatedAt: Date
}
```

### JudgeScore
```javascript
{
  _id: ObjectId,
  judgeId: ObjectId (ref: User, required),
  contestantId: ObjectId (ref: Contestant, required),
  round: String (required, enum: ['Preliminary', 'Semi-Final', 'Final']),
  creativity: Number (0-25, required),
  presentation: Number (0-25, required),
  skillLevel: Number (0-25, required),
  audienceImpact: Number (0-25, required),
  totalScore: Number (calculated: sum of criteria),
  comments: String (optional),
  submittedAt: Date (default: now),
  createdAt: Date,
  updatedAt: Date,
  
  // Unique index:
  Unique: { judgeId, contestantId, round }
}
```

---

Generated: April 6, 2026
Backend Version: 1.0.0
