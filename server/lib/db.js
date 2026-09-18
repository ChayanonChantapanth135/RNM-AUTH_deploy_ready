import mysql from 'mysql2/promise'

let pool;

/**
 * เชื่อมต่อกับฐานข้อมูล MySQL (ใช้รูปแบบ Connection Pool เพื่อความเร็วและรองรับคำขอพร้อมกัน)
 * รองรับทั้ง Railway default envs (MYSQLHOST, MYSQLUSER, etc.), DATABASE_URL และ standard DB_* envs
 * @returns {Pool} ออบเจกต์ Connection Pool สำหรับคิวรีฐานข้อมูล
 */
export const connectToDatabase = async () => {
  if (!pool) {
    const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
    if (dbUrl) {
      pool = mysql.createPool(dbUrl);
    } else {
      pool = mysql.createPool({
        host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
        port: Number(process.env.DB_PORT || process.env.MYSQLPORT) || 3306,
        user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
        password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
        database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'railway',
        waitForConnections: true,
        connectionLimit: 15,
        queueLimit: 0,
        dateStrings: true
      });
    }
  }
  return pool;
}