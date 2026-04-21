const express = require('express');
const cors = require('cors');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Allowed frontend origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS not allowed for origin: ${origin}`));
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', require('./routes/auth.Routes'));
app.use('/api/contestants', require('./routes/contestant.Routes'));
app.use('/api/votes', require('./routes/vote.Routes'));
app.use('/api/settings', require('./routes/settings.Routes'));
app.use('/api/judges', require('./routes/judge.Routes'));
app.use('/api/scores', require('./routes/judgeScore.Routes'));

// Root
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SLIIT Got Talent 2026 - Judge Scoring Dashboard Backend',
    version: '1.0.0',
    status: 'running',
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// 404 + Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;