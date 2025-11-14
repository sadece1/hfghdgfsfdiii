-- Grader Parts Marketplace Database Schema
-- MySQL/MariaDB Compatible

-- Create database
CREATE DATABASE IF NOT EXISTS grader_marketplace;
USE grader_marketplace;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url VARCHAR(255),
    role ENUM('user', 'admin') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Graders table
CREATE TABLE IF NOT EXISTS graders (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    brand VARCHAR(50),
    model VARCHAR(50),
    price DECIMAL(12,2) NOT NULL,
    year INT,
    operating_hours INT,
    fuel VARCHAR(50),
    transmission VARCHAR(50),
    location VARCHAR(100),
    seller_type VARCHAR(50),
    images JSON,
    description TEXT,
    technical_specs JSON,
    features JSON,
    safety JSON,
    is_new BOOLEAN DEFAULT TRUE,
    is_sold BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    listing_date DATE,
    stock_country ENUM('EU', 'Kenya', 'US') DEFAULT 'EU',
    user_id VARCHAR(36),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Parts table
CREATE TABLE IF NOT EXISTS parts (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    part_number VARCHAR(100) NOT NULL,
    compatible_models JSON,
    images JSON,
    description TEXT,
    specifications JSON,
    is_new BOOLEAN DEFAULT TRUE,
    is_sold BOOLEAN DEFAULT FALSE,
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    listing_date DATE,
    stock_country ENUM('EU', 'Kenya', 'US') DEFAULT 'EU',
    user_id VARCHAR(36),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    grader_id VARCHAR(36),
    part_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (grader_id) REFERENCES graders(id) ON DELETE CASCADE,
    FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE,
    CHECK ((grader_id IS NOT NULL AND part_id IS NULL) OR (grader_id IS NULL AND part_id IS NOT NULL))
);

-- Homepage slider table
CREATE TABLE IF NOT EXISTS homepage_slider (
    id VARCHAR(36) PRIMARY KEY,
    type ENUM('grader', 'part') NOT NULL,
    grader_id VARCHAR(36),
    part_id VARCHAR(36),
    order_index INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (grader_id) REFERENCES graders(id) ON DELETE CASCADE,
    FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE,
    CHECK ((grader_id IS NOT NULL AND part_id IS NULL) OR (grader_id IS NULL AND part_id IS NOT NULL))
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(200),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales locations table (for map)
CREATE TABLE IF NOT EXISTS sales_locations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    x_coordinate DECIMAL(5,2) NOT NULL,
    y_coordinate DECIMAL(5,2) NOT NULL,
    products JSON,
    contact VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_graders_brand ON graders(brand);
CREATE INDEX idx_graders_price ON graders(price);
CREATE INDEX idx_graders_is_sold ON graders(is_sold);
CREATE INDEX idx_graders_is_featured ON graders(is_featured);
CREATE INDEX idx_graders_stock_country ON graders(stock_country);
CREATE INDEX idx_graders_created_at ON graders(created_at);

CREATE INDEX idx_parts_brand ON parts(brand);
CREATE INDEX idx_parts_category ON parts(category);
CREATE INDEX idx_parts_price ON parts(price);
CREATE INDEX idx_parts_is_sold ON parts(is_sold);
CREATE INDEX idx_parts_stock_quantity ON parts(stock_quantity);
CREATE INDEX idx_parts_stock_country ON parts(stock_country);
CREATE INDEX idx_parts_created_at ON parts(created_at);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_grader_id ON favorites(grader_id);
CREATE INDEX idx_favorites_part_id ON favorites(part_id);

CREATE INDEX idx_homepage_slider_order ON homepage_slider(order_index);
CREATE INDEX idx_homepage_slider_is_active ON homepage_slider(is_active);

CREATE INDEX idx_contact_messages_is_read ON contact_messages(is_read);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at);

-- Enhanced Security Database Schema for Grader Marketplace
-- MySQL/MariaDB Compatible with comprehensive security measures

-- Create database with security settings
CREATE DATABASE IF NOT EXISTS grader_marketplace 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE grader_marketplace;

-- Users table with enhanced security
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url VARCHAR(255),
    role ENUM('user', 'admin') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(32),
    failed_login_attempts INT DEFAULT 0,
    last_failed_login TIMESTAMP NULL,
    account_locked_until TIMESTAMP NULL,
    last_login TIMESTAMP NULL,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Security constraints
    CONSTRAINT chk_username_length CHECK (CHAR_LENGTH(username) >= 3 AND CHAR_LENGTH(username) <= 30),
    CONSTRAINT chk_email_format CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_phone_format CHECK (phone IS NULL OR phone REGEXP '^[+]?[0-9]{10,15}$'),
    CONSTRAINT chk_failed_attempts CHECK (failed_login_attempts >= 0 AND failed_login_attempts <= 10)
);

-- User sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_token (session_token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

-- Login attempts tracking for brute force protection
CREATE TABLE IF NOT EXISTS login_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(254) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(100),
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_email_ip (email, ip_address),
    INDEX idx_attempted_at (attempted_at),
    INDEX idx_ip_address (ip_address)
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

-- Email verification tokens
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id)
);

-- Graders table with security enhancements
CREATE TABLE IF NOT EXISTS graders (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    brand VARCHAR(50),
    model VARCHAR(50),
    price DECIMAL(12,2) NOT NULL,
    year INT,
    operating_hours INT,
    fuel VARCHAR(50),
    transmission VARCHAR(50),
    location VARCHAR(100),
    seller_type VARCHAR(50),
    images JSON,
    description TEXT,
    technical_specs JSON,
    features JSON,
    safety JSON,
    is_new BOOLEAN DEFAULT TRUE,
    is_sold BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    listing_date DATE,
    stock_country ENUM('EU', 'Kenya', 'US') DEFAULT 'EU',
    user_id VARCHAR(36),
    
    -- Security constraints
    CONSTRAINT chk_year_range CHECK (year IS NULL OR (year >= 1900 AND year <= YEAR(CURRENT_DATE) + 2)),
    CONSTRAINT chk_price_positive CHECK (price > 0),
    CONSTRAINT chk_title_length CHECK (CHAR_LENGTH(title) >= 5 AND CHAR_LENGTH(title) <= 200),
    CONSTRAINT chk_operating_hours CHECK (operating_hours IS NULL OR operating_hours >= 0),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_brand_model (brand, model),
    INDEX idx_price (price),
    INDEX idx_year (year),
    INDEX idx_is_featured (is_featured),
    INDEX idx_is_sold (is_sold),
    INDEX idx_stock_country (stock_country),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- Parts table with enhanced security
CREATE TABLE IF NOT EXISTS parts (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    part_number VARCHAR(100) NOT NULL,
    compatible_models JSON,
    images JSON,
    description TEXT,
    specifications JSON,
    is_new BOOLEAN DEFAULT TRUE,
    is_sold BOOLEAN DEFAULT FALSE,
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    listing_date DATE,
    stock_country ENUM('EU', 'Kenya', 'US') DEFAULT 'EU',
    user_id VARCHAR(36),
    
    -- Security constraints
    CONSTRAINT chk_price_positive_parts CHECK (price > 0),
    CONSTRAINT chk_stock_quantity CHECK (stock_quantity >= 0),
    CONSTRAINT chk_title_length_parts CHECK (CHAR_LENGTH(title) >= 5 AND CHAR_LENGTH(title) <= 200),
    CONSTRAINT chk_part_number_length CHECK (CHAR_LENGTH(part_number) >= 3 AND CHAR_LENGTH(part_number) <= 100),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_brand_category (brand, category),
    INDEX idx_price_parts (price),
    INDEX idx_part_number (part_number),
    INDEX idx_is_new (is_new),
    INDEX idx_is_sold_parts (is_sold),
    INDEX idx_stock_country_parts (stock_country),
    INDEX idx_stock_quantity (stock_quantity),
    INDEX idx_user_id_parts (user_id),
    INDEX idx_created_at_parts (created_at)
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    grader_id VARCHAR(36),
    part_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (grader_id) REFERENCES graders(id) ON DELETE CASCADE,
    FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE,
    CHECK ((grader_id IS NOT NULL AND part_id IS NULL) OR (grader_id IS NULL AND part_id IS NOT NULL)),
    INDEX idx_user_id_favorites (user_id),
    INDEX idx_grader_id (grader_id),
    INDEX idx_part_id (part_id)
);

-- Homepage slider table
CREATE TABLE IF NOT EXISTS homepage_slider (
    id VARCHAR(36) PRIMARY KEY,
    type ENUM('grader', 'part') NOT NULL,
    grader_id VARCHAR(36),
    part_id VARCHAR(36),
    order_index INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (grader_id) REFERENCES graders(id) ON DELETE CASCADE,
    FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE,
    CHECK ((grader_id IS NOT NULL AND part_id IS NULL) OR (grader_id IS NULL AND part_id IS NOT NULL)),
    INDEX idx_order_index (order_index),
    INDEX idx_is_active (is_active)
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(200),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_name_length CHECK (CHAR_LENGTH(name) >= 2 AND CHAR_LENGTH(name) <= 100),
    CONSTRAINT chk_email_format_contact CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_phone_format_contact CHECK (phone IS NULL OR phone REGEXP '^[+]?[0-9]{10,15}$'),
    
    INDEX idx_is_read (is_read),
    INDEX idx_created_at_contact (created_at)
);

-- Sales locations table (for map)
CREATE TABLE IF NOT EXISTS sales_locations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    x_coordinate DECIMAL(5,2) NOT NULL,
    y_coordinate DECIMAL(5,2) NOT NULL,
    products JSON,
    contact VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_coordinates CHECK (x_coordinate >= 0 AND x_coordinate <= 100 AND y_coordinate >= 0 AND y_coordinate <= 100),
    INDEX idx_coordinates (x_coordinate, y_coordinate)
);

-- Audit log table for security monitoring
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(36),
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id_audit (user_id),
    INDEX idx_action (action),
    INDEX idx_resource (resource_type, resource_id),
    INDEX idx_created_at_audit (created_at),
    INDEX idx_ip_address (ip_address)
);

-- Security events table for monitoring
CREATE TABLE IF NOT EXISTS security_events (
    id VARCHAR(36) PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    description TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_id VARCHAR(36),
    user_agent TEXT,
    additional_data JSON,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP NULL,
    resolved_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_event_type (event_type),
    INDEX idx_severity (severity),
    INDEX idx_ip_address_security (ip_address),
    INDEX idx_user_id_security (user_id),
    INDEX idx_resolved (resolved),
    INDEX idx_created_at_security (created_at)
);

-- Rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
    id VARCHAR(36) PRIMARY KEY,
    identifier VARCHAR(100) NOT NULL, -- IP address or user ID
    endpoint VARCHAR(100) NOT NULL,
    request_count INT DEFAULT 1,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    blocked_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_rate_limit (identifier, endpoint, window_start),
    INDEX idx_identifier (identifier),
    INDEX idx_endpoint (endpoint),
    INDEX idx_window_start (window_start),
    INDEX idx_blocked_until (blocked_until)
);

-- Create security views
CREATE VIEW user_security_summary AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.is_active,
    u.email_verified,
    u.two_factor_enabled,
    u.failed_login_attempts,
    u.account_locked_until,
    u.last_login,
    COUNT(la.id) as total_login_attempts,
    COUNT(CASE WHEN la.success = FALSE THEN 1 END) as failed_attempts_count,
    MAX(la.attempted_at) as last_attempt
FROM users u
LEFT JOIN login_attempts la ON u.email = la.email
GROUP BY u.id;

-- Create stored procedures for security operations
DELIMITER //

-- Procedure to clean up expired sessions
CREATE PROCEDURE CleanupExpiredSessions()
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
    DELETE FROM password_reset_tokens WHERE expires_at < NOW();
    DELETE FROM email_verification_tokens WHERE expires_at < NOW();
    DELETE FROM rate_limits WHERE window_start < DATE_SUB(NOW(), INTERVAL 1 HOUR);
END //

-- Procedure to lock user account after failed attempts
CREATE PROCEDURE LockUserAccount(IN user_email VARCHAR(254))
BEGIN
    UPDATE users 
    SET account_locked_until = DATE_ADD(NOW(), INTERVAL 30 MINUTE),
        failed_login_attempts = failed_login_attempts + 1,
        last_failed_login = NOW()
    WHERE email = user_email;
END //

-- Procedure to unlock user account
CREATE PROCEDURE UnlockUserAccount(IN user_email VARCHAR(254))
BEGIN
    UPDATE users 
    SET account_locked_until = NULL,
        failed_login_attempts = 0,
        last_failed_login = NULL
    WHERE email = user_email;
END //

DELIMITER ;

-- Create triggers for audit logging
DELIMITER //

CREATE TRIGGER users_audit_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, ip_address, details)
    VALUES (UUID(), NEW.id, 'USER_CREATED', 'user', NEW.id, NULL, JSON_OBJECT('username', NEW.username, 'email', NEW.email));
END //

CREATE TRIGGER users_audit_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, ip_address, details)
    VALUES (UUID(), NEW.id, 'USER_UPDATED', 'user', NEW.id, NULL, JSON_OBJECT('changes', JSON_OBJECT('username', OLD.username != NEW.username, 'email', OLD.email != NEW.email, 'is_active', OLD.is_active != NEW.is_active)));
END //

DELIMITER ;

-- Insert sample data with security considerations
INSERT INTO users (id, username, email, password_hash, full_name, role, is_active, email_verified) VALUES
('admin-001', 'admin', 'admin@grader-marketplace.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin', TRUE, TRUE),
('user-001', 'testuser', 'user@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test User', 'user', TRUE, TRUE);

-- Sample graders
INSERT INTO graders (id, title, brand, model, price, year, operating_hours, fuel, transmission, location, seller_type, images, description, technical_specs, features, safety, is_new, is_sold, listing_date, stock_country, user_id) VALUES
('grader-001', 'Caterpillar 160M Motor Grader', 'Cat', '160M', 450000.00, 2020, 2500, 'Diesel', 'Automatic', 'Nairobi, Kenya', 'Galeriden', '["/rsm/Grader_2.jpg", "/rsm/Grader02.jpg"]', 'Excellent condition Caterpillar 160M motor grader. Well maintained with full service history.', '{"engine": "Caterpillar C7 ACERT", "power": "186 kW", "torque": "950 Nm", "bladeWidth": "3.7m", "operatingWeight": "18,500 kg", "fuelConsumption": "25 L/h"}', '["Air Conditioning", "GPS Ready", "Blade Float", "Ripper"]', '["ROPS/FOPS", "Emergency Stop", "Fire Suppression"]', TRUE, FALSE, '2024-01-15', 'Kenya', 'admin-001'),
('grader-002', 'Komatsu GD655-7 Motor Grader', 'Komatsu', 'GD655-7', 380000.00, 2019, 3200, 'Diesel', 'Manual', 'Mombasa, Kenya', 'Sahibinden', '["/rsm/Grader_2.jpg"]', 'Komatsu GD655-7 motor grader in good working condition.', '{"engine": "Komatsu SAA6D125E-5", "power": "179 kW", "torque": "920 Nm", "bladeWidth": "3.7m", "operatingWeight": "17,800 kg", "fuelConsumption": "23 L/h"}', '["Air Conditioning", "Blade Float", "Ripper"]', '["ROPS/FOPS", "Emergency Stop"]', FALSE, FALSE, '2024-01-20', 'Kenya', 'user-001');

-- Sample parts
INSERT INTO parts (id, title, brand, category, price, part_number, compatible_models, images, description, specifications, is_new, is_sold, stock_quantity, listing_date, stock_country, user_id) VALUES
('part-001', 'Caterpillar Blade Edge', 'Cat', 'Blade Parts', 15000.00, '1R-0742', '["140M", "160M", "120M"]', '["/rsm/grader-icon.png"]', 'Original Caterpillar blade edge for motor graders. High quality hardened steel construction.', '{"material": "Hardened Steel", "dimensions": "3.7m x 0.3m x 0.05m", "weight": "45 kg", "warranty": "12 months"}', TRUE, FALSE, 25, '2024-01-10', 'EU', 'admin-001'),
('part-002', 'Komatsu Hydraulic Pump', 'Komatsu', 'Hydraulic Parts', 8500.00, 'GD655-7-HP', '["GD655-7", "GD675-7"]', '["/rsm/grader-icon.png"]', 'Komatsu hydraulic pump for motor graders. Rebuilt and tested.', '{"material": "Cast Iron", "dimensions": "0.4m x 0.3m x 0.2m", "weight": "25 kg", "warranty": "6 months"}', FALSE, FALSE, 15, '2024-01-12', 'US', 'user-001');

-- Sample homepage slider items
INSERT INTO homepage_slider (id, type, grader_id, part_id, order_index, is_active) VALUES
('slider-001', 'grader', 'grader-001', NULL, 1, TRUE),
('slider-002', 'part', NULL, 'part-001', 2, TRUE);

-- Sample sales locations
INSERT INTO sales_locations (id, name, x_coordinate, y_coordinate, products, contact) VALUES
('location-001', 'Caterpillar 160M', 45.00, 55.00, '["Caterpillar 160M", "Komatsu GD655-7", "Blade Parts"]', '+254 700 001 001'),
('location-002', 'Caterpillar 160M', 65.00, 75.00, '["Caterpillar 160M", "Port Machinery"]', '+254 700 001 002'),
('location-003', 'Komatsu GD655-7', 25.00, 50.00, '["Caterpillar Parts", "Komatsu Components"]', '+254 700 001 003'),
('location-004', 'Caterpillar 140M', 35.00, 45.00, '["Caterpillar 140M", "Hydraulic Pumps"]', '+254 700 001 004'),
('location-005', 'Motor Graders', 30.00, 40.00, '["Motor Graders", "Spare Parts"]', '+254 700 001 005');
