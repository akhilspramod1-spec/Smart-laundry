const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getStats,
  updateStatus,
  deleteBooking
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/', protect, getMyBookings);
router.get('/all', protect, adminOnly, getAllBookings);
router.get('/stats', protect, adminOnly, getStats);
router.put('/:id/status', protect, adminOnly, updateStatus);
router.delete('/:id', protect, adminOnly, deleteBooking);

module.exports = router;
