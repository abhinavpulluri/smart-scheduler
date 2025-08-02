const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class UserModel {
  // Create a new user
  static async createUser(userData) {
    const { email, password, first_name, last_name } = userData;
    
    // Hash the password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, first_name, last_name, created_at
    `;
    
    const values = [email, password_hash, first_name, last_name];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }
  
  // Find user by ID
  static async findById(id) {
    const query = 'SELECT id, email, first_name, last_name, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = UserModel;