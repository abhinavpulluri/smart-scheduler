require('dotenv').config();

const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    try {
        console.log('Setting up database tables...');

        //Read the schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        //Execute the schema
        await pool.query(schema);

        console.log('Database tables created successfully');
        console.log('Tables created: users, groups, user_groups, events, meetings, meeting_participants');

    } catch (error) {
        console.error('Error setting up database:', error.message);
    } finally {
        await pool.end();
    }
}

setupDatabase();