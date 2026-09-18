import React, { useState, useEffect, useRef } from "react";
import { formatDate, safeDateString } from "../lib/dateUtils";
import { useLanguage } from "../lib/LanguageContext";

const MONTH_NAMES_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_NAMES_TH = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const WEEKDAYS_EN = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const WEEKDAYS_TH = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"];

const CustomDateInput = ({
  value,
  onChange,
  name = "dueDate",
  placeholder = "DD/MM/YYYY",
  className = "form-control rounded-lg text-sm py-2",
  disabled = false,
  required = false,
  placement = "auto", // "auto" | "top" | "bottom"
  style = {},
}) => {
  const { language } = useLanguage();
  const [inputText, setInputText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Calendar navigation state (CE year and 0-indexed month)
  const [viewYear, setViewYear] = useState(() => {
    if (value) {
      const iso = safeDateString(value);
      if (iso) return parseInt(iso.split("-")[0], 10);
    }
    return new Date().getFullYear();
  });

  const [viewMonth, setViewMonth] = useState(() => {
    if (value) {
      const iso = safeDateString(value);
      if (iso) return parseInt(iso.split("-")[1], 10) - 1;
    }
    return new Date().getMonth();
  });

  // Keep display text synchronized with incoming YYYY-MM-DD value
  useEffect(() => {
    if (value) {
      setInputText(formatDate(value, language));
      const iso = safeDateString(value);
      if (iso) {
        const [y, m] = iso.split("-");
        setViewYear(parseInt(y, 10));
        setViewMonth(parseInt(m, 10) - 1);
      }
    } else {
      setInputText("");
    }
  }, [value, language]);

  // Close calendar popup on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle direct typing in DD/MM/YYYY format
  const handleTextChange = (e) => {
    const val = e.target.value;
    setInputText(val);

    const match = val.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      const day = match[1].padStart(2, "0");
      const month = match[2].padStart(2, "0");
      let yearNum = parseInt(match[3], 10);
      if (yearNum > 2400) yearNum -= 543;

      const isoStr = `${yearNum}-${month}-${day}`;
      const testDate = new Date(`${yearNum}-${month}-${day}T00:00:00`);
      if (!isNaN(testDate.getTime())) {
        onChange({ target: { name, value: isoStr } });
        setViewYear(yearNum);
        setViewMonth(parseInt(month, 10) - 1);
      }
    } else if (!val.trim()) {
      onChange({ target: { name, value: "" } });
    }
  };

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDate = (year, month, day) => {
    const yStr = String(year);
    const mStr = String(month + 1).padStart(2, "0");
    const dStr = String(day).padStart(2, "0");
    const isoStr = `${yStr}-${mStr}-${dStr}`;

    onChange({ target: { name, value: isoStr } });
    setIsOpen(false);
  };

  // Selected date parsing
  const selectedIso = safeDateString(value);
  let selYear = null,
    selMonth = null,
    selDay = null;
  if (selectedIso) {
    const parts = selectedIso.split("-");
    selYear = parseInt(parts[0], 10);
    selMonth = parseInt(parts[1], 10) - 1;
    selDay = parseInt(parts[2], 10);
  }

  // Today parsing
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();

  // Generate 42 calendar grid cells (Monday - Sunday)
  const generateDays = () => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    // getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
    // Convert to 0 for Monday ... 6 for Sunday
    const dayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells = [];

    // Prev month days
    for (let i = dayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      cells.push({
        day: d,
        month: prevM,
        year: prevY,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      cells.push({
        day: d,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
      });
    }

    // Next month days to make complete grid (up to 35 or 42)
    const totalSlots = cells.length > 35 ? 42 : 35;
    const remaining = totalSlots - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      cells.push({
        day: d,
        month: nextM,
        year: nextY,
        isCurrentMonth: false,
      });
    }

    return cells;
  };

  const [openDirection, setOpenDirection] = useState("down"); // "down" | "up"

  useEffect(() => {
    if (placement === "top") {
      setOpenDirection("up");
      return;
    }
    if (placement === "bottom") {
      setOpenDirection("down");
      return;
    }

    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const popoverHeight = 360;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < popoverHeight || spaceAbove > spaceBelow) {
        setOpenDirection("up");
      } else {
        setOpenDirection("down");
      }
    }
  }, [isOpen, placement]);

  const calendarDays = generateDays();
  const monthNames = language === "th" ? MONTH_NAMES_TH : MONTH_NAMES_EN;
  const weekdays = language === "th" ? WEEKDAYS_TH : WEEKDAYS_EN;
  const displayYear = language === "th" ? viewYear + 543 : viewYear;

  // Generate 50 years forward and 50 years backward for the year selector
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 101 }, (_, i) => {
    const y = currentYear - 50 + i;
    return {
      year: y,
      label: language === "th" ? String(y + 543) : String(y),
    };
  });

  return (
    <div className="position-relative w-100" ref={containerRef}>
      {/* Input row */}
      <div className="position-relative d-flex align-items-center">
        <input
          type="text"
          className={`${className} cursor-pointer`}
          value={inputText}
          onChange={handleTextChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) setIsOpen((prev) => !prev);
          }}
          style={{
            paddingRight: "2.5rem",
            ...style,
          }}
        />
        <button
          type="button"
          className="btn btn-link p-0 position-absolute end-0 me-2 text-decoration-none border-0 bg-transparent text-muted cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) setIsOpen((prev) => !prev);
          }}
          disabled={disabled}
          title="Choose Date"
          style={{ zIndex: 5, display: "flex", alignItems: "center", cursor: "pointer" }}
        >
          <ion-icon
            name="calendar-outline"
            style={{ fontSize: "18px", color: "#64748b", pointerEvents: "none" }}
          ></ion-icon>
        </button>
      </div>

      {/* Modern Popover Calendar UI (Image 2 style) */}
      {isOpen && (
        <div
          className="position-absolute shadow-lg"
          style={{
            ...(openDirection === "up"
              ? { bottom: "calc(100% + 8px)" }
              : { top: "calc(100% + 8px)" }),
            right: 0,
            zIndex: 1050,
            width: "310px",
            backgroundColor: "var(--bg-surface)",
            borderRadius: "24px",
            padding: "20px",
            boxShadow:
              "0 20px 40px -10px rgba(0, 0, 0, 0.3), 0 8px 16px -6px rgba(0, 0, 0, 0.1)",
            border: "1px solid var(--border-surface)",
            fontFamily: "inherit",
            animation:
              openDirection === "up"
                ? "customFadeInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
                : "customFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <style>{`
            @keyframes customFadeIn {
              from { opacity: 0; transform: translateY(-8px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes customFadeInUp {
              from { opacity: 0; transform: translateY(8px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .date-cell-btn {
              transition: all 0.15s ease;
              border: none;
              outline: none;
            }
            .date-cell-btn:hover:not(.selected):not(.today-selected) {
              background-color: var(--bg-surface-hover) !important;
              color: var(--text-primary) !important;
            }
          `}</style>

          {/* Header with Month/Year badge and Navigation buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            {/* Prev month button */}
            <button
              type="button"
              onClick={handlePrevMonth}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-surface)",
                boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--text-primary)",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-surface-hover)";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-surface)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            {/* Month & Year Interactive Pill Badges */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {/* Month Pill */}
              <div
                style={{
                  position: "relative",
                  backgroundColor: "var(--bg-surface)",
                  padding: "6px 14px",
                  borderRadius: "12px",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
                  border: "1px solid var(--border-surface)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--bg-surface-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--bg-surface)")
                }
              >
                <span
                  style={{
                    fontWeight: "600",
                    fontSize: "12px",
                    color: "var(--text-primary)",
                    pointerEvents: "none",
                  }}
                >
                  {monthNames[viewMonth]}
                </span>
                <span
                  style={{
                    fontSize: "9px",
                    color: "var(--brand-color)",
                    pointerEvents: "none",
                    transform: "scale(0.85)",
                  }}
                >
                  ▲
                </span>

                {/* Invisible select covering whole pill */}
                <select
                  value={viewMonth}
                  onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                    zIndex: 2,
                  }}
                >
                  {monthNames.map((m, idx) => (
                    <option key={idx} value={idx}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Pill */}
              <div
                style={{
                  position: "relative",
                  backgroundColor: "var(--bg-surface)",
                  padding: "6px 14px",
                  borderRadius: "12px",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
                  border: "1px solid var(--border-surface)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--bg-surface-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--bg-surface)")
                }
              >
                <span
                  style={{
                    fontWeight: "600",
                    fontSize: "12px",
                    color: "var(--text-primary)",
                    pointerEvents: "none",
                  }}
                >
                  {displayYear}
                </span>
                <span
                  style={{
                    fontSize: "9px",
                    color: "var(--brand-color)",
                    pointerEvents: "none",
                    transform: "scale(0.85)",
                  }}
                >
                  ▲
                </span>

                {/* Invisible select covering whole year pill */}
                <select
                  value={viewYear}
                  onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                    zIndex: 2,
                  }}
                >
                  {yearOptions.map((opt) => (
                    <option key={opt.year} value={opt.year}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Next month button */}
            <button
              type="button"
              onClick={handleNextMonth}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-surface)",
                boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--text-primary)",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-surface-hover)";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-surface)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>

          {/* Weekday headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "4px",
              marginBottom: "8px",
              textAlign: "center",
            }}
          >
            {weekdays.map((wd, index) => (
              <div
                key={index}
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--text-secondary)",
                  padding: "4px 0",
                }}
              >
                {wd}
              </div>
            ))}
          </div>

          {/* Date days grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "4px",
            }}
          >
            {calendarDays.map((cell, index) => {
              const isSelected =
                selYear === cell.year &&
                selMonth === cell.month &&
                selDay === cell.day;

              const isToday =
                todayYear === cell.year &&
                todayMonth === cell.month &&
                todayDay === cell.day;

              let bg = "transparent";
              let color = cell.isCurrentMonth ? "var(--text-primary)" : "var(--text-secondary)";
              let fontWeight = "500";
              let shadow = "none";

              if (isSelected) {
                bg = "var(--brand-color)";
                color = "#ffffff";
                fontWeight = "700";
                shadow = "0 4px 10px rgba(37, 99, 235, 0.35)";
              } else if (isToday) {
                bg = "rgba(56, 189, 248, 0.15)";
                color = "var(--brand-color)";
                fontWeight = "700";
              }

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() =>
                    handleSelectDate(cell.year, cell.month, cell.day)
                  }
                  className={`date-cell-btn ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
                  style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "10px",
                    backgroundColor: bg,
                    color: color,
                    fontSize: "13px",
                    fontWeight: fontWeight,
                    cursor: "pointer",
                    boxShadow: shadow,
                  }}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Quick Action Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "14px",
              paddingTop: "10px",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <button
              type="button"
              onClick={() => {
                onChange({ target: { name, value: "" } });
                setIsOpen(false);
              }}
              style={{
                border: "none",
                background: "transparent",
                color: "#64748b",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "6px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
            >
              {language === "th" ? "ล้างค่า" : "Clear"}
            </button>

            <button
              type="button"
              onClick={() => {
                handleSelectDate(todayYear, todayMonth, todayDay);
              }}
              style={{
                border: "none",
                background: "#f1f5f9",
                color: "#2563eb",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                padding: "4px 10px",
                borderRadius: "6px",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e0e7ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f1f5f9";
              }}
            >
              {language === "th" ? "วันนี้" : "Today"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDateInput;
