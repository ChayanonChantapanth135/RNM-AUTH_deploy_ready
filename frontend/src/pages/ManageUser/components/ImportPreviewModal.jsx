import React, { useState, useMemo } from "react";
import { Modal } from "react-bootstrap";

const formatRole = (role) => {
  if (!role) return "-";
  const r = String(role).toLowerCase().trim();
  if (r === "admin") return "Admin";
  if (r === "manager" || r === "project_manager" || r === "project manager")
    return "Project Manager";
  if (r === "storyboard") return "Storyboard";
  if (r === "animation") return "Animation";
  if (r === "designer") return "Designer";
  if (r === "programmer") return "Programmer";
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const getRoleBadgeStyle = (role) => {
  const r = (role || "").toLowerCase();
  if (r.includes("admin"))
    return "bg-indigo-100 text-indigo-800 border border-indigo-200";
  if (r.includes("manager"))
    return "bg-pink-100 text-pink-800 border border-pink-200";
  if (r.includes("storyboard"))
    return "bg-amber-100 text-amber-900 border border-amber-300";
  if (r.includes("animation"))
    return "bg-emerald-100 text-emerald-800 border border-emerald-300";
  if (r.includes("designer"))
    return "bg-purple-100 text-purple-800 border border-purple-200";
  if (r.includes("programmer"))
    return "bg-cyan-100 text-cyan-800 border border-cyan-300";
  return "bg-slate-100 text-slate-800 border border-slate-300";
};

/**
 * คอมโพเนนต์ Popup Preview สำหรับแสดงรายชื่อผู้ใช้ที่กำลังจะ Import จากไฟล์ Excel/CSV
 */
const ImportPreviewModal = ({
  show,
  onHide,
  fileName,
  users = [],
  existingUsers = [],
  onConfirm,
  t,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // วิเคราะห์สถานะของแต่ละแถว (New User / Update User / Invalid)
  const analyzedUsers = useMemo(() => {
    const existingEmailSet = new Set(
      existingUsers
        .map((u) => (u.email || "").toLowerCase().trim())
        .filter(Boolean),
    );

    return users.map((user, idx) => {
      const fullname = (
        user.fullname ||
        user.name ||
        user.username ||
        ""
      ).trim();
      const email = (user.email || "").toLowerCase().trim();
      const phone = (user.phone || user.phonenumber || user.tel || "").trim();
      const role = user.role || "storyboard";
      const leader = (user.leader_email || user.leader || user.leader_name || user.leader_id || "").trim();
      const status = user.status || "active";
      const startDate = user.start_date || user.startdate || user.startDate || "";
      const expireDate = user.expire_date || user.expiredate || user.expireDate || "";

      const isValid = Boolean(email && fullname);
      const isExisting = existingEmailSet.has(email);

      let importType = "new"; // "new", "update", "invalid"
      if (!isValid) {
        importType = "invalid";
      } else if (isExisting) {
        importType = "update";
      }

      return {
        idx: idx + 1,
        fullname: fullname || "-",
        email: email || "-",
        phone: phone || "-",
        role,
        leader: leader || "-",
        status,
        startDate: startDate || "-",
        expireDate: expireDate || "-",
        isValid,
        importType,
      };
    });
  }, [users, existingUsers]);

  const stats = useMemo(() => {
    let newCount = 0;
    let updateCount = 0;
    let invalidCount = 0;

    analyzedUsers.forEach((u) => {
      if (u.importType === "new") newCount++;
      else if (u.importType === "update") updateCount++;
      else invalidCount++;
    });

    return { newCount, updateCount, invalidCount, total: analyzedUsers.length };
  }, [analyzedUsers]);

  const filteredList = useMemo(() => {
    return analyzedUsers.filter((u) => {
      const matchesSearch =
        searchTerm === "" ||
        u.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.leader.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || u.importType === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [analyzedUsers, searchTerm, statusFilter]);

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Body
        className="p-0 overflow-hidden"
        style={{
          borderRadius: "1.25rem",
          backgroundColor: "#FFFFFF",
          color: "#0F172A",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/80">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl font-bold border border-indigo-100 shadow-sm">
                📥
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-slate-900 mb-0.5 tracking-tight flex items-center gap-2">
                  {t("importPreviewTitle") || "ตรวจสอบข้อมูลก่อนนำเข้า"}
                </h4>
                <p className="text-xs text-slate-500 mb-0">
                  {t("importPreviewSub") || "ไฟล์:"}{" "}
                  <span className="text-indigo-600 font-semibold">
                    {fileName}
                  </span>
                  {" • "}
                  {t("importPreviewTotal") || "ทั้งหมด"}{" "}
                  <span className="font-bold text-slate-800">
                    {stats.total}
                  </span>{" "}
                  {t("entriesText") || "รายการ"}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onHide}
            className="self-end md:self-auto text-slate-500 hover:text-slate-800 px-3.5 py-1.5 rounded-xl bg-slate-200/70 hover:bg-slate-200 text-xs font-bold transition-all"
          >
            ✕ {t("cancelBtn") || "ยกเลิก"}
          </button>
        </div>

        {/* Quick Stats Banner */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 bg-slate-100/60 border-b border-slate-200">
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500">
              {t("importTotalCount") || "รายการทั้งหมด"}
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-800 mt-0.5">
              {stats.total}
            </span>
          </div>
          <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm flex flex-col">
            <span className="text-[11px] sm:text-xs font-bold text-emerald-700 flex items-center gap-1.5">
              <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-500"></span>
              {t("importNewUsers") || "เพิ่มผู้ใช้ใหม่"}
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">
              +{stats.newCount}
            </span>
          </div>
          <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm flex flex-col">
            <span className="text-[11px] sm:text-xs font-bold text-amber-700 flex items-center gap-1.5">
              <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-amber-500"></span>
              {t("importUpdateUsers") || "อัปเดตข้อมูลเดิม"}
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-600 mt-0.5">
              {stats.updateCount}
            </span>
          </div>
          <div className="p-3 sm:p-3.5 rounded-2xl bg-rose-50 border border-rose-200 shadow-sm flex flex-col">
            <span className="text-[11px] sm:text-xs font-bold text-rose-700 flex items-center gap-1.5">
              <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-rose-500"></span>
              {t("importInvalidUsers") || "ข้อมูลไม่สมบูรณ์"}
            </span>
            <span className="text-xl sm:text-2xl font-black text-rose-600 mt-0.5">
              {stats.invalidCount}
            </span>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="p-4 sm:p-6 pb-3 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              className="w-full rounded-2xl py-2.5 pl-9 pr-4 text-xs font-medium focus:outline-none transition-all placeholder:text-slate-400"
              style={{
                backgroundColor: "#FFFFFF",
                color: "#0F172A",
                border: "1.5px solid #CBD5E1",
              }}
              placeholder={t("searchPlaceholder") || "ค้นหาชื่อ หรือ อีเมล..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              🔍
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === "all"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t("roleFilterAll") || "ทั้งหมด"} ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter("new")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === "new"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              {t("importNewUsers") || "ผู้ใช้ใหม่"} ({stats.newCount})
            </button>
            <button
              onClick={() => setStatusFilter("update")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === "update"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                  : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700"
              }`}
            >
              {t("importUpdateUsers") || "อัปเดต"} ({stats.updateCount})
            </button>
            {stats.invalidCount > 0 && (
              <button
                onClick={() => setStatusFilter("invalid")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === "invalid"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                    : "bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700"
                }`}
              >
                {t("importInvalidUsers") || "ไม่สมบูรณ์"} ({stats.invalidCount})
              </button>
            )}
          </div>
        </div>

        {/* Table Preview */}
        <div className="px-4 sm:px-6 py-2">
          <div
            className="overflow-x-auto rounded-2xl border border-slate-200 bg-white light-scrollbar"
            style={{ maxHeight: "380px", overflowY: "auto" }}
          >
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-100 border-b border-slate-200 shadow-sm">
                <tr className="text-xs uppercase tracking-wider text-slate-600 font-bold">
                  <th className="py-3 px-3 text-center w-12 text-slate-600">
                    #
                  </th>
                  <th className="py-3 px-4 text-left whitespace-nowrap text-slate-600">
                    {t("colUser") || "ชื่อผู้ใช้"}
                  </th>
                  <th className="py-3 px-4 text-left whitespace-nowrap text-slate-600">
                    {t("colEmail") || "อีเมล"}
                  </th>
                  <th className="py-3 px-4 text-left whitespace-nowrap text-slate-600">
                    {t("modalPhoneLabel") || "เบอร์โทรศัพท์"}
                  </th>
                  <th className="py-3 px-4 text-center whitespace-nowrap text-slate-600">
                    {t("colRole") || "บทบาท"}
                  </th>
                  <th className="py-3 px-4 text-left whitespace-nowrap text-slate-600">
                    {t("modalLeaderLabel") || "หัวหน้า"}
                  </th>
                  <th className="py-3 px-4 text-center whitespace-nowrap text-slate-600">
                    {t("colStatus") || "สถานะ"}
                  </th>
                  <th className="py-3 px-4 text-center whitespace-nowrap text-slate-600">
                    {t("modalStartDateLabel") || "วันเริ่ม"}
                  </th>
                  <th className="py-3 px-4 text-center whitespace-nowrap text-slate-600">
                    {t("modalExpireDateLabel") || "วันหมดอายุ"}
                  </th>
                  <th className="py-3 px-4 text-center whitespace-nowrap text-slate-600">
                    {t("importActionCol") || "ผลลัพธ์การนำเข้า"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                {filteredList.map((user) => {
                  return (
                    <tr
                      key={user.idx}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-3 text-center text-slate-400 font-medium">
                        {user.idx}
                      </td>
                      <td className="py-3 px-4 text-left font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 font-black flex items-center justify-center text-[11px] shrink-0">
                            {user.fullname
                              ? user.fullname[0]?.toUpperCase()
                              : "U"}
                          </div>
                          <span className="text-slate-900">
                            {user.fullname}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-left text-slate-600 font-medium whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="py-3 px-4 text-left text-slate-600 font-medium whitespace-nowrap">
                        {user.phone}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold ${getRoleBadgeStyle(
                            user.role,
                          )}`}
                        >
                          {formatRole(user.role)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-left text-slate-600 font-medium whitespace-nowrap">
                        {user.leader}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {user.status === "suspended" ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px]">
                            {t("suspendedLabel") || "Suspended"}
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                            {t("activeLabel") || "Active"}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600 font-medium whitespace-nowrap">
                        {user.startDate}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600 font-medium whitespace-nowrap">
                        {user.expireDate}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {user.importType === "new" && (
                          <span className="inline-flex items-center px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-[11px] shadow-sm">
                            {t("importActionCreate") || "New Account"}
                          </span>
                        )}
                        {user.importType === "update" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 font-bold text-[11px] shadow-sm">
                            {t("importActionUpdate") || "Update Account"}
                          </span>
                        )}
                        {user.importType === "invalid" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-300 font-bold text-[11px] shadow-sm">
                            {t("importActionInvalid") || "Skip"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredList.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center text-slate-400 py-10 text-xs font-semibold"
                    >
                      {t("noUsersText") || "ไม่พบข้อมูลที่ค้นหา"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/80 mt-2">
          <div className="text-xs text-slate-600 text-center sm:text-left font-medium">
            <span>
              {t("importConfirmSummary") || "พร้อมนำเข้าทั้งหมด"}{" "}
              <strong className="text-emerald-700 font-black">
                {stats.newCount + stats.updateCount}
              </strong>{" "}
              {t("entriesText") || "รายการ"}
            </span>
            {stats.invalidCount > 0 && (
              <span className="text-rose-600 ml-2 font-semibold">
                ({t("importInvalidSkipped") || "ระบบจะข้ามรายการที่ไม่สมบูรณ์"}{" "}
                {stats.invalidCount} {t("entriesText") || "รายการ"})
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={loading}
              onClick={onHide}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all disabled:opacity-50"
            >
              {t("cancelBtn") || "ยกเลิก"}
            </button>
            <button
              type="button"
              disabled={
                loading || (stats.newCount === 0 && stats.updateCount === 0)
              }
              onClick={onConfirm}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>
                    {t("importingProgress") || "กำลังนำเข้าข้อมูล..."}
                  </span>
                </>
              ) : (
                <>
                  <span>✓</span>
                  <span>{t("confirmBtn") || "ตกลงนำเข้าข้อมูล"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ImportPreviewModal;
