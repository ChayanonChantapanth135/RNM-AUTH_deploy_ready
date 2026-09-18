import mysql from 'mysql2/promise'

let pool;

/**
 * เชื่อมต่อกับฐานข้อมูล MySQL (ใช้รูปแบบ Connection Pool เพื่อความเร็วและรองรับคำขอพร้อมกัน)
 * @returns {Pool} ออบเจกต์ Connection Pool สำหรับคิวรีฐานข้อมูล
 */
export const connectToDatabase = async () => {
  if (!pool) {
    pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'myapp_db',
        waitForConnections: true,
        connectionLimit: 15,
        queueLimit: 0,
        dateStrings: true
    })
  }
  return pool;
}