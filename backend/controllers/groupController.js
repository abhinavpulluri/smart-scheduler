const GroupModel = require('../models/groupModel');
const UserModel = require('../models/userModel');

class GroupController {
  static async createGroup(req, res) {
    try {
      const { name, description } = req.body;
      const creator_id = req.user.id;

      if (!name) {
        return res.status(400).json({ message: 'Group name is required' });
      }

      const group = await GroupModel.createGroup({
        name,
        description,
        creator_id
      });

      res.status(201).json({ message: 'Group created successfully', group });
    } catch (error) {
      console.error('Error creating group:', error);
      res.status(500).json({ message: 'Failed to create group', error: error.message });
    }
  }

  static async getUserGroups(req, res) {
    try {
      const user_id = req.user.id;
      const groups = await GroupModel.getUserGroups(user_id);
      res.json({ groups });
    } catch (error) {
      console.error('Error fetching user groups:', error);
      res.status(500).json({ message: 'Failed to fetch groups', error: error.message });
    }
  }

  static async getGroupById(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const group = await GroupModel.getGroupById(id, user_id);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }

      res.json({ group });
    } catch (error) {
      console.error('Error fetching group:', error);
      res.status(500).json({ message: 'Failed to fetch group', error: error.message });
    }
  }

  static async getGroupMembers(req, res) {
    try {
      const { groupId } = req.params;
      const user_id = req.user.id;

      // Verify user is member of the group
      const group = await GroupModel.getGroupById(groupId, user_id);
      if (!group) {
        return res.status(403).json({ message: 'You are not a member of this group' });
      }

      const members = await GroupModel.getGroupMembers(groupId);
      res.json({ members });
    } catch (error) {
      console.error('Error fetching group members:', error);
      res.status(500).json({ message: 'Failed to fetch group members', error: error.message });
    }
  }

  static async addUserToGroup(req, res) {
    try {
      const { groupId } = req.params;
      const { email, role = 'member' } = req.body;
      const user_id = req.user.id;

      // Verify user is admin of the group
      const group = await GroupModel.getGroupById(groupId, user_id);
      if (!group || group.role !== 'admin') {
        return res.status(403).json({ message: 'Only group admins can add members' });
      }

      // Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Add user to group
      await GroupModel.addUserToGroup(groupId, user.id, role);

      res.json({ message: 'User added to group successfully' });
    } catch (error) {
      console.error('Error adding user to group:', error);
      if (error.message === 'User is already a member of this group') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Failed to add user to group', error: error.message });
    }
  }

  static async removeUserFromGroup(req, res) {
    try {
      const { groupId, userId } = req.params;
      const current_user_id = req.user.id;

      // Verify current user is admin of the group
      const group = await GroupModel.getGroupById(groupId, current_user_id);
      if (!group || group.role !== 'admin') {
        return res.status(403).json({ message: 'Only group admins can remove members' });
      }

      // Remove user from group
      await GroupModel.removeUserFromGroup(groupId, userId);

      res.json({ message: 'User removed from group successfully' });
    } catch (error) {
      console.error('Error removing user from group:', error);
      res.status(500).json({ message: 'Failed to remove user from group', error: error.message });
    }
  }

  static async updateGroup(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const user_id = req.user.id;

      // Verify user is admin of the group
      const group = await GroupModel.getGroupById(id, user_id);
      if (!group || group.role !== 'admin') {
        return res.status(403).json({ message: 'Only group admins can update the group' });
      }

      const updatedGroup = await GroupModel.updateGroup(id, { name, description });
      res.json({ message: 'Group updated successfully', group: updatedGroup });
    } catch (error) {
      console.error('Error updating group:', error);
      res.status(500).json({ message: 'Failed to update group', error: error.message });
    }
  }

  static async deleteGroup(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      // Verify user is admin of the group
      const group = await GroupModel.getGroupById(id, user_id);
      if (!group || group.role !== 'admin') {
        return res.status(403).json({ message: 'Only group admins can delete the group' });
      }

      await GroupModel.deleteGroup(id);
      res.json({ message: 'Group deleted successfully' });
    } catch (error) {
      console.error('Error deleting group:', error);
      res.status(500).json({ message: 'Failed to delete group', error: error.message });
    }
  }
}

module.exports = GroupController; 