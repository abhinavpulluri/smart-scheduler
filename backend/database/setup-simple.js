require('dotenv').config();
const pool = require('../config/database');

async function setupDatabase() {
  try {
    console.log('🗄️ Setting up database tables...');
    
    // Create users table
    console.log('Creating users table...');
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create groups table
    console.log('Creating groups table...');
    await pool.query(`
      CREATE TABLE "groups" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create user_groups table
    console.log('Creating user_groups table...');
    await pool.query(`
      CREATE TABLE user_groups (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        group_id INTEGER REFERENCES "groups"(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, group_id)
      );
    `);
    
    // Create events table
    console.log('Creating events table...');
    await pool.query(`
      CREATE TABLE events (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        location VARCHAR(255),
        is_busy BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create meetings table
    console.log('Creating meetings table...');
    await pool.query(`
      CREATE TABLE meetings (
        id SERIAL PRIMARY KEY,
        group_id INTEGER REFERENCES "groups"(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        location VARCHAR(255),
        created_by INTEGER REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create meeting_participants table
    console.log('Creating meeting_participants table...');
    await pool.query(`
      CREATE TABLE meeting_participants (
        id SERIAL PRIMARY KEY,
        meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(meeting_id, user_id)
      );
    `);
    
    console.log('All database tables created successfully!');
    
  } catch (error) {
    console.error('Error setting up database:', error.message);
  } finally {
    await pool.end();
  }
}

setupDatabase();