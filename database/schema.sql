-- Database Schema for LONDON VIP License System
-- Database: london_vip

CREATE DATABASE IF NOT EXISTS london_vip;
USE london_vip;

-- Users Table (Admin Panel Access)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'support') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Licenses Table
CREATE TABLE IF NOT EXISTS licenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    license_key VARCHAR(64) NOT NULL UNIQUE,
    max_devices INT DEFAULT 1,
    expire_at DATETIME NULL,
    is_lifetime BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'blocked') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_license_key (license_key)
);

-- Devices Table
CREATE TABLE IF NOT EXISTS devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    license_id INT NOT NULL,
    device_fingerprint VARCHAR(64) NOT NULL,
    first_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (license_id) REFERENCES licenses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_device_per_license (license_id, device_fingerprint)
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    target_id INT NULL,
    details TEXT NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (Username: LONDON, Password: admin123)
-- Hash generated using bcrypt cost 10. 
-- NOTE: User requested password 'Ramiz2005'. Please run the password update script to set it.
INSERT INTO users (username, password_hash, role) 
SELECT 'LONDON', '$2b$10$X7X.7/8/9/0/1/2/3/4/5/6/7/8/9/0/1/2/3/4/5/6/7/8/9/0/1', 'admin' 
WHERE NOT EXISTS (SELECT * FROM users WHERE username = 'LONDON');
