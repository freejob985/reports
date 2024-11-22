-- إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS tasks_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE tasks_system;

-- جدول المهام
CREATE TABLE tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- جدول التقارير
CREATE TABLE reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
); 