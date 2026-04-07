# Judge Panel Backend - API Documentation

## Base URL
```
http://localhost:5000/api/judges
```

## Authentication
All endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### 1. Get Judge Profile
**Endpoint:** `GET /api/judges/profile`  
**Access:** Private (Judge, Admin)  
**Description:** Retrieve the logged-in judge's profile and statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "judge_id",
    "email": "judge@sliit.lk",
    "role": "judge",
    "totalScoredContestants": 12,
    "uniqueContestants": 12,
    "createdAt": "2026-04-07T10:30:00Z"
  }
}
```

---

### 2. Get Contestants for Judging
**Endpoint:** `GET /api/judges/contestants`  
**Access:** Private (Judge, Admin)  
**Query Parameters:**
- `category` (optional) - Filter by talent category (e.g., "Singing", "Dancing")
- `round` (optional) - Filter by round
- `status` (optional) - Filter by status

**Description:** Get list of all approved contestants available for judging

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "contestant_id",
      "name": "Amandi Perera",
      "category": "Singing",
      "photo": "https://...",
      "description": "Performance description",
      "votes": 150,
      "hasBeenScored": false,
      "scoreSubmitted": null
    }
  ],
  "count": 50
}
```

---

### 3. Get Contestant Scores
**Endpoint:** `GET /api/judges/scores/:contestantId`  
**Access:** Private (Judge, Admin)  
**URL Parameters:**
- `contestantId` - The MongoDB ID of the contestant

**Description:** Get all judge scores for a specific contestant, including averages

**Response:**
```json
{
  "success": true,
  "data": {
    "contestantId": "contestant_id",
    "contestantName": "Amandi Perera",
    "category": "Singing",
    "totalJudges": 5,
    "averageScore": "87.50",
    "criteriaAverages": {
      "creativity": "22.50",
      "presentation": "23.00",
      "skillLevel": "21.50",
      "audienceImpact": "20.50"
    },
    "scores": [
      {
        "judgeId": "judge_id",
        "judgeEmail": "judge1@sliit.lk",
        "criteria": {
          "creativity": 25,
          "presentation": 24,
          "skillLevel": 24,
          "audienceImpact": 23
        },
        "totalScore": 96,
        "submittedAt": "2026-04-07T10:30:00Z"
      }
    ]
  }
}
```

---

### 4. Submit Judge Score
**Endpoint:** `POST /api/judges/submit-score`  
**Access:** Private (Judge only)  
**Request Body:**
```json
{
  "contestantId": "contestant_id",
  "creativity": 24,
  "presentation": 23,
  "skillLevel": 25,
  "audienceImpact": 22,
  "notes": "Excellent performance with great stage presence"
}
```

**Description:** Submit scores for a contestant. Each judge can only score each contestant once.

**Response:**
```json
{
  "success": true,
  "message": "Score submitted successfully",
  "data": {
    "scoreId": "score_id",
    "contestantId": "contestant_id",
    "criteria": {
      "creativity": 24,
      "presentation": 23,
      "skillLevel": 25,
      "audienceImpact": 22
    },
    "totalScore": 94,
    "submittedAt": "2026-04-07T10:30:00Z"
  }
}
```

---

### 5. Update Judge Score
**Endpoint:** `PUT /api/judges/scores/:scoreId`  
**Access:** Private (Judge only)  
**URL Parameters:**
- `scoreId` - The MongoDB ID of the score to update

**Request Body:**
```json
{
  "creativity": 25,
  "presentation": 24,
  "skillLevel": 25,
  "audienceImpact": 23,
  "notes": "Updated notes"
}
```

**Description:** Update an existing score (only by the judge who submitted it)

**Response:**
```json
{
  "success": true,
  "message": "Score updated successfully",
  "data": {
    "scoreId": "score_id",
    "criteria": {
      "creativity": 25,
      "presentation": 24,
      "skillLevel": 25,
      "audienceImpact": 23
    },
    "totalScore": 97,
    "updatedAt": "2026-04-07T11:00:00Z"
  }
}
```

---

### 6. Get Judge Scoreboard
**Endpoint:** `GET /api/judges/scoreboard`  
**Access:** Private (Judge, Admin)  
**Query Parameters:**
- `category` (optional) - Filter rankings by category

**Description:** Get personal scoreboard ranked by the current judge's scores

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "scoreId": "score_id",
      "contestantId": "contestant_id",
      "name": "Amandi Perera",
      "category": "Singing",
      "photo": "https://...",
      "totalScore": 96,
      "criteria": {
        "creativity": 25,
        "presentation": 24,
        "skillLevel": 24,
        "audienceImpact": 23
      },
      "submittedAt": "2026-04-07T10:30:00Z"
    }
  ],
  "count": 12
}
```

---

### 7. Get Overall Scoreboard
**Endpoint:** `GET /api/judges/overall-scoreboard`  
**Access:** Private (Any authenticated user)  
**Query Parameters:**
- `round` (optional) - Filter by round (qualifier, semi-final, final)
- `category` (optional) - Filter by talent category

**Description:** Get overall rankings based on average scores from all judges

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "contestantId": "contestant_id",
      "name": "Amandi Perera",
      "category": "Singing",
      "photo": "https://...",
      "averageScore": 87.50,
      "judgeCount": 5,
      "criteria": {
        "creativity": 22.50,
        "presentation": 23.00,
        "skillLevel": 21.50,
        "audienceImpact": 20.50
      }
    }
  ],
  "count": 50
}
```

---

### 8. Get Judge Progress
**Endpoint:** `GET /api/judges/progress`  
**Access:** Private (Judge, Admin)  
**Description:** Get the judge's scoring progress statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalContestants": 50,
    "scoredContestants": 12,
    "pendingContestants": 38,
    "progressPercentage": "24.00",
    "byCategory": [
      {
        "_id": "Singing",
        "count": 4,
        "averageScore": 88.25
      },
      {
        "_id": "Dancing",
        "count": 3,
        "averageScore": 85.67
      }
    ]
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "All scoring criteria are required"
}
```

### 401 Unauthorized
```json
{
  "message": "Not authorized, token failed"
}
```

### 403 Forbidden
```json
{
  "message": "Role judge is not authorized to access this resource"
}
```

### 404 Not Found
```json
{
  "message": "Contestant not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error submitting score",
  "error": "Error details"
}
```

---

## Integration Steps

1. **Import JudgeScore Model** in any file that needs to reference judge scores
2. **Update User Role Enum** to include 'judge' (already done)
3. **Create Judge Accounts** via admin panel with role: 'judge'
4. **Frontend Integration** - See integration guide below

---

## Frontend Integration Example

See `JUDGE_PANEL_INTEGRATION.md` for complete frontend integration instructions.
