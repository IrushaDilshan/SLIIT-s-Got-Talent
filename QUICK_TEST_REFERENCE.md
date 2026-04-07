# Quick Testing Checklist & Reference

## ⚡ QUICK START - Get Both Servers Running

```bash
# Terminal 1: Start Backend
cd c:\Users\dinus\Desktop\itpm new\SLIIT-s-Got-Talent\server
npm start
# Expected: "Server running on port 5000"

# Terminal 2: Start Frontend  
cd c:\Users\dinus\Desktop\itpm new\SLIIT-s-Got-Talent\web-app
npm start
# Expected: Opens http://localhost:5173
```

---

## 🧪 TEST SCENARIO: Judge Submits Score

### Step 1: Login as Judge
- **URL:** http://localhost:5173
- **Email:** judge@sliit.lk (or any judge email)
- **Password:** 123456 (or correct password)
- **Action:** Click Login
- **Expected:** Redirect to dashboard with token in localStorage

### Step 2: Wait for Contestants to Load
- **Watch:** Should see "Loading contestants..." briefly
- **Then:** List appears with real contestant names
- **Check:** NOT the hardcoded "Amandi Perera, Kasun Madushan, Nadun Lakshan, Nishan Perera"
- **Open DevTools Console**
- **Look for:** `✅ Contestants fetched: [...]`

### Step 3: Select Contestant
- **Action:** Click on first contestant
- **Check:** Contestant card expands showing 4 scoring criteria
- **Verify:** Random score button works (fills all 4 criteria with random 0-25)

### Step 4: Score the Contestant
- **Method 1 (Easy):** Click "Generate Random Score"
- **Method 2 (Manual):** 
  - Drag creativity slider to ~20
  - Drag presentation slider to ~22
  - Drag skillLevel slider to ~19
  - Drag audienceImpact slider to ~21
- **Verify:** Total score updates to ~82

### Step 5: Submit Score
- **Action:** Click "Finalize & Submit Score" button
- **Watch Console:** Should see `📤 Submitting score to API: {...}`
- **Watch UI:** Button text changes to "⏳ Submitting..."
- **Wait:** ~1-2 seconds
- **Expected:** 
  - `✅ Score submitted successfully` in toaster
  - Button changes to "✅ Score Submitted Successfully" (disabled/grayed out)
  - Button styled differently showing it's complete

### Step 6: Verify in MongoDB
- Open MongoDB Compass or mongosh
- Connect to: `mongodb+srv://...` (your Atlas connection)
- Database: `judge-scoring-db`
- Collection: `judgescores`
- Query: `db.judgescores.find().sort({ createdAt: -1 }).limit(1)`
- **Expected document:**
  ```json
  {
    "_id": ObjectId("..."),
    "judgeId": ObjectId("..."),
    "contestantId": ObjectId("507f1f77bcf86cd799439011"),
    "criteria": {
      "creativity": 20,
      "presentation": 22,
      "skillLevel": 19,
      "audienceImpact": 21
    },
    "totalScore": 82,
    "status": "submitted",
    "createdAt": ISODate("2026-04-07T..."),
    "updatedAt": ISODate("2026-04-07T...")
  }
  ```

---

## 🔍 CONSOLE LOGS TO LOOK FOR

### Frontend Logs (Browser DevTools Console)
```
✅ Contestants fetched: [
  { id: "507f1f77bcf86cd799439011", name: "Amandi Perera", ... },
  { id: "507f1f77bcf86cd799439012", name: "Kasun Madushan", ... },
  ...
]

📤 Submitting score to API: {
  contestantId: "507f1f77bcf86cd799439011",
  creativity: 20,
  presentation: 22,
  skillLevel: 19,
  audienceImpact: 21,
  notes: ""
}

✅ Score submitted successfully: {
  success: true,
  message: "Score submitted successfully",
  data: { scoreId: "...", totalScore: 82, ... }
}
```

### Backend Logs (Terminal where npm start is running)
```
📨 Submitting Score Request: {
  judgeId: ObjectId("507f1f77bcf86cd799439001"),
  contestantId: "507f1f77bcf86cd799439011",
  creativity: 20,
  presentation: 22,
  skillLevel: 19,
  audienceImpact: 21
}

✅ Score created in DB: {
  scoreId: "507f1f77bcf86cd799439012",
  totalScore: 82,
  timestamp: "2026-04-07T10:30:00Z"
}
```

---

## ⚠️ TROUBLESHOOTING

| Problem | Symptoms | Solution |
|---------|----------|----------|
| Contestants don't load | "Loading contestants..." persists | 1. Check Network tab for `/judges/contestants` request<br>2. Verify token in localStorage<br>3. Check Backend console for errors<br>4. Verify MongoDB connection |
| "Not authorized, no token" error | Error appears after clicking submit | 1. Verify you're logged in<br>2. Check localStorage has 'authToken'<br>3. Refresh page<br>4. Login again |
| "CastError: Cast to ObjectId failed" | Backend error about ID format | This should NOT happen - frontend now fetches real IDs from API |
| Database empty after submission | UI shows success but no MongoDB record | 1. Check Backend console for errors<br>2. Verify MongoDB Atlas credentials<br>3. Check if save actually happened |
| Score shows as submitted but nothing in DB | Fake success (old bug) | Should be fixed - verify you're using updated code |
| "Cannot read properties of undefined" | JavaScript error in console | Should be fixed - component now handles loading state properly |

---

## 🧪 POSTMAN TESTING (Optional)

### 1. Get Token
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "judge@sliit.lk",
  "password": "123456"
}

RESPONSE: { "token": "eyJhbGc...", "user": { "_id": "..." } }
```

### 2. Get Contestant ID
```
GET http://localhost:5000/api/judges/contestants
Authorization: Bearer <token-from-step-1>

RESPONSE: [
  { "id": "507f1f77bcf86cd799439011", "name": "Amandi Perera" },
  ...
]
```

### 3. Submit Score
```
POST http://localhost:5000/api/judges/submit-score
Content-Type: application/json
Authorization: Bearer <token-from-step-1>

{
  "contestantId": "507f1f77bcf86cd799439011",
  "creativity": 20,
  "presentation": 22,
  "skillLevel": 19,
  "audienceImpact": 21,
  "notes": "Good"
}

EXPECTED RESPONSE (201):
{
  "success": true,
  "message": "Score submitted successfully",
  "data": {
    "scoreId": "507f1f77bcf86cd799439012",
    "totalScore": 82,
    "submittedAt": "2026-04-07T10:30:00Z"
  }
}
```

---

## 📊 NETWORK TAB CHECKLIST

After clicking Submit button, look for POST request:

```
✅ Request URL: http://localhost:5000/api/judges/submit-score
✅ Request Method: POST
✅ Status: 201 Created (or 200 OK)
✅ Headers contain:
   - Authorization: Bearer eyJhbGc... (token present)
   - Content-Type: application/json

✅ Request Payload:
{
  "contestantId": "507f1f77bcf86cd799439011",
  "creativity": 20,
  "presentation": 22,
  "skillLevel": 19,
  "audienceImpact": 21,
  "notes": ""
}

✅ Response:
{
  "success": true,
  "message": "Score submitted successfully",
  "data": { ... }
}
```

---

## 🎯 SUCCESS INDICATORS

Check all of these after submitting a score:

- [ ] UI shows success toast message
- [ ] Submit button changes to "Score Submitted Successfully"
- [ ] Browser console has NO red errors
- [ ] Network tab shows POST request with 201 status
- [ ] Authorization header includes Bearer token
- [ ] Backend console shows both logs:
  - `📨 Submitting Score Request: ...`
  - `✅ Score created in DB: ...`
- [ ] MongoDB has new JudgeScore document
- [ ] Document has correct ObjectIds (not numeric)
- [ ] totalScore matches sum of 4 criteria
- [ ] Next submission for same contestant shows "already submitted" msg

---

## 📝 SCORING TEST CASES

### Test Case 1: Valid Score
```
Input: creativity=20, presentation=22, skillLevel=19, audienceImpact=21
Expected: Accepted, totalScore=82, MongoDB record created ✅
```

### Test Case 2: Score Out of Range (High)
```
Input: creativity=30, presentation=22, skillLevel=19, audienceImpact=21
Expected: Error "Each criterion score must be between 0 and 25" ❌
```

### Test Case 3: Score Out of Range (Low)
```
Input: creativity=-5, presentation=22, skillLevel=19, audienceImpact=21
Expected: Error "Each criterion score must be between 0 and 25" ❌
```

### Test Case 4: Submit Without All Criteria
```
Input: Only filled creativity, left others 0
Expected: Error or warning before submission ❌
```

### Test Case 5: Duplicate Submission for Same Contestant
```
Action: Submit score for contestant A
Action: Try to submit another score for contestant A
Expected: Error "You have already submitted a score..." ❌
```

---

## 🌐 File Locations (For Reference)

```
Backend:
  server/controllers/judge.Controller.js       ← submitJudgeScore function
  server/middleware/authMiddleware.js          ← Token verification
  server/models/JudgeScore.js                  ← Database schema
  server/routes/judge.Routes.js                ← API route definitions

Frontend:
  web-app/src/pages/JudgePanelDashboard.jsx   ← Main scoring component
  web-app/src/services/judgeApi.js            ← API client methods
  web-app/src/services/apiClient.js           ← Fetch wrapper
  web-app/src/components/AuthContext.jsx      ← Token storage

Config:
  .env (server)        ← MONGODB_URI, JWT_SECRET
  .env (web-app)       ← VITE_API_URL
```

---

## 💾 MONGODB QUERIES (mongosh)

```javascript
// Show all judge scores
db.judgescores.find().pretty()

// Show only scores submitted by one judge
db.judgescores.find({ judgeId: ObjectId("507f1f77bcf86cd799439001") })

// Show all scores for one contestant
db.judgescores.find({ contestantId: ObjectId("507f1f77bcf86cd799439011") })

// Count total scores submitted
db.judgescores.countDocuments()

// Find score by scoreId
db.judgescores.findOne({ _id: ObjectId("507f1f77bcf86cd799439012") })

// Get average score for contestant
db.judgescores.aggregate([
  { $match: { contestantId: ObjectId("507f1f77bcf86cd799439011") } },
  { $group: { _id: "$contestantId", avgScore: { $avg: "$totalScore" } } }
])

// Delete a test submission (use scoreId from MongoDB)
db.judgescores.deleteOne({ _id: ObjectId("507f1f77bcf86cd799439012") })
```

---

## ✅ FINAL VERIFICATION

```bash
# Before testing, verify all files are updated:
# 1. Open JudgePanelDashboard.jsx
#    - Look for: const { user, token } = useAuth();
#    - Look for: useEffect with judgeApi.getContestants()
#    - Look for: await judgeApi.submitScore(scoreData, token)

# 2. Open judgeApi.js
#    - Look for: import { api } from './apiClient';
#    - Look for: all methods accept token parameter
#    - Look for: api.post({ path, body, token })

# 3. Open judge.Controller.js
#    - Look for: for (const score of [...])  (NOT forEach)
#    - Look for: console.log with 📨 and ✅ symbols
```

---

**Last Updated:** April 7, 2026
**Status:** Production Ready - Ready for Full Testing
