# 🚀 Quick Start Guide - SLIIT's Got Talent Backend

## ⚡ 5-Minute Setup

### 1. Start MongoDB

**Choose one option:**

```bash
# Option A: If installed locally
mongod

# Option B: Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Option C: MongoDB Atlas (Cloud)
# Update MONGO_URI in .env
```

### 2. Setup Backend

```bash
cd server

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Seed database
npm run seed

# Start server
npm start
```

**Expected output:**
```
✅ MongoDB Connected Successfully
   Host: localhost
   Database: sliit-talent
   Port: 27017

Server running on port 5000
```

### 3. Test It Works

```bash
# Open new terminal
curl http://localhost:5000/api/health

# Should respond with:
# {"success":true,"message":"API is healthy",...}
```

---

## 📋 Available NPM Commands

```bash
# Server
npm start                # Start production server
npm run dev             # Start with auto-reload

# Database Seeding
npm run seed            # Seed all data (judges + contestants + scores)
npm run seed:judges     # Seed judges only
npm run seed:contestants # Seed contestants
npm run seed:scores     # Seed scores
npm run seed:clear      # Clear all data

# Database Admin
npm run db:status       # Show connection status
npm run db:stats        # Show database statistics
npm run db:indexes      # Create indexes
npm run db:verify       # Verify integrity
npm run db:backup       # Create backup
npm run db:collections  # List collections
npm run db:size         # Show database size
```

---

## 🧪 Quick Test Workflow

### 1. Verify Database

```bash
npm run db:status
# Expected: State: CONNECTED
```

### 2. Check Seeded Data

```bash
npm run db:stats
# Shows collections, indexes, data size
```

### 3. Create Judge Account

```bash
cd server
node create_judge.js judge1@sliit.lk judge2@sliit.lk
```

### 4. Login & Get Token

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"judge1@sliit.lk","otp":"123456"}'

# Save the token from response
# Use it as: Authorization: Bearer <token>
```

### 5. Get Contestants

```bash
curl http://localhost:5000/api/judges/contestants \
  -H "Authorization: Bearer <your_token>"
```

### 6. Submit Score

```bash
curl -X POST http://localhost:5000/api/judges/submit-score \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "contestantId": "<contestant_id_from_step_5>",
    "creativity": 24,
    "presentation": 23,
    "skillLevel": 25,
    "audienceImpact": 22,
    "notes": "Excellent performance"
  }'
```

---

## 📊 What Gets Seeded

When you run `npm run seed`, the database is populated with:

### Judges (5)
- judge1@sliit.lk
- judge2@sliit.lk
- judge3@sliit.lk
- judge4@sliit.lk
- judge5@sliit.lk

### Contestants (8)
- Amandi Perera (Singing)
- Kasun Madushan (Dancing)
- Nethmi Silva (Drama)
- Ravindu Senanayake (Beatboxing)
- Sanjeewa Peiris (Magic)
- Priyanka Mendis (Singing)
- Ravi Kumara (Comedy)
- Lasantha Fernando (Dancing)

### Judge Scores (40)
- All judges score all contestants
- Scores automatically generated (10-25 per criteria)

---

## 🔍 MongoDB Compass (GUI Tool)

For visual database management:

1. Download: https://www.mongodb.com/try/download/compass
2. Open MongoDB Compass
3. Connect to: `mongodb://localhost:27017`
4. Browse databases, collections, and documents
5. Query and edit data visually

---

## 📱 Frontend Integration

Once backend is running, update your React app:

```javascript
// In your .env (web-app folder)
VITE_API_BASE_URL=http://localhost:5000/api

// In your component
import { judgeApi } from '../services/judgeApi';

// Get contestants
const contestants = await judgeApi.getContestants();

// Submit score
await judgeApi.submitScore({
  contestantId: 'xyz',
  creativity: 24,
  presentation: 23,
  skillLevel: 25,
  audienceImpact: 22,
});
```

---

## 🆘 Common Issues

### Issue: "MongoDB connection refused"
```bash
# Check if MongoDB is running
mongosh

# If not running, start it
mongod  # or: brew services start mongodb-community
```

### Issue: "Cannot find module"
```bash
cd server
npm install
```

### Issue: "Port 5000 already in use"
```bash
# Use different port
PORT=5001 npm start
```

### Issue: "ENOENT: no such file or directory .env"
```bash
cd server
cp .env.example .env
# Edit .env if using remote MongoDB
```

### Issue: "Duplicate key error"
```bash
# Clear and reseed
npm run seed:clear
npm run seed
```

---

## 📈 Monitor Database

Real-time monitoring:

```bash
# Watch database stats
watch -n 1 'npm run db:stats'

# Watch connection status
watch -n 1 'npm run db:status'
```

---

## 🔐 Security Checklist

Before production:

- [ ] Change JWT_SECRET in .env
- [ ] Use MongoDB Atlas (not local)
- [ ] Enable authentication on MongoDB
- [ ] Configure HTTPS/SSL
- [ ] Update CORS origins
- [ ] Enable rate limiting
- [ ] Set up monitoring
- [ ] Configure backups

---

## 📊 API Endpoints Summary

### Health & Status
```
GET  /api/health                    # Health check
```

### Judges
```
GET  /api/judges/profile                    # Judge info
GET  /api/judges/contestants                # List to score
GET  /api/judges/scores/:id                 # Contestant scores
POST /api/judges/submit-score               # Submit score
PUT  /api/judges/scores/:id                 # Update score
GET  /api/judges/scoreboard                 # Personal ranking
GET  /api/judges/overall-scoreboard         # Final ranking
GET  /api/judges/progress                   # Progress stats
```

---

## 💾 Backup Strategy

### Daily Automatic Backup

```bash
# Create backup
npm run db:backup
# Saved to: backups/backup-2026-04-07T10-30-45-123Z.json
```

### Restore from Backup

```bash
# List backups
ls backups/

# Restore
node db_admin.js restore ./backups/backup-2026-04-07T10-30-45-123Z.json
```

---

## 📞 Useful MongoDB Commands

```mongosh
# Connect
mongosh mongodb://localhost:27017/sliit-talent

# View databases
show dbs

# View collections
show collections

# Count documents
db.users.countDocuments()
db.judgescores.countDocuments()

# Find sample data
db.users.findOne()
db.judgescores.findOne()

# Top scores
db.judgescores.find().sort({totalScore: -1}).limit(5)
```

---

## 🚀 Next Steps

1. ✅ Backend running
2. ✅ Database seeded
3. Navigate to: [Frontend Integration](./JUDGE_PANEL_INTEGRATION.md)
4. Test end-to-end flow
5. Deploy to production

---

## 📚 Full Documentation

- [Backend Implementation Guide](./BACKEND_IMPLEMENTATION_GUIDE.md)
- [MongoDB Setup Guide](./MONGODB_SETUP_GUIDE.md)
- [API Reference](./server/JUDGE_PANEL_API.md)
- [Judge Panel Summary](./JUDGE_PANEL_BACKEND_SUMMARY.md)

---

## ✨ You're Ready!

Your backend is now fully functional with:
- ✅ Express.js server
- ✅ MongoDB database
- ✅ 8 API endpoints
- ✅ Error handling
- ✅ Data validation
- ✅ Admin tools
- ✅ Backup system

**Start scoring! 🏆**

---

**Questions?** Check the full documentation or refer to the guides above.
