# Final Leaderboard - Testing Guide

## Prerequisites
✅ Backend running on `http://localhost:5000`
✅ Frontend running on `http://localhost:5173`
✅ MongoDB connected with judge scores and contestant votes data
✅ At least 2-3 judges have submitted scores for contestants

## Quick Test Steps

### 1. Test Backend Endpoint
**Command:**
```bash
curl http://localhost:5000/api/judges/final-leaderboard
```

**Expected Response:**
- Status: 200
- Contains `leaderboard` array with contestants
- Each contestant has `weightedScore`, `averageJudgeScore`, `publicVotes`
- Contains `topThree` array with top 3 contestants
- Contains `statistics` object

**Example:**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "contestantId": "65abc123...",
        "name": "Amandi Perera",
        "category": "Singing",
        "publicVotes": 850,
        "averageJudgeScore": 37.5,
        "weightedScore": 88.75
      }
    ],
    "statistics": {
      "totalContestants": 12,
      "totalVotes": 8920,
      "averageJudgeScore": 35.2
    }
  }
}
```

### 2. Test Category Filter
**Command:**
```bash
curl "http://localhost:5000/api/judges/final-leaderboard?category=Singing"
```

**Expected:**
- Only returns contestants with `category === "Singing"`

### 3. Test FinalLeaderboardDashboard Component

**Steps:**
1. Navigate to `/final-leaderboard` in browser
2. Should show loading spinner initially (2-3 seconds)
3. After loading:
   - ✅ Top 3 finalists display with medals
   - ✅ Statistics cards show correct totals (votes, judge score, etc.)
   - ✅ Full leaderboard table displays ranked contestants
   - ✅ Vote analysis and judge score charts render
   - ✅ Performance trend overview shows top 4 contestants

**Test Interactions:**
- Type in search box → should filter contestants by name/category
- Select category dropdown → should show only that category
- All statistics update correctly

### 4. Test FinalResult Component

**Steps:**
1. Navigate to `/final-result` (check your routing)
2. Should show loading spinner
3. After loading:
   - ✅ Header displays report information
   - ✅ Top 3 podium cards show with correct data
   - ✅ "Overview" tab shows top performers
   - ✅ "Charts" tab shows:
     - Public votes bar chart
     - Judge scores bar chart
     - Final weighted score chart
     - Trend analysis
   - ✅ "Criteria" tab shows judge evaluation breakdown
   - ✅ Full ranking table displays all contestants

**Test Interactions:**
- Click "Overview", "Charts", "Criteria" tabs → should switch views
- Click "Print Report" button → should trigger print dialog
- Search box filters results
- Category dropdown filters by talent type

### 5. Data Validation

Check these values match reality:

**Total Votes:**
```javascript
// Should equal sum of all contestant.votes from database
Example: 850 + 920 + 780 + ... = expected total
```

**Average Judge Score:**
```javascript
// Should be average of all averageJudgeScore values
Example: (37.5 + 36 + 38 + ...) / count
```

**Weighted Score Calculation:**
```javascript
// For any contestant, manually verify:
publicPercent = (publicVotes / maxVotes) * 100  // e.g., (850/1000)*100 = 85
judgePercent = (averageJudgeScore / 40) * 100   // e.g., (37.5/40)*100 = 93.75
weightedScore = publicPercent * 0.4 + judgePercent * 0.6
// e.g., 85 * 0.4 + 93.75 * 0.6 = 34 + 56.25 = 90.25
```

## Error Testing

### Test Error Handling

**Disconnect MongoDB:**
```bash
# Stop MongoDB or disconnect network
# Navigate to /final-leaderboard
# Should see: "Error Loading Leaderboard" message
# "Retry" button should work after reconnecting
```

**Empty Database:**
```bash
# Delete all contestants and scores
# Should show: Loading state completes
# Empty leaderboard displays (no error)
# Statistics show: 0 contestants, 0 votes
```

## Performance Testing

**Measure Load Times:**
1. Open DevTools → Network tab
2. Navigate to `/final-leaderboard`
3. Check `/judges/final-leaderboard` request:
   - ⏱️ Should complete in < 500ms
   - 📊 Should show full data with all fields

**With Large Dataset:** (optional)
- Test with 50+ contestants
- Test with 100+ judge scores
- Verify response time stays under 1 second

## Real Data Verification

### Step-by-step verification:

1. **Open MongoDB Compass or mongosh:**
```javascript
// Check contestant data
db.contestants.findOne()
// Should have: name, talentType, votes, imageUrl, status

// Check judge scores
db.judgescores.findOne()
// Should have: judgeId, contestantId, criteria, totalScore

// Count judges
db.judgescores.distinct('judgeId').length
// Should be at least 2-3
```

2. **Compare with Frontend Display:**
- Pick one contestant from database
- Find them in the leaderboard
- Verify:
  - Name matches
  - Votes count matches
  - Judge score is reasonable (average of all judge scores for that contestant)

3. **Verify Ranking Order:**
- Top contestant should have highest `weightedScore`
- Scores should be in descending order
- No duplicate contestants

## Debugging Tips

**If leaderboard shows no data:**
```bash
# Check backend console for errors
# Check GraphQL/API logs
# Verify MongoDB has data: db.contestants.count()
```

**If scores seem wrong:**
```bash
# Verify max values: maxVotes (1000) and maxJudgeScore (40)
# Check weighted calculation: 40% public + 60% judge
# Verify all judges' scores were submitted
```

**If category filter doesn't work:**
```bash
# Check that contestants have talentType field
# Verify query parameter is being sent correctly
# Check API endpoint logs
```

**If images don't load:**
```bash
# Verify imageUrl field exists in db
# Check URLs are publicly accessible
# Check for CORS issues
```

## Success Criteria

✅ All tests from sections 1-5 pass
✅ Data accuracy verified from database
✅ No errors in browser console
✅ Navigation between tabs/filters works smoothly
✅ Loading and error states display correctly
✅ Rankings are in correct order
✅ Statistics match calculations
✅ Performance acceptable (< 1s loading)

## Known Test Data

If you need test data, expected results:

| Contestant | Public Votes | Judge Score | Weighted |
|-----------|-------------|------------|----------|
| Rank 1 | 920 | 37.5 | 88.75 |
| Rank 2 | 870 | 36.2 | 85.33 |
| Rank 3 | 790 | 38.0 | 85.20 |

(These are examples - your actual data will vary)

## Troubleshooting

**Issue:** Infinite loading spinner
- Check backend is running
- Check API endpoint returns data
- Check browser console for errors

**Issue:** "Error Loading Leaderboard"
- Backend service down 
- Database connection lost
- Check server logs

**Issue:** Data doesn't update when voting happens
- Frontend doesn't auto-refresh
- Manually refresh page to see new votes
- Real-time updates not implemented

**Issue:** Wrong weighted scores
- Verify weight split is 40/60
- Check maxVotes = 1000, maxJudgeScore = 40
- Manual calculation matches API response

## Clean Up Test Data

To reset for fresh testing:
```javascript
// In MongoDB
db.contestants.updateMany({}, { $set: { votes: 0 } })
db.judgescores.deleteMany({})
```

Then re-populate with test votes and scores.
