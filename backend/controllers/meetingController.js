const MeetingModel = require('../models/meetingModel');
const GroupModel = require('../models/groupModel');

class MeetingController {
  static async createMeeting(req, res) {
    try {
      const { group_id, title, description, start_time, end_time, location } = req.body;
      const creator_id = req.user.id;

      // Validate input
      if (!group_id || !title || !start_time || !end_time) {
        return res.status(400).json({ 
          message: 'Group ID, title, start time, and end time are required' 
        });
      }

      // Verify user is member of the group
      const group = await GroupModel.getGroupById(group_id, creator_id);
      if (!group) {
        return res.status(403).json({ 
          message: 'You are not a member of this group' 
        });
      }

      // Validate time logic
      if (new Date(start_time) >= new Date(end_time)) {
        return res.status(400).json({ 
          message: 'End time must be after start time' 
        });
      }

      // Create meeting
      const meeting = await MeetingModel.createMeeting({
        group_id,
        title,
        description,
        start_time,
        end_time,
        location,
        creator_id
      });

      // Get all group members
      const groupMembers = await GroupModel.getGroupMembers(group_id);
      
      // Add all group members as participants
      for (const member of groupMembers) {
        const status = member.id === creator_id ? 'accepted' : 'pending';
        try {
          await MeetingModel.addParticipant(meeting.id, member.id, status);
        } catch (error) {
          console.error('Failed to add participant:', member.id, error);
          // Continue with other members even if one fails
        }
      }

      res.status(201).json({
        message: 'Meeting created successfully',
        meeting
      });

    } catch (error) {
      console.error('Create meeting error:', error);
      res.status(500).json({ 
        message: 'Internal server error' 
      });
    }
  }

  static async getGroupMeetings(req, res) {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;

      // Verify user is member of the group
      const group = await GroupModel.getGroupById(groupId, userId);
      if (!group) {
        return res.status(403).json({ 
          message: 'You are not a member of this group' 
        });
      }

      const meetings = await MeetingModel.getGroupMeetings(groupId, userId);
      res.json({ meetings });

    } catch (error) {
      console.error('Get group meetings error:', error);
      res.status(500).json({ 
        message: 'Internal server error' 
      });
    }
  }

  static async getMeetingById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const meeting = await MeetingModel.getMeetingById(id, userId);
      if (!meeting) {
        return res.status(404).json({ 
          message: 'Meeting not found' 
        });
      }

      res.json({ meeting });

    } catch (error) {
      console.error('Get meeting error:', error);
      res.status(500).json({ 
        message: 'Internal server error' 
      });
    }
  }

  static async updateMeeting(req, res) {
    try {
      const { id } = req.params;
      const { title, description, start_time, end_time, location, status } = req.body;
      const userId = req.user.id;

      // Check if meeting exists and user is creator
      const existingMeeting = await MeetingModel.getMeetingById(id, userId);
      if (!existingMeeting) {
        return res.status(404).json({ 
          message: 'Meeting not found' 
        });
      }

      if (existingMeeting.creator_id !== userId) {
        return res.status(403).json({ 
          message: 'Only the meeting creator can update the meeting' 
        });
      }

      // Validate time logic if times are being updated
      if (start_time && end_time && new Date(start_time) >= new Date(end_time)) {
        return res.status(400).json({ 
          message: 'End time must be after start time' 
        });
      }

      // Update meeting
      const updatedMeeting = await MeetingModel.updateMeeting(id, {
        title: title || existingMeeting.title,
        description: description || existingMeeting.description,
        start_time: start_time || existingMeeting.start_time,
        end_time: end_time || existingMeeting.end_time,
        location: location || existingMeeting.location,
        status: status || existingMeeting.status
      });

      res.json({
        message: 'Meeting updated successfully',
        meeting: updatedMeeting
      });

    } catch (error) {
      console.error('Update meeting error:', error);
      res.status(500).json({ 
        message: 'Internal server error' 
      });
    }
  }

  static async deleteMeeting(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if meeting exists and user is creator
      const meeting = await MeetingModel.getMeetingById(id, userId);
      if (!meeting) {
        return res.status(404).json({ 
          message: 'Meeting not found' 
        });
      }

      if (meeting.creator_id !== userId) {
        return res.status(403).json({ 
          message: 'Only the meeting creator can delete the meeting' 
        });
      }

      await MeetingModel.deleteMeeting(id);
      res.json({
        message: 'Meeting deleted successfully'
      });

    } catch (error) {
      console.error('Delete meeting error:', error);
      res.status(500).json({ 
        message: 'Internal server error' 
      });
    }
  }

  static async updateParticipantStatus(req, res) {
    try {
      const { meetingId } = req.params;
      const { status } = req.body;
      const userId = req.user.id;

      // Check if meeting exists
      const meeting = await MeetingModel.getMeetingById(meetingId, userId);
      if (!meeting) {
        return res.status(404).json({ 
          message: 'Meeting not found' 
        });
      }

      // Update participant status
      const result = await MeetingModel.updateParticipantStatus(meetingId, userId, status);

      res.json({
        message: 'Participation status updated successfully',
        updatedStatus: status
      });

    } catch (error) {
      console.error('Update participant status error:', error);
      res.status(500).json({ 
        message: 'Internal server error' 
      });
    }
  }

  static async getUserMeetings(req, res) {
    try {
      const userId = req.user.id;
      
      const meetings = await MeetingModel.getUserMeetings(userId);
      
      res.json({ meetings });

    } catch (error) {
      console.error('Get user meetings error:', error);
      res.status(500).json({ 
        message: 'Internal server error' 
      });
    }
  }

  static async getAllUserMeetings(req, res) {
    try {
      const userId = req.user.id;
      
      const meetings = await MeetingModel.getAllUserMeetings(userId);
      
      res.json({ meetings });

    } catch (error) {
      console.error('Get all user meetings error:', error);
      res.status(500).json({ 
        message: 'Internal server error' 
      });
    }
  }

  static async findAvailableSlots(req, res) {
    try {
      const { groupId } = req.params;
      const { start_date, end_date, duration = 60 } = req.query;
      const userId = req.user.id;

      // Verify user is member of the group
      const group = await GroupModel.getGroupById(groupId, userId);
      if (!group) {
        return res.status(403).json({ 
          message: 'You are not a member of this group' 
        });
      }

      if (!start_date || !end_date) {
        return res.status(400).json({ 
          message: 'Start date and end date are required' 
        });
      }

      const availableSlots = await MeetingModel.findAvailableSlots(
        groupId, 
        start_date, 
        end_date, 
        parseInt(duration)
      );

      res.json({ 
        availableSlots,
        group: {
          id: group.id,
          name: group.name
        }
      });

    } catch (error) {
      console.error('Find available slots error:', error);
      res.status(500).json({ 
        message: 'Internal server error' 
      });
    }
  }
}

module.exports = MeetingController; 