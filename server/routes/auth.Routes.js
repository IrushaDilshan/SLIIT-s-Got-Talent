/**
 * Authentication Routes
 * Handles judge login, registration, and profile
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.Controller');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Public routes (no auth required)
 */

// POST /api/auth/login - Request OTP with email
router.post('/login', authController.login);

// POST /api/auth/verify - Verify OTP and get token
router.post('/verify', authController.verify);

// POST /api/auth/register - Register new judge (can be used for admin to create judges)
router.post('/register', authController.register);

/**
 * Protected routes (auth required)
 */

// GET /api/auth/profile - Get logged-in judge's profile
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
