import express from 'express';
import { upload, uploadTaskFileMiddleware, verifyToken, loginLimiter, otpLimiter } from '../middleware/authMiddleware.js';
import * as authCtrl from '../controllers/authController.js';
import * as notificationCtrl from '../controllers/notificationController.js';

const router = express.Router();

// --- AUTH ROUTES ---
router.post('/login', loginLimiter, authCtrl.login);
router.post('/refresh', authCtrl.refresh);
router.post('/logout', authCtrl.logout);

// --- USER ROUTES (Protected) ---
router.get('/users', verifyToken, authCtrl.getUsers);
router.get('/users/:id', verifyToken, authCtrl.getUserById);
router.post('/users', verifyToken, upload.single('avatar'), authCtrl.createUser);
router.put('/users/:id', verifyToken, upload.single('avatar'), authCtrl.updateUser);
router.delete('/users/:id', verifyToken, authCtrl.softDeleteUser);
router.post('/users/:id/restore', verifyToken, authCtrl.restoreUser);
router.delete('/users/:id/permanent', verifyToken, authCtrl.permanentDeleteUser);
router.post('/upload-avatar/:id', verifyToken, upload.single('avatar'), authCtrl.uploadAvatar);
router.post('/users/import', verifyToken, authCtrl.importUsers);

// --- PROJECT & TASK ROUTES (Protected) ---
router.get('/team-leaders', verifyToken, authCtrl.getTeamLeaders);
router.get('/projects', verifyToken, authCtrl.getProjects);
router.post('/projects', verifyToken, authCtrl.createProject);
router.put('/projects/:id', verifyToken, authCtrl.updateProject);
router.delete('/projects/:id', verifyToken, authCtrl.deleteProject);

router.post('/tasks', verifyToken, authCtrl.createTask);
router.post('/tasks/check-overdue', verifyToken, authCtrl.triggerCheckOverdueTasks);
router.put('/tasks/:id/status', verifyToken, authCtrl.updateTaskStatus);
router.put('/tasks/:id', verifyToken, authCtrl.updateTask);
router.delete('/tasks/:id', verifyToken, authCtrl.deleteTask);
router.get('/tasks/:id/history', verifyToken, authCtrl.getTaskHistory);
router.get('/tasks/:id/comments', verifyToken, authCtrl.getTaskComments);
router.post('/tasks/:id/comments', verifyToken, authCtrl.createTaskComment);
router.get('/tasks/:id/files', verifyToken, authCtrl.getTaskFiles);
router.post('/tasks/:id/files', verifyToken, uploadTaskFileMiddleware.single('file'), authCtrl.uploadTaskFile);
router.get('/tasks/:id/status-history', verifyToken, authCtrl.getTaskStatusHistory);

// --- PERSONAL TASKS ROUTES (Protected) ---
router.get('/personal-tasks', verifyToken, authCtrl.getPersonalTasks);
router.post('/personal-tasks', verifyToken, authCtrl.createPersonalTask);
router.put('/personal-tasks/reorder', verifyToken, authCtrl.reorderPersonalTasks);
router.put('/personal-tasks/:id', verifyToken, authCtrl.updatePersonalTask);
router.delete('/personal-tasks/:id', verifyToken, authCtrl.deletePersonalTask);

// --- DASHBOARD & LOGS ROUTES (Protected) ---
router.get('/dashboard-stats', verifyToken, authCtrl.getDashboardStats);
router.get('/calendar-events', verifyToken, authCtrl.getCalendarEvents);
router.get('/activity-logs', verifyToken, authCtrl.getActivityLogs);

// --- OTP & RESET PASSWORD & PUBLIC ROUTES (Rate Limited) ---
router.post('/send-otp', otpLimiter, authCtrl.sendOtp);
router.post('/reset-password', authCtrl.resetPassword);
router.post('/reset-password-first-time', authCtrl.resetPasswordFirstTime);
router.post('/contact', authCtrl.sendContactMessage);

// --- NOTIFICATION ROUTES (Protected) ---
router.get('/notifications', verifyToken, notificationCtrl.getUserNotifications);
router.put('/notifications/read-all', verifyToken, notificationCtrl.markAllAsRead);
router.put('/notifications/:id/read', verifyToken, notificationCtrl.markAsRead);
router.delete('/notifications/clear-all', verifyToken, notificationCtrl.clearAllNotifications);
router.delete('/notifications/:id', verifyToken, notificationCtrl.deleteNotification);

export default router;
