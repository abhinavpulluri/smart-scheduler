const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema-fixed.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
        console.log('✅ Executed:', statement.substring(0, 50) + '...');
      }
    }
    
    console.log('🎉 Database initialized successfully!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    // Don't throw error - tables might already exist
  }
}

module.exports = { initializeDatabase }; 