import { connectToDatabase } from './lib/db.js';

const sampleTasks = [
  { title: "ตรวจสอบไฟล์เสียงพากย์ EP 1-5", status: "todo", task_date: "2026-08-22" },
  { title: "แก้ไข Subtitle ภาษาไทยช่วงท้ายคลิป", status: "in-progress", task_date: "2026-08-24" },
  { title: "เตรียม Storyboard ฉากเปิดตัวโปรเจกต์ใหม่", status: "todo", task_date: "2026-08-25" },
  { title: "เรนเดอร์วิดีโอตัวอย่าง 4K ส่งลูกค้า", status: "in-progress", task_date: "2026-08-26" },
  { title: "ประชุมทีมสรุป Feedback ประจำสัปดาห์", status: "completed", task_date: "2026-08-20" },
  { title: "จัดระเบียบ Asset ไฟล์ภาพกราฟิกใน Drive", status: "todo", task_date: "2026-08-28" },
  { title: "ออกแบบหน้า Cover Thumbnail YouTube", status: "in-progress", task_date: "2026-08-23" },
  { title: "ตรวจทานเอกสารแปลภาษาญี่ปุ่น", status: "completed", task_date: "2026-08-19" },
  { title: "อัปเดตสถานะ Progress Report ประจำเดือน", status: "todo", task_date: "2026-08-30" },
  { title: "สำรองข้อมูลงานวิดีโอลง External Drive", status: "completed", task_date: "2026-08-21" },
];

async function seed() {
  const db = await connectToDatabase();
  const userId = 42;

  console.log(`Checking user ID ${userId}...`);
  const [users] = await db.query('SELECT id, fullname, email FROM users WHERE id = ?', [userId]);
  if (users.length === 0) {
    console.log(`User ID ${userId} not found, checking total users...`);
  } else {
    console.log(`Found user:`, users[0]);
  }

  for (let i = 0; i < sampleTasks.length; i++) {
    const t = sampleTasks[i];
    const isCompleted = t.status === 'completed' ? 1 : 0;
    const position = i + 1;
    await db.query(
      'INSERT INTO personal_tasks (user_id, title, status, position, is_completed, task_date) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, t.title, t.status, position, isCompleted, t.task_date]
    );
    console.log(`Inserted: [${t.status}] ${t.title} (Date: ${t.task_date})`);
  }

  console.log('Successfully seeded 10 personal tasks for user ID 42!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Error seeding tasks:', err);
  process.exit(1);
});
