# Frontend Integration Guide - Judge Scoring Dashboard

**Quick reference for integrating the React frontend with the Judge Scoring Backend**

---

## 🎯 API Base URL

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

---

## 🔐 Authentication Setup in React

### 1. Create API Client (apiClient.js)

```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// Add token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login'; // Redirect to login
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 📋 API Calls for Your Frontend

### Login Page - POST /auth/login

```javascript
import apiClient from '../services/apiClient';

async function handleLogin(email, password) {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });

    // Save token
    localStorage.setItem('token', response.data.token);
    
    // Save user info
    localStorage.setItem('user', JSON.stringify(response.data.user));

    // Navigate to dashboard
    navigate('/dashboard');

    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Login failed';
    console.error('Login error:', message);
    throw new Error(message);
  }
}
```

---

### Judge Profile - GET /auth/profile

```javascript
async function fetchJudgeProfile() {
  try {
    const response = await apiClient.get('/auth/profile');
    
    return response.data.user;
    // {
    //   id: "507f1f...",
    //   name: "John Smith",
    //   email: "john.smith@judging.com",
    //   role: "judge",
    //   panel: "Panel A",
    //   photo: "https://...",
    //   isActive: true
    // }
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    throw error;
  }
}
```

---

### Get All Contestants - GET /contestants

```javascript
async function fetchContestants(round = 'Preliminary') {
  try {
    const response = await apiClient.get('/contestants', {
      params: {
        round: round,     // 'Preliminary', 'Semi-Final', 'Final'
        status: 'pending', // optional: 'pending', 'performed', 'disqualified'
        limit: 100,        // optional: default 100
      },
    });

    return response.data.contestants;
    // [
    //   {
    //     id: "507f1f77bcf86cd799439020",
    //     name: "Emma Williams",
    //     category: "Dance",
    //     round: "Preliminary",
    //     performanceTitle: "Contemporary Flow",
    //     photo: "https://...",
    //     status: "pending",
    //     timeSlot: "09:00 AM"
    //   },
    //   ...
    // ]
  } catch (error) {
    console.error('Failed to fetch contestants:', error);
    throw error;
  }
}
```

---

### Get Single Contestant - GET /contestants/:id

```javascript
async function fetchContestantDetails(contestantId) {
  try {
    const response = await apiClient.get(`/contestants/${contestantId}`);

    return response.data.contestant;
    // {
    //   id: "507f1f77bcf86cd799439020",
    //   name: "Emma Williams",
    //   category: "Dance",
    //   round: "Preliminary",
    //   performanceTitle: "Contemporary Flow",
    //   photo: "https://...",
    //   status: "pending",
    //   timeSlot: "09:00 AM",
    //   regNumber: "SLIIT-001",
    //   contactNumber: "+94701234567"
    // }
  } catch (error) {
    console.error('Failed to fetch contestant:', error);
    throw error;
  }
}
```

---

### Submit Judge Score - POST /scores/submit 🎯

**Most Important Endpoint**

```javascript
async function submitJudgeScore(contestantId, scores) {
  try {
    const response = await apiClient.post('/scores/submit', {
      contestantId: contestantId,           // MongoDB ID of contestant
      creativity: scores.creativity,         // 0-25 (integer)
      presentation: scores.presentation,     // 0-25 (integer)
      skillLevel: scores.skillLevel,         // 0-25 (integer)
      audienceImpact: scores.audienceImpact, // 0-25 (integer)
    });

    // Success response
    console.log('Score submitted!');
    console.log('Total Score:', response.data.score.totalScore);
    // {
    //   totalScore: 86,
    //   submittedAt: "2026-04-06T11:30:00.000Z"
    // }

    return response.data.score;
  } catch (error) {
    const message = error.response?.data?.message;
    
    if (message?.includes('already submitted')) {
      console.error('You already scored this contestant in this round!');
    } else if (message?.includes('criteria')) {
      console.error('Please fill all 4 criteria!');
    } else {
      console.error('Error submitting score:', message);
    }
    
    throw error;
  }
}
```

**Your Frontend Form Should:**
```javascript
// Example scoring form component

function ScoringForm({ contestantId, onSubmit }) {
  const [scores, setScores] = useState({
    creativity: undefined,
    presentation: undefined,
    skillLevel: undefined,
    audienceImpact: undefined,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate before sending
    if (!scores.creativity || !scores.presentation || 
        !scores.skillLevel || !scores.audienceImpact) {
      alert('Please fill all criteria!');
      return;
    }

    // Check ranges
    for (let key in scores) {
      if (scores[key] < 0 || scores[key] > 25 || !Number.isInteger(scores[key])) {
        alert(`${key} must be integer between 0 and 25`);
        return;
      }
    }

    // Send to backend
    await submitJudgeScore(contestantId, scores);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="number" 
        min="0" 
        max="25"
        value={scores.creativity || ''} 
        onChange={(e) => setScores({...scores, creativity: parseInt(e.target.value)})}
        placeholder="Creativity (0-25)"
      />
      <input 
        type="number" 
        min="0" 
        max="25"
        value={scores.presentation || ''} 
        onChange={(e) => setScores({...scores, presentation: parseInt(e.target.value)})}
        placeholder="Presentation (0-25)"
      />
      <input 
        type="number" 
        min="0" 
        max="25"
        value={scores.skillLevel || ''} 
        onChange={(e) => setScores({...scores, skillLevel: parseInt(e.target.value)})}
        placeholder="Skill Level (0-25)"
      />
      <input 
        type="number" 
        min="0" 
        max="25"
        value={scores.audienceImpact || ''} 
        onChange={(e) => setScores({...scores, audienceImpact: parseInt(e.target.value)})}
        placeholder="Audience Impact (0-25)"
      />
      <button type="submit">Submit Score</button>
    </form>
  );
}
```

---

### Get Judge's Submitted Scores - GET /scores/my-scores

```javascript
async function fetchMyScores(round = 'Preliminary') {
  try {
    const response = await apiClient.get('/scores/my-scores', {
      params: {
        round: round,  // optional
        limit: 50,     // optional
      },
    });

    return response.data.scores;
    // [
    //   {
    //     id: "507f1f77bcf86cd799439030",
    //     contestant: {
    //       name: "Emma Williams",
    //       category: "Dance",
    //       performanceTitle: "Contemporary Flow",
    //       photo: "https://..."
    //     },
    //     round: "Preliminary",
    //     creativity: 20,
    //     presentation: 22,
    //     skillLevel: 23,
    //     audienceImpact: 21,
    //     totalScore: 86,
    //     submittedAt: "2026-04-06T11:30:00.000Z"
    //   },
    //   ...
    // ]
  } catch (error) {
    console.error('Failed to fetch my scores:', error);
    throw error;
  }
}
```

---

### Get Leaderboard - GET /scores/leaderboard

```javascript
async function fetchLeaderboard(round = 'Preliminary') {
  try {
    const response = await apiClient.get('/scores/leaderboard', {
      params: {
        round: round,
        limit: 50,
      },
    });

    return response.data.leaderboard;
    // [
    //   {
    //     rank: 1,
    //     contestantId: "507f1f77bcf86cd799439020",
    //     contestant: {
    //       name: "Emma Williams",
    //       category: "Dance",
    //       performanceTitle: "Contemporary Flow",
    //       photo: "https://..."
    //     },
    //     averageScore: 85.67,
    //     totalScore: 257,
    //     judgeCount: 3
    //   },
    //   {
    //     rank: 2,
    //     ...
    //   }
    // ]
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    throw error;
  }
}
```

---

## 🔄 Typical User Flow

```
1. User opens React app
   ↓
2. Check localStorage for token
   ├─ If no token: Show LoginPage
   └─ If token exists: Show DashboardPage
   ↓
3. LoginPage
   └─ User enters email + password
   └─ Call: POST /auth/login
   └─ Save token to localStorage
   └─ Navigate to Dashboard
   ↓
4. DashboardPage  
   └─ Call: GET /auth/profile (optional, for showing judge info)
   └─ Display contestant list
   ↓
5. ContestantListPage
   └─ Call: GET /contestants?round=Preliminary
   └─ Display contestants with photos
   └─ Judge clicks on contestant to score
   ↓
6. ScoringPage (Your JudgePanelDashboard)
   └─ Show contestant details
   └─ Display 4 input fields for scores (0-25)
   └─ Judge enters: creativity, presentation, skillLevel, audienceImpact
   └─ Judge clicks "Submit Score"
   └─ Call: POST /scores/submit
   ├─ If error (duplicate): Show "Already scored this contestant"
   ├─ If error (missing criteria): Show "Please complete all criteria"
   └─ If success: Show "Score submitted! Total: 86/100"
   ↓
7. LeaderboardPage
   └─ Call: GET /scores/leaderboard?round=Preliminary
   └─ Display contestants ranked by average score
```

---

## ⚠️ Error Handling

Always handle these error cases:

```javascript
async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const response = await apiClient[method.toLowerCase()](endpoint, data);
    return response.data;
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    // Handle different error scenarios
    if (status === 400) {
      // Bad request - validation error
      console.error('Validation error:', message);
      alert(message);
    } else if (status === 401) {
      // Unauthorized - token expired or missing
      console.error('Not authenticated');
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (status === 403) {
      // Forbidden - not enough permissions
      console.error('Access denied:', message);
      alert('You do not have permission for this action');
    } else if (status === 404) {
      // Not found
      console.error('Resource not found:', message);
      alert('Contestant or score not found');
    } else if (status === 500) {
      // Server error
      console.error('Server error');
      alert('Server error. Please try again later.');
    } else {
      // Network error
      console.error('Network error:', error.message);
      alert('Network error. Please check your connection.');
    }

    throw error;
  }
}
```

---

## 🎨 Common Frontend Patterns

### Protected Route Component

```javascript
function ProtectedRoute({ Component }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  return <Component />;
}

// Usage
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route 
    path="/dashboard" 
    element={<ProtectedRoute Component={DashboardPage} />} 
  />
</Routes>
```

### Loading States

```javascript
function Dashboard() {
  const [contestants, setContestants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchContestants()
      .then(setContestants)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading contestants...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {contestants.map(c => (
        <div key={c.id}>{c.name}</div>
      ))}
    </div>
  );
}
```

---

## 📍 Environment Variables

Create `.env` in React root:

```
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
```

Use in React:

```javascript
const API_URL = process.env.REACT_APP_API_BASE_URL;
```

---

## 🔗 Sample Components You Need

Based on your existing JudgePanelDashboard:

```
JudgePanelDashboard/
├── Login
│   └── LoginForm.jsx         (handle POST /auth/login)
├── Dashboard
│   ├── JudgeProfile.jsx      (GET /auth/profile)
│   ├── ContestantList.jsx    (GET /contestants)
│   ├── ScoringForm.jsx       (POST /scores/submit) ← CRITICAL
│   ├── MyScores.jsx          (GET /scores/my-scores)
│   └── Leaderboard.jsx       (GET /scores/leaderboard)
└── services/
    └── apiClient.js          (axios instance with token handling)
```

---

## 📊 Testing Checklist

- [ ] Can login with john.smith@judging.com
- [ ] Token stored in localStorage
- [ ] Can load and display contestant list
- [ ] Can submit score with all criteria
- [ ] Cannot submit duplicate score (shows error)
- [ ] Cannot submit incomplete score (shows error)
- [ ] Total score calculated correctly by backend
- [ ] Can view my submitted scores
- [ ] Can view leaderboard (sorted by average score)
- [ ] Score forms cleared after submission
- [ ] Logout removes token from localStorage
- [ ] Cannot access protected pages without token

---

## 🚀 Running Both Services

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Backend running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd web-app
npm run dev
# Frontend running on http://localhost:3000
```

Both services communicate via API calls.

---

## 💡 Quick Tips

1. **Use Postman First** - Test backend endpoints before frontend
2. **Check Console** - Browser DevTools for API errors
3. **Check Network Tab** - See actual API requests/responses
4. **localStorage** - Check if token is being saved/retrieved
5. **Interceptors** - Verify token is added to all requests
6. **Error Messages** - Backend provides specific error messages
7. **Total Calculation** - Backend does it, don't calculate in React

---

## 📚 Related Documentation

- [README.md](./README.md) - Project overview
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Full API reference
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Backend setup

---

**Ready to integrate!** Copy the API calls above and update your React components. 🚀
