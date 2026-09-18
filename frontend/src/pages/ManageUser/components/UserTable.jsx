import React from "react";
import { API_URL } from "../../../config";

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
  if (r.includes("admin")) return "bg-indigo-500/20 text-indigo-300";
  if (r.includes("manager")) return "bg-pink-500/20 text-pink-300";
  if (r.includes("storyboard")) return "bg-amber-500/20 text-amber-300";
  if (r.includes("animation")) return "bg-emerald-500/20 text-emerald-300";
  if (r.includes("designer")) return "bg-purple-500/20 text-purple-300";
  if (r.includes("programmer")) return "bg-cyan-500/20 text-cyan-300";
  return "bg-slate-800 text-slate-300";
};

const UserTable = ({
  filteredUsers,
  currentUser,
  currentPage,
  setCurrentPage,
  entriesPerPage,
  setEntriesPerPage,
  t,
  handleOpenEdit,
  handleToggleStatus,
  handleDeleteUser,
}) => {
  const totalEntries = filteredUsers.length;
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredUsers.slice(
    indexOfFirstEntry,
    indexOfLastEntry,
  );
  const totalPages = Math.ceil(totalEntries / entriesPerPage);

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-2xl overflow-hidden">
      {/* Show entries row */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span>{t("showText")}</span>
          <select
            className="bg-slate-900/80 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none"
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>{t("entriesPerPageText")}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-slate-400 font-bold">
              <th className="py-4 px-4 text-left whitespace-nowrap">{t("colUser")}</th>
              <th className="py-4 px-4 text-left whitespace-nowrap">{t("colEmail")}</th>
              <th className="py-4 px-4 text-center whitespace-nowrap">{t("colRole")}</th>
              <th className="py-4 px-4 text-center whitespace-nowrap">{t("colStatus")}</th>
              <th className="py-4 px-4 text-center whitespace-nowrap">{t("colLastLogin")}</th>
              <th className="py-4 px-4 text-center w-36 whitespace-nowrap">{t("colManage")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-slate-200">
            {currentEntries.map((user) => {
              const isSelf =
                currentUser &&
                (Number(currentUser.id) === Number(user.id) ||
                  currentUser.email?.toLowerCase() ===
                    user.email?.toLowerCase());

              return (
                <tr
                  key={user.id}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-4 text-left whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={
                            user.avatar.startsWith("http")
                              ? user.avatar
                              : `${API_URL}${user.avatar}`
                          }
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-indigo-600/30 flex items-center justify-center font-bold text-xs text-indigo-300 shrink-0">
                          {user.initials}
                        </div>
                      )}
                      <div className="flex items-center gap-2 flex-nowrap whitespace-nowrap">
                        <span className="font-bold text-white whitespace-nowrap">
                          {user.name}
                        </span>
                        {user.isLeader && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold tracking-wide shadow-sm flex items-center gap-1 shrink-0 whitespace-nowrap">
                            {t("leaderBadge") || "Leader"}
                          </span>
                        )}
                        {isSelf && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold shrink-0 whitespace-nowrap">
                            {t("youBadge")}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-400 text-xs text-left">
                    <div>{user.email}</div>
                  </td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${getRoleBadgeStyle(user.role)}`}
                    >
                      {formatRole(user.role)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    {user.status === "active" ? (
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold whitespace-nowrap">
                        {t("activeLabel")}
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-semibold whitespace-nowrap">
                        {t("suspendedLabel")}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-slate-400 text-xs text-center whitespace-nowrap">
                    {user.lastLogin}
                  </td>
                  <td className="py-4 px-4 text-center w-36">
                    <div className="inline-flex items-center gap-2 justify-center">
                      <button
                        className="p-2 rounded-xl bg-white/5 text-slate-300 transition-colors hover:scale-110"
                        onClick={() => handleOpenEdit(user)}
                      >
                        ✏️
                      </button>
                      <button
                        disabled={isSelf}
                        className={`p-2 rounded-xl transition-colors ${isSelf ? "opacity-30 cursor-not-allowed" : user.status === "suspended" ? "bg-emerald-500/20 text-emerald-300 hover:scale-110" : "bg-amber-500/20 text-amber-300 hover:scale-110"}`}
                        onClick={() => !isSelf && handleToggleStatus(user)}
                        title={
                          isSelf
                            ? t("cannotSuspendSelf") ||
                              "ไม่สามารถระงับสิทธิ์ตัวเองได้"
                            : ""
                        }
                      >
                        {user.status === "suspended" ? "🔓" : "⏸️"}
                      </button>
                      <button
                        disabled={isSelf}
                        className={`p-2 rounded-xl bg-rose-500/20 text-rose-300 transition-colors ${isSelf ? "opacity-30 cursor-not-allowed" : "hover:scale-110"}`}
                        onClick={() => !isSelf && handleDeleteUser(user)}
                        title={
                          isSelf
                            ? t("cannotDeleteSelf") || "ไม่สามารถลบตัวเองได้"
                            : ""
                        }
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {currentEntries.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center text-slate-500 py-8 text-sm"
                >
                  {t("noUsersText")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div
        className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 text-xs"
        style={{
          borderTop: "1px solid var(--border-surface)",
          color: "var(--text-secondary)",
        }}
      >
        <span>
          {t("showingText")} {totalEntries === 0 ? 0 : indexOfFirstEntry + 1}{" "}
          {t("toText")} {Math.min(indexOfLastEntry, totalEntries)} {t("ofText")}{" "}
          {totalEntries} {t("entriesText")}
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold disabled:opacity-40 transition-all cursor-pointer shadow-sm hover:shadow-md"
              style={{
                background: "var(--bg-surface-hover)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-surface)",
              }}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              {t("prevText") || "Previous"}
            </button>
            <span
              className="px-3.5 py-1.5 font-bold rounded-xl text-xs pagination-badge shadow-md"
              style={{
                background: "var(--brand-color)",
                color: "#FFFFFF",
              }}
            >
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold disabled:opacity-40 transition-all cursor-pointer shadow-sm hover:shadow-md"
              style={{
                background: "var(--bg-surface-hover)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-surface)",
              }}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
            >
              {t("nextText") || "Next"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTable;
