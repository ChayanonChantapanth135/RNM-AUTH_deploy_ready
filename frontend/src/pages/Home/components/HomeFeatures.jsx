import React from "react";
import { motion } from "framer-motion";

const HomeFeatures = ({ t, containerVariants, itemVariants }) => {
  return (
    <section id="features" className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white">
          {t("landingFeaturesTitle") || "ฟีเจอร์เด่นที่จะช่วยให้งานคุณราบรื่น"}
        </h2>
        <p className="mt-4 text-slate-400 max-w-xl mx-auto text-base">
          {t("landingFeaturesDesc") || "ระบบของเราออกแบบมาอย่างพิถีพิถันเพื่อตอบโจทย์ทุกขั้นตอนในการบริหารจัดการงานและโครงการ"}
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        {/* Feature 1 */}
        <motion.div variants={itemVariants} className="glass-card rounded-3xl p-8 cursor-pointer">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-3xl mb-6 shadow-inner">
            📁
          </div>
          <h3 className="text-xl font-bold text-white mb-3">
            {t("featureProjTitle") || "จัดการโปรเจกต์"}
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            {t("featureProjDesc") || "สร้างโปรเจกต์หลัก กำหนดหัวหน้าทีม และติดตามความคืบหน้าของโปรเจกต์ได้โดยอัตโนมัติ"}
          </p>
        </motion.div>

        {/* Feature 2 */}
        <motion.div variants={itemVariants} className="glass-card rounded-3xl p-8 cursor-pointer">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-3xl mb-6 shadow-inner">
            ⏱️
          </div>
          <h3 className="text-xl font-bold text-white mb-3">
            {t("featureTaskTitle") || "ติดตามสถานะงาน"}
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            {t("featureTaskDesc") || "ควบคุมสถานะของงานย่อยได้อย่างละเอียด ไม่ว่าจะเป็นงานที่รอดำเนินการ, กำลังทำ, อยู่ระหว่างตรวจสอบ หรือเสร็จสิ้นแล้ว"}
          </p>
        </motion.div>

        {/* Feature 3 */}
        <motion.div variants={itemVariants} className="glass-card rounded-3xl p-8 cursor-pointer">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center text-3xl mb-6 shadow-inner">
            📅
          </div>
          <h3 className="text-xl font-bold text-white mb-3">
            {t("featureCalTitle") || "ปฏิทินส่งงาน"}
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            {t("featureCalDesc") || "ดูวันส่งงานของทุกโปรเจกต์ได้บนปฏิทินแบบ Interactive ป้องกันการลืมวันส่งงานสำคัญ"}
          </p>
        </motion.div>

        {/* Feature 4 */}
        <motion.div variants={itemVariants} className="glass-card rounded-3xl p-8 cursor-pointer">
          <div className="w-14 h-14 rounded-2xl bg-pink-500/20 flex items-center justify-center text-3xl mb-6 shadow-inner">
            👥
          </div>
          <h3 className="text-xl font-bold text-white mb-3">
            {t("featureTeamTitle") || "บันทึกประวัติกิจกรรม"}
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            {t("featureTeamDesc") || "ตรวจสอบประวัติการทำงานย้อนหลังของทุกคนในระบบได้อย่างโปร่งใส รู้ทุกการอัปเดตและการเปลี่ยนแปลง"}
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HomeFeatures;
