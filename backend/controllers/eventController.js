const EventModel = require('../models/eventModel');
const GroupModel = require('../models/groupModel');

class EventController {
  static async createEvent(req, res) {
    try {
      const { title, description, start_time, end_time, location, is_busy } = req.body;
      const user_id = req.user.id;

      const eventData = {
        user_id,
        title,
        description,
        start_time,
        end_time,
        location,
        is_busy: is_busy !== undefined ? is_busy : true
      };

      const event = await EventModel.createEvent(eventData);
      res.status(201).json({ message: 'Event created successfully', event });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ message: 'Failed to create event', error: error.message });
    }
  }

  static async getUserEvents(req, res) {
    try {
      const user_id = req.user.id;
      const { start_date, end_date } = req.query;

      const events = await EventModel.getUserEvents(user_id, start_date, end_date);
      res.json({ events });
    } catch (error) {
      console.error('Error fetching user events:', error);
      res.status(500).json({ message: 'Failed to fetch events', error: error.message });
    }
  }

  static async getGroupEvents(req, res) {
    try {
      const { groupId } = req.params;
      const user_id = req.user.id;
      const { start_date, end_date } = req.query;

      // Verify user is member of the group
      const group = await GroupModel.getGroupById(groupId, user_id);
      if (!group) {
        return res.status(403).json({ message: 'You are not a member of this group' });
      }

      // Get all group members
      const members = await GroupModel.getGroupMembers(groupId);
      const memberIds = members.map(member => member.id);

      // Get events for all group members
      const events = await EventModel.getMultipleUsersEvents(memberIds, start_date, end_date);
      
      res.json({ 
        events,
        group: {
          id: group.id,
          name: group.name,
          description: group.description
        },
        members: members.length
      });
    } catch (error) {
      console.error('Error fetching group events:', error);
      res.status(500).json({ message: 'Failed to fetch group events', error: error.message });
    }
  }

  static async getEventById(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const event = await EventModel.getEventById(id, user_id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      res.json({ event });
    } catch (error) {
      console.error('Error fetching event:', error);
      res.status(500).json({ message: 'Failed to fetch event', error: error.message });
    }
  }

  static async updateEvent(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;
      const updates = req.body;

      const event = await EventModel.updateEvent(id, user_id, updates);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      res.json({ message: 'Event updated successfully', event });
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ message: 'Failed to update event', error: error.message });
    }
  }

  static async deleteEvent(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const event = await EventModel.deleteEvent(id, user_id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ message: 'Failed to delete event', error: error.message });
    }
  }

  static async getUserBusyTimes(req, res) {
    try {
      const user_id = req.user.id;
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({ message: 'Start date and end date are required' });
      }

      const busyTimes = await EventModel.getUserBusyTimes(user_id, start_date, end_date);
      res.json({ busyTimes });
    } catch (error) {
      console.error('Error fetching busy times:', error);
      res.status(500).json({ message: 'Failed to fetch busy times', error: error.message });
    }
  }

  static async getGroupBusyTimes(req, res) {
    try {
      const { groupId } = req.params;
      const user_id = req.user.id;
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({ message: 'Start date and end date are required' });
      }

      // Verify user is member of the group
      const group = await GroupModel.getGroupById(groupId, user_id);
      if (!group) {
        return res.status(403).json({ message: 'You are not a member of this group' });
      }

      // Get all group members
      const members = await GroupModel.getGroupMembers(groupId);
      const memberIds = members.map(member => member.id);

      // Get busy times for all group members
      const busyTimes = await EventModel.getMultipleUsersBusyTimes(memberIds, start_date, end_date);
      
      res.json({ 
        busyTimes,
        group: {
          id: group.id,
          name: group.name,
          description: group.description
        },
        members: members.length
      });
    } catch (error) {
      console.error('Error fetching group busy times:', error);
      res.status(500).json({ message: 'Failed to fetch group busy times', error: error.message });
    }
  }
}

module.exports = EventController; 