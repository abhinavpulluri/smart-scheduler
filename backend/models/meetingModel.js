const pool = require('../config/database');

class MeetingModel {
  static async createMeeting(meetingData) {
    const { group_id, title, description, start_time, end_time, location, creator_id } = meetingData;
    
    const query = `
      INSERT INTO meetings (group_id, title, description, start_time, end_time, location, creator_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [group_id, title, description, start_time, end_time, location, creator_id];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getGroupMeetings(groupId, userId) {
    const query = `
      SELECT 
        m.*,
        g.name as group_name,
        u.first_name as creator_name,
        u.last_name as creator_last_name,
        mp.status as participation_status
      FROM meetings m
      JOIN "groups" g ON m.group_id = g.id
      LEFT JOIN users u ON m.creator_id = u.id
      LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id AND mp.user_id = $2
      WHERE m.group_id = $1
      ORDER BY m.start_time ASC
    `;
    
    try {
      const result = await pool.query(query, [groupId, userId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async getMeetingById(meetingId, userId) {
    const query = `
      SELECT 
        m.*,
        g.name as group_name,
        u.first_name as creator_name,
        u.last_name as creator_last_name,
        mp.status as participation_status
      FROM meetings m
      JOIN "groups" g ON m.group_id = g.id
      LEFT JOIN users u ON m.creator_id = u.id
      LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id AND mp.user_id = $2
      WHERE m.id = $1
    `;
    
    try {
      const result = await pool.query(query, [meetingId, userId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async updateMeeting(meetingId, updates) {
    const { title, description, start_time, end_time, location, status } = updates;
    
    const query = `
      UPDATE meetings
      SET title = $1, description = $2, start_time = $3, end_time = $4, location = $5, status = $6, updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `;
    
    const values = [title, description, start_time, end_time, location, status, meetingId];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async deleteMeeting(meetingId) {
    const query = `DELETE FROM meetings WHERE id = $1 RETURNING *`;
    
    try {
      const result = await pool.query(query, [meetingId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async addParticipant(meetingId, userId, status = 'pending') {
    const query = `
      INSERT INTO meeting_participants (meeting_id, user_id, status)
      VALUES ($1, $2, $3)
      ON CONFLICT (meeting_id, user_id) DO UPDATE SET status = $3
      RETURNING *
    `;
    
    try {
      const result = await pool.query(query, [meetingId, userId, status]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async updateParticipantStatus(meetingId, userId, status) {
    const query = `
      UPDATE meeting_participants
      SET status = $1
      WHERE meeting_id = $2 AND user_id = $3
      RETURNING *
    `;
    
    try {
      const result = await pool.query(query, [status, meetingId, userId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async removeParticipant(meetingId, userId) {
    const query = `DELETE FROM meeting_participants WHERE meeting_id = $1 AND user_id = $2 RETURNING *`;
    
    try {
      const result = await pool.query(query, [meetingId, userId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getUserMeetings(userId) {
    const query = `
      SELECT 
        m.*,
        g.name as group_name,
        u.first_name as creator_name,
        u.last_name as creator_last_name,
        COALESCE(mp.status, 'pending') as participation_status
      FROM meetings m
      JOIN "groups" g ON m.group_id = g.id
      LEFT JOIN users u ON m.creator_id = u.id
      LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id AND mp.user_id = $1
      WHERE EXISTS (
        SELECT 1 FROM user_groups ug 
        WHERE ug.group_id = m.group_id AND ug.user_id = $1
      )
      AND (mp.status IS NULL OR mp.status != 'declined')
      ORDER BY m.start_time ASC
    `;
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async getAllUserMeetings(userId) {
    const query = `
      SELECT 
        m.*,
        g.name as group_name,
        u.first_name as creator_name,
        u.last_name as creator_last_name,
        COALESCE(mp.status, 'pending') as participation_status
      FROM meetings m
      JOIN "groups" g ON m.group_id = g.id
      LEFT JOIN users u ON m.creator_id = u.id
      LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id AND mp.user_id = $1
      WHERE EXISTS (
        SELECT 1 FROM user_groups ug 
        WHERE ug.group_id = m.group_id AND ug.user_id = $1
      )
      ORDER BY m.start_time ASC
    `;
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async findAvailableSlots(groupId, startDate, endDate, duration = 60) {
    // Get all group members
    const membersQuery = `
      SELECT user_id FROM user_groups WHERE group_id = $1
    `;
    
    const membersResult = await pool.query(membersQuery, [groupId]);
    const memberIds = membersResult.rows.map(row => row.user_id);
    
    if (memberIds.length === 0) {
      return [];
    }
    
    // Get busy times for all group members
    const busyQuery = `
      SELECT user_id, start_time, end_time
      FROM events
      WHERE user_id = ANY($1) AND is_busy = true 
        AND start_time >= $2 AND end_time <= $3
      ORDER BY start_time ASC
    `;
    
    const busyResult = await pool.query(busyQuery, [memberIds, startDate, endDate]);
    const busyTimes = busyResult.rows;
    
    // Simple algorithm to find available slots
    // This is a basic implementation - in production you'd want more sophisticated logic
    const availableSlots = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Check each hour in the date range
    for (let time = new Date(start); time < end; time.setHours(time.getHours() + 1)) {
      const slotStart = new Date(time);
      const slotEnd = new Date(time.getTime() + duration * 60 * 1000);
      
      // Check if this slot conflicts with any busy times
      const hasConflict = busyTimes.some(busy => {
        const busyStart = new Date(busy.start_time);
        const busyEnd = new Date(busy.end_time);
        return (slotStart < busyEnd && slotEnd > busyStart);
      });
      
      if (!hasConflict) {
        availableSlots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString()
        });
      }
    }
    
    return availableSlots;
  }
}

module.exports = MeetingModel; 