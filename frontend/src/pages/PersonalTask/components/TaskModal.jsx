import React, { useState, useEffect } from "react";
import CustomDateInput from "../../../components/CustomDateInput";
import { useLanguage } from "../../../lib/LanguageContext";

const TaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  columnTitle = "",
}) => {
  const { language } = useLanguage();
  const isThai = language === "th";

  const [title, setTitle] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || "");
        const rawDate = initialData.task_date || "";
        const iso = rawDate.includes("T") ? rawDate.split("T")[0] : rawDate;
        setTaskDate(iso);
      } else {
        setTitle("");
        setTaskDate("");
      }
      setError("");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(isThai ? "กรุณากรอกชื่องาน" : "Please enter task title");
      return;
    }
    onSubmit({
      title: title.trim(),
      task_date: taskDate || null,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        // backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        className="rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-visible"
        style={{
          backgroundColor: "#FFFFFF",
          color: "#0F172A",
          border: "1px solid #E2E8F0",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.45)",
          animation: "modalZoomIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes modalZoomIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* Modal Header */}
        <div
          className="flex items-center justify-between pb-4 mb-4"
          style={{ borderBottom: "1px solid #E2E8F0" }}
        >
          <div>
            <h2
              className="text-xl font-bold flex items-center gap-2"
              style={{ color: "#0F172A" }}
            >
              <span>
                {initialData
                  ? isThai
                    ? "แก้ไข Task"
                    : "Edit Task"
                  : isThai
                    ? `เพิ่ม Task ใหม่ ${columnTitle ? `(${columnTitle})` : ""}`
                    : `Add New Task ${columnTitle ? `(${columnTitle})` : ""}`}
              </span>
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
              {isThai
                ? "กรอกรายละเอียดงานส่วนตัวของคุณ"
                : "Fill in your personal task details"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-visible">
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-1.5"
              style={{ color: "#334155" }}
            >
              {isThai ? "ชื่องาน" : "Task Title"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              rows="3"
              maxLength={200}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              style={{
                backgroundColor: "#F8FAFC",
                color: "#0F172A",
                border: "1.5px solid #94A3B8",
                wordBreak: "break-word",
                lineHeight: "1.5",
              }}
              placeholder={
                isThai ? "กรอกชื่องานของคุณ..." : "Enter task title..."
              }
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError("");
              }}
              autoFocus
            />
            <div className="flex justify-end text-[11px] text-slate-400 mt-1">
              <span>{title.length}/200</span>
            </div>
          </div>

          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-1.5"
              style={{ color: "#334155" }}
            >
              {isThai ? "วันที่กำหนด" : "Due Date"}
            </label>
            <CustomDateInput
              value={taskDate}
              onChange={(e) => setTaskDate(e.target.value)}
              name="taskDate"
              placeholder="DD/MM/YYYY"
              placement="top"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: "#F8FAFC",
                color: "#0F172A",
                border: "1.5px solid #94A3B8",
              }}
            />
          </div>

          {/* Modal Actions */}
          <div
            className="flex items-center justify-end gap-2.5 pt-4 mt-6"
            style={{ borderTop: "1px solid #E2E8F0" }}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-red-600/15 hover:bg-red-600 text-red-500 hover:text-white rounded-xl text-sm font-semibold border border-red-500/25 transition-all cursor-pointer"
            >
              {isThai ? "ยกเลิก" : "Cancel"}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white shadow-md transition-all cursor-pointer hover:scale-102 active:scale-98"
              style={{
                backgroundColor: "var(--brand-color, #2563eb)",
              }}
            >
              {initialData
                ? isThai
                  ? "บันทึกการแก้ไข"
                  : "Save Changes"
                : isThai
                  ? "บันทึก"
                  : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
