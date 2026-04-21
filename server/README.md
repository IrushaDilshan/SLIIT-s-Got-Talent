# SLIIT Got Talent 2026 - Judge Scoring Dashboard Backend

**Complete Node.js + Express + MongoDB + Mongoose backend for the Judge Scoring Dashboard**

---

## 📚 Quick Links

- **[Setup Guide](./SETUP_GUIDE.md)** - Complete installation and configuration
- **[API Documentation](./API_DOCUMENTATION.md)** - All endpoints with examples
- **[Postman Collection](./POSTMAN_COLLECTION.json)** - Import for testing

---

## ✨ Features

✅ **Judge Authentication** - JWT-based login with email/password  
✅ **Secure Password Hashing** - bcryptjs for password security  
✅ **Contestant Management** - View and manage contestants for scoring  
✅ **Judge Score Submission** - Submit scores with 4 criteria (0-25 each)  
✅ **Duplicate Prevention** - Judge cannot submit multiple times for same contestant  
✅ **Backend Validation** - All criteria required, backend calculates total  
✅ **Leaderboard/Scoreboard** - View contestants ranked by average judge score  
✅ **Role-Based Access** - Judge vs Admin permissions  
✅ **Error Handling** - Comprehensive error responses with HTTP status codes  
✅ **CORS Support** - Configured for React frontend  
✅ **MongoDB Integration** - Mongoose models with validation  

---

## 🏗️ Architecture

### Technology Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Password Security:** bcryptjs
- **Validation:** Custom middleware + Joi

### Project Structure
```
server/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── auth.Controller.js    # Authentication logic
│   ├── contestant.Controller.js  # Contestant management
│   └── judgeScore.Controller.js  # Score & leaderboard
├── middleware/
│   ├── authMiddleware.js     # JWT verification
│   ├── roleMiddleware.js     # Role-based access
│   └── validationMiddleware.js  # Input validation
├── models/
│   ├── User.js               # Judge schema
│   ├── Contestant.js         # Contestant schema
│   └── JudgeScore.js         # Score schema with duplicate prevention
├── routes/
│   ├── auth.Routes.js
│   ├── contestant.Routes.js
│   └── judgeScore.Routes.js
├── scripts/
│   └── seed.js               # Sample data generator
├── app.js                    # Express app config
├── index.js                  # Server entry point
└── package.json              # Dependencies
```

---

## 📋 Database Schemas

### User (Judge)
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String ("judge" or "admin"),
  panel: String,
  photo: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Contestant
```javascript
{
  name: String,
  category: String,
  round: String ("Preliminary", "Semi-Final", "Final"),
  performanceTitle: String,
  photo: String,
  status: String ("pending", "performed", "disqualified"),
  timeSlot: String,
  regNumber: String,
  contactNumber: String,
  createdAt: Date,
  updatedAt: Date
}
```

### JudgeScore
```javascript
{
  judgeId: Reference (User),
  contestantId: Reference (Contestant),
  round: String,
  creativity: Number (0-25),
  presentation: Number (0-25),
  skillLevel: Number (0-25),
  audienceImpact: Number (0-25),
  totalScore: Number (auto-calculated),
  submittedAt: Date,
  
  // Unique index prevents duplicate: (judgeId, contestantId, round)
}
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v14+
- MongoDB (local or Atlas)

### Installation (5 minutes)

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start MongoDB
mongod  # or your preferred method

# Run development server
npm run dev

# In another terminal, seed sample data
npm run seed
```

Server running at `http://localhost:5000`

---

## 📝 API Endpoints Summary

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Judge login |
| POST | `/auth/register` | Register judge (admin) |
| GET | `/auth/profile` | Get judge profile (auth) |

### Contestants
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/contestants` | Get all contestants |
| GET | `/contestants/:id` | Get single contestant |
| POST | `/contestants` | Create contestant (admin) |
| PUT | `/contestants/:id` | Update contestant (admin) |
| DELETE | `/contestants/:id` | Delete contestant (admin) |

### Judge Scores
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/scores/submit` | Submit score (auth) |
| GET | `/scores/my-scores` | Get judge's scores (auth) |
| GET | `/scores/leaderboard` | Get leaderboard |
| GET | `/scores/:id` | Get single score (auth) |

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed request/response examples.

---

## 💻 Frontend Integration

### 1. Install Axios
```bash
npm install axios
```

### 2. Create API Client
```javascript
// src/services/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### 3. Example Requests
```javascript
// Login
const { data } = await apiClient.post('/auth/login', { 
  email, password 
});
localStorage.setItem('token', data.token);

// Get contestants
const { data } = await apiClient.get('/contestants', {
  params: { round: 'Preliminary' }
});

// Submit score
const { data } = await apiClient.post('/scores/submit', {
  contestantId,
  creativity: 20,
  presentation: 22,
  skillLevel: 23,
  audienceImpact: 21
});

// Get leaderboard
const { data } = await apiClient.get('/scores/leaderboard', {
  params: { round: 'Preliminary' }
});
```

---

## 🧪 Testing Endpoints

### Using Postman
1. Import `POSTMAN_COLLECTION.json`
2. Set `{{token}}` variable after login
3. Test each endpoint

### Using cURL
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.smith@judging.com","password":"SecurePass123!"}'

# Get contestants
curl http://localhost:5000/api/contestants

# Submit score (replace TOKEN and IDs)
curl -X POST http://localhost:5000/api/scores/submit \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contestantId":"CONTESTANT_ID",
    "creativity":20,
    "presentation":22,
    "skillLevel":23,
    "audienceImpact":21
  }'
```

---

## 🔐 Business Rules & Validation

### Judge Scoring Rules
1. ✅ All 4 criteria required (creativity, presentation, skillLevel, audienceImpact)
2. ✅ Each criterion must be integer 0-25
3. ✅ Total score = sum of all criteria (calculated by backend)
4. ✅ One score per judge per contestant per round only
5. ✅ Error if duplicate: "You have already submitted a score for this contestant in this round."

### Error Responses
```json
// Missing criteria
{
  "success": false,
  "message": "Please complete all criteria before submitting."
}

// Invalid score range
{
  "success": false,
  "message": "creativity must be between 0 and 25. Received: 30"
}

// Duplicate submission
{
  "success": false,
  "message": "You have already submitted a score for this contestant in this round."
}

// Unauthorized
{
  "success": false,
  "message": "No token provided. Please login."
}
```

---

## 🛠️ Available Scripts

```bash
# Development mode (with nodemon auto-reload)
npm run dev

# Production mode
npm start

# Seed database with sample data
npm run seed
```

---

## 📊 Sample Data

After running `npm run seed`, you get:

**Sample Judges:**
- john.smith@judging.com / SecurePass123!
- sarah.johnson@judging.com / SecurePass123!
- michael.chen@judging.com / SecurePass123!

**Sample Contestants:**
- Emma Williams (Dance)
- Rajesh Kumar (Singing)
- Alex Thompson (Comedy)
- Priya Sharma (Magic)
- Chris Davis (Instrumental)

---

## 🔒 Security Features

- **Password Hashing:** bcryptjs with 10 salt rounds
- **JWT Authentication:** 7-day expiration tokens
- **Secure Headers:** CORS properly configured
- **Input Validation:** All endpoints validate input
- **Role-Based Access:** Judge vs Admin permissions
- **Backend Calculation:** Never trusts frontend scores
- **Duplicate Prevention:** Database unique index on (judgeId, contestantId, round)
- **Rate Limiting:** Can be added with express-rate-limit

---

## 📞 Troubleshooting

### MongoDB Connection Error
```
Error: MongoServerError: connect ECONNREFUSED
```
**Solution:** Start MongoDB (`mongod`) or check MONGO_URI in .env

### Token Expired
```
Error: TokenExpiredError: token expired
```
**Solution:** User must login again. Token valid for 7 days.

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Ensure FRONTEND_URL in .env matches React dev server

### Duplicate Score Error
```
You have already submitted a score for this contestant in this round.
```
**Solution:** Judge cannot score same contestant twice. By design.

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for more troubleshooting.

---

## 📈 Performance Considerations

- MongoDB indexes on frequently queried fields (round, judgeId, contestantId)
- Unique compound index prevents duplicate submissions
- JWT stateless authentication (no session storage)
- Lean queries where relations not needed
- Pagination support (limit parameter)

---

## 🚀 Deployment

### Production Checklist
- [ ] Change JWT_SECRET to strong random string
- [ ] Set NODE_ENV=production
- [ ] Use MongoDB Atlas (not local)
- [ ] Set FRONTEND_URL to production domain
- [ ] Remove console.log statements
- [ ] Enable rate limiting
- [ ] Set up SSL/HTTPS
- [ ] Use environment-specific configs

### Deployment Platforms
- Heroku
- Railway
- AWS Elastic Beanstalk
- Azure App Service
- DigitalOcean
- Google Cloud

---

## 📚 Complete Documentation

For comprehensive details:
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Installation, configuration, MongoDB setup
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - All endpoints with request/response examples
- **Code Comments** - Every file has inline documentation

---

## 📝 Code Quality

Every file includes:
- Clear file descriptions
- JSDoc comments on functions/endpoints
- Inline explanations of complex logic
- Error handling with specific status codes
- Consistent naming conventions
- Proper separation of concerns

---

## 🎯 Key Features for Your Frontend

Your React `JudgePanelDashboard` should:

1. **On Mount:**
   - Check for token in localStorage
   - If no token, redirect to login

2. **Login Page:**
   - POST `/auth/login` with email/password
   - Save token: `localStorage.setItem('token', data.token)`

3. **Judge Profile:**
   - GET `/auth/profile` (requires token)
   - Display judge name, panel, photo

4. **Contestant List:**
   - GET `/contestants?round=Preliminary`
   - Display in card/table format

5. **Scoring Form:**
   - Input 4 criteria (0-25 each)
   - POST `/scores/submit` with all data
   - Show success/error message

6. **Leaderboard:**
   - GET `/scores/leaderboard?round=Preliminary`
   - Display contestants ranked by score

---

## 🔗 Frontend API Calls Reference

```javascript
// Store token after login
localStorage.setItem('token', response.data.token);

// Add token to every request (see apiClient.js)
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}

// API base URL
let baseURL = 'http://localhost:5000/api';

// All endpoints start with /api/
// Examples:
POST   /api/auth/login
GET    /api/auth/profile
GET    /api/contestants
POST   /api/scores/submit
GET    /api/scores/leaderboard
```

---

## 💡 Tips & Best Practices

1. **Always check token expiry** - Implement automatic logout on 401
2. **Handle all errors** - Show user-friendly messages
3. **Cache contestant list** - Don't fetch on every render
4. **Disable submit button** - While request in progress
5. **Show loading states** - Better UX
6. **Validate on frontend** - But always validate on backend too
7. **Use environment variables** - For API URL, don't hardcode
8. **Test all endpoints** - Before merging to production

---

## 📄 License

This project is for SLIIT Got Talent 2026.

---

## 📧 Support

For issues, questions, or contributions:
1. Check the documentation files
2. Review error messages in browser console
3. Check Node.js server terminal output
4. Verify MongoDB is running and connected
5. Ensure token is being sent in Authorization header

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Backend running at http://localhost:5000
- [ ] MongoDB connected
- [ ] Sample data seeded
- [ ] Can login with sample account
- [ ] Can view contestants
- [ ] Can submit score
- [ ] Can view leaderboard
- [ ] React frontend can make API calls
- [ ] Token stored in localStorage
- [ ] Duplicate score prevention works

---

**Backend Version:** 1.0.0  
**Last Updated:** April 6, 2026  
**Status:** Ready for Development ✅
