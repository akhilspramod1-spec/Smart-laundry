const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  getPendingStudents,
  verifyStudent
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/pending-students', protect, adminOnly, getPendingStudents);
router.post('/verify-student', protect, adminOnly, verifyStudent);

module.exports = router;
