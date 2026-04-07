/**
 * MongoDB Database Setup & Initialization Guide
 * Instructions for setting up MongoDB and initializing the database
 */

# MongoDB Setup Guide for SLIIT's Got Talent

## 1. Installation

### Option A: Local MongoDB Installation

#### On Windows (via Chocolatey):
```bash
choco install mongodb-community
```

#### On macOS (via Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
```

#### On Linux (Ubuntu/Debian):
```bash
sudo apt-get install -y mongodb
```

### Option B: Using MongoDB Community Edition (Docker)

```bash
# Pull MongoDB image
docker pull mongo:latest

# Run MongoDB container
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Option C: MongoDB Atlas (Cloud)

1. Go to: https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get connection string
5. Update `.env` file with connection string:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/sliit-talent
   ```

---

## 2. Verify MongoDB Installation

### Check if MongoDB is running:

**Windows (PowerShell):**
```powershell
Get-Service MongoDB
```

**macOS/Linux:**
```bash
sudo systemctl status mongod
```

### Start MongoDB service:

**Windows:**
```powershell
net start MongoDB
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

---

## 3. Connect to MongoDB

### Using MongoDB Compass (GUI):
1. Download: https://www.mongodb.com/try/download/compass
2. Install and open
3. Connect to: `mongodb://localhost:27017`

### Using MongoDB Shell:
```bash
mongosh mongodb://localhost:27017
```

Then run:
```mongosh
show dbs                           # List all databases
use sliit-talent                   # Switch to database
show collections                   # List collections
db.users.find()                    # Query users
```

---

## 4. Project Setup

### Step 1: Copy Environment File
```bash
cd server
cp .env.example .env
```

### Step 2: Edit .env File
```bash
# .env file configuration
MONGO_URI=mongodb://localhost:27017/sliit-talent
PORT=5000
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Start Backend Server
```bash
npm start
```

You should see:
```
✅ MongoDB Connected Successfully
   Host: localhost
   Database: sliit-talent
   Port: 27017
```

---

## 5. Database Initialization Commands

### Seed All Sample Data:
```bash
node seed_db.js --all
```

This creates:
- 5 sample judges
- 8 sample contestants
- 40 sample judge scores

### Seed Specific Data:
```bash
# Judges only
node seed_db.js --judges

# Contestants only
node seed_db.js --contestants

# Scores only
node seed_db.js --scores

# Clear all data
node seed_db.js --clear
```

---

## 6. Database Administration

### Check Database Status:
```bash
node db_admin.js status
```

Expected output:
```
📊 Database Connection Status:
   State: CONNECTED
   Host: localhost
   Port: 27017
   Database: sliit-talent
```

### View Statistics:
```bash
node db_admin.js stats
```

### Create Indexes:
```bash
node db_admin.js indexes
```

### Verify Integrity:
```bash
node db_admin.js verify
```

### List Collections:
```bash
node db_admin.js collections
```

### Show Database Size:
```bash
node db_admin.js size
```

### Create Backup:
```bash
node db_admin.js backup
# Creates: backups/backup-2026-04-07T10-30-45-123Z.json
```

### Restore from Backup:
```bash
node db_admin.js restore ./backups/backup-2026-04-07T10-30-45-123Z.json
```

---

## 7. MongoDB Database Collections Schema

### Users Collection:
```json
{
  "_id": ObjectId,
  "email": "judge@sliit.lk",
  "role": "judge",
  "votedCategories": ["Singing"],
  "votedContestants": ["id1", "id2"],
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

### Contestants Collection:
```json
{
  "_id": ObjectId,
  "name": "Amandi Perera",
  "universityId": "IT19001",
  "talentType": "Singing",
  "description": "Classical singer",
  "imageUrl": "https://...",
  "videoUrl": "https://...",
  "status": "approved",
  "votes": 150,
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

### JudgeScores Collection:
```json
{
  "_id": ObjectId,
  "judgeId": ObjectId,
  "contestantId": ObjectId,
  "criteria": {
    "creativity": 24,
    "presentation": 23,
    "skillLevel": 25,
    "audienceImpact": 22
  },
  "totalScore": 94,
  "round": "semi-final",
  "status": "submitted",
  "notes": "Great performance",
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

### Votes Collection:
```json
{
  "_id": ObjectId,
  "voterId": ObjectId,
  "contestantId": ObjectId,
  "timestamp": ISODate,
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

---

## 8. Common MongoDB Queries (via Shell)

```mongosh
# Connect to database
use sliit-talent

# Find all judges
db.users.find({role: "judge"})

# Find all contestants
db.contestants.find()

# Find all scores
db.judgescores.find()

# Find scores for a specific contestant
db.judgescores.find({contestantId: ObjectId("...")})

# Calculate average score per contestant
db.judgescores.aggregate([
  {
    $group: {
      _id: "$contestantId",
      avgScore: { $avg: "$totalScore" },
      judgeCount: { $sum: 1 }
    }
  },
  { $sort: { avgScore: -1 } }
])

# Find high scores (>90)
db.judgescores.find({totalScore: {$gt: 90}})

# Count total scores
db.judgescores.countDocuments()

# Delete a collection
db.judgescores.deleteMany({})

# Drop entire database (USE WITH CAUTION)
db.dropDatabase()
```

---

## 9. Troubleshooting

### Issue: MongoDB Connection Refused
**Solution:**
```bash
# Check if MongoDB is running
mongosh

# If not running, start it:
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Issue: "MONGO_URI not found"
**Solution:**
```bash
# Create .env file from template
cp .env.example .env

# Edit .env and add your MongoDB connection string
```

### Issue: "Connection timeout"
**Solution:**
```bash
# Check MongoDB is accessible
mongosh mongodb://localhost:27017

# Verify MONGO_URI is correct in .env
# For Atlas: mongodb+srv://username:password@cluster.mongodb.net/dbname
```

### Issue: "Duplicate key error"
**Solution:**
```bash
# Clear and reseed database
node seed_db.js --clear
node seed_db.js --all
```

---

## 10. Database Backup & Recovery

### Automatic Backup (Recommended):
```bash
# Create backup
node db_admin.js backup

# Backups are stored in: ./backups/
```

### Export Data (MongoDB Tools):
```bash
# Install MongoDB Database Tools
# https://www.mongodb.com/try/download/database-tools

# Export collections
mongoexport --db sliit-talent --collection judgescores --out judgescores.json
```

### Import Data:
```bash
mongoimport --db sliit-talent --collection judgescores --file judgescores.json
```

---

## 11. Performance Optimization

### Create Indexes for Better Query Performance:
```bash
node db_admin.js indexes
```

### Keys indexed by default:
- `judgeId + contestantId + round` (JudgeScore - unique)
- `email` (User - unique)
- `universityId` (Contestant - unique)
- `voterId + contestantId` (Vote)

---

## 12. Production Checklist

- [ ] MongoDB Atlas account created
- [ ] Cluster deployed in production region
- [ ] Network access configured
- [ ] Database user created with strong password
- [ ] MONGO_URI updated in .env
- [ ] Connection tested successfully
- [ ] Indexes created
- [ ] Backup strategy implemented
- [ ] Monitoring enabled
- [ ] SSL/TLS enabled

---

## 📚 Resources

- MongoDB Documentation: https://docs.mongodb.com/
- Mongoose Documentation: https://mongoosejs.com/
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- MongoDB Compass: https://www.mongodb.com/products/tools/compass

---

**Status: Database setup complete! 🚀**
