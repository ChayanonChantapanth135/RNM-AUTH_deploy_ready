import React, { useState, useMemo } from "react";
import { Modal } from "react-bootstrap";

const normalizeRole = (role) => {
  if (!role) return "storyboard";
  const r = String(role).toLowerCase().trim();
  if (r === "admin") return "admin";
  if (r === "manager" || r === "project_manager" || r === "project manager")
    return "manager";
  if (r === "storyboard") return "storyboard";
  if (r === "animation") return "animation";
  if (r === "designer") return "designer";
  if (r === "programmer") return "programmer";
  return r;
};

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

const normalizePhone = (phoneStr) => {
  if (!phoneStr) return "";
  const cleaned = String(phoneStr).replace(/\D/g, "");
  return cleaned;
};

const normalizeDateStr = (dateVal) => {
  if (!dateVal) return "";
  const str = String(dateVal).trim();
  if (!str || str === "-" || str.toLowerCase() === "null") return "";

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const month = dmyMatch[2].padStart(2, "0");
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // ISO String
  if (str.includes("T")) {
    return str.split("T")[0];
  }

  // YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, "0");
    const day = ymdMatch[3].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return str;
};

/**
 * คอมโพเนนต์ Popup Preview พร้อมระบบ Smart Diffing (ตรวจสอบการเปลี่ยนแปลงเฉพาะฟิลด์)
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

  // แผนผังผู้ใช้เดิมในระบบ (ค้นหาด้วย Email แบบ O(1))
  const existingUserMap = useMemo(() => {
    const map = new Map();
    existingUsers.forEach((u) => {
      const email = (u.email || "").toLowerCase().trim();
      if (email) {
        map.set(email, u);
      }
    });
    return map;
  }, [existingUsers]);

  // วิเคราะห์สถานะของแต่ละแถวด้วย Smart Diff
  const analyzedUsers = useMemo(() => {
    return users.map((user, idx) => {
      const fullname = (
        user.fullname ||
        user.name ||
        user.username ||
        ""
      ).trim();
      const email = (user.email || "").toLowerCase().trim();
      const rawPhone = user.phone || user.phonenumber || user.tel || "";
      const phone = String(rawPhone).trim();
      const role = normalizeRole(user.role || "storyboard");
      const leader = (
        user.leader_email ||
        user.leader ||
        user.leader_name ||
        user.leader_id ||
        ""
      )
        .toString()
        .trim();
      const status =
        (user.status || "active").toLowerCase().trim() === "suspended"
          ? "suspended"
          : "active";
      const startDate = normalizeDateStr(
        user.start_date || user.startdate || user.startDate,
      );
      const expireDate = normalizeDateStr(
        user.expire_date || user.expiredate || user.expireDate,
      );
      const password = (user.password || "").trim();

      const isValid = Boolean(email && fullname);
      const existing = existingUserMap.get(email);
      const isExisting = Boolean(existing);

      let importType = "new"; // "new", "changed", "unchanged", "invalid"
      const changedFields = [];

      if (!isValid) {
        importType = "invalid";
      } else if (isExisting) {
        // ทำการเปรียบเทียบข้อมูลจริงทีละ Field
        const exName = (existing.fullname || existing.name || "").trim();
        const exPhone = normalizePhone(existing.phone);
        const curPhone = normalizePhone(phone);
        const exRole = normalizeRole(existing.rawRole || existing.role);
        const exStatus =
          (existing.status || "active").toLowerCase().trim() === "suspended"
            ? "suspended"
            : "active";
        const exStartDate = normalizeDateStr(
          existing.startDate || existing.start_date,
        );
        const exExpireDate = normalizeDateStr(
          existing.expireDate || existing.expire_date,
        );

        if (fullname.toLowerCase() !== exName.toLowerCase()) {
          changedFields.push("fullname");
        }
        if (curPhone !== exPhone && (curPhone !== "" || exPhone !== "")) {
          changedFields.push("phone");
        }
        if (role !== exRole) {
          changedFields.push("role");
        }
        if (status !== exStatus) {
          changedFields.push("status");
        }
        if (startDate !== exStartDate && (startDate !== "" || exStartDate !== "")) {
          changedFields.push("startDate");
        }
        if (expireDate !== exExpireDate && (expireDate !== "" || exExpireDate !== "")) {
          changedFields.push("expireDate");
        }
        if (leader && leader !== "-" && leader.toLowerCase() !== "null") {
          const exLeaderName = (existing.leaderName || "").toLowerCase();
          const exLeaderId = String(existing.leaderId || "");
          if (
            !exLeaderName.includes(leader.toLowerCase()) &&
            leader.toLowerCase() !== exLeaderId
          ) {
            changedFields.push("leader");
          }
        }
        if (password) {
          changedFields.push("password");
        }

        if (changedFields.length > 0) {
          importType = "changed";
        } else {
          importType = "unchanged";
        }
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
        changedFields,
        rawUser: user,
      };
    });
  }, [users, existingUserMap]);

  const stats = useMemo(() => {
    let newCount = 0;
    let changedCount = 0;
    let unchangedCount = 0;
    let invalidCount = 0;

    analyzedUsers.forEach((u) => {
      if (u.importType === "new") newCount++;
      else if (u.importType === "changed") changedCount++;
      else if (u.importType === "unchanged") unchangedCount++;
      else invalidCount++;
    });

    return {
      newCount,
      changedCount,
      unchangedCount,
      invalidCount,
      total: analyzedUsers.length,
    };
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

  // ส่งเฉพาะผู้ใช้ใหม่ และผู้ใช้ที่มีข้อมูลเปลี่ยนแปลงไปยัง Backend
  const handleConfirmSync = () => {
    const usersToImport = analyzedUsers
      .filter((u) => u.importType === "new" || u.importType === "changed")
      .map((u) => u.rawUser);

    if (onConfirm) {
      onConfirm(usersToImport);
    }
  };

  const actionableCount = stats.newCount + stats.changedCount;

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      backdrop="static"
      keyboard={false}
      dialogClassName="!max-w-6xl my-2 sm:my-8 px-2 sm:px-0"
    >
      <Modal.Body
        className="!p-0 p-0 overflow-hidden"
        style={{
          borderRadius: "1.25rem",
          backgroundColor: "#FFFFFF",
          color: "#0F172A",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          padding: 0,
        }}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50/80">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl sm:text-2xl font-bold border border-indigo-100 shadow-sm shrink-0">
              📥
            </div>
            <div className="min-w-0">
              <h4 className="text-base sm:text-xl font-extrabold text-slate-900 mb-0.5 tracking-tight truncate">
                {t("importPreviewTitle") || "ตรวจสอบข้อมูลก่อนนำเข้า"}
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mb-0 truncate">
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

          <button
            type="button"
            onClick={onHide}
            className="shrink-0 text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-xl bg-slate-200/70 hover:bg-slate-200 text-xs font-bold transition-all"
          >
            ✕ {t("cancelBtn") || "ยกเลิก"}
          </button>
        </div>

        {/* Quick Stats Banner */}
        <div className="px-3.5 sm:px-6 py-3 sm:py-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 bg-slate-100/60 border-b border-slate-200">
          <div className="p-2.5 sm:p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 truncate">
              {t("importTotalCount") || "รายการทั้งหมด"}
            </span>
            <span className="text-lg sm:text-2xl font-black text-slate-800 mt-0.5">
              {stats.total}
            </span>
          </div>
          <div className="p-2.5 sm:p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm flex flex-col">
            <span className="text-[11px] sm:text-xs font-bold text-emerald-700 flex items-center gap-1.5 truncate">
              <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
              {t("importNewUsers") || "เพิ่มผู้ใช้ใหม่"}
            </span>
            <span className="text-lg sm:text-2xl font-black text-emerald-600 mt-0.5">
              +{stats.newCount}
            </span>
          </div>
          <div className="p-2.5 sm:p-3.5 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm flex flex-col">
            <span className="text-[11px] sm:text-xs font-bold text-amber-700 flex items-center gap-1.5 truncate">
              <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-amber-500 shrink-0"></span>
              {t("importChangedUsers") || "ข้อมูลเปลี่ยนแปลง"}
            </span>
            <span className="text-lg sm:text-2xl font-black text-amber-600 mt-0.5">
              {stats.changedCount}
            </span>
          </div>
          <div className="p-2.5 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-300 shadow-sm flex flex-col">
            <span className="text-[11px] sm:text-xs font-bold text-slate-600 flex items-center gap-1.5 truncate">
              <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-slate-400 shrink-0"></span>
              {t("importUnchangedUsers") || "ไม่มีการแก้ไข"}
            </span>
            <span className="text-lg sm:text-2xl font-black text-slate-600 mt-0.5">
              {stats.unchangedCount}
            </span>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="p-3.5 sm:p-6 pb-2 flex flex-col sm:flex-row justify-between items-center gap-2.5 sm:gap-3">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              className="w-full rounded-2xl py-2 sm:py-2.5 pl-9 pr-4 text-xs font-medium focus:outline-none transition-all placeholder:text-slate-400"
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

          <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            <button
              onClick={() => setStatusFilter("all")}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold text-center whitespace-nowrap transition-all ${
                statusFilter === "all"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t("roleFilterAll") || "ทั้งหมด"} ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter("changed")}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold text-center whitespace-nowrap transition-all ${
                statusFilter === "changed"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                  : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700"
              }`}
            >
              {t("importChangedUsers") || "ข้อมูลเปลี่ยน"} ({stats.changedCount})
            </button>
            <button
              onClick={() => setStatusFilter("new")}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold text-center whitespace-nowrap transition-all ${
                statusFilter === "new"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              {t("importNewUsers") || "ผู้ใช้ใหม่"} ({stats.newCount})
            </button>
            <button
              onClick={() => setStatusFilter("unchanged")}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold text-center whitespace-nowrap transition-all ${
                statusFilter === "unchanged"
                  ? "bg-slate-700 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t("importUnchangedUsers") || "ไม่เปลี่ยน"} ({stats.unchangedCount})
            </button>
            {stats.invalidCount > 0 && (
              <button
                onClick={() => setStatusFilter("invalid")}
                className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold text-center whitespace-nowrap transition-all ${
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

        {/* Notice Info */}
        <div className="px-3.5 sm:px-6 py-1">
          <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <span className="shrink-0">⚡</span>
            <span>
              {t("importChangedOnlyNotice") ||
                "ระบบจะบันทึกเฉพาะรายการใหม่และรายการที่มีการเปลี่ยนแปลง เพื่อความรวดเร็วและลดโหลดฐานข้อมูล"}
            </span>
          </div>
        </div>

        {/* Table & Mobile Cards Container */}
        <div className="px-3.5 sm:px-6 py-2">
          {/* Desktop Table View (Hidden on mobile) */}
          <div
            className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 bg-white light-scrollbar"
            style={{ maxHeight: "360px", overflowY: "auto" }}
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
                  const isChangedRow = user.importType === "changed";
                  const fields = user.changedFields || [];

                  return (
                    <tr
                      key={user.idx}
                      className={`hover:bg-slate-50 transition-colors ${
                        user.importType === "unchanged" ? "opacity-75" : ""
                      }`}
                    >
                      <td className="py-3 px-3 text-center text-slate-400 font-medium">
                        {user.idx}
                      </td>
                      <td
                        className={`py-3 px-4 text-left font-bold text-slate-900 whitespace-nowrap ${
                          isChangedRow && fields.includes("fullname")
                            ? "bg-amber-50/80 text-amber-900"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 font-black flex items-center justify-center text-[11px] shrink-0">
                            {user.fullname
                              ? user.fullname[0]?.toUpperCase()
                              : "U"}
                          </div>
                          <span className="text-slate-900">
                            {user.fullname}
                          </span>
                          {isChangedRow && fields.includes("fullname") && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 font-bold">
                              ✏️ แก้ไข
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-left text-slate-600 font-medium whitespace-nowrap">
                        {user.email}
                      </td>
                      <td
                        className={`py-3 px-4 text-left text-slate-600 font-medium whitespace-nowrap ${
                          isChangedRow && fields.includes("phone")
                            ? "bg-amber-50/80 font-bold text-amber-900"
                            : ""
                        }`}
                      >
                        {user.phone}
                        {isChangedRow && fields.includes("phone") && (
                          <span className="ml-1 text-[10px] text-amber-700 font-bold">
                            ✏️
                          </span>
                        )}
                      </td>
                      <td
                        className={`py-3 px-4 text-center whitespace-nowrap ${
                          isChangedRow && fields.includes("role")
                            ? "bg-amber-50/80"
                            : ""
                        }`}
                      >
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold ${getRoleBadgeStyle(
                            user.role,
                          )}`}
                        >
                          {formatRole(user.role)}
                        </span>
                        {isChangedRow && fields.includes("role") && (
                          <span className="ml-1 text-[10px] text-amber-700 font-bold">
                            ✏️
                          </span>
                        )}
                      </td>
                      <td
                        className={`py-3 px-4 text-center whitespace-nowrap ${
                          isChangedRow && fields.includes("status")
                            ? "bg-amber-50/80"
                            : ""
                        }`}
                      >
                        {user.status === "suspended" ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px]">
                            {t("suspendedLabel") || "Suspended"}
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                            {t("activeLabel") || "Active"}
                          </span>
                        )}
                        {isChangedRow && fields.includes("status") && (
                          <span className="ml-1 text-[10px] text-amber-700 font-bold">
                            ✏️
                          </span>
                        )}
                      </td>
                      <td
                        className={`py-3 px-4 text-center text-slate-600 font-medium whitespace-nowrap ${
                          isChangedRow && fields.includes("startDate")
                            ? "bg-amber-50/80 font-bold text-amber-900"
                            : ""
                        }`}
                      >
                        {user.startDate}
                      </td>
                      <td
                        className={`py-3 px-4 text-center text-slate-600 font-medium whitespace-nowrap ${
                          isChangedRow && fields.includes("expireDate")
                            ? "bg-amber-50/80 font-bold text-amber-900"
                            : ""
                        }`}
                      >
                        {user.expireDate}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {user.importType === "new" && (
                          <span className="inline-flex items-center px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-[11px] shadow-sm">
                            {t("importActionCreate") || "New Account"}
                          </span>
                        )}
                        {user.importType === "changed" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 font-bold text-[11px] shadow-sm">
                            {t("importActionChanged") || "Update (Changed)"}
                          </span>
                        )}
                        {user.importType === "unchanged" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 font-medium text-[11px]">
                            {t("importActionUnchanged") || "No Change (Skip)"}
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
                      colSpan={10}
                      className="text-center text-slate-400 py-10 text-xs font-semibold"
                    >
                      {t("noUsersText") || "ไม่พบข้อมูลที่ค้นหา"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (Shown on mobile only, eliminates horizontal scrolling) */}
          <div
            className="md:hidden flex flex-col gap-2.5 overflow-y-auto light-scrollbar pr-0.5"
            style={{ maxHeight: "380px" }}
          >
            {filteredList.map((user) => {
              const isChangedRow = user.importType === "changed";
              const fields = user.changedFields || [];

              return (
                <div
                  key={user.idx}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2 ${
                    user.importType === "new"
                      ? "bg-emerald-50/40 border-emerald-200/90 shadow-sm"
                      : user.importType === "changed"
                      ? "bg-amber-50/50 border-amber-200/90 shadow-sm"
                      : user.importType === "invalid"
                      ? "bg-rose-50/40 border-rose-200/90 shadow-sm"
                      : "bg-white border-slate-200 opacity-80"
                  }`}
                >
                  {/* Card Header: # + Avatar + Full Name + Import Action Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="text-[11px] font-bold text-slate-400 shrink-0">
                        #{user.idx}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 font-black flex items-center justify-center text-xs shrink-0">
                        {user.fullname
                          ? user.fullname[0]?.toUpperCase()
                          : "U"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`font-bold text-xs truncate ${
                              isChangedRow && fields.includes("fullname")
                                ? "text-amber-900"
                                : "text-slate-900"
                            }`}
                          >
                            {user.fullname}
                          </span>
                          {isChangedRow && fields.includes("fullname") && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 font-bold">
                              ✏️ แก้ไข
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate font-medium">
                          {user.email}
                        </div>
                      </div>
                    </div>

                    {/* Action Badge */}
                    <div className="shrink-0">
                      {user.importType === "new" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px]">
                          {t("importActionCreate") || "New"}
                        </span>
                      )}
                      {user.importType === "changed" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[10px]">
                          {t("importActionChanged") || "Update"}
                        </span>
                      )}
                      {user.importType === "unchanged" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 font-medium text-[10px]">
                          {t("importActionUnchanged") || "Skip"}
                        </span>
                      )}
                      {user.importType === "invalid" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-rose-100 text-rose-700 border border-rose-300 font-bold text-[10px]">
                          {t("importActionInvalid") || "Skip"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Details: Role, Status, Phone */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    {/* Role */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[11px] shrink-0">
                        {t("colRole") || "บทบาท"}:
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold ${getRoleBadgeStyle(
                          user.role,
                        )}`}
                      >
                        {formatRole(user.role)}
                      </span>
                      {isChangedRow && fields.includes("role") && (
                        <span className="text-[10px] text-amber-700 font-bold">
                          ✏️
                        </span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-slate-400 text-[11px] shrink-0">
                        {t("colStatus") || "สถานะ"}:
                      </span>
                      {user.status === "suspended" ? (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[10px]">
                          {t("suspendedLabel") || "Suspended"}
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                          {t("activeLabel") || "Active"}
                        </span>
                      )}
                      {isChangedRow && fields.includes("status") && (
                        <span className="text-[10px] text-amber-700 font-bold">
                          ✏️
                        </span>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-1.5 col-span-2">
                      <span className="text-slate-400 text-[11px] shrink-0">
                        {t("modalPhoneLabel") || "เบอร์โทร"}:
                      </span>
                      <span
                        className={`text-[11px] text-slate-700 font-medium ${
                          isChangedRow && fields.includes("phone")
                            ? "bg-amber-100 text-amber-900 px-1 rounded font-bold"
                            : ""
                        }`}
                      >
                        {user.phone || "-"}
                      </span>
                      {isChangedRow && fields.includes("phone") && (
                        <span className="text-[10px] text-amber-700 font-bold">
                          ✏️
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dates Row */}
                  <div className="flex items-center justify-between text-[11px] bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">
                        {t("modalStartDateLabel") || "วันเริ่ม"}:
                      </span>
                      <span
                        className={`font-medium ${
                          isChangedRow && fields.includes("startDate")
                            ? "text-amber-800 font-bold"
                            : "text-slate-700"
                        }`}
                      >
                        {user.startDate || "-"}
                      </span>
                      {isChangedRow && fields.includes("startDate") && (
                        <span className="text-[10px] text-amber-700 font-bold">
                          ✏️
                        </span>
                      )}
                    </div>
                    <span className="text-slate-300">→</span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">
                        {t("modalExpireDateLabel") || "วันหมด"}:
                      </span>
                      <span
                        className={`font-medium ${
                          isChangedRow && fields.includes("expireDate")
                            ? "text-amber-800 font-bold"
                            : "text-slate-700"
                        }`}
                      >
                        {user.expireDate || "-"}
                      </span>
                      {isChangedRow && fields.includes("expireDate") && (
                        <span className="text-[10px] text-amber-700 font-bold">
                          ✏️
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredList.length === 0 && (
              <div className="text-center text-slate-400 py-8 text-xs font-semibold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                {t("noUsersText") || "ไม่พบข้อมูลที่ค้นหา"}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 bg-slate-50/80 mt-2">
          <div className="text-xs text-slate-600 text-center sm:text-left font-medium w-full sm:w-auto">
            <span>
              {t("importConfirmSummary") || "พร้อมนำเข้า/อัปเดต"}{" "}
              <strong className="text-emerald-700 font-black">
                {actionableCount}
              </strong>{" "}
              {t("entriesText") || "รายการ"}
            </span>
            {stats.unchangedCount > 0 && (
              <span className="text-slate-500 block sm:inline sm:ml-2">
                ({t("importUnchangedUsers") || "ข้อมูลเหมือนเดิม"}{" "}
                {stats.unchangedCount} {t("entriesText") || "รายการ ข้ามอัตโนมัติ"})
              </span>
            )}
            {stats.invalidCount > 0 && (
              <span className="text-rose-600 block sm:inline sm:ml-2 font-semibold">
                ({t("importInvalidSkipped") || "ระบบจะข้ามรายการที่ไม่สมบูรณ์"}{" "}
                {stats.invalidCount} {t("entriesText") || "รายการ"})
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5 w-full sm:w-auto sm:flex sm:items-center sm:gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={onHide}
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all disabled:opacity-50 text-center"
            >
              {t("cancelBtn") || "ยกเลิก"}
            </button>
            <button
              type="button"
              disabled={loading || actionableCount === 0}
              onClick={handleConfirmSync}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-center"
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
                  <span>
                    {actionableCount === 0
                      ? t("importNoChanges") || "ไม่มีข้อมูลเปลี่ยนแปลง"
                      : `${t("confirmBtn") || "ตกลงนำเข้า"} (${actionableCount})`}
                  </span>
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
