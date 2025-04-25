const express = require('express');
const router = express.Router();
const { 
  bookAppointment, 
  getUserAppointments,
  getAppointmentById,
  updateAppointmentStatus
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

// All appointment routes are protected
router.use(protect);

// Create a new appointment and get user appointments
router.route('/')
  .post(bookAppointment)
  .get(getUserAppointments);

// Get and update specific appointment
router.route('/:id')
  .get(getAppointmentById)
  .patch(updateAppointmentStatus);

module.exports = router; 