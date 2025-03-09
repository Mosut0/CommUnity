-- Create Reports Table
CREATE TABLE Reports (
    reportID SERIAL PRIMARY KEY,
    userID UUID NOT NULL,  -- References Supabase's auth.users table
    category VARCHAR(50) NOT NULL,
    description TEXT,
    location POINT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    imageurl TEXT,
    FOREIGN KEY (userID) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create Events Table
CREATE TABLE Events (
    eventID SERIAL PRIMARY KEY,
    reportID INT NOT NULL,
    eventType VARCHAR(50) NOT NULL,
    time TIMESTAMP NOT NULL,
    FOREIGN KEY (reportID) REFERENCES Reports(reportID) ON DELETE CASCADE
);

-- Create Hazards Table
CREATE TABLE Hazards (
    hazardID SERIAL PRIMARY KEY,
    reportID INT NOT NULL,
    hazardType VARCHAR(50) NOT NULL,
    FOREIGN KEY (reportID) REFERENCES Reports(reportID) ON DELETE CASCADE
);

-- Create LostItems Table
CREATE TABLE LostItems (
    lostID SERIAL PRIMARY KEY,
    reportID INT NOT NULL,
    itemType VARCHAR(100) NOT NULL,
    contactInfo VARCHAR(100),
    FOREIGN KEY (reportID) REFERENCES Reports(reportID) ON DELETE CASCADE
);

-- Create FoundItems Table
CREATE TABLE FoundItems (
    foundID SERIAL PRIMARY KEY,
    reportID INT NOT NULL,
    itemType VARCHAR(100) NOT NULL,
    contactInfo VARCHAR(100),
    FOREIGN KEY (reportID) REFERENCES Reports(reportID) ON DELETE CASCADE
);

-- Add Constraints for Valid Categories and Event Types
ALTER TABLE Reports
ADD CONSTRAINT valid_category CHECK (
    category IN ('safety', 'infrastructure', 'wildlife', 'health', 'lost', 'found', 'other', 'event')
);

-- Add column for distance radius in users table
ALTER TABLE auth.users
ADD COLUMN distance_radius INT DEFAULT 20; -- Default distance radius of 20 km