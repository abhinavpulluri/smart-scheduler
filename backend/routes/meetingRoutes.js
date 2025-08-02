const express = require('express');
const MeetingController = require('../controllers/meetingController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Meeting CRUD operations
router.post('/', MeetingController.createMeeting);
router.get('/user', MeetingController.getUserMeetings);
router.get('/user/all', MeetingController.getAllUserMeetings);

// Group meetings
router.get('/group/:groupId', MeetingController.getGroupMeetings);

// Available time slots
router.get('/group/:groupId/available-slots', MeetingController.findAvailableSlots);

// Meeting participation (must come before /:id routes)
router.put('/:meetingId/status', MeetingController.updateParticipantStatus);

// Meeting CRUD operations (parameterized routes last)
router.get('/:id', MeetingController.getMeetingById);
router.put('/:id', MeetingController.updateMeeting);
router.delete('/:id', MeetingController.deleteMeeting);

module.exports = router; 