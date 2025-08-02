const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected routes
router.get('/me', authenticateToken, AuthController.getProfile);

module.exports = router; 