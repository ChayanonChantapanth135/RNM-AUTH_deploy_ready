import { connectToDatabase } from './lib/db.js';

// รายการหัวข้องานที่หลากหลายตามหมวดหมู่งานต่าง ๆ
const taskTemplates = [
  // ด้านงานออกแบบ & Graphic / UI / Storyboard
  "ออกแบบ Artwork สำหรับแคมเปญ Social Media ประจำสัปดาห์",
  "สร้าง Moodboard และ Color Palette สำหรับ Project ใหม่",
  "วาด Storyboard Sequence ฉากแอ็กชัน EP 1-3",
  "ออกแบบไอคอนและ UI Component สำหรับหน้า Dashboard",
  "แก้ไขภาพปก YouTube Thumbnail และ Facebook Banner",
  "ตัดต่อและ Retouch ภาพโปรโมตสินค้าความละเอียดสูง",
  "จัดทำ Style Guide สำหรับโปรเจกต์การ์ตูนเรื่องใหม่",
  "ร่างภาพ Concept Art ตัวละครหลักเวอร์ชัน 2",
  "ตรวจสอบความถูกต้องของ Assets กราฟิกและ Export ไฟล์ SVG/PNG",
  "ออกแบบ Layout หน้า Landing Page เวอร์ชัน Mobile Responsive",
  
  // ด้านงานตัดต่อ & แอนิเมชัน & วิดีโอ / เสียง
  "เรนเดอร์วิดีโอตัวอย่างแบบ 4K เพื่อเตรียมส่งตรวจ",
  "ตัดต่อวิดีโอ Teaser ความยาว 30 วินาทีสำหรับยิง Ads",
  "ใส่เสียง Sound Effect และดนตรีประกอบฉากไคลแม็กซ์",
  "ปรับแก้ Timing ของ Keyframe แอนิเมชันให้ลื่นไหลขึ้น",
  "ตรวจสอบและ Sync ไฟล์เสียงพากย์ภาษาไทยและญี่ปุ่น",
  "ทำ Visual Effects (VFX) ลำแสงและเอฟเฟกต์ระเบิด",
  "แก้ไข Subtitle และจัดวางตำแหน่งข้อความบนวิดีโอ",
  "จัดระเบียบไฟล์ Footage วิดีโอใน Storage และติด Tag",
  "แปลงไฟล์ Master Video ให้เป็นฟอร์แมตต่าง ๆ สำหรับนำไปใช้งาน",
  "ทำ Color Grading ปรับโทนสีวิดีโอให้เข้ากับบรรยากาศของเรื่อง",

  // ด้านงานพัฒนา & โปรแกรมมิ่ง & ทดสอบระบบ
  "เขียนฟังก์ชัน RESTful API สำหรับระบบจัดการผู้ใช้งาน",
  "แก้ไข Bug ระบบแจ้งเตือน Realtime บน WebSocket",
  "ปรับปรุงประสิทธิภาพ Query ฐานข้อมูลและสร้าง Index เพิ่มเติม",
  "เขียน Unit Test และ Integration Test สำหรับโมดูลชำระเงิน",
  "ทดสอบความเข้ากันได้ของระบบบนเว็บบราวเซอร์ต่างๆ",
  "ปรับแต่งหน้าตา UI ให้รองรับ Dark Mode สมบูรณ์แบบ",
  "ตรวจสอบช่องโหว่ความปลอดภัยของ API Endpoints",
  "ติดตั้งและ Config Server สภาพแวดล้อม Staging ใหม่",
  "ปรับปรุง Code Refactoring เพื่อลด Technical Debt",
  "ตรวจสอบ Log ข้อผิดพลาดของเซิร์ฟเวอร์และแก้ไขจุดคอขวด",

  // ด้านการบริหารจัดการ & ประชุม & วางแผน
  "ประชุมติดตามความคืบหน้าร่วมกับทีมใน Sprint ประจำสัปดาห์",
  "จัดทำเอกสารสรุปความคืบหน้าโครงการส่งผู้บริหาร",
  "ประเมินระยะเวลาและทรัพยากรสำหรับงานในสัปดาห์ถัดไป",
  "ตรวจรับงานจากฟรีแลนซ์และตรวจสอบ Checklist ความถูกต้อง",
  "อัปเดตสถานะงานในบอร์ดโปรเจกต์ให้เป็นปัจจุบัน",
  "นัดหมายประชุมรับ Requirement เพิ่มเติมจากลูกค้า",
  "ทบทวน Feedback จากลูกค้าและแจกจ่ายงานให้สมาชิกในทีม",
  "จัดทำแผนสำรองความเสี่ยงสำหรับเดดไลน์งานสัปดาห์หน้า",
  "สรุปรายงาน KPI รายเดือนของทีม",
  "จัดระเบียบและอัปเดตโฟลเดอร์เอกสารใน Google Drive",

  // ด้านงานทั่วไป & การจัดการข้อมูล & บำรุงรักษา
  "สำรองข้อมูลงานวิดีโอและซอร์สโค้ดลง External Storage",
  "ทำความสะอาดแคชระบบและลบไฟล์ชั่วคราวที่ไม่จำเป็น",
  "ศึกษาเทคโนโลยีหรือเครื่องมือใหม่ๆ เพื่อนำมาประยุกต์ใช้",
  "ตรวจทานความถูกต้องของเอกสารสัญญาและข้อตกลงการทำงาน",
  "ทำคู่มือการใช้งานระบบ (User Manual) ฉบับย่อ",
  "ตรวจสอบสต็อกอุปกรณ์และอุปกรณ์ไอทีในสตูดิโอ",
  "รวบรวมแบบประเมินความพึงพอใจจากผู้ใช้งานระบบ",
  "จัดระเบียบอีเมลและตอบกลับข้อซักถามที่คั่งค้าง",
  "อัปเกรดซอฟต์แวร์และแพ็กเกจไลบรารีให้เป็นเวอร์ชันล่าสุด",
  "เตรียมการนำเสนอผลงาน (Slide Presentation) ประจำไตรมาส"
];

const statuses = ['todo', 'in-progress', 'completed'];

// ฟังก์ชันสุ่มวันที่ระหว่างช่วง (เช่น ย้อนหลัง 45 วัน ถึง อนาคต 45 วัน รอบปัจจุบันปี 2026)
function getRandomDate() {
  const baseDate = new Date('2026-09-09T00:00:00Z');
  // สุ่มระยะห่างตั้งแต่ -45 วัน ถึง +45 วัน
  const dayOffset = Math.floor(Math.random() * 91) - 45;
  const targetDate = new Date(baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
  
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// สุ่มเลือก element จาก array
function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedPersonalTasks() {
  const db = await connectToDatabase();
  
  // 1. ดึงผู้ใช้งานทั้งหมดที่ยังไม่ได้ถูกลบ (deleted_at IS NULL)
  const [users] = await db.query('SELECT id, fullname, role FROM users WHERE deleted_at IS NULL');
  console.log(`Found ${users.length} active users.`);

  if (users.length === 0) {
    console.log('No users found in database.');
    process.exit(0);
  }

  const tasksPerUser = 50;
  let totalInserted = 0;

  for (const user of users) {
    console.log(`Generating ${tasksPerUser} tasks for [User ${user.id}] ${user.fullname} (${user.role})...`);

    // สร้าง batch insert data
    const values = [];
    
    // สุ่มหยิบ tasks และสร้าง 50 tasks
    for (let i = 1; i <= tasksPerUser; i++) {
      // สุ่มเลือกหัวข้องาน และเติมหมายเลข/หมวด เพื่อให้ไม่ซ้ำซ้อนกัน
      const templateTitle = taskTemplates[(i - 1) % taskTemplates.length];
      const cycleNumber = Math.floor((i - 1) / taskTemplates.length) + 1;
      const title = cycleNumber > 1 ? `${templateTitle} (รอบที่ ${cycleNumber})` : templateTitle;
      
      const status = getRandomItem(statuses);
      const isCompleted = status === 'completed' ? 1 : 0;
      const position = i;
      const taskDate = getRandomDate();

      values.push([user.id, title, status, position, isCompleted, taskDate]);
    }

    // Insert batch เข้าสู่ personal_tasks
    await db.query(
      'INSERT INTO personal_tasks (user_id, title, status, position, is_completed, task_date) VALUES ?',
      [values]
    );

    totalInserted += tasksPerUser;
  }

  console.log(`\n==============================================`);
  console.log(`🎉 SUCCESS! Seeded ${totalInserted} personal tasks across ${users.length} users (50 tasks each) with randomized dates.`);
  console.log(`==============================================`);

  process.exit(0);
}

seedPersonalTasks().catch((err) => {
  console.error('Error seeding personal tasks:', err);
  process.exit(1);
});
