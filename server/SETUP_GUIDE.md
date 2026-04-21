# Judge Scoring Dashboard - Setup Guide

Complete guide to set up and run the SLIIT Got Talent 2026 Judge Scoring Dashboard backend.

---

## 📋 Prerequisites

Before starting, ensure you have:

1. **Node.js** (v14 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

2. **MongoDB** (Local or Cloud)
   - **Option A - Local:** Download from https://www.mongodb.com/try/download/community
   - **Option B - Cloud:** MongoDB Atlas (https://www.mongodb.com/cloud/atlas)

3. **Git** (for cloning)
   - Download: https://git-scm.com/

4. **Text Editor/IDE** (VS Code recommended)
   - Download: https://code.visualstudio.com/

---

## 🚀 Quick Start (5 minutes)

### 1. Navigate to Server Directory
```bash
cd server
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
Create a `.env` file in the `server` folder:

```bash
# Copy the example
cp .env.example .env

# Edit .env with your values (see Configuration section)
```

### 4. Start MongoDB

**Local MongoDB:**
```bash
# Windows
mongod

# macOS/Linux
brew services start mongodb-community
```

**Cloud MongoDB (Atlas):**
- Set `MONGO_URI` in .env to your Atlas connection string

### 5. Run the Server
```bash
npm run dev
```

You should see:
```
╔══════════════════════════════════════════════════════════════╗
║  SLIIT Got Talent 2026 - Judge Scoring Dashboard Backend     ║
╠══════════════════════════════════════════════════════════════╣
║  ✓ Server Running                                            ║
║  ✓ Port: 5000                                                ║
║  ✓ Environment: development                                  ║
║  ✓ Time: 11:30:45 AM                                         ║
╚══════════════════════════════════════════════════════════════╝
```

### 6. Seed Sample Data
```bash
npm run seed
```

This creates:
- 3 sample judges
- 5 sample contestants
- Print login credentials to console

### 7. Test the Backend
Open browser and visit:
```
http://localhost:5000
```

You should see:
```json
{
  "success": true,
  "message": "SLIIT Got Talent 2026 - Judge Scoring Dashboard Backend",
  "version": "1.0.0",
  "status": "running"
}
```

---

## ⚙️ Configuration

### Environment Variables (.env)

```ini
# ═══════════════════════════════════
# SERVER CONFIGURATION
# ═══════════════════════════════════

# Port to run the server on
PORT=5000

# Environment mode
NODE_ENV=development

# ═══════════════════════════════════
# DATABASE CONFIGURATION
# ═══════════════════════════════════

# MongoDB connection string
# Local: mongodb://localhost:27017/judge-scoring-db
# Atlas: mongodb+srv://username:password@cluster.mongodb.net/judge-scoring-db?retryWrites=true&w=majority
MONGO_URI=mongodb://localhost:27017/judge-scoring-db

# ═══════════════════════════════════
# JWT AUTHENTICATION
# ═══════════════════════════════════

# Secret key for JWT (change in production!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345

# Token expiration time
JWT_EXPIRE=7d

# ═══════════════════════════════════
# FRONTEND CONFIGURATION
# ═══════════════════════════════════

# React frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

---

## 🗄️ Setting Up MongoDB

### Option 1: Local MongoDB

#### Windows
1. Download: https://www.mongodb.com/try/download/community
2. Run installer and follow prompts
3. Start MongoDB:
   ```bash
   mongod
   ```
4. Keep terminal running

#### macOS
1. Install using Homebrew:
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   ```
2. Start MongoDB:
   ```bash
   brew services start mongodb-community
   ```

#### Ubuntu/Linux
```bash
# Install
sudo apt-get install mongodb

# Start service
sudo systemctl start mongodb
```

**Verify MongoDB is running:**
```bash
mongo  # or mongosh
```

---

### Option 2: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a new project
4. Create a cluster (free tier available)
5. Create database user with strong password
6. Get connection string
7. Add IP to whitelist (allow all from 0.0.0.0/0 for development)
8. Update `MONGO_URI` in `.env`:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster-name.mongodb.net/judge-scoring-db?retryWrites=true&w=majority
   ```

---

## 📁 Project Structure

```
server/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── auth.Controller.js    # Login, register, profile
│   ├── contestant.Controller.js  # Contestant CRUD
│   └── judgeScore.Controller.js  # Score submission, leaderboard
├── middleware/
│   ├── authMiddleware.js     # JWT verification
│   ├── roleMiddleware.js     # Role-based access control
│   └── validationMiddleware.js  # Input validation
├── models/
│   ├── User.js               # Judge/User schema
│   ├── Contestant.js         # Contestant schema
│   └── JudgeScore.js         # Judge score schema
├── routes/
│   ├── auth.Routes.js        # Auth endpoints
│   ├── contestant.Routes.js  # Contestant endpoints
│   └── judgeScore.Routes.js  # Score/leaderboard endpoints
├── scripts/
│   └── seed.js               # Sample data generator
├── utils/
│   └── sendEmail.js          # Email utility (optional)
├── app.js                    # Express app config
├── index.js                  # Server entry point
├── package.json              # Dependencies
├── .env.example              # Example environment vars
└── API_DOCUMENTATION.md      # API reference
```

---

## 🧪 Testing the Backend

### Test 1: Health Check
```bash
curl http://localhost:5000
```

### Test 2: Get All Contestants
```bash
curl http://localhost:5000/api/contestants
```

### Test 3: Login (Using Postman or cURL)

**Using Postman:**
1. Open Postman
2. Create new request
3. Method: `POST`
4. URL: `http://localhost:5000/api/auth/login`
5. Body (JSON):
   ```json
   {
     "email": "john.smith@judging.com",
     "password": "SecurePass123!"
   }
   ```
6. Send

**Using cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.smith@judging.com",
    "password": "SecurePass123!"
  }'
```

You'll receive a JWT token.

### Test 4: Submit Score (Protected)
```bash
curl -X POST http://localhost:5000/api/scores/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "contestantId": "CONTESTANT_ID_HERE",
    "creativity": 20,
    "presentation": 22,
    "skillLevel": 23,
    "audienceImpact": 21
  }'
```

---

## 🔗 Connecting React Frontend

### 1. Update React API Client

In your React project, create `src/services/apiClient.js`:

```javascript
import axios from 'axios';

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

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, logout
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 2. Update Your React Components

**Example: Login Component**
```javascript
import apiClient from '../services/apiClient';

async function handleLogin(email, password) {
  try {
    const { data } = await apiClient.post('/auth/login', { email, password });
    
    // Store token
    localStorage.setItem('token', data.token);
    
    // Store user info
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Redirect to dashboard
    navigate('/dashboard');
  } catch (error) {
    console.error('Login failed:', error.response.data.message);
  }
}
```

**Example: Get Contestants**
```javascript
async function loadContestants() {
  try {
    const { data } = await apiClient.get('/contestants', {
      params: { round: 'Preliminary' }
    });
    setContestants(data.contestants);
  } catch (error) {
    console.error('Failed to load contestants:', error);
  }
}
```

**Example: Submit Score**
```javascript
async function submitScore(contestantId, scores) {
  try {
    const { data } = await apiClient.post('/scores/submit', {
      contestantId,
      creativity: scores.creativity,
      presentation: scores.presentation,
      skillLevel: scores.skillLevel,
      audienceImpact: scores.audienceImpact,
    });
    
    alert('Score submitted successfully!');
    console.log('Total Score:', data.score.totalScore);
  } catch (error) {
    if (error.response?.data?.message === 'You have already submitted a score for this contestant in this round.') {
      alert('You have already scored this contestant!');
    } else {
      alert('Error submitting score');
    }
  }
}
```

### 3. Frontend Environment Variables

In React `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Recommended Frontend API Calls

Based on your JudgePanelDashboard:

```javascript
// 1. Login Judge
POST /auth/login
{ email, password }

// 2. Get Judge Profile
GET /auth/profile
(with token)

// 3. Get Contestants for Scoring
GET /contestants?round=Preliminary

// 4. Get Single Contestant Details
GET /contestants/:id

// 5. Submit Score for Contestant
POST /scores/submit
{ contestantId, creativity, presentation, skillLevel, audienceImpact }

// 6. Get Judge's Submitted Scores
GET /scores/my-scores?round=Preliminary

// 7. Get Leaderboard
GET /scores/leaderboard?round=Preliminary
```

---

## 🐛 Debugging

### Common Issues

**Issue: MongoDB Connection Error**
```
Error: MongoServerError: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** 
- Ensure MongoDB is running (`mongod` or `brew services start mongodb-community`)
- Check `MONGO_URI` in `.env`

---

**Issue: JWT Token Expired**
```
Error: TokenExpiredError: token expired
```
**Solution:**
- User needs to login again
- Token expires after 7 days (configurable in `.env` with `JWT_EXPIRE`)

---

**Issue: CORS Error in Browser**
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Ensure `FRONTEND_URL` in `.env` matches React dev server URL
- Backend should have CORS enabled for your frontend origin

---

**Issue: "Duplicate submission" Error**
```
Error: Duplicate submission detected
```
**Solution:**
- Judge cannot submit multiple scores for same contestant in same round
- This is by design to prevent double-scoring
- Use GET /scores/my-scores to see what was already submitted

---

## 📊 Monitoring & Logs

### Enable Detailed Logging
Add to `.env`:
```
NODE_ENV=development
```

In production, use:
```
NODE_ENV=production
```

### Check Server Logs
```bash
npm run dev
# Shows all requests and database operations
```

---

## 🔒 Security Features

✅ Passwords hashed with bcryptjs  
✅ JWT token-based authentication  
✅ Protected routes with role-based access  
✅ Input validation on all endpoints  
✅ Prevents duplicate score submissions  
✅ Backend computes totals (doesn't trust frontend)  

---

## 📦 Deployment

### Production Setup

1. **Set production environment:**
   ```
   NODE_ENV=production
   ```

2. **Use strong JWT secret:**
   ```
   JWT_SECRET=<generate-very-long-random-string>
   ```

3. **Use MongoDB Atlas** (not local)
   ```
   MONGO_URI=mongodb+srv://...
   ```

4. **Set correct FRONTEND_URL** (your React domain)

5. **Run production server:**
   ```bash
   npm start
   ```

### Deployment Platforms

- **Heroku:** `git push heroku main`
- **Railway:** Connect GitHub repo
- **AWS:** Lambda + RDS
- **Azure:** App Service + Cosmos DB
- **DigitalOcean:** Droplets

---

## 📞 Support

For issues or questions:
1. Check API_DOCUMENTATION.md
2. Review error messages in console
3. Check MongoDB connection
4. Verify token is being sent in headers
5. Check CORS settings

---

## 📝 Next Steps

1. ✅ Install dependencies
2. ✅ Set up MongoDB
3. ✅ Configure `.env`
4. ✅ Start backend (`npm run dev`)
5. ✅ Seed sample data (`npm run seed`)
6. ✅ Test endpoints
7. ✅ Connect React frontend
8. ✅ Update frontend API calls
9. ✅ Test full flow (login → view contestants → submit scores → view leaderboard)

---

Generated: April 6, 2026  
Backend Version: 1.0.0
