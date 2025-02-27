-- Create Users Table
CREATE TABLE Users (
    userID VARCHAR(50) PRIMARY KEY,  -- Username or unique identifier
    email VARCHAR(100) NOT NULL UNIQUE,
    phoneNumber VARCHAR(15),
    name VARCHAR(100) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Reports Table
CREATE TABLE Reports (
    reportID SERIAL PRIMARY KEY,
    userID VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    location POINT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
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

ALTER TABLE Reports
ADD CONSTRAINT valid_category CHECK (
    category IN ('safety', 'infrastructure', 'wildlife', 'health', 'lost', 'found', 'other')
);

ALTER TABLE Events
ADD CONSTRAINT valid_eventType CHECK (
    eventType IN ('crime', 'accident', 'celebration', 'other')
);