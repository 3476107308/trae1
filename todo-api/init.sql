-- 数据库初始化脚本
-- 1. 打开 phpMyAdmin
-- 2. 创建数据库 todo_app
-- 3. 执行以下SQL语句

CREATE DATABASE IF NOT EXISTS todo_app DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE todo_app;

CREATE TABLE IF NOT EXISTS todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  completed TINYINT(1) NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 可选：插入测试数据
INSERT INTO todos (title, completed, date) VALUES ('学习小程序开发', 1, '2026-05-16');
INSERT INTO todos (title, completed, date) VALUES ('完成需求文档', 1, '2026-05-16');
INSERT INTO todos (title, completed, date) VALUES ('编写代码', 0, '2026-05-16');
INSERT INTO todos (title, completed, date) VALUES ('测试功能', 0, '2026-05-16');
INSERT INTO todos (title, completed, date) VALUES ('准备演示', 0, '2026-05-17');