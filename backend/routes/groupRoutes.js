const express = require('express');
const GroupController = require('../controllers/groupController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Group CRUD operations
router.post('/', GroupController.createGroup);
router.get('/', GroupController.getUserGroups);
router.get('/:id', GroupController.getGroupById);
router.put('/:id', GroupController.updateGroup);
router.delete('/:id', GroupController.deleteGroup);

// Group membership operations
router.get('/:groupId/members', GroupController.getGroupMembers);
router.post('/:groupId/members', GroupController.addUserToGroup);
router.delete('/:groupId/members/:userId', GroupController.removeUserFromGroup);

module.exports = router; 