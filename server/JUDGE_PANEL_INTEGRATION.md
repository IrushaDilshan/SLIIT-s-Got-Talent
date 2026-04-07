# Judge Panel Frontend Integration Guide

## Overview
This guide explains how to integrate the Judge Panel API with your React frontend.

---

## 1. API Service Setup

Create a new file `src/services/judgeApi.js`:

```javascript
import apiClient from './apiClient';

export const judgeApi = {
  // Get judge profile
  getProfile: () => apiClient.get('/judges/profile'),

  // Get contestants for judging
  getContestants: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/judges/contestants${queryString ? '?' + queryString : ''}`);
  },

  // Get scores for a specific contestant
  getContestantScores: (contestantId) => 
    apiClient.get(`/judges/scores/${contestantId}`),

  // Submit scores for a contestant
  submitScore: (scoreData) => 
    apiClient.post('/judges/submit-score', scoreData),

  // Update existing score
  updateScore: (scoreId, scoreData) => 
    apiClient.put(`/judges/scores/${scoreId}`, scoreData),

  // Get judge's personal scoreboard
  getScoreboard: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/judges/scoreboard${queryString ? '?' + queryString : ''}`);
  },

  // Get overall scoreboard (average of all judges)
  getOverallScoreboard: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/judges/overall-scoreboard${queryString ? '?' + queryString : ''}`);
  },

  // Get judge progress
  getProgress: () => apiClient.get('/judges/progress'),
};
```

---

## 2. Update JudgePanelDashboard.jsx

Replace the mock data with API calls:

```javascript
import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../components/AuthContext.jsx";
import { judgeApi } from "../services/judgeApi.js";

const JudgePanelDashboard = () => {
  const { user } = useAuth();

  const [contestants, setContestants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeContestantId, setActiveContestantId] = useState(null);
  const [scores, setScores] = useState({});
  const [submittedResults, setSubmittedResults] = useState({});

  const criteria = [
    { key: "creativity", label: "Creativity", helper: "Originality & uniqueness", max: 25 },
    { key: "presentation", label: "Presentation", helper: "Stage presence & delivery", max: 25 },
    { key: "skillLevel", label: "Skill Level", helper: "Technical ability", max: 25 },
    { key: "audienceImpact", label: "Audience Impact", helper: "Engagement & overall response", max: 25 },
  ];

  // Fetch contestants on component mount
  useEffect(() => {
    const fetchContestants = async () => {
      try {
        setLoading(true);
        const response = await judgeApi.getContestants();
        
        // Transform API data to match frontend structure
        const transformedData = response.data.map((contestant, index) => ({
          id: contestant.id,
          name: contestant.name,
          category: contestant.category,
          round: "Semi Final",
          performanceTitle: contestant.description || "Performance",
          photo: contestant.photo,
          status: contestant.hasBeenScored ? "Completed" : "Ready for Review",
          timeSlot: `${String(19 + Math.floor(index / 4)).padStart(2, '0')}:${String((index % 4) * 15).padStart(2, '0')} PM`,
        }));

        setContestants(transformedData);
        if (transformedData.length > 0) {
          setActiveContestantId(transformedData[0].id);
        }
      } catch (err) {
        setError(err.message || "Failed to load contestants");
        setMessage(`❌ Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchContestants();
  }, []);

  const categories = ["All", ...new Set(contestants.map((c) => c.category))];

  const filteredContestants = useMemo(() => {
    return contestants.filter((contestant) => {
      const matchesCategory = selectedCategory === "All" || contestant.category === selectedCategory;
      const matchesSearch =
        contestant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contestant.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contestant.performanceTitle.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [contestants, selectedCategory, searchTerm]);

  const handleScoreChange = (id, field, value) => {
    const score = Math.max(0, Math.min(25, Number(value) || 0));
    setScores((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: score },
    }));
  };

  const calculateJudgeTotal = (id) => {
    const s = scores[id] || {};
    return (s.creativity || 0) + (s.presentation || 0) + (s.skillLevel || 0) + (s.audienceImpact || 0);
  };

  const handleSubmit = async (contestant) => {
    try {
      const judgeTotal = calculateJudgeTotal(contestant.id);
      const scoreData = {
        contestantId: contestant.id,
        creativity: scores[contestant.id]?.creativity || 0,
        presentation: scores[contestant.id]?.presentation || 0,
        skillLevel: scores[contestant.id]?.skillLevel || 0,
        audienceImpact: scores[contestant.id]?.audienceImpact || 0,
      };

      const response = await judgeApi.submitScore(scoreData);

      setSubmittedResults((prev) => ({ 
        ...prev, 
        [contestant.id]: response.data 
      }));

      setMessage(`✅ Score submitted for ${contestant.name}: ${judgeTotal}/100`);

      // Auto-select next contestant
      const currentIndex = filteredContestants.findIndex(c => c.id === contestant.id);
      if (currentIndex < filteredContestants.length - 1) {
        setTimeout(() => setActiveContestantId(filteredContestants[currentIndex + 1].id), 1500);
      }

      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const scoreboard = contestants
    .map((contestant) => {
      const saved = submittedResults[contestant.id];
      return {
        id: contestant.id,
        name: contestant.name,
        photo: contestant.photo,
        judgeScore: saved ? saved.data.totalScore : calculateJudgeTotal(contestant.id),
      };
    })
    .sort((a, b) => b.judgeScore - a.judgeScore);

  const activeContestant = contestants.find((c) => c.id === activeContestantId) || contestants[0];
  const activeTotal = calculateJudgeTotal(activeContestant?.id);
  const isSubmitted = !!submittedResults[activeContestant?.id];

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.main, justifyContent: 'center', alignItems: 'center' }}>
          <p style={{ fontSize: '18px', color: '#fff' }}>Loading contestants...</p>
        </div>
      </div>
    );
  }

  // ... rest of the component remains the same
};

export default JudgePanelDashboard;
```

---

## 3. Create an Admin Panel for Judge Management

Create `src/pages/AdminJudgeManagement.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import { judgeApi } from '../services/judgeApi.js';

const AdminJudgeManagement = () => {
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scoreboard, setScoreboard] = useState([]);

  useEffect(() => {
    // Fetch overall scoreboard
    const fetchScoreboard = async () => {
      try {
        const response = await judgeApi.getOverallScoreboard();
        setScoreboard(response.data);
      } catch (error) {
        console.error('Failed to fetch scoreboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScoreboard();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Judge Panel Results</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Rank</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Contestant</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Category</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Avg Score</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Judges</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Details</th>
          </tr>
        </thead>
        <tbody>
          {scoreboard.map((item, index) => (
            <tr key={item.contestantId} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{index + 1}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.name}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.category}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.averageScore}/100</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.judgeCount}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                Creativity: {item.criteria.creativity} | Presentation: {item.criteria.presentation}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminJudgeManagement;
```

---

## 4. Environment Configuration

Ensure your `.env` file in the web-app has the correct API base URL:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 5. Judge Account Creation

Create a script `server/create_judge.js`:

```javascript
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createJudge = async (email, name) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const judge = await User.create({
      email,
      role: 'judge',
    });

    console.log(`✅ Judge created: ${email}`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating judge:', error.message);
    process.exit(1);
  }
};

// Usage: node create_judge.js judge1@sliit.lk
const email = process.argv[2] || 'judge1@sliit.lk';
createJudge(email);
```

Run it with:
```bash
node create_judge.js judge1@sliit.lk
```

---

## 6. Testing the Backend

### Using cURL:

```bash
# Login as judge
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"judge@sliit.lk","otp":"123456"}'

# Get contestants
curl -X GET http://localhost:5000/api/judges/contestants \
  -H "Authorization: Bearer <token>"

# Submit score
curl -X POST http://localhost:5000/api/judges/submit-score \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "contestantId":"<id>",
    "creativity":24,
    "presentation":23,
    "skillLevel":25,
    "audienceImpact":22
  }'
```

### Using Postman:

1. Create a new collection "Judge Panel"
2. Set up environment variables:
   - `base_url`: http://localhost:5000/api
   - `token`: (set after login)
3. Create requests for each endpoint
4. Use the token in headers for authenticated routes

---

## 7. Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check token validity and ensure it's sent in Authorization header |
| 403 Forbidden | Verify user has 'judge' role |
| Contestant not found | Ensure contestant ID is valid and contestant is approved |
| Already scored | Each judge can only score a contestant once; use PUT to update |
| Database connection error | Check MONGO_URI in .env file |

---

## Summary of Files Created

✅ `/server/models/JudgeScore.js` - Model for storing judge scores  
✅ `/server/controllers/judge.Controller.js` - Judge panel controller  
✅ `/server/routes/judge.Routes.js` - Judge panel routes  
✅ `/server/app.js` - Updated with judge routes  
📝 `/server/JUDGE_PANEL_API.md` - API documentation  
📝 `/web-app/src/services/judgeApi.js` - Frontend API service  

---

## Next Steps

1. Test all endpoints with Postman
2. Integrate `judgeApi` service in frontend components
3. Create admin dashboard to view overall results
4. Set up judge email notifications
5. Add real-time scoreboard updates with WebSockets (optional)
