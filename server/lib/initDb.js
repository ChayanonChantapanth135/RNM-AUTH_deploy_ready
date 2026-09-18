import mysql from 'mysql2/promise'

/**
 * ตั้งค่าและเตรียมความพร้อมของฐานข้อมูล (Database Initialization)
 * - สร้างฐานข้อมูลหากยังไม่มี
 * - สร้างตารางที่จำเป็นทั้งหมด 11 ตาราง (roles, users, projects, tasks, comments, files, etc.)
 * - ใส่ข้อมูลเริ่มต้น (Seed) เช่น บทบาทผู้ใช้งานเริ่มต้น (Default Roles)
 * - เพิ่มคอลัมน์ที่ขาดหายไปเผื่อกรณีอัปเกรดฐานข้อมูลแบบปลอดภัย
 */
export const initializeDatabase = async () => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    })

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`)
    
    // Switch to the database
    await connection.query(`USE ${process.env.DB_NAME}`)
    
    // 1. Create roles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role_name VARCHAR(50) NOT NULL UNIQUE,
        description VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Seed default roles if roles table is empty
    const [rolesCount] = await connection.query('SELECT COUNT(*) as count FROM roles')
    if (rolesCount[0].count === 0) {
      const defaultRoles = [
        ['admin', 'System Administrator with full access'],
        ['manager', 'Project Manager with access to create/manage own projects'],
        ['storyboard', 'Storyboard creator and visual planner'],
        ['animation', 'Animator and motion designer'],
        ['designer', 'Graphic and UI/UX Designer'],
        ['programmer', 'Software engineer and developer']
      ]
      for (const [name, desc] of defaultRoles) {
        await connection.query('INSERT INTO roles (role_name, description) VALUES (?, ?)', [name, desc])
      }
      console.log('Seeded default roles.')
    }

    // 2. Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullname VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin','manager','storyboard','animation','designer','programmer') DEFAULT 'storyboard',
        role_id INT NULL,
        avatar VARCHAR(512) DEFAULT NULL,
        status ENUM('active','suspended') DEFAULT 'active',
        start_date DATE NULL DEFAULT NULL,
        expire_date DATE NULL DEFAULT NULL,
        is_force_reset TINYINT(1) DEFAULT 1,
        leader_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL,
        FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `)

    // 3. Create projects table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NULL,
        status ENUM('Pending', 'In Progress', 'Reviewing', 'Completed') DEFAULT 'Pending',
        priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
        end_date DATE NULL,
        created_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `)

    // 4. Create project_team_leaders table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS project_team_leaders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_project_leader (project_id, user_id)
      )
    `)

    // 5. Create tasks table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        status ENUM('Pending', 'In Progress', 'Reviewing', 'Completed') DEFAULT 'Pending',
        assigned_to INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
      )
    `)

    // 6. Create comments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NULL,
        task_id INT NULL,
        user_id INT NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // 7. Create files table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NULL,
        task_id INT NULL,
        filename VARCHAR(255) NOT NULL,
        filepath VARCHAR(512) NOT NULL,
        uploaded_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // 8. Create notifications table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'system',
        link VARCHAR(255) DEFAULT NULL,
        is_read TINYINT(1) DEFAULT 0,
        read_status BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // 9. Create activity_logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        action VARCHAR(255) NOT NULL,
        details TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `)

    // 10. Create task_status_history table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS task_status_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task_id INT NOT NULL,
        status VARCHAR(50) NOT NULL,
        changed_by INT NULL,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `)

    // 10.5 Create task_history table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS task_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task_id INT NOT NULL,
        action VARCHAR(100) NOT NULL,
        details TEXT NULL,
        changed_by INT NULL,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `)

    // 11. Create user_settings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        setting_key VARCHAR(100) NOT NULL,
        setting_value TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_setting (user_id, setting_key)
      )
    `)

    // 12. Create otp_requests table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS otp_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,            -- ผูกกับ ID ของผู้ใช้
        otp_code VARCHAR(6) NOT NULL,    -- เก็บเลข OTP 6 หลัก
        expires_at TIMESTAMP NOT NULL,   -- เวลาหมดอายุ (เช่น เวลาปัจจุบัน + 3 นาที)
        is_used TINYINT(1) DEFAULT 0,    -- สถานะ (0 = ยังไม่ใช้, 1 = ใช้แล้ว)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // 13. Create personal_tasks table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS personal_tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        title VARCHAR(255) NOT NULL,
        status ENUM('todo', 'in-progress', 'completed') DEFAULT 'todo',
        position INT DEFAULT 0,
        is_completed TINYINT(1) DEFAULT 0,
        task_date DATE NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // Safely add missing columns to existing tables
    const alterQueries = [
      "ALTER TABLE personal_tasks ADD COLUMN IF NOT EXISTS status ENUM('todo', 'in-progress', 'completed') DEFAULT 'todo'",
      "ALTER TABLE personal_tasks ADD COLUMN IF NOT EXISTS position INT DEFAULT 0",
      "ALTER TABLE users CHANGE COLUMN username fullname VARCHAR(255) NOT NULL",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS role ENUM('admin','manager','storyboard','animation','designer','programmer') DEFAULT 'storyboard'",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id INT NULL",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(512) DEFAULT NULL",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS status ENUM('active','suspended') DEFAULT 'active'",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS start_date DATE NULL DEFAULT NULL",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS expire_date DATE NULL DEFAULT NULL",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50) DEFAULT NULL",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS leader_id INT NULL",
      "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_type VARCHAR(50) DEFAULT NULL",
      "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium'",
      "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date DATE DEFAULT NULL",
      "ALTER TABLE files ADD COLUMN IF NOT EXISTS task_id INT NULL",
      "ALTER TABLE comments ADD COLUMN IF NOT EXISTS task_id INT NULL",
      "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title VARCHAR(255) NULL",
      "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'system'",
      "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link VARCHAR(255) DEFAULT NULL",
      "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS task_id INT NULL",
      "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read TINYINT(1) DEFAULT 0",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL DEFAULT NULL",
      "ALTER TABLE projects ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL DEFAULT NULL",
      "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL DEFAULT NULL",
      
      // Performance Indexes
      "CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications (user_id, is_read)",
      "CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications (user_id, created_at DESC)",
      "CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs (created_at DESC)",
      "CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date ON activity_logs (user_id, created_at DESC)",
      "CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status)",
      "CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks (due_date)",
      "CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON tasks (project_id, status, deleted_at)",
      "CREATE INDEX IF NOT EXISTS idx_tasks_assigned_status ON tasks (assigned_to, status, deleted_at)",
      "CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects (deleted_at)",
      "CREATE INDEX IF NOT EXISTS idx_projects_status_del ON projects (status, deleted_at)",
      "CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects (created_by, deleted_at)",
      "CREATE INDEX IF NOT EXISTS idx_project_tl_user ON project_team_leaders (user_id, project_id)",
      "CREATE INDEX IF NOT EXISTS idx_comments_task ON comments (task_id, created_at)",
      "CREATE INDEX IF NOT EXISTS idx_files_task ON files (task_id, created_at)",
      "CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at ON tasks (deleted_at)",
      "CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users (deleted_at)",
      "CREATE INDEX IF NOT EXISTS idx_users_email_status ON users (email, status, deleted_at)",
      "CREATE INDEX IF NOT EXISTS idx_users_role_id ON users (role_id)",
      "CREATE INDEX IF NOT EXISTS idx_personal_tasks_user_status ON personal_tasks (user_id, status)",
      "CREATE INDEX IF NOT EXISTS idx_personal_tasks_user_pos ON personal_tasks (user_id, status, position)",
      "CREATE INDEX IF NOT EXISTS idx_personal_tasks_date ON personal_tasks (task_date)",
      "CREATE INDEX IF NOT EXISTS idx_otp_expires_used ON otp_requests (expires_at, is_used)",
      "CREATE INDEX IF NOT EXISTS idx_otp_lookup ON otp_requests (user_id, otp_code, is_used, expires_at)",
    ]
    for (const q of alterQueries) {
      try { await connection.query(q) } catch (e) { /* ignore if column already exists */ }
    }

    const alterProjectsQueries = [
      // Migrate old lowercase/underscore status values to PascalCase before altering ENUM
      "UPDATE projects SET status = 'Pending' WHERE status = 'pending'",
      "UPDATE projects SET status = 'In Progress' WHERE status = 'in_progress'",
      "UPDATE projects SET status = 'Reviewing' WHERE status = 'review'",
      "UPDATE projects SET status = 'Completed' WHERE status = 'completed'",
      "ALTER TABLE projects MODIFY COLUMN status ENUM('Pending', 'In Progress', 'Reviewing', 'Completed') DEFAULT 'Pending'",
      "ALTER TABLE projects ADD COLUMN priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium'",
      "ALTER TABLE projects ADD COLUMN end_date DATE NULL",
      "ALTER TABLE projects ADD COLUMN created_by INT NULL",
      "ALTER TABLE projects ADD CONSTRAINT fk_projects_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL",
      "ALTER TABLE tasks MODIFY COLUMN status ENUM('Pending', 'In Progress', 'Reviewing', 'Completed') DEFAULT 'Pending'"
    ]
    for (const q of alterProjectsQueries) {
      try { await connection.query(q) } catch (e) { /* ignore if column or constraint already exists */ }
    }
    
    console.log('Database initialized successfully with all 12 tables.')
    await connection.end()
  } catch (error) {
    console.error('Database initialization error:', error.message)
    // Don't exit - server can still run without initialization
  }
}
