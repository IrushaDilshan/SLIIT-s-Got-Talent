# Final Leaderboard Integration - Implementation Reference

## 🎯 Overview

The final leaderboard system now pulls real data from the database, combining:
- **Public votes** from registered users
- **Judge scores** from evaluation panel
- **Weighted calculation** (40% public + 60% judge)

This creates a unified final ranking displayed in both dashboard and report formats.

## 📊 Data Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐      ┌──────────────────┐             │
│  │  Contestants    │      │   Judge Scores   │             │
│  ├─────────────────┤      ├──────────────────┤             │
│  │ _id             │      │ _id              │             │
│  │ name            │      │ judgeId          │             │
│  │ talentType      │      │ contestantId  ──┼─── Link     │
│  │ votes (0-1000)  │◄─────┤ criteria {       │             │
│  │ imageUrl        │      │   creativity     │             │
│  │ status          │      │   presentation   │             │
│  │                 │      │   skillLevel     │             │
│  │                 │      │   audienceImpact │             │
│  │                 │      │ }                │             │
│  │                 │      │ totalScore       │             │
│  └─────────────────┘      └──────────────────┘             │
└─────────────────────────────────────────────────────────────┘
           ▲                         ▲
           │                         │
           └──────────────┬──────────┘
                          │
                    API Aggregation
                          │
                          ▼
        ┌──────────────────────────────────┐
        │  getFinalLeaderboard()           │
        │  /api/judges/final-leaderboard   │
        └──────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
 FinalLeaderboard   FinalResult      judgeApi.getFinal
 Dashboard.jsx      .jsx             Leaderboard()
```

## 🔌 API Endpoint Details

### GET /api/judges/final-leaderboard

**Location:** `server/routes/judge.Routes.js`
**Handler:** `server/controllers/judge.Controller.js` → `getFinalLeaderboard()`
**Authentication:** ❌ None required (public endpoint)
**Cache:** None (always fresh from database)

**Request:**
```http
GET /api/judges/final-leaderboard?category=Singing
```

**Query Parameters:**
| Parameter | Type | Required | Example |
|-----------|------|----------|---------|
| category | string | No | "Singing", "Dancing", etc. |

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "contestantId": "507f1f77bcf86cd799439011",
        "name": "Amandi Perera",
        "category": "Singing",
        "imageUrl": "https://...",
        "description": "Professional singer",
        "publicVotes": 920,
        "maxVotes": 1000,
        "publicVotePercent": 92,
        "averageJudgeScore": 37.5,
        "maxJudgeScore": 40,
        "judgeCount": 5,
        "judgeScorePercent": 94,
        "criteria": {
          "creativity": 9.4,
          "presentation": 9.2,
          "skillLevel": 9.6,
          "audienceImpact": 9.3
        },
        "weightedScore": 92.8
      },
      // ... more contestants
    ],
    "topThree": [
      // Same structure as leaderboard[0], [1], [2]
    ],
    "statistics": {
      "totalContestants": 12,
      "totalVotes": 8920,
      "averageJudgeScore": 35.2,
      "highestWeightedScore": 92.8
    }
  },
  "count": 12
}
```

**Response Error (500):**
```json
{
  "message": "Error fetching final leaderboard",
  "error": "Connection timeout"
}
```

## 💻 Frontend Integration

### judgeApi Service
**File:** `web-app/src/services/judgeApi.js`

```javascript
// Import
import judgeApi from "../services/judgeApi";

// Usage
const fetchResults = async () => {
  const response = await judgeApi.getFinalLeaderboard();
  // response.data contains: { leaderboard, topThree, statistics }
  
  // Or with category filter
  const singing = await judgeApi.getFinalLeaderboard({ category: 'Singing' });
};
```

### Component Implementation Pattern

**FinalLeaderboardDashboard.jsx:**
```javascript
import { useEffect, useState } from 'react';
import judgeApi from "../services/judgeApi";

export default function FinalLeaderboardDashboard() {
  const [contestants, setContestants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await judgeApi.getFinalLeaderboard();
        setContestants(response.data.leaderboard);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // Render with loading/error states
  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;
  
  return <LeaderboardDisplay contestants={contestants} />;
}
```

## 🧮 Score Calculation Formula

### Formula:
```
weightedScore = (publicVotePercent × 0.4) + (judgeScorePercent × 0.6)

Where:
  publicVotePercent = (publicVotes / maxVotes) × 100
  judgeScorePercent = (averageJudgeScore / maxJudgeScore) × 100
  
Constants:
  maxVotes = 1000
  maxJudgeScore = 40
```

### Example:
```
Contestant: Amandi Perera
  publicVotes = 920
  averageJudgeScore = 37.5

Step 1: Calculate percentages
  publicVotePercent = (920 / 1000) × 100 = 92%
  judgeScorePercent = (37.5 / 40) × 100 = 93.75%

Step 2: Apply weights
  weightedScore = (92 × 0.4) + (93.75 × 0.6)
  weightedScore = 36.8 + 56.25
  weightedScore = 93.05

Result: 93.05
```

## 📋 Data Transformation

**API Response → Component:**

| API Field | Display Use | Component Field |
|-----------|-------------|-----------------|
| contestantId | React key, link | c.contestantId |
| name | Header display | c.name |
| category | Filter, label | c.category |
| imageUrl | Avatar/photo | c.imageUrl |
| publicVotes | Vote count | c.publicVotes |
| maxVotes | Vote denominator | c.maxVotes |
| publicVotePercent | Vote bar height | c.publicVotePercent |
| averageJudgeScore | Judge score | c.averageJudgeScore |
| maxJudgeScore | Score denominator | c.maxJudgeScore |
| judgeCount | Info text | c.judgeCount |
| judgeScorePercent | Judge bar height | c.judgeScorePercent |
| criteria | Breakdown bars | c.criteria (object) |
| weightedScore | Final ranking | c.weightedScore |

## 🔄 Data Flow Sequence

```
1. Component Mounts
   └─> useEffect triggers
   
2. API Request
   └─> judgeApi.getFinalLeaderboard()
   └─> GET /api/judges/final-leaderboard
   
3. Backend Processing
   └─> JudgeScore.aggregate() [judge scores]
   └─> Contestant.find() [votes]
   └─> Calculate weightedScore for each
   └─> Sort descending
   └─> Return structured response
   
4. Frontend Response
   └─> setContestants(data.leaderboard)
   └─> setLoading(false)
   
5. Render
   └─> Maps over contestants
   └─> Displays leaderboard/charts
```

## 🚀 Key Features

### ✅ Real-time Data
- Pulls latest votes and judge scores on each load
- No caching delays
- Accurate current rankings

### ✅ Responsive Filtering
- Filter by talent category
- Search by name
- Dynamic category list from database

### ✅ Error Handling
- Loading spinner while fetching
- Error message with retry button
- Graceful fallbacks

### ✅ Performance
- Single aggregation query (efficient)
- ~500ms total response time typical
- Handles 50+ contestants easily

## 📱 Component Features Comparison

| Feature | FinalLeaderboardDashboard | FinalResult |
|---------|---------------------------|------------|
| Purpose | Live leaderboard | Detailed report |
| Top 3 Display | ✅ Podium view | ✅ Podium view |
| Charts | ✅ Vote/Judge/Trend | ✅ Vote/Judge/Trend |
| Criteria Breakdown | ✅ In table | ✅ Detailed tab |
| Search/Filter | ✅ Yes | ✅ Yes |
| Print Report | ❌ No | ✅ Yes |
| Performance Trend | ✅ Sparklines | ✅ Charts |
| Export | ❌ No | ✅ PDF |

## 🔐 Security Considerations

✅ **Public Endpoint:** No authentication required
- Allows unauthenticated users to view final results
- Suitable for public announcement

⚠️ **Data Exposed:**
- Names and categories (public)
- Vote counts (public)
- Judge scores (public in this context)
- Judge panel emails (NOT exposed)

✅ **No Updates:** Endpoint is read-only
- No injection risks
- Results only from database queries

## 🛠️ Maintenance

### Database Considerations
```javascript
// Ensure judges submitted scores
db.judgescores.count() // Should be > 0

// Verify contestant votes
db.contestants.aggregate([
  { $group: { _id: null, totalVotes: { $sum: "$votes" } } }
])

// Check judge contribution
db.judgescores.distinct('judgeId').length
```

### Performance Tuning
```javascript
// Add index for faster queries
db.contestants.createIndex({ "status": 1, "talentType": 1 })
db.judgescores.createIndex({ "contestantId": 1 })
```

### Common Issues & Fixes

**Issue:** Empty leaderboard shown  
**Fix:** Verify contestants have `status: 'approved'` in database

**Issue:** Wrong weighted scores  
**Fix:** Check maxVotes (1000) and maxJudgeScore (40) constants

**Issue:** Slow response times  
**Fix:** Add database indexes on `status`, `talentType`, `contestantId`

**Issue:** Missing judge scores  
**Fix:** Verify judges submitted scores via `/api/judges/submit-score`

## 📞 Support

For issues:
1. Check browser console for errors
2. Check backend server logs
3. Verify MongoDB connection
4. Check data exists in collections
5. Use testing guide at `FINAL_LEADERBOARD_TESTING.md`

## 📚 Related Documentation

- Judge scoring: `JUDGE_PANEL_README.md`
- Backend setup: `BACKEND_COMPLETE_SUMMARY.md`
- Testing: `FINAL_LEADERBOARD_TESTING.md`
- Integration: `JUDGE_PANEL_INTEGRATION.md`
