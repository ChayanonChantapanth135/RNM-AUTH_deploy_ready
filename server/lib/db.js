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
    // ตรวจสอบว่าจำเป็นต้องใช้ SSL หรือไม่ (เช่น เชื่อมต่อ TiDB Cloud หรือคลาวด์ภายนอก)
    const sslConfig = (process.env.DB_SSL === 'true' || process.env.TIDB_ENABLE_SSL === 'true' || Boolean(process.env.TIDB_HOST))
      ? { minVersion: 'TLSv1.2', rejectUnauthorized: true }
      : undefined;

    if (dbUrl) {
      pool = mysql.createPool({
        uri: dbUrl,
        ssl: sslConfig,
        waitForConnections: true,
        connectionLimit: 15,
        queueLimit: 0,
        dateStrings: true,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000
      });
    } else {
      pool = mysql.createPool({
        host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
        port: Number(process.env.DB_PORT || process.env.MYSQLPORT) || 3306,
        user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
        password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
        database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'railway',
        ssl: sslConfig,
        waitForConnections: true,
        connectionLimit: 15,
        queueLimit: 0,
        dateStrings: true,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000
      });
    }
  }
  return pool;
}