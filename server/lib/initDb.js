import mysql from 'mysql2/promise'
import bcrypt from 'bcrypt'

/**
 * ตั้งค่าและเตรียมความพร้อมของฐานข้อมูล (Database Initialization)
 * - สร้างฐานข้อมูลหากยังไม่มี
 * - สร้างตารางที่จำเป็นทั้งหมด 11 ตาราง (roles, users, projects, tasks, comments, files, etc.)
 * - ใส่ข้อมูลเริ่มต้น (Seed) เช่น บทบาทผู้ใช้งานเริ่มต้น (Default Roles) และ Default Admin
 * - เพิ่มคอลัมน์ที่ขาดหายไปเผื่อกรณีอัปเกรดฐานข้อมูลแบบปลอดภัย
 */
export const initializeDatabase = async () => {
  let connection;
  const dbName = process.env.DB_NAME || process.env.MYSQLDATABASE || 'railway';
  const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

  try {
    if (dbUrl) {
      connection = await mysql.createConnection(dbUrl);
    } else {
      const host = process.env.DB_HOST || process.env.MYSQLHOST || 'localhost';
      const port = Number(process.env.DB_PORT || process.env.MYSQLPORT) || 3306;
      const user = process.env.DB_USER || process.env.MYSQLUSER || 'root';
      const password = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '';

      try {
        // Try connecting without specifying DB to create it if needed
        connection = await mysql.createConnection({ host, port, user, password });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await connection.query(`USE \`${dbName}\``);
      } catch (connErr) {
        // If create database is restricted (e.g. Railway managed MySQL), connect directly to the database
        connection = await mysql.createConnection({ host, port, user, password, database: dbName });
      }
    }
    
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
        { name: 'admin', desc: 'ผู้ดูแลระบบสูงสุด (เข้าถึงได้ทุกระบบ)' },
        { name: 'manager', desc: 'ผู้จัดการ (จัดการโครงการ, กำกับดูแลผู้ใช้)' },
        { name: 'storyboard', desc: 'ทีมสตอรี่บอร์ด (จัดการงานและไทม์ไลน์)' },
        { name: 'animation', desc: 'ทีมอนิเมชั่น (ทำงานและอัปเดตสถานะ)' },
        { name: 'designer', desc: 'ทีมนักออกแบบ (ออกแบบกราฟิกและสื่อ)' },
        { name: 'programmer', desc: 'ทีมนักพัฒนา (พัฒนาระบบและแก้ไขบั๊ก)' }
      ]

      for (const role of defaultRoles) {
        await connection.query(
          'INSERT IGNORE INTO roles (role_name, description) VALUES (?, ?)',
          [role.name, role.desc]
        )
      }
      console.log('Seeded default roles successfully.')
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
        phone VARCHAR(50) DEFAULT NULL,
        start_date DATE NULL DEFAULT NULL,
        expire_date DATE NULL DEFAULT NULL,
        is_force_reset TINYINT(1) DEFAULT 0,
        leader_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL,
        FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `)

    // Seed default admin user (admin@example.com / Admin@1234)
    try {
      const [adminUsers] = await connection.query("SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1")
      const defaultPassword = await bcrypt.hash('Admin@1234', 10)
      const [adminRole] = await connection.query("SELECT id FROM roles WHERE role_name = 'admin' LIMIT 1")
      const roleId = adminRole[0]?.id || 1

      if (adminUsers.length === 0) {
        await connection.query(`
          INSERT INTO users (fullname, email, password, role, role_id, status, is_force_reset)
          VALUES ('System Admin', 'admin@example.com', ?, 'admin', ?, 'active', 0)
        `, [defaultPassword, roleId])
        console.log('Seeded default admin user (admin@example.com / Admin@1234).')
      } else {
        // Ensure admin user has admin role and is active, without overwriting custom passwords
        await connection.query(`
          UPDATE users SET role = 'admin', role_id = ?, status = 'active', deleted_at = NULL WHERE email = 'admin@example.com'
        `, [roleId])
        console.log('Verified default admin user status (admin@example.com).')
      }
    } catch (adminErr) {
      console.error('Error seeding default admin:', adminErr.message)
    }

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
        task_type VARCHAR(50) DEFAULT NULL,
        priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
        due_date DATE DEFAULT NULL,
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

    // Helper function to safely add a column if it doesn't exist
    const addColumnIfNotExists = async (table, column, definition) => {
      try {
        const [cols] = await connection.query(`
          SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?
        `, [table, column]);
        if (cols.length === 0) {
          await connection.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
        }
      } catch (err) {
        // ignore
      }
    };

    await addColumnIfNotExists('users', 'phone', 'VARCHAR(50) DEFAULT NULL');
    await addColumnIfNotExists('users', 'start_date', 'DATE NULL DEFAULT NULL');
    await addColumnIfNotExists('users', 'expire_date', 'DATE NULL DEFAULT NULL');
    await addColumnIfNotExists('users', 'leader_id', 'INT NULL');
    await addColumnIfNotExists('users', 'deleted_at', 'TIMESTAMP NULL DEFAULT NULL');
    await addColumnIfNotExists('tasks', 'task_type', 'VARCHAR(50) DEFAULT NULL');
    await addColumnIfNotExists('tasks', 'priority', "ENUM('Low', 'Medium', 'High') DEFAULT 'Medium'");
    await addColumnIfNotExists('tasks', 'due_date', 'DATE DEFAULT NULL');
    await addColumnIfNotExists('tasks', 'deleted_at', 'TIMESTAMP NULL DEFAULT NULL');
    await addColumnIfNotExists('projects', 'deleted_at', 'TIMESTAMP NULL DEFAULT NULL');
    await addColumnIfNotExists('files', 'task_id', 'INT NULL');
    await addColumnIfNotExists('comments', 'task_id', 'INT NULL');
    await addColumnIfNotExists('notifications', 'task_id', 'INT NULL');
    await addColumnIfNotExists('personal_tasks', 'status', "ENUM('todo', 'in-progress', 'completed') DEFAULT 'todo'");
    await addColumnIfNotExists('personal_tasks', 'position', 'INT DEFAULT 0');

    // Performance Indexes
    const indexQueries = [
      "CREATE INDEX idx_notifications_user_read ON notifications (user_id, is_read)",
      "CREATE INDEX idx_notifications_user_created ON notifications (user_id, created_at DESC)",
      "CREATE INDEX idx_activity_logs_created_at ON activity_logs (created_at DESC)",
      "CREATE INDEX idx_activity_logs_user_date ON activity_logs (user_id, created_at DESC)",
      "CREATE INDEX idx_tasks_status ON tasks (status)",
      "CREATE INDEX idx_tasks_due_date ON tasks (due_date)",
      "CREATE INDEX idx_tasks_project_status ON tasks (project_id, status, deleted_at)",
      "CREATE INDEX idx_tasks_assigned_status ON tasks (assigned_to, status, deleted_at)",
      "CREATE INDEX idx_projects_deleted_at ON projects (deleted_at)",
      "CREATE INDEX idx_projects_status_del ON projects (status, deleted_at)",
      "CREATE INDEX idx_projects_created_by ON projects (created_by, deleted_at)",
      "CREATE INDEX idx_project_tl_user ON project_team_leaders (user_id, project_id)",
      "CREATE INDEX idx_comments_task ON comments (task_id, created_at)",
      "CREATE INDEX idx_files_task ON files (task_id, created_at)",
      "CREATE INDEX idx_tasks_deleted_at ON tasks (deleted_at)",
      "CREATE INDEX idx_users_deleted_at ON users (deleted_at)",
      "CREATE INDEX idx_users_email_status ON users (email, status, deleted_at)",
      "CREATE INDEX idx_users_role_id ON users (role_id)",
      "CREATE INDEX idx_personal_tasks_user_status ON personal_tasks (user_id, status)",
      "CREATE INDEX idx_personal_tasks_user_pos ON personal_tasks (user_id, status, position)",
      "CREATE INDEX idx_personal_tasks_date ON personal_tasks (task_date)",
      "CREATE INDEX idx_otp_expires_used ON otp_requests (expires_at, is_used)",
      "CREATE INDEX idx_otp_lookup ON otp_requests (user_id, otp_code, is_used, expires_at)",
    ];
    for (const q of indexQueries) {
      try { await connection.query(q) } catch (e) { /* ignore if index already exists */ }
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
