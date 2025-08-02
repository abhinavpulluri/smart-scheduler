const pool = require('../config/database');

class EventModel {
  static async createEvent(eventData) {
    const { user_id, title, description, start_time, end_time, location, is_busy } = eventData;
    
    const query = `
      INSERT INTO events (user_id, title, description, start_time, end_time, location, is_busy)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [user_id, title, description, start_time, end_time, location, is_busy];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getUserEvents(userId, startDate = null, endDate = null) {
    let query = `
      SELECT e.*, u.first_name, u.last_name, u.email
      FROM events e
      JOIN users u ON e.user_id = u.id
      WHERE e.user_id = $1
    `;
    
    const values = [userId];
    
    if (startDate && endDate) {
      query += ` AND e.start_time >= $2 AND e.end_time <= $3`;
      values.push(startDate, endDate);
    }
    
    query += ` ORDER BY e.start_time ASC`;
    
    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async getMultipleUsersEvents(userIds, startDate = null, endDate = null) {
    if (!userIds || userIds.length === 0) {
      return [];
    }

    let query = `
      SELECT e.*, u.first_name, u.last_name, u.email
      FROM events e
      JOIN users u ON e.user_id = u.id
      WHERE e.user_id = ANY($1)
    `;
    
    const values = [userIds];
    
    if (startDate && endDate) {
      query += ` AND e.start_time >= $2 AND e.end_time <= $3`;
      values.push(startDate, endDate);
    }
    
    query += ` ORDER BY e.start_time ASC`;
    
    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async getEventById(eventId, userId) {
    const query = `
      SELECT e.*, u.first_name, u.last_name, u.email
      FROM events e
      JOIN users u ON e.user_id = u.id
      WHERE e.id = $1 AND e.user_id = $2
    `;
    
    try {
      const result = await pool.query(query, [eventId, userId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async updateEvent(eventId, userId, updates) {
    const { title, description, start_time, end_time, location, is_busy } = updates;
    
    const query = `
      UPDATE events
      SET title = $1, description = $2, start_time = $3, end_time = $4, location = $5, is_busy = $6, updated_at = NOW()
      WHERE id = $7 AND user_id = $8
      RETURNING *
    `;
    
    const values = [title, description, start_time, end_time, location, is_busy, eventId, userId];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async deleteEvent(eventId, userId) {
    const query = `DELETE FROM events WHERE id = $1 AND user_id = $2 RETURNING *`;
    
    try {
      const result = await pool.query(query, [eventId, userId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getUserBusyTimes(userId, startDate, endDate) {
    const query = `
      SELECT start_time, end_time, title
      FROM events
      WHERE user_id = $1 AND is_busy = true AND start_time >= $2 AND end_time <= $3
      ORDER BY start_time ASC
    `;
    
    try {
      const result = await pool.query(query, [userId, startDate, endDate]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async getMultipleUsersBusyTimes(userIds, startDate, endDate) {
    if (!userIds || userIds.length === 0) {
      return [];
    }

    const query = `
      SELECT e.start_time, e.end_time, e.title, u.first_name, u.last_name, u.id as user_id
      FROM events e
      JOIN users u ON e.user_id = u.id
      WHERE e.user_id = ANY($1) AND e.is_busy = true AND e.start_time >= $2 AND e.end_time <= $3
      ORDER BY e.start_time ASC
    `;
    
    try {
      const result = await pool.query(query, [userIds, startDate, endDate]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = EventModel; 