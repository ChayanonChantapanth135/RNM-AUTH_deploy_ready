import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer storage for avatar uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Configure multer storage for task attachments
const taskFileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'taskfile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

export const uploadTaskFileMiddleware = multer({
    storage: taskFileStorage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied: Token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

// Rate limiter for Login attempts (ป้องกัน Brute Force: 10 ครั้งต่อ 1 นาทีต่อ 1 IP)
import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 login requests per windowMs
    message: { message: 'มีคำขอเข้าสู่ระบบบ่อยเกินไป กรุณารอ 1 นาทีก่อนลองใหม่อีกครั้ง' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for OTP Requests (ป้องกันการสแปมขอ OTP: 3 ครั้งต่อ 1 นาทีต่อ 1 IP)
export const otpLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 3, // Limit each IP to 3 OTP requests per windowMs
    message: { message: 'มีการขอรหัส OTP บ่อยเกินไป กรุณารอ 1 นาทีแล้วลองใหม่' },
    standardHeaders: true,
    legacyHeaders: false,
});
