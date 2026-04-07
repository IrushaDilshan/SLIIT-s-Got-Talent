# Backend Implementation - Complete Guide

## 📋 Overview

This guide covers the complete backend implementation with MongoDB integration for the Judge Panel feature in SLIIT's Got Talent system.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │              EXPRESS.JS SERVER                      │    │
│  │  - Port 5000                                       │    │
│  │  - CORS enabled                                    │    │
│  │  - Error handling middleware                      │    │
│  └────────────────────────────────────────────────────┘    │
│                         │                                   │
│          ┌──────────────┼──────────────┐                    │
│          │              │              │                    │
│  ┌───────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐             │
│  │   Routes     │ │Middleware │ │ Controllers │             │
│  │              │ │           │ │             │             │
│  │ - auth       │ │- verify   │ │- validate   │             │
│  │ - judges     │ │- auth     │ │- process    │             │
│  │ - votes      │ │- error    │ │- respond    │             │
│  │ - contestants│ │- cors     │ │             │             │
│  │ - settings   │ │           │ │             │             │
│  └──────────────┘ └───────────┘ └─────────────┘             │
│                         │                                   │
│          ┌──────────────┼──────────────┐                    │
│          │              │              │                    │
│  ┌───────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐             │
│  │   Models     │ │Validators │ │ Utilities   │             │
│  │              │ │           │ │             │             │
│  │ - User       │ │- Scores   │ │- DB Utils   │             │
│  │ - JudgeScore │ │- Email    │ │- Validators │             │
│  │ - Contestant │ │- Data     │ │- Helpers    │             │
│  │ - Vote       │ │           │ │             │             │
│  └──────────────┘ └───────────┘ └─────────────┘             │
│                         │                                   │
│  ┌──────────────────────▼──────────────────────────┐        │
│  │           MONGODB DATABASE                      │        │
│  │  - Collections: Users, JudgeScores,            │        │
│  │    Contestants, Votes, Settings                │        │
│  │  - Indexes: For performance optimization       │        │
│  │  - Backup: Automated backup system             │        │
│  └──────────────────────────────────────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
server/
├── config/
│   ├── db.js                 # MongoDB connection manager
│   └── dbUtils.js            # Database utilities
├── controllers/
│   ├── judge.Controller.js   # Judge scoring logic
│   ├── auth.Controller.js
│   ├── vote.Controller.js
│   └── ...
├── models/
│   ├── JudgeScore.js         # Judge score schema
│   ├── User.js
│   ├── Contestant.js
│   └── Vote.js
├── routes/
│   ├── judge.Routes.js       # Judge endpoints
│   └── ...
├── middleware/
│   ├── errorHandler.js       # Error handling
│   ├── authMiddleware.js
│   └── roleMiddleware.js
├── utils/
│   ├── validators.js         # Data validation
│   ├── sendEmail.js
│   └── helpers.js
├── app.js                    # Express app setup
├── index.js                  # Entry point
├── .env.example              # Environment template
├── seed_db.js                # Database seeding script
├── db_admin.js               # Database admin CLI
└── package.json              # Dependencies
```

---

## 🔧 Setup Instructions

### 1. Install MongoDB

**Windows:**
```bash
choco install mongodb-community
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
```

**Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. Start MongoDB Service

```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 3. Setup Backend

```bash
cd server

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Seed database
node seed_db.js --all

# Start server
npm start
```

---

## 📊 Database Models

### JudgeScore Model

```javascript
{
  judgeId: ObjectId (ref: User),
  contestantId: ObjectId (ref: Contestant),
  criteria: {
    creativity: Number (0-25),
    presentation: Number (0-25),
    skillLevel: Number (0-25),
    audienceImpact: Number (0-25),
  },
  totalScore: Number (0-100),
  status: String ('submitted', 'pending', 'revision'),
  round: String ('qualifier', 'semi-final', 'final'),
  notes: String,
  timestamps: {
    createdAt: Date,
    updatedAt: Date,
  }
}
```

**Indexes:**
- Unique: `(judgeId, contestantId, round)` - Prevents duplicate scoring

---

## 📡 API Endpoints

All endpoints require JWT authentication:
```
Authorization: Bearer <token>
```

### Judge Endpoints

```
GET    /api/judges/profile                    # Get judge info
GET    /api/judges/contestants                # List contestants
GET    /api/judges/scores/:contestantId       # Get contestant scores
POST   /api/judges/submit-score               # Submit scores
PUT    /api/judges/scores/:scoreId            # Update scores
GET    /api/judges/scoreboard                 # Personal rankings
GET    /api/judges/overall-scoreboard         # Final rankings
GET    /api/judges/progress                   # Progress statistics
```

### Example: Submit Score

```javascript
POST /api/judges/submit-score
Content-Type: application/json
Authorization: Bearer <token>

{
  "contestantId": "507f1f77bcf86cd799439011",
  "creativity": 24,
  "presentation": 23,
  "skillLevel": 25,
  "audienceImpact": 22,
  "notes": "Excellent performance"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Score submitted successfully",
  "data": {
    "scoreId": "507f1f77bcf86cd799439012",
    "contestantId": "507f1f77bcf86cd799439011",
    "totalScore": 94,
    "criteria": {
      "creativity": 24,
      "presentation": 23,
      "skillLevel": 25,
      "audienceImpact": 22
    },
    "submittedAt": "2026-04-07T10:30:00Z"
  }
}
```

---

## 🛠️ Database Management Commands

### Database Administration

```bash
# Check status
node db_admin.js status

# Show statistics
node db_admin.js stats

# View collections
node db_admin.js collections

# Verify integrity
node db_admin.js verify

# Show database size
node db_admin.js size

# Create backup
node db_admin.js backup

# Restore from backup
node db_admin.js restore ./backups/backup-*.json
```

### Seeding Commands

```bash
# Seed all data
node seed_db.js --all

# Seed judges only
node seed_db.js --judges

# Seed contestants
node seed_db.js --contestants

# Seed scores
node seed_db.js --scores

# Clear all data
node seed_db.js --clear
```

---

## 🔐 Security Features

✅ **JWT Authentication** - Token-based auth  
✅ **Role-Based Access Control** - Judge, Admin, Student roles  
✅ **Input Validation** - All data validated  
✅ **Error Handling** - Centralized error middleware  
✅ **CORS Configuration** - Cross-origin protection  
✅ **Unique Constraints** - Prevent duplicate entries  
✅ **Audit Trail** - Timestamps on all data  

---

## 🧪 Testing the Backend

### Health Check

```bash
curl http://localhost:5000/api/health
```

**Response:**
```json
{
  "success": true,
  "message": "API is healthy",
  "uptime": 12345.67
}
```

### Login as Judge

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "judge1@sliit.lk",
    "otp": "123456"
  }'
```

### Get Contestants

```bash
curl http://localhost:5000/api/judges/contestants \
  -H "Authorization: Bearer <your_token>"
```

---

## 🚨 Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "details": ["Specific error details"],
  "timestamp": "2026-04-07T10:30:00Z"
}
```

### Common Error Codes

| Code | Message | Solution |
|------|---------|----------|
| 400 | Bad Request | Check request body |
| 401 | Unauthorized | Invalid/missing token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry |
| 500 | Server Error | Contact support |

---

## 📈 Performance Optimization

### Indexes

All indexes are automatically created:

```bash
node db_admin.js indexes
```

Indexed fields:
- `judgeId + contestantId + round` (Unique)
- `email` (User - Unique)
- `universityId` (Contestant - Unique)
- `voterId + contestantId` (Vote)

### Query Optimization

Examples of optimized queries:

```javascript
// Get contestant scores with ranking
db.judgescores.aggregate([
  { $match: { contestantId: ObjectId(...) } },
  { $group: { _id: null, avgScore: { $avg: '$totalScore' } } }
])

// Get top 10 contestants
db.judgescores.aggregate([
  {
    $group: {
      _id: '$contestantId',
      avgScore: { $avg: '$totalScore' }
    }
  },
  { $sort: { avgScore: -1 } },
  { $limit: 10 }
])
```

---

## 🔄 Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Network access configured
- [ ] Backup strategy implemented
- [ ] Environment variables set
- [ ] Indexes created
- [ ] Error handling tested
- [ ] JWT secret changed
- [ ] CORS origin updated
- [ ] Data validation verified
- [ ] Rate limiting configured

---

## 📚 File Reference

| File | Purpose |
|------|---------|
| `config/db.js` | MongoDB connection |
| `config/dbUtils.js` | Database utilities |
| `models/JudgeScore.js` | Score schema |
| `controllers/judge.Controller.js` | Judge logic |
| `middleware/errorHandler.js` | Error handling |
| `utils/validators.js` | Data validation |
| `seed_db.js` | Database seeding |
| `db_admin.js` | Database admin CLI |

---

## 💡 Common Tasks

### Add a New Judge

```bash
node create_judge.js your.email@sliit.lk
```

### Backup Database

```bash
node db_admin.js backup
# Creates: backups/backup-2026-04-07T10-30-45-123Z.json
```

### View Scores for Contestant

```bash
# Via Mongoose shell
db.judgescores.find({contestantId: ObjectId("...")})
```

### Reset All Scores

```bash
node seed_db.js --clear
node seed_db.js --scores
```

---

## 🚀 Production Deployment

### Environment Setup

Create `.env` file with:

```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/sliit-talent
PORT=5000
JWT_SECRET=your_production_secret
NODE_ENV=production
API_URL=https://your-api.com
```

### Deploy Using PM2

```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start index.js --name "sliit-api"

# View logs
pm2 logs sliit-api

# Monitor
pm2 monitor
```

---

## 🆘 Troubleshooting

### MongoDB Connection Error

```bash
# Check if MongoDB is running
mongosh

# If not, start it based on your OS
```

### "Duplicate key" Error

```bash
# Clear and reseed
node seed_db.js --clear
node seed_db.js --all
```

### Token Expired

```bash
# Get new token by logging in again
curl -X POST http://localhost:5000/api/auth/login
```

---

## 📱 Frontend Integration

Import the API service in React:

```javascript
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

## ✨ Status

✅ **Backend: COMPLETE**
- 8 API endpoints
- Database models
- Validation & error handling
- Seeding scripts
- Admin tools
- Documentation

**Ready for production use! 🚀**

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review error messages
3. Check database status: `node db_admin.js status`
4. Review logs in MongoDB Compass
5. Consult MongoDB documentation

---

**Backend implementation completed successfully! 🎉**
