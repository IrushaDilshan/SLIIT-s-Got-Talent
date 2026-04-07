const express = require('express');
const cors = require('cors');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth.Routes'));
app.use('/api/contestants', require('./routes/contestant.Routes'));
app.use('/api/votes', require('./routes/vote.Routes'));
app.use('/api/settings', require('./routes/settings.Routes'));
app.use('/api/judges', require('./routes/judge.Routes'));

// Basic route
app.get('/', (req, res) => {
    res.send('SLIIT\'s Got Talent API is running...');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date(),
        uptime: process.uptime(),
    });
});

// 404 handler (must be before error handler)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
