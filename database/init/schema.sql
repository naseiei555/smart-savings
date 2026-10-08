-- Smart Savings Companion Database Schema
-- Character set: utf8mb4, Collation: utf8mb4_unicode_ci

SET NAMES utf8mb4;
SET time_zone = '+07:00';

-- 1. users: ข้อมูลผู้ใช้งานระบบ
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    notify_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. savings_goals: เป้าหมายการออมเงิน
CREATE TABLE IF NOT EXISTS savings_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    target_amount DECIMAL(12,2) NOT NULL,
    initial_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    income DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    expense DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    saving_capacity DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    start_date DATE NOT NULL,
    target_date DATE NOT NULL,
    status ENUM('active', 'completed') NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_goals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_goals_user_id (user_id),
    INDEX idx_goals_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. savings_transactions: บันทึกรายการฝาก/ออมเงิน
CREATE TABLE IF NOT EXISTS savings_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    goal_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    saving_date DATE NOT NULL,
    note VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transactions_goal FOREIGN KEY (goal_id) REFERENCES savings_goals(id) ON DELETE CASCADE,
    INDEX idx_tx_goal_id (goal_id),
    INDEX idx_tx_saving_date (saving_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. ai_analyses: ผลการวิเคราะห์เป้าหมายและคำแนะนำจาก AI
CREATE TABLE IF NOT EXISTS ai_analyses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    goal_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    risk_level VARCHAR(50) NOT NULL,
    summary TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ai_analyses_goal FOREIGN KEY (goal_id) REFERENCES savings_goals(id) ON DELETE CASCADE,
    INDEX idx_ai_goal_id (goal_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. notifications: การแจ้งเตือนผู้ใช้งานทั้งในแอปและ LINE
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    goal_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    channel ENUM('app', 'line') NOT NULL DEFAULT 'app',
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    notification_date DATE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_goal FOREIGN KEY (goal_id) REFERENCES savings_goals(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_goal_type_channel_date (user_id, goal_id, type, channel, notification_date),
    INDEX idx_notifications_user_date (user_id, notification_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. line_accounts: บัญชี LINE ที่ผูกกับผู้ใช้
CREATE TABLE IF NOT EXISTS line_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    line_user_id VARCHAR(100) NOT NULL UNIQUE,
    is_connected BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_line_accounts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_line_user_id (line_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. line_link_codes: รหัสชั่วคราวสำหรับผูกบัญชี LINE กับระบบ
CREATE TABLE IF NOT EXISTS line_link_codes (
    code VARCHAR(64) PRIMARY KEY,
    user_id INT NOT NULL,
    expires_at DATETIME NOT NULL,
    CONSTRAINT fk_line_link_codes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_link_user_id (user_id),
    INDEX idx_link_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;