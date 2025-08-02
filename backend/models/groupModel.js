const pool = require('../config/database');

class GroupModel {
  static async createGroup(groupData) {
    const { name, description, creator_id } = groupData;
    
    const query = `
      INSERT INTO "groups" (name, description, creator_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    try {
      const result = await pool.query(query, [name, description, creator_id]);
      const group = result.rows[0];
      
      // Add creator as admin member
      await this.addUserToGroup(group.id, creator_id, 'admin');
      
      return group;
    } catch (error) {
      throw error;
    }
  }

  static async getUserGroups(userId) {
    const query = `
      SELECT g.*, ug.role, u.first_name as creator_name, u.last_name as creator_last_name
      FROM "groups" g
      JOIN user_groups ug ON g.id = ug.group_id
      JOIN users u ON g.creator_id = u.id
      WHERE ug.user_id = $1
      ORDER BY g.created_at DESC
    `;
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async getGroupById(groupId, userId) {
    const query = `
      SELECT g.*, ug.role, u.first_name as creator_name, u.last_name as creator_last_name
      FROM "groups" g
      JOIN user_groups ug ON g.id = ug.group_id
      JOIN users u ON g.creator_id = u.id
      WHERE g.id = $1 AND ug.user_id = $2
    `;
    
    try {
      const result = await pool.query(query, [groupId, userId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getGroupMembers(groupId) {
    const query = `
      SELECT u.id, u.first_name, u.last_name, u.email, ug.role, ug.joined_at
      FROM user_groups ug
      JOIN users u ON ug.user_id = u.id
      WHERE ug.group_id = $1
      ORDER BY ug.joined_at ASC
    `;
    
    try {
      const result = await pool.query(query, [groupId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async addUserToGroup(groupId, userId, role = 'member') {
    // First check if user is already in the group
    const checkQuery = `SELECT * FROM user_groups WHERE group_id = $1 AND user_id = $2`;
    const checkResult = await pool.query(checkQuery, [groupId, userId]);
    
    if (checkResult.rows.length > 0) {
      throw new Error('User is already a member of this group');
    }
    
    const query = `
      INSERT INTO user_groups (group_id, user_id, role)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    try {
      const result = await pool.query(query, [groupId, userId, role]);
      
      // Add user to all existing meetings in this group
      await this.addUserToExistingMeetings(groupId, userId);
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async addUserToExistingMeetings(groupId, userId) {
    try {
      // Get all meetings for this group
      const meetingsQuery = `SELECT id, creator_id FROM meetings WHERE group_id = $1`;
      const meetingsResult = await pool.query(meetingsQuery, [groupId]);
      const meetings = meetingsResult.rows;
      
      // Add user as participant to each meeting
      for (const meeting of meetings) {
        // Check if user is already a participant
        const participantCheckQuery = `SELECT * FROM meeting_participants WHERE meeting_id = $1 AND user_id = $2`;
        const participantCheckResult = await pool.query(participantCheckQuery, [meeting.id, userId]);
        
        if (participantCheckResult.rows.length === 0) {
          // User is not a participant, add them
          const status = meeting.creator_id === userId ? 'accepted' : 'pending';
          const addParticipantQuery = `
            INSERT INTO meeting_participants (meeting_id, user_id, status)
            VALUES ($1, $2, $3)
          `;
          await pool.query(addParticipantQuery, [meeting.id, userId, status]);
        }
      }
    } catch (error) {
      // Log error but don't throw - we don't want to fail adding user to group
      // just because adding to meetings failed
      console.error('Error adding user to existing meetings:', error);
    }
  }

  static async removeUserFromGroup(groupId, userId) {
    const query = `DELETE FROM user_groups WHERE group_id = $1 AND user_id = $2 RETURNING *`;
    
    try {
      const result = await pool.query(query, [groupId, userId]);
      
      // Remove user from all meetings in this group
      await this.removeUserFromGroupMeetings(groupId, userId);
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async removeUserFromGroupMeetings(groupId, userId) {
    try {
      // Get all meetings for this group
      const meetingsQuery = `SELECT id FROM meetings WHERE group_id = $1`;
      const meetingsResult = await pool.query(meetingsQuery, [groupId]);
      const meetings = meetingsResult.rows;
      
      // Remove user as participant from each meeting
      for (const meeting of meetings) {
        const removeParticipantQuery = `DELETE FROM meeting_participants WHERE meeting_id = $1 AND user_id = $2`;
        await pool.query(removeParticipantQuery, [meeting.id, userId]);
      }
    } catch (error) {
      // Log error but don't throw - we don't want to fail removing user from group
      // just because removing from meetings failed
      console.error('Error removing user from group meetings:', error);
    }
  }

  static async updateGroup(groupId, updates) {
    const { name, description } = updates;
    
    const query = `
      UPDATE "groups"
      SET name = $1, description = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    
    try {
      const result = await pool.query(query, [name, description, groupId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async deleteGroup(groupId) {
    const query = `DELETE FROM "groups" WHERE id = $1 RETURNING *`;
    
    try {
      const result = await pool.query(query, [groupId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = GroupModel; 