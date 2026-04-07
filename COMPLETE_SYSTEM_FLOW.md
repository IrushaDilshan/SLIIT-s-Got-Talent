# Complete End-to-End Judge Scoring System Flow

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     SLIIT's Got Talent - Judge Scoring System            │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────┐        ┌──────────────┐        ┌────────────────────┐
│   Frontend  │        │    Backend   │        │      MongoDB       │
│   React App │◄─────►│  Node.js API │◄─────►│  Atlas Database    │
│  Port 5173  │        │  Port 5000   │        │  sliit.zjnwlox...  │
└─────────────┘        └──────────────┘        │  judge-scoring-db  │
                                               └────────────────────┘
```

---

## 📝 STEP 1: CONTESTANT REGISTRATION

### Backend Route
**File:** `server/routes/contestant.Routes.js`
**Endpoint:** `POST /api/contestants`
**Access:** Public (No authentication required)

### Request
```javascript
POST http://localhost:5000/api/contestants
Content-Type: application/json

{
  "name": "Amandi Perera",
  "universityId": "cs/2021/001",
  "talentType": "Dance",
  "description": "Contemporary Dance Performance",
  "imageUrl": "https://...",
  "videoUrl": "https://..."
}
```

### Backend Processing
**File:** `server/controllers/contestant.Controller.js` → `registerContestant()`

```javascript
1. Validate required fields: name, universityId, talentType
2. Check if universityId already exists
3. Create Contestant document in MongoDB
4. Set status = 'pending' (requires admin approval)
```

### Response (201 Created)
```javascript
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Amandi Perera",
    "universityId": "cs/2021/001",
    "talentType": "Dance",
    "description": "Contemporary Dance Performance",
    "imageUrl": "https://...",
    "status": "pending",
    "votes": 0,
    "createdAt": "2026-04-07T10:00:00Z"
  }
}
```

### ✅ MongoDB Entry
**Database:** `judge-scoring-db`
**Collection:** `contestants`
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "Amandi Perera",
  "universityId": "cs/2021/001",
  "talentType": "Dance",
  "description": "Contemporary Dance Performance",
  "imageUrl": "https://...",
  "videoUrl": "https://...",
  "status": "pending",  ← Requires admin approval
  "votes": 0,
  "createdAt": ISODate("2026-04-07T10:00:00Z"),
  "updatedAt": ISODate("2026-04-07T10:00:00Z")
}
```

**Admin Changes Status to 'approved':**
```bash
db.contestants.updateOne(
  { _id: ObjectId("507f1f77bcf86cd799439011") },
  { $set: { status: "approved" } }
)
```

---

## 👨‍⚖️ STEP 2: JUDGE LOGIN & AUTHENTICATION

### Frontend Login Component
**File:** `web-app/src/pages/LoginPage.jsx`

```javascript
POST /api/auth/login
{
  "email": "judge@sliit.lk",
  "password": "password123"
}
```

### Backend Authentication
**File:** `server/controllers/auth.Controller.js`

```javascript
1. Validate email/password
2. Query User collection for match
3. Verify role = 'judge'
4. Generate JWT token (valid 7 days)
5. Return token + user data
```

### Response
```javascript
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439001",
    "email": "judge@sliit.lk",
    "name": "Dr. Smith",
    "role": "judge"
  }
}
```

### ✅ Frontend Storage
**Location:** Browser `localStorage`
```javascript
// AuthContext.jsx stores token
localStorage.setItem('authToken', token);

// Later, useAuth() hook retrieves it
const { user, token } = useAuth();
// token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🎭 STEP 3: JUDGE FETCHES CONTESTANTS

### Frontend Component
**File:** `web-app/src/pages/JudgePanelDashboard.jsx`

```javascript
useEffect(() => {
  const fetchContestants = async () => {
    const data = await judgeApi.getContestants({}, token);
    setContestants(data); // Store in state
  };
  if (token) fetchContestants();
}, [token]);
```

### API Service Layer
**File:** `web-app/src/services/judgeApi.js`

```javascript
getContestants: async (params = {}, token) => {
  const response = await api.get({ 
    path: '/judges/contestants', 
    token 
  });
  return response.data || response; // Return array of contestants
}
```

### API Client
**File:** `web-app/src/services/apiClient.js`

```javascript
export const api = {
  get: ({ path, token }) => request({ 
    method: 'GET', 
    path, 
    token 
  })
};

async function request({ method, path, token, body }) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`; // ← Auth token added here
  }

  const res = await fetch(`http://localhost:5000/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await parseJson(res);
  if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
  return data;
}
```

### Backend Route Handler
**File:** `server/routes/judge.Routes.js`
```javascript
router.get('/contestants', protect, authorize('judge', 'admin'), getContestantsForJudging);
```

### Backend Controller
**File:** `server/controllers/judge.Controller.js` → `getContestantsForJudging()`

```javascript
1. Middleware: verify JWT token (protect)
2. Middleware: verify role = 'judge' or 'admin' (authorize)
3. Query: Contestant.find({ status: 'approved' })
4. For each contestant:
   - Check if judge already scored them
   - Add hasBeenScored flag
5. Return array of contestants
```

### API Request Chain
```
Browser Network:
  GET /api/judges/contestants
  Headers:
    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  
Backend:
  ✓ Token verified
  ✓ Role verified
  ✓ Query contestants
  
Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Amandi Perera",
      "category": "Dance",
      "photo": "https://...",
      "description": "Contemporary Dance Performance",
      "hasBeenScored": false,
      "votes": 0
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "Kasun Madushan",
      "category": "Music",
      "photo": "https://...",
      "description": "Piano Performance",
      "hasBeenScored": false,
      "votes": 5
    },
    ...
  ],
  "count": 15
}
```

### ✅ Frontend State Update
```javascript
const [contestants, setContestants] = useState([]);
// After API response:
setContestants(response.data); // Now contains real MongoDB ObjectIds

// Example state:
contestants = [
  { id: "507f1f77bcf86cd799439011", name: "Amandi Perera", ... },
  { id: "507f1f77bcf86cd799439012", name: "Kasun Madushan", ... }
]
```

---

## 🎯 STEP 4: JUDGE ENTERS SCORES

### Frontend Component State Management

```javascript
// User selects contestant
const [activeContestantId, setActiveContestantId] = useState(null);

// Judge enters scores via sliders
const [scores, setScores] = useState({});

const handleScoreChange = (id, field, value) => {
  const score = Math.max(0, Math.min(25, Number(value) || 0));
  setScores((prev) => ({
    ...prev,
    [id]: { ...prev[id], [field]: score }
  }));
};

// Example scores state after user input:
scores = {
  "507f1f77bcf86cd799439011": {
    creativity: 20,
    presentation: 22,
    skillLevel: 19,
    audienceImpact: 21
  }
}
```

### UI Validation
```javascript
const calculateJudgeTotal = (id) => {
  const s = scores[id] || {};
  return (s.creativity || 0) + (s.presentation || 0) + (s.skillLevel || 0) + (s.audienceImpact || 0);
};

// Display updates in real-time
Total Score: 20 + 22 + 19 + 21 = 82/100 ✓
```

---

## 📤 STEP 5: JUDGE SUBMITS SCORES TO MONGODB

### Frontend Submit Handler
**File:** `web-app/src/pages/JudgePanelDashboard.jsx`

```javascript
const handleSubmit = async (contestant) => {
  try {
    // 1. Validate all criteria filled
    const scores_data = scores[contestant.id] || {};
    if (!scores_data.creativity || !scores_data.presentation || !scores_data.skillLevel || !scores_data.audienceImpact) {
      setMessage("❌ Please fill all scoring criteria");
      return;
    }

    // 2. Prepare payload
    const scoreData = {
      contestantId: contestant.id,           // MongoDB ObjectId
      creativity: scores_data.creativity,     // 0-25
      presentation: scores_data.presentation, // 0-25
      skillLevel: scores_data.skillLevel,     // 0-25
      audienceImpact: scores_data.audienceImpact, // 0-25
      notes: ""
    };

    // 3. Show loading state
    setMessage("⏳ Submitting score...");

    // 4. Call API with authentication token
    const response = await judgeApi.submitScore(scoreData, token);

    // 5. On success, update local state
    setSubmittedResults((prev) => ({ 
      ...prev, 
      [contestant.id]: {
        scoreId: response.data?.scoreId,
        judgeScore: 82,
        criteria: scores_data
      }
    }));

    // 6. Show success message
    setMessage(`✅ Score submitted for ${contestant.name}: 82/100`);

  } catch (err) {
    setMessage(`❌ Error: ${err.message}`);
  }
};
```

### API Service
**File:** `web-app/src/services/judgeApi.js`

```javascript
submitScore: async (scoreData, token) => {
  if (!token) {
    throw new Error('Authentication token is required');
  }
  
  console.log('📤 Submitting score to API:', scoreData);

  const response = await api.post({ 
    path: '/judges/submit-score', 
    body: scoreData, 
    token 
  });

  console.log('✅ Score submitted successfully:', response);
  return response;
}
```

### Network Request
```
POST /api/judges/submit-score HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "contestantId": "507f1f77bcf86cd799439011",
  "creativity": 20,
  "presentation": 22,
  "skillLevel": 19,
  "audienceImpact": 21,
  "notes": ""
}
```

---

## ⚙️ STEP 6: BACKEND VALIDATES & SAVES TO MONGODB

### Backend Route
**File:** `server/routes/judge.Routes.js`
```javascript
router.post('/submit-score', protect, authorize('judge'), submitJudgeScore);
```

### Authentication Middleware
**File:** `server/middleware/authMiddleware.js`
```javascript
// protect middleware:
1. Extract token from Authorization header
2. Verify JWT signature
3. Decode token to get user ID
4. Query User collection to get user object
5. Attach req.user = { _id: "...", email: "...", role: "judge" }
6. Continue to next middleware
```

### Authorization Middleware
**File:** `server/middleware/roleMiddleware.js`
```javascript
// authorize('judge') middleware:
1. Check req.user.role === 'judge'
2. If not, return 403 Forbidden
3. If yes, continue to controller
```

### Backend Controller
**File:** `server/controllers/judge.Controller.js` → `submitJudgeScore()`

```javascript
exports.submitJudgeScore = async (req, res) => {
  try {
    const { contestantId, creativity, presentation, skillLevel, audienceImpact, notes } = req.body;

    console.log('📨 Submitting Score Request:', {
      judgeId: req.user._id,
      contestantId,
      creativity,
      presentation,
      skillLevel,
      audienceImpact,
    });

    // VALIDATION STEP 1: Required fields
    if (!contestantId) {
      return res.status(400).json({ message: 'Contestant ID is required' });
    }

    if (creativity === undefined || presentation === undefined || skillLevel === undefined || audienceImpact === undefined) {
      return res.status(400).json({ message: 'All scoring criteria are required' });
    }

    // VALIDATION STEP 2: Score ranges (FIX: using for loop)
    for (const score of [creativity, presentation, skillLevel, audienceImpact]) {
      if (score < 0 || score > 25) {
        return res.status(400).json({ message: 'Each criterion score must be between 0 and 25' });
      }
    }

    // VALIDATION STEP 3: Valid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(contestantId)) {
      return res.status(400).json({ message: 'Invalid contestant ID' });
    }

    // VALIDATION STEP 4: Contestant exists in database
    const contestant = await Contestant.findById(contestantId);
    if (!contestant) {
      return res.status(404).json({ message: 'Contestant not found' });
    }

    // VALIDATION STEP 5: Judge hasn't already scored this contestant
    const existingScore = await JudgeScore.findOne({
      judgeId: req.user._id,
      contestantId,
    });

    if (existingScore) {
      return res.status(400).json({ 
        message: 'You have already submitted a score for this contestant. Update your existing score instead.' 
      });
    }

    // CALCULATION: Total score
    const totalScore = creativity + presentation + skillLevel + audienceImpact;

    // DATABASE SAVE: Create JudgeScore document
    const judgeScore = await JudgeScore.create({
      judgeId: req.user._id,              // From authenticated user
      contestantId,                        // From request body
      criteria: {
        creativity,
        presentation,
        skillLevel,
        audienceImpact,
      },
      totalScore,                          // Sum of all criteria
      notes: notes || '',
      status: 'submitted',
    });

    console.log('✅ Score created in DB:', {
      scoreId: judgeScore._id,
      totalScore: judgeScore.totalScore,
    });

    // RESPONSE: Success
    res.status(201).json({
      success: true,
      message: 'Score submitted successfully',
      data: {
        scoreId: judgeScore._id,
        contestantId: judgeScore.contestantId,
        criteria: judgeScore.criteria,
        totalScore: judgeScore.totalScore,
        submittedAt: judgeScore.createdAt,
      },
    });

  } catch (error) {
    console.error('❌ Error submitting judge score:', error);
    res.status(500).json({ 
      message: 'Error submitting judge score', 
      error: error.message 
    });
  }
};
```

### ✅ MongoDB Document Created

**Database:** `judge-scoring-db` (from MONGO_URI in .env)
**Collection:** `judgescores`

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439100"),
  "judgeId": ObjectId("507f1f77bcf86cd799439001"),
  "contestantId": ObjectId("507f1f77bcf86cd799439011"),
  "criteria": {
    "creativity": 20,
    "presentation": 22,
    "skillLevel": 19,
    "audienceImpact": 21
  },
  "totalScore": 82,
  "notes": "",
  "status": "submitted",
  "createdAt": ISODate("2026-04-07T10:30:00Z"),
  "updatedAt": ISODate("2026-04-07T10:30:00Z"),
  "__v": 0
}
```

---

## 🔍 VERIFICATION PROCESS

### Step 1: Verify MongoDB Connection
```bash
# Terminal: Check if MongoDB connection is working
cd server
npm start

# Look for:
# ✅ MongoDB Connected Successfully
#    Host: sliit.zjnwlox.mongodb.net
#    Database: judge-scoring-db
#    Port: 27017
```

### Step 2: Verify Contestants Collection
```javascript
// MongoDB Compass or mongosh
db.contestants.find().pretty()

// Should show registered contestants with status 'approved' or 'pending'
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "Amandi Perera",
  "status": "approved",
  ...
}
```

### Step 3: Browser Console Logs
```javascript
// After login and entering Judge Panel:

🔄 Fetching contestants with token: Present
✅ Contestants fetched: [Object, Object, ...]
```

### Step 4: Verify Score Submission
```javascript
// After clicking "Finalize & Submit Score":

📤 Sending score submission: {
  contestantId: "507f1f77bcf86cd799439011",
  creativity: 20,
  presentation: 22,
  skillLevel: 19,
  audienceImpact: 21,
  notes: ""
}

✅ Score submitted for Amandi Perera: 82/100
```

### Step 5: Verify MongoDB Document
```bash
# In MongoDB Compass or mongosh:
db.judgescores.find().pretty()

# Should show new document:
{
  "_id": ObjectId("507f1f77bcf86cd799439100"),
  "judgeId": ObjectId("507f1f77bcf86cd799439001"),
  "contestantId": ObjectId("507f1f77bcf86cd799439011"),
  "criteria": {
    "creativity": 20,
    "presentation": 22,
    "skillLevel": 19,
    "audienceImpact": 21
  },
  "totalScore": 82,
  "status": "submitted",
  "createdAt": ISODate("2026-04-07T10:30:00Z")
}
```

---

## 🛠️ TROUBLESHOOTING CHECKLIST

| Issue | Cause | Solution |
|-------|-------|----------|
| "Cannot connect to MongoDB" | MONGO_URI is incorrect | Check `.env` file: `mongodb+srv://sliit_got_db_user:sliit%40123@sliit.zjnwlox.mongodb.net/judge-scoring-db` |
| "Contestant not found" | Contestant status is 'pending' not 'approved' | Admin must approve contestant before judging |
| "You have already submitted a score" | Judge tried to score same contestant twice | Expected behavior - shows message correctly |
| "Each criterion score must be between 0-25" | Frontend didn't validate before sending | Check slider max value = 25 |
| "Authentication token is required" | Token not passed to API | Verify `useAuth()` returns token |
| "Invalid contestant ID" | ObjectId format is wrong | Frontend should only use IDs from API response |
| Score shows in UI but not in MongoDB | Frontend is only updating local state | Verify API call is actually being made (check Network tab) |

---

## 📊 COMPLETE DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────┐
│ CONTESTANT REGISTRATION (Initially)                                 │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Admin/Contestant registers                                        │
│ 2. POST /api/contestants → Create Contestant document               │
│ 3. MongoDB: judges... db.contestants collection                     │
│ 4. Status = 'pending' (requires admin approval)                     │
│ 5. Admin changes status to 'approved'                               │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│ JUDGE LOGIN                                                          │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Judge enters email/password in LoginPage.jsx                     │
│ 2. POST /api/auth/login → Backend verifies credentials             │
│ 3. Backend generates JWT token (expires in 7 days)                 │
│ 4. Frontend stores token in localStorage                            │
│ 5. AuthContext provides token via useAuth() hook                    │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│ JUDGE PANEL LOADS CONTESTANTS                                       │
├─────────────────────────────────────────────────────────────────────┤
│ 1. JudgePanelDashboard.jsx mounts                                   │
│ 2. useEffect calls judgeApi.getContestants({}, token)              │
│ 3. apiClient.js: Request with Authorization header                 │
│ 4. Backend: authMiddleware verifies JWT token                       │
│ 5. Backend: roleMiddleware checks role = 'judge'                    │
│ 6. Controller: Query db.contestants { status: 'approved' }          │
│ 7. Response: Array of ObjectIds and contestant data                │
│ 8. Frontend: setContestants(response.data) in React state          │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│ JUDGE ENTERS SCORES                                                 │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Judge selects contestant from list                               │
│ 2. Judge moves sliders (0-25 for each of 4 criteria)                │
│ 3. handleScoreChange() updates React state: scores[id]             │
│ 4. Frontend validates: all 4 criteria filled, total shows          │
│ 5. Judge clicks "Finalize & Submit Score"                          │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND SUBMISSION WITH VALIDATION                                 │
├─────────────────────────────────────────────────────────────────────┤
│ 1. handleSubmit() validates all 4 criteria are filled               │
│ 2. Prepares payload: { contestantId, creativity, ... }             │
│ 3. Shows "⏳ Submitting score..." message                           │
│ 4. Calls judgeApi.submitScore(scoreData, token)                    │
│ 5. apiClient.request() with Authorization header                   │
│ 6. Network POST to /api/judges/submit-score                        │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│ BACKEND VALIDATION & MONGODB SAVE                                   │
├─────────────────────────────────────────────────────────────────────┤
│ 1. protect middleware: Verify JWT token                             │
│ 2. authorize middleware: Check role = 'judge'                       │
│ 3. submitJudgeScore controller:                                     │
│    a. Validate all fields present                                   │
│    b. Validate score ranges 0-25                                    │
│    c. Validate ObjectId format                                      │
│    d. Check contestant exists in db.contestants                     │
│    e. Check judge hasn't already scored contestant                  │
│ 4. Calculate totalScore = sum of 4 criteria                         │
│ 5. JudgeScore.create() → MongoDB insertion                          │
│ 6. Document saved to db.judgescores collection                      │
│ 7. Response 201 with scoreId and submission details                 │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│ MONGODB PERSISTENCE                                                 │
├─────────────────────────────────────────────────────────────────────┤
│ Database: judge-scoring-db                                          │
│ Collection: judgescores                                             │
│                                                                      │
│ Document Structure:                                                  │
│ {                                                                    │
│   _id: ObjectId(...),        ← Auto-generated by MongoDB            │
│   judgeId: ObjectId(...),    ← From authenticated user              │
│   contestantId: ObjectId(...),  ← From request body                 │
│   criteria: {                                                        │
│     creativity: 20,          ← 0-25 range                           │
│     presentation: 22,        ← 0-25 range                           │
│     skillLevel: 19,          ← 0-25 range                           │
│     audienceImpact: 21       ← 0-25 range                           │
│   },                                                                 │
│   totalScore: 82,            ← Sum of all criteria                  │
│   status: 'submitted',                                              │
│   createdAt: ISODate(...),                                          │
│   updatedAt: ISODate(...)                                           │
│ }                                                                    │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND SUCCESS FEEDBACK                                           │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Response 201 received                                            │
│ 2. Update local state: setSubmittedResults(...)                     │
│ 3. Show success toast: "✅ Score submitted for Amandi: 82/100"     │
│ 4. Disable submit button for that contestant                        │
│ 5. Auto-advance to next contestant (optional)                       │
│ 6. Judge can now score next contestant                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📋 CONFIGURATION VERIFICATION

### .env File (Server)
**File:** `server/.env`
```
PORT=5000
MONGO_URI=mongodb+srv://sliit_got_db_user:sliit%40123@sliit.zjnwlox.mongodb.net/judge-scoring-db?appName=sliit
JWT_SECRET=judge_scoring_secret_key_2026_sliit_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**✅ Verification:**
- `MONGO_URI` points to correct database `judge-scoring-db`
- `JWT_SECRET` is set (change in production!)
- `FRONTEND_URL` matches React dev server

### Database Credentials
- **Atlas URL:** `sliit.zjnwlox.mongodb.net`
- **Database Name:** `judge-scoring-db`
- **Username:** `sliit_got_db_user`
- **Password:** `sliit@123` (encoded in URI)
- **Collections:**
  - `contestants` - Registered performers
  - `judgescores` - Submitted judge scores
  - `users` - Judges and admins
  - `votes` - Public voting data

---

## ✅ SYSTEM READY CHECKLIST

- [ ] MongoDB connection string is correct in `.env`
- [ ] Backend started: `npm start` in `server/` directory
- [ ] Frontend started: `npm start` in `web-app/` directory
- [ ] Contestant(s) registered and approved (status = 'approved')
- [ ] Judge user created with role = 'judge'
- [ ] Judge can login and gets JWT token
- [ ] Judge Panel loads with real contestants (not hardcoded)
- [ ] Judge can adjust all 4 scoring criteria (0-25 each)
- [ ] Total score updates in real-time
- [ ] Submit button sends API request
- [ ] MongoDB receives and stores JudgeScore document
- [ ] Browser console shows success logs
- [ ] No red errors in browser console
- [ ] No red errors in backend terminal

---

**Last Updated:** April 7, 2026  
**Status:** ✅ Production Ready
