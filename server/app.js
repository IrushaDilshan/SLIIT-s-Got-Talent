const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.Routes'));
app.use('/api/contestants', require('./routes/contestant.Routes'));
app.use('/api/votes', require('./routes/vote.Routes'));

// Basic route
app.get('/', (req, res) => {
    res.send('SLIIT\'s Got Talent API is running...');
});

module.exports = app;
