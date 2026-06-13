const express = require('express');
const router = express.Router();
const { loginUser, getMe, seedDatabase } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Temporary route to seed the live database
router.get('/seed', seedDatabase);

module.exports = router;
