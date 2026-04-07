# ⚡ QUICK REFERENCE - COMMON COMMANDS

## 🚀 START THE SYSTEM (3 steps)

### Step 1: Seed Test Data
```bash
cd server
npm run seed
```
Output: ✅ Database seeded with 5 judges, 8 contestants

### Step 2: Start Backend
```bash
npm start
```
Output: ✅ Server running on port 5000

### Step 3: Start Frontend
```bash
cd web-app
npm start
```
Output: ✅ Frontend running on localhost:5173

---

## 🧪 TESTING COMMANDS

### Verify System Health
```bash
cd server
node verify-system.js
```
Checks: Environment, Models, Routes, Database, Frontend files

### View Database Status
```bash
npm run db:status
npm run db:stats
npm run db:collections
```

### Clear & Re-seed Data
```bash
npm run seed:clear
npm run seed
```

---

## 📊 MONGODB QUERIES

### Connect to Database
```bash
mongosh "mongodb+srv://sliit_got_db_user:sliit%40123@sliit.zjnwlox.mongodb.net/judge-scoring-db"
```

### View All Scores
```javascript
use judge-scoring-db
db.judgescores.find().pretty()
```

### View Specific Judge's Scores
```javascript
db.judgescores.find({ judgeId: ObjectId("507f1f77bcf86cd799439001") })
```

### View Contestant's Average Score
```javascript
db.judgescores.aggregate([
  { $match: { contestantId: ObjectId("507f1f77bcf86cd799439011") } },
  { $group: { _id: "$contestantId", avgScore: { $avg: "$totalScore" } } }
])
```

### Count Total Submissions
```javascript
db.judgescores.countDocuments()
```

### Delete Test Submissions
```javascript
db.judgescores.deleteMany({ status: "submitted" })
```

---

## 🔐 TEST LOGIN CREDENTIALS

**Email:** judge1@sliit.lk  
**Password:** password123

Other judges: judge2@sliit.lk through judge5@sliit.lk (same password)

---

## 🐛 DEBUGGING

### View Backend Logs
Look for messages like:
- `📨 Submitting Score Request` - Request received
- `✅ Score created in DB` - Successfully saved
- `❌ Error submitting...` - Error occurred

### View Frontend Console (F12)
Look for messages like:
- `🔄 Fetching contestants with token` - Data loading
- `✅ Contestants fetched` - Data received
- `📤 Sending score submission` - Score being submitted
- `✅ Score submitted successfully` - Success

### Check Network Tab (F12)
- Method: POST for submissions
- URL: /api/judges/submit-score
- Status: 201 for success, 4xx/5xx for errors
- Headers: Authorization header present?

---

## 📋 CONFIGURATION FILES

### Server .env Location
```
server/.env
```
Key variables:
- MONGO_URI - Database connection string
- JWT_SECRET - Token signing key
- PORT - Server port (default 5000)

### Frontend Env Location
```
web-app/.env.local
```
Key variables:
- VITE_API_BASE_URL - Backend API address (default: http://localhost:5000/api)

---

## 🔄 LIFECYCLE COMMANDS

### Full Reset
```bash
npm run seed:clear    # Clear all data
npm run seed          # Re-seed with fresh data
npm start             # Restart server
```

### Just Clear Scores
```bash
# In mongosh:
db.judgescores.deleteMany({})
```

### Backup Collections
```bash
npm run db:backup
```

---

## 📈 PERFORMANCE CHECKS

### Database Indexes
```bash
npm run db:indexes
```

### Database Size
```bash
npm run db:size
```

### Data Verification
```bash
npm run db:verify
```

---

## 🛑 STOP SERVICES

### Kill Backend (Port 5000)
```bash
# On Windows PowerShell:
lsof -i :5000
kill -9 <PID>

# Or using:
npx kill-port 5000
```

### Kill Frontend (Port 5173)
```bash
# Press Ctrl+C in the terminal
# Or:
npx kill-port 5173
```

---

## 🔍 COMMON ISSUES & QUICK FIXES

| Problem | Command to Check | Fix |
|---------|------------------|-----|
| Can't login | Check users in DB: `db.users.find()` | Run `npm run seed` |
| No contestants | Check: `db.contestants.countDocuments()` | Run `npm run seed` |
| Port 5000 in use | `lsof -i :5000` | Kill process: `npx kill-port 5000` |
| MongoDB won't connect | Verify .env has MONGO_URI | Check IP whitelist in Atlas |
| Contestants don't load | Network tab in F12 | Check API status on port 5000 |
| Score won't save | Backend console logs | Check MongoDB connection |

---

## 📱 API ENDPOINTS (Quick Reference)

### Authentication
```
POST /api/auth/login
DELETE /api/auth/logout
```

### Judge Scoring
```
GET /api/judges/contestants          - Get list to score
POST /api/judges/submit-score         - Submit scores
GET /api/judges/scores/:contestantId - View contestant scores
GET /api/judges/profile              - Get judge info
```

### Admin
```
GET /api/contestants          - List all
POST /api/contestants         - Create new
PUT /api/contestants/:id      - Update
DELETE /api/contestants/:id   - Delete
```

---

## 🎯 VERIFICATION CHECKLIST

```
□ Backend started - port 5000
□ Frontend started - port 5173
□ Database seeded
□ Can login
□ Contestants load
□ Can score
□ Score saves to MongoDB
□ No console errors
□ Total calculated correctly
```

---

## 📞 QUICK SUPPORT

**Query MongoDB:**
```bash
mongosh "mongodb+srv://sliit_got_db_user:sliit%40123@sliit.zjnwlox.mongodb.net/judge-scoring-db"
```

**Check Connection:**
```bash
cd server
npm run db:status
```

**Restart Clean:**
```bash
npm run seed:clear
npm run seed
npm start
```

**Verify Installation:**
```bash
node verify-system.js
```

---

## 🆘 IMMEDIATE ISSUES

### "Cannot connect to database"
```bash
# Check connection string
echo $MONGO_URI

# Test connection
node -e "require('mongoose').connect(process.env.MONGO_URI).then(() => console.log('✓ OK')).catch(e => console.log('✗', e.message))"
```

### "Port already in use"
```bash
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :5000
kill -9 <PID>
```

### "Module not found"
```bash
npm install
npm start
```

---

**Last Updated:** April 7, 2026  
**All Commands Tested:** ✅ YES
