-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, 
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Groups table
CREATE TABLE "groups" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Groups (many-to-many relationship)
CREATE TABLE user_groups (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    group_id INTEGER_REFERENCES groups(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- 'admin', 'member'
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    UNIQUE(user_id, group_id)
);

-- Events table (personal calendar events)
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER_REFERENCES users(id) on DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location VARCHAR(255),
    is_busy BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meetings table (group meetings)
CREATE TABLE meetings (
    id SERIAL PRIMARY_KEY,
    group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location VARCHAR(255),
    created_by INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'cancelled', 'completed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meeting Participants 
CREATE TABLE meeting_participants (
    id SERIAL PRIMARY KEY,
    meeting_id INTEGER_REFERENCES meetings(id) ON DELETE CASCADE,
    user_id INTEGER_REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(meeting_id, user_id)
);
