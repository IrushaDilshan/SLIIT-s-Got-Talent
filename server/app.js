/**
 * Express Application Configuration
 * Configures middleware, routes, and error handling
 */

const express = require('express');
const cors = require('cors');

const app = express();

/**
 * Middleware Configuration
 */

// CORS - Allow frontend to communicate with backend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse form data

/**
 * Routes Configuration
 */

// Authentication routes
// POST   /api/auth/login    - Judge login
// POST   /api/auth/register - Register new judge
// GET    /api/auth/profile  - Get logged-in judge profile
app.use('/api/auth', require('./routes/auth.Routes'));

// Contestant routes (view contestants for scoring)
// GET    /api/contestants        - Get all contestants
// GET    /api/contestants/:id    - Get single contestant
// POST   /api/contestants        - Create contestant (admin)
// PUT    /api/contestants/:id    - Update contestant (admin)
// DELETE /api/contestants/:id    - Delete contestant (admin)
app.use('/api/contestants', require('./routes/contestant.Routes'));

// Judge Score routes
// POST   /api/scores/submit      - Submit judge score
// GET    /api/scores/my-scores   - Get my submitted scores
// GET    /api/scores/leaderboard - Get leaderboard
// GET    /api/scores/:scoreId    - Get single score
app.use('/api/scores', require('./routes/judgeScore.Routes'));

/**
 * Health Check Endpoint
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SLIIT Got Talent 2026 - Judge Scoring Dashboard Backend',
    version: '1.0.0',
    status: 'running',
  });
});

/**
 * 404 Handler - Route not found
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found.',
    path: req.originalUrl,
  });
});

/**
 * Error Handling Middleware
 * Catches all errors and returns appropriate response
 */
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred.';

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

module.exports = app;
