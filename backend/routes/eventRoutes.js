const express = require('express');
const EventController = require('../controllers/eventController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Personal events
router.post('/', EventController.createEvent);
router.get('/', EventController.getUserEvents);
router.get('/:id', EventController.getEventById);
router.put('/:id', EventController.updateEvent);
router.delete('/:id', EventController.deleteEvent);
router.get('/busy-times', EventController.getUserBusyTimes);

// Group events
router.get('/group/:groupId', EventController.getGroupEvents);
router.get('/group/:groupId/busy-times', EventController.getGroupBusyTimes);

module.exports = router; 