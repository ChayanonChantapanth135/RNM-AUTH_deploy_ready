import nodemailer from 'nodemailer';
import { connectToDatabase } from '../lib/db.js';

/**
 * Helper to log email activity to DB table `activity_logs`
 */
async function logEmailActivity({ recipientEmail, action, details, userId = null }) {
  try {
    const db = await connectToDatabase();
    let finalUserId = userId;
    if (!finalUserId && recipientEmail) {
      const [users] = await db.query('SELECT id FROM users WHERE email = ? LIMIT 1', [recipientEmail]);
      if (users && users.length > 0) {
        finalUserId = users[0].id;
      }
    }
    await db.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)',
      [finalUserId || null, action, details]
    );
  } catch (err) {
    console.error('[Email Log DB Error] Failed to save email activity log:', err.message);
  }
}

/**
 * Get configured Nodemailer transporter instance
 */
function getTransporter() {
  const emailUser = (process.env.EMAIL_USER || 'chayanon.sent@gmail.com').replace(/['"]/g, '').trim();
  const emailPass = (process.env.EMAIL_PASS || '').replace(/['"]/g, '').trim();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: emailUser, pass: emailPass }
  });

  return { transporter, emailUser, emailPass };
}

/**
 * Format date string into English format
 */
function formatDateEn(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Send email when a new project is created 
 */
export async function sendProjectCreationEmail({ recipientEmail, recipientName, projectName, priority, endDate, creatorName }) {
  if (!recipientEmail) return;

  try {
    const { transporter, emailUser, emailPass } = getTransporter();

    const mailOptions = {
      from: `"Project Management System" <${emailUser}>`,
      to: recipientEmail,
      subject: `[Project Management] You have been assigned as Team Leader for: ${projectName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h2 style="color: #38bdf8; margin: 0; font-size: 20px;">New Project Assigned</h2>
            <p style="color: #94a3b8; font-size: 13px; margin-top: 6px;">You have been assigned as the Team Leader for this project</p>
          </div>

          <p style="color: #334155; font-size: 15px;">Hello <b>${recipientName || 'Team Leader'}</b>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            A new project has been created in the system and assigned to you as <b>Team Leader</b>. Here are the details:
          </p>

          <div style="background-color: #ffffff; padding: 18px; border-radius: 12px; border-left: 4px solid #0284c7; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; width: 130px;">Project Name:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${projectName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Priority:</td>
                <td style="padding: 6px 0;"><span style="background-color: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${priority || 'Medium'}</span></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">End Date:</td>
                <td style="padding: 6px 0; color: #e11d48; font-weight: bold;">${formatDateEn(endDate)}</td>
              </tr>
              ${creatorName ? `
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Created By:</td>
                <td style="padding: 6px 0;">${creatorName}</td>
              </tr>` : ''}
            </table>
          </div>

          <div style="text-align: center; margin: 24px 0 16px 0;">
            <a href="${process.env.APP_URL || 'http://localhost:5173'}/projects" style="background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 2px 4px rgba(2, 132, 199, 0.3);">
              🔗 View Project
            </a>
          </div>

          <p style="font-size: 13px; color: #64748b; text-align: center; margin-top: 16px;">
            Please log in to the system to view details and manage sub-tasks for this project.
          </p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">This is an automated email notification from Project Management System.</p>
        </div>
      `
    };

    if (emailPass) {
      await transporter.sendMail(mailOptions);
      console.log(`[Email Sent] Project creation email sent to: ${recipientEmail} for project: "${projectName}"`);
      await logEmailActivity({
        recipientEmail,
        action: 'Send Email (Project Creation)',
        details: `Sent project assignment email to ${recipientEmail} for project "${projectName}"`
      });
    } else {
      console.warn(`[Email Warning] EMAIL_PASS is not configured in .env. Skipped actual SMTP send for project "${projectName}" to ${recipientEmail}.`);
      await logEmailActivity({
        recipientEmail,
        action: 'Send Email Warning (Project Creation)',
        details: `Skipped actual SMTP send (missing EMAIL_PASS) to ${recipientEmail} for project "${projectName}"`
      });
    }
  } catch (error) {
    console.error(`[Email Error] Failed to send project creation email to ${recipientEmail}:`, error.message);
    await logEmailActivity({
      recipientEmail,
      action: 'Send Email Failed (Project Creation)',
      details: `Failed to send project creation email to ${recipientEmail}: ${error.message}`
    });
  }
}

/**
 * Send email when a new task is created
 */
export async function sendTaskCreationEmail({ recipientEmail, recipientName, taskTitle, projectName, priority, taskType, dueDate, description, creatorName, roleLabel }) {
  if (!recipientEmail) return;

  try {
    const { transporter, emailUser, emailPass } = getTransporter();

    const mailOptions = {
      from: `"Project Management System" <${emailUser}>`,
      to: recipientEmail,
      subject: `[Project Management] New Task Assigned: ${taskTitle} (Project: ${projectName || 'General'})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #0d9488, #14b8a6); padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h2 style="color: #ffffff; margin: 0; font-size: 20px;">📋 New Task Created</h2>
            <p style="color: #ccfbf1; font-size: 13px; margin-top: 6px;">New Task Notification for ${roleLabel || 'Member'}</p>
          </div>

          <p style="color: #334155; font-size: 15px;">Hello <b>${recipientName || 'Member'}</b>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            A new task <b>"${taskTitle}"</b> has been added to project <b>"${projectName || 'General'}"</b>. Here are the task details:
          </p>

          <div style="background-color: #ffffff; padding: 18px; border-radius: 12px; border-left: 4px solid #14b8a6; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; width: 130px;">Task Title:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${taskTitle}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Project:</td>
                <td style="padding: 6px 0;">${projectName || '-'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Task Type:</td>
                <td style="padding: 6px 0;">${taskType || '-'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Priority:</td>
                <td style="padding: 6px 0;"><span style="background-color: #fef3c7; color: #b45309; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${priority || 'Medium'}</span></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Due Date:</td>
                <td style="padding: 6px 0; color: #e11d48; font-weight: bold;">${formatDateEn(dueDate)}</td>
              </tr>
              ${description ? `
              <tr>
                <td style="padding: 6px 0; font-weight: bold; vertical-align: top;">Description:</td>
                <td style="padding: 6px 0; color: #475569;">${description}</td>
              </tr>` : ''}
            </table>
          </div>

          <div style="text-align: center; margin: 24px 0 16px 0;">
            <a href="${process.env.APP_URL || 'http://localhost:5173'}/my-tasks" style="background-color: #0d9488; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 2px 4px rgba(13, 148, 136, 0.3);">
              📋 Go to My Tasks
            </a>
          </div>

          <p style="font-size: 13px; color: #64748b; text-align: center; margin-top: 16px;">
            Please log in to the system to track and update the task status.
          </p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">This is an automated email notification from Project Management System.</p>
        </div>
      `
    };

    if (emailPass) {
      await transporter.sendMail(mailOptions);
      console.log(`[Email Sent] Task creation email sent to: ${recipientEmail} for task: "${taskTitle}"`);
      await logEmailActivity({
        recipientEmail,
        action: 'Send Email (Task Creation)',
        details: `Sent task assignment email to ${recipientEmail} for task "${taskTitle}"`
      });
    } else {
      console.warn(`[Email Warning] EMAIL_PASS is not configured in .env. Skipped actual SMTP send for task "${taskTitle}" to ${recipientEmail}.`);
      await logEmailActivity({
        recipientEmail,
        action: 'Send Email Warning (Task Creation)',
        details: `Skipped actual SMTP send (missing EMAIL_PASS) to ${recipientEmail} for task "${taskTitle}"`
      });
    }
  } catch (error) {
    console.error(`[Email Error] Failed to send task creation email to ${recipientEmail}:`, error.message);
    await logEmailActivity({
      recipientEmail,
      action: 'Send Email Failed (Task Creation)',
      details: `Failed to send task creation email to ${recipientEmail}: ${error.message}`
    });
  }
}

/**
 * Send welcome email with temporary password when a new user is created
 */
export async function sendWelcomeUserEmail({ recipientEmail, recipientName, tempPassword }) {
  if (!recipientEmail) return;

  try {
    const { transporter, emailUser, emailPass } = getTransporter();

    const mailOptions = {
      from: `"Project Management System" <${emailUser}>`,
      to: recipientEmail,
      subject: 'New Account Registration - Project Management',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #0d6efd, #0284c7); padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Welcome to Project Management</h2>
            <p style="color: #e0f2fe; font-size: 13px; margin-top: 6px;">Your user account has been successfully created</p>
          </div>

          <p style="color: #334155; font-size: 15px;">Hello <b>${recipientName || 'User'}</b>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Your account has been created by the administrator. Here are your login credentials:
          </p>

          <div style="background-color: #ffffff; padding: 18px; border-radius: 12px; border-left: 4px solid #0d6efd; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <p style="margin: 6px 0; color: #334155;"><b>Email:</b> ${recipientEmail}</p>
            <p style="margin: 6px 0; color: #334155;"><b>Temporary Password:</b> <span style="font-size: 16px; font-weight: bold; color: #dc3545;">${tempPassword}</span></p>
          </div>

          <p style="color: #ea580c; font-weight: bold; font-size: 13px;">* You will be prompted to reset your password upon first login for security purposes.</p>

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">Please keep these credentials secure and confidential.</p>
        </div>
      `
    };

    if (emailPass) {
      await transporter.sendMail(mailOptions);
      console.log(`[Welcome Email Sent] Email sent to: ${recipientEmail}`);
      await logEmailActivity({
        recipientEmail,
        action: 'Send Email (Welcome User)',
        details: `Sent welcome account email with temporary password to ${recipientEmail}`
      });
    } else {
      console.warn(`[Email Warning] EMAIL_PASS is not configured in .env. Skipped sending welcome email to ${recipientEmail}.`);
      await logEmailActivity({
        recipientEmail,
        action: 'Send Email Warning (Welcome User)',
        details: `Skipped actual SMTP send (missing EMAIL_PASS) welcome email to ${recipientEmail}`
      });
    }
  } catch (error) {
    console.error(`[Email Error] Failed to send welcome email to ${recipientEmail}:`, error.message);
    await logEmailActivity({
      recipientEmail,
      action: 'Send Email Failed (Welcome User)',
      details: `Failed to send welcome email to ${recipientEmail}: ${error.message}`
    });
  }
}

/**
 * Send OTP verification email for password reset
 */
export async function sendOtpEmail({ recipientEmail, recipientName, otpCode }) {
  if (!recipientEmail) return;

  try {
    const { transporter, emailUser, emailPass } = getTransporter();

    const mailOptions = {
      from: `"Project Management System" <${emailUser}>`,
      to: recipientEmail,
      subject: 'OTP Verification Code - Project Management',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #0d6efd, #2563eb); padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h2 style="color: #ffffff; margin: 0; font-size: 20px;">OTP Verification</h2>
            <p style="color: #dbeafe; font-size: 13px; margin-top: 6px;">Password Reset Verification Code</p>
          </div>

          <p style="color: #334155; font-size: 15px;">Hello <b>${recipientName || 'User'}</b>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            You requested a One-Time Password (OTP) to reset your account password.
          </p>

          <div style="background-color: #ffffff; padding: 20px; text-align: center; border-radius: 12px; border: 1px solid #cbd5e1; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #0f172a;">${otpCode}</span>
          </div>

          <p style="color: #ea580c; font-weight: bold; font-size: 13px; text-align: center;">* This OTP code will expire in 3 minutes and can only be used once.</p>

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">If you did not request this email, please ignore it.</p>
        </div>
      `
    };

    if (emailPass) {
      await transporter.sendMail(mailOptions);
      console.log(`[OTP Email Sent] Email sent to: ${recipientEmail}, OTP: ${otpCode}`);
      await logEmailActivity({
        recipientEmail,
        action: 'Send Email (OTP)',
        details: `Sent OTP verification code email to ${recipientEmail}`
      });
    } else {
      console.warn(`[Email Warning] EMAIL_PASS is not configured in .env. Skipping real email delivery, showing OTP on console/frontend.`);
      await logEmailActivity({
        recipientEmail,
        action: 'Send Email Warning (OTP)',
        details: `Skipped actual SMTP send (missing EMAIL_PASS) for OTP to ${recipientEmail}`
      });
    }
  } catch (error) {
    console.error(`[Email Error] Failed to send OTP email to ${recipientEmail}:`, error.message);
    await logEmailActivity({
      recipientEmail,
      action: 'Send Email Failed (OTP)',
      details: `Failed to send OTP email to ${recipientEmail}: ${error.message}`
    });
  }
}

/**
 * Send overdue task notification email to assignee's Leader
 */
export async function sendTaskOverdueLeaderEmail({
  recipientEmail,
  recipientName,
  assigneeName,
  taskTitle,
  projectName,
  dueDate,
  priority,
  status
}) {
  if (!recipientEmail) return;

  try {
    const { transporter, emailUser, emailPass } = getTransporter();

    const mailOptions = {
      from: `"Project Management System" <${emailUser}>`,
      to: recipientEmail,
      subject: `[URGENT] Task Overdue: "${taskTitle}" (${assigneeName})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Task Overdue Alert</h2>
            <p style="color: #fecaca; font-size: 13px; margin-top: 6px;">Notification for Team Leader</p>
          </div>

          <p style="color: #334155; font-size: 15px;">Dear <b>${recipientName || 'Team Leader'}</b>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            The system has detected that an assigned task for <b>${assigneeName || 'Team Member'}</b> in your project is incomplete and has passed its deadline. Details are as follows:
          </p>

          <div style="background-color: #ffffff; padding: 18px; border-radius: 12px; border-left: 4px solid #dc2626; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; width: 140px;">Task Name:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${taskTitle}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Project:</td>
                <td style="padding: 6px 0;">${projectName || '-'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Assignee:</td>
                <td style="padding: 6px 0; color: #0284c7; font-weight: bold;">${assigneeName || '-'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Current Status:</td>
                <td style="padding: 6px 0;"><span style="background-color: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${status || 'Pending'}</span></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Priority:</td>
                <td style="padding: 6px 0;"><span style="background-color: #fef3c7; color: #b45309; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${priority || 'Medium'}</span></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Due Date:</td>
                <td style="padding: 6px 0; color: #dc2626; font-weight: bold;">${formatDateEn(dueDate)}</td>
              </tr>
            </table>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">This is an automated email notification from Project Management System.</p>
        </div>
      `
    };

    if (emailPass) {
      await transporter.sendMail(mailOptions);
      console.log(`[Overdue Email Sent] Sent to Leader: ${recipientEmail} for task: "${taskTitle}"`);
      await logEmailActivity({
        recipientEmail,
        action: 'Send Email (Task Overdue to Leader)',
        details: `Sent overdue alert to leader ${recipientEmail} for task "${taskTitle}" (Assignee: ${assigneeName})`
      });
    } else {
      console.warn(`[Email Warning] EMAIL_PASS is not configured. Skipped sending overdue email to leader ${recipientEmail}.`);
      await logEmailActivity({
        recipientEmail,
        action: 'Send Email Warning (Task Overdue to Leader)',
        details: `Skipped SMTP send (missing EMAIL_PASS) for task "${taskTitle}" to leader ${recipientEmail}`
      });
    }
  } catch (error) {
    console.error(`[Email Error] Failed to send overdue task email to ${recipientEmail}:`, error.message);
    await logEmailActivity({
      recipientEmail,
      action: 'Send Email Failed (Task Overdue to Leader)',
      details: `Failed to send overdue email to ${recipientEmail}: ${error.message}`
    });
  }
}

/**
 * Send contact form message to Admin and auto-reply confirmation to sender
 */
export async function sendContactFormEmail({ fullName, email, subject, message }) {
  try {
    const { transporter, emailUser, emailPass } = getTransporter();

    // 1. Send to System Admin
    const adminMailOptions = {
      from: `"${fullName} (Contact Form)" <${emailUser}>`,
      replyTo: email,
      to: emailUser,
      subject: `[Contact Us Message] ${subject || 'New Inquiry'} - from ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #0f172a, #334155); padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h2 style="color: #38bdf8; margin: 0; font-size: 20px;">✉️ New Contact Message</h2>
            <p style="color: #94a3b8; font-size: 13px; margin-top: 6px;">Received via website contact form</p>
          </div>

          <p style="color: #334155; font-size: 15px;">You have received a new contact message from <b>${fullName}</b>:</p>

          <div style="background-color: #ffffff; padding: 18px; border-radius: 12px; border-left: 4px solid #0284c7; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; width: 130px;">Sender Name:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Email Address:</td>
                <td style="padding: 6px 0;"><a href="mailto:${email}" style="color: #0284c7; text-decoration: none; font-weight: bold;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Subject:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${subject || 'General Inquiry'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0 6px 0; font-weight: bold; vertical-align: top;" colspan="2">Message:</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 12px; background-color: #f1f5f9; border-radius: 8px; color: #1e293b; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 24px 0 16px 0;">
            <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject || 'Inquiry')}" style="background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 2px 4px rgba(2, 132, 199, 0.3);">
              Reply to ${fullName}
            </a>
          </div>

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">Sent on ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}</p>
        </div>
      `
    };

    // 2. Auto-reply confirmation to sender
    const senderConfirmationMailOptions = {
      from: `"Project Management System" <${emailUser}>`,
      to: email,
      subject: `We've received your message: ${subject || 'Inquiry'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #0d9488, #14b8a6); padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Thank You for Contacting Us</h2>
            <p style="color: #ccfbf1; font-size: 13px; margin-top: 6px;">We have received your message</p>
          </div>

          <p style="color: #334155; font-size: 15px;">Hello <b>${fullName}</b>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Thank you for reaching out to us. We have successfully received your message and our team will review it and get back to you as soon as possible.
          </p>

          <div style="background-color: #ffffff; padding: 16px; border-radius: 12px; border-left: 4px solid #14b8a6; margin: 20px 0;">
            <p style="margin: 4px 0; color: #64748b; font-size: 13px;"><b>Subject:</b> ${subject}</p>
            <p style="margin: 8px 0 4px 0; color: #64748b; font-size: 13px;"><b>Message:</b></p>
            <p style="margin: 0; color: #334155; font-size: 13px; background: #f8fafc; padding: 10px; border-radius: 6px; white-space: pre-wrap;">${message}</p>
          </div>

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">This is an automated confirmation message from Project Management System.</p>
        </div>
      `
    };

    if (emailPass) {
      await transporter.sendMail(adminMailOptions);
      console.log(`[Contact Email Sent] Contact message from ${email} sent to admin (${emailUser})`);

      // Send confirmation to sender (catch error safely so it won't break if recipient email is invalid)
      try {
        await transporter.sendMail(senderConfirmationMailOptions);
      } catch (e) {
        console.warn(`[Auto-reply Warning] Could not send confirmation copy to sender ${email}:`, e.message);
      }

      await logEmailActivity({
        recipientEmail: emailUser,
        action: 'Send Email (Contact Us Form)',
        details: `Contact message received from ${fullName} (${email}): "${subject}"`
      });
    } else {
      console.warn(`[Email Warning] EMAIL_PASS is not configured. Skipped sending contact email.`);
    }
  } catch (error) {
    console.error(`[Email Error] Failed to send contact email:`, error.message);
    throw error;
  }
}


