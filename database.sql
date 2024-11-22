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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    priority INT DEFAULT 0 COMMENT 'أولوية المهمة: 0=عادية, 1=منخفضة, 2=متوسطة, 3=عالية',
    status_type ENUM('بحث', 'ايقاف', 'الغاء', 'تطوير', 'اجتماع', 'تأجيل', 'أولوية') DEFAULT 'بحث',
    parent_id INT NULL COMMENT 'معرف المهمة الأب للمهام الفرعية',
    FOREIGN KEY (parent_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- جدول التقارير
CREATE TABLE reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- إنشاء جدول المهام الفرعية
CREATE TABLE subtasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status BOOLEAN DEFAULT FALSE,
    priority INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
); 