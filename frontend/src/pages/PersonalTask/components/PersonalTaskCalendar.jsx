import React, { useMemo, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import thLocale from "@fullcalendar/core/locales/th";
import Swal from "sweetalert2";
import { useLanguage } from "../../../lib/LanguageContext";

const STATUS_CONFIG = {
  todo: {
    labelTh: "ต้องทำ",
    labelEn: "To Do",
    color: "#007aeb",
    bg: "rgba(0, 122, 235, 0.18)",
    border: "rgba(0, 122, 235, 0.5)",
  },
  "in-progress": {
    labelTh: "กำลังทำ",
    labelEn: "In Progress",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.18)",
    border: "rgba(245, 158, 11, 0.5)",
  },
  completed: {
    labelTh: "เสร็จสิ้น",
    labelEn: "Completed",
    color: "#00b884",
    bg: "rgba(0, 184, 132, 0.18)",
    border: "rgba(0, 184, 132, 0.5)",
  },
};

const PersonalTaskCalendar = ({
  data,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onUpdateTaskDate,
}) => {
  const { language } = useLanguage();
  const isThai = language === "th";
  const externalTasksContainerRef = useRef(null);

  // Convert tasks to FullCalendar event format
  const { events, undatedTasks } = useMemo(() => {
    const taskList = Object.values(data?.tasks || {});
    const evts = [];
    const undated = [];

    taskList.forEach((task) => {
      if (!task) return;

      if (task.task_date) {
        const isoDate = task.task_date.includes("T")
          ? task.task_date.split("T")[0]
          : task.task_date;

        const statusConf = STATUS_CONFIG[task.status] || STATUS_CONFIG["todo"];

        evts.push({
          id: String(task.dbId),
          title: task.title,
          start: isoDate,
          allDay: true,
          backgroundColor: statusConf.bg,
          borderColor: statusConf.border,
          textColor: "#f8fafc",
          extendedProps: {
            task,
            status: task.status,
            isCompleted: task.is_completed === 1 || task.status === "completed",
          },
        });
      } else {
        undated.push(task);
      }
    });

    return { events: evts, undatedTasks: undated };
  }, [data]);

  // Enable External Dragging for Unscheduled Tasks from Bottom Tray
  useEffect(() => {
    if (!externalTasksContainerRef.current) return;

    const draggable = new Draggable(externalTasksContainerRef.current, {
      itemSelector: ".fc-external-task",
      eventData: (eventEl) => {
        const taskDataStr = eventEl.getAttribute("data-task");
        const task = taskDataStr ? JSON.parse(taskDataStr) : null;
        const status = task?.status || "todo";
        const statusConf = STATUS_CONFIG[status] || STATUS_CONFIG["todo"];

        return {
          id: task ? String(task.dbId) : "",
          title: task ? task.title : eventEl.innerText,
          backgroundColor: statusConf.bg,
          borderColor: statusConf.border,
          textColor: "#f8fafc",
          extendedProps: { task },
        };
      },
    });

    return () => {
      draggable.destroy();
    };
  }, []);

  // Handle Event Drag Start: record task being dragged
  const handleEventDragStart = (info) => {
    const task = info.event.extendedProps.task;
    window.__draggedCalendarTask = task;
  };

  // Handle Event Drag Stop: detect if dropped down onto the unscheduled dropzone
  const handleEventDragStop = (info) => {
    if (info && info.jsEvent) {
      const clientX = info.jsEvent.clientX;
      const clientY = info.jsEvent.clientY;
      const dropTarget = document.elementFromPoint(clientX, clientY);
      const isOverDropzone = dropTarget?.closest("#unscheduled-tasks-dropzone");

      if (isOverDropzone && window.__draggedCalendarTask) {
        const task = window.__draggedCalendarTask;
        if (task && task.dbId) {
          onUpdateTaskDate(task.dbId, null);
        }
      }
    }
    window.__draggedCalendarTask = null;
  };

  // Handle Event Drag & Drop Date Change (Internal Events)
  const handleEventDrop = (info) => {
    const task = info.event.extendedProps.task;
    if (!task || !task.dbId) return;

    const startDate = info.event.start;
    if (!startDate) return;

    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, "0");
    const day = String(startDate.getDate()).padStart(2, "0");
    const newDateStr = `${year}-${month}-${day}`;

    onUpdateTaskDate(task.dbId, newDateStr);
  };

  // Handle External Drop from Bottom Tray onto Calendar
  const handleExternalDrop = (dropInfo) => {
    const taskDataStr = dropInfo.draggedEl.getAttribute("data-task");
    if (!taskDataStr) return;

    try {
      const task = JSON.parse(taskDataStr);
      if (task && task.dbId) {
        const year = dropInfo.date.getFullYear();
        const month = String(dropInfo.date.getMonth() + 1).padStart(2, "0");
        const day = String(dropInfo.date.getDate()).padStart(2, "0");
        const newDateStr = `${year}-${month}-${day}`;
        onUpdateTaskDate(task.dbId, newDateStr);
      }
    } catch (e) {
      console.error("Failed to parse external dropped task:", e);
    }
  };

  // Handle Event Click: show detail & actions
  const handleEventClick = (info) => {
    info.jsEvent.preventDefault();
    const task = info.event.extendedProps.task;
    if (!task) return;

    const statusConf = STATUS_CONFIG[task.status] || STATUS_CONFIG["todo"];
    const statusText = isThai ? statusConf.labelTh : statusConf.labelEn;
    const dateFormatted = task.task_date
      ? new Date(task.task_date).toLocaleDateString(
          isThai ? "th-TH" : "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          },
        )
      : isThai
        ? "ไม่ได้กำหนด"
        : "No due date";

    Swal.fire({
      title: `<span class="text-xl font-bold text-gray-800">${task.title}</span>`,
      html: `
        <div class="text-left mt-3 p-4 rounded-2xl bg-slate-50 text-sm space-y-3 shadow-inner">
          <div class="flex items-center justify-between">
            <span class="text-gray-500 font-medium">${isThai ? "สถานะ:" : "Status:"}</span>
            <span class="px-3 py-1 rounded-full text-xs font-bold shadow-sm" style="background-color: ${statusConf.bg}; color: ${statusConf.color};">
              ● ${statusText}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-500 font-medium">${isThai ? "กำหนดส่ง:" : "Due Date:"}</span>
            <span class="font-bold text-gray-800">${dateFormatted}</span>
          </div>
        </div>
      `,
      background: "#ffffff",
      color: "#1f2937",
      returnFocus: false,
      heightAuto: false,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: `✏️ ${isThai ? "แก้ไข" : "Edit"}`,
      confirmButtonColor: "#007aeb",
      denyButtonText: `🗑️ ${isThai ? "ลบ" : "Delete"}`,
      denyButtonColor: "#ef4444",
      cancelButtonText: isThai ? "ปิด" : "Close",
      cancelButtonColor: "#6c757d",
      customClass: {
        popup: "rounded-3xl shadow-2xl !border-0",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        onEditTask(task);
      } else if (result.isDenied) {
        onDeleteTask(task);
      }
    });
  };

  // Custom Event Content Rendering
  const renderEventContent = (eventInfo) => {
    const task = eventInfo.event.extendedProps.task;
    const status = task?.status || "todo";
    const statusConf = STATUS_CONFIG[status] || STATUS_CONFIG["todo"];
    const isDone = task?.is_completed === 1 || status === "completed";

    return (
      <div
        className="flex items-center gap-1.5 px-2 py-1 rounded-md w-full overflow-hidden text-xs font-medium select-none hover:brightness-110"
        style={{
          backgroundColor: statusConf.bg,
          borderLeft: `3px solid ${statusConf.color}`,
          boxSizing: "border-box",
        }}
        title={`${eventInfo.event.title} (${isThai ? statusConf.labelTh : statusConf.labelEn})`}
      >
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: statusConf.color }}
        ></span>
        <span
          className={`truncate flex-1 ${
            isDone ? "line-through text-slate-400" : "text-slate-100"
          }`}
        >
          {eventInfo.event.title}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar Card Container */}
      <div
        className="rounded-3xl p-6 md:p-8 shadow-xl relative"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-surface)",
        }}
      >
        {/* Header toolbar stats & legend */}
        <div
          className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4"
          style={{ borderBottom: "1px solid var(--border-surface)" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <div>
              <h2
                className="text-lg font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {isThai ? "ปฏิทินงานส่วนตัว" : "Personal Tasks Calendar"}
              </h2>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--text-secondary)" }}
              >
                {isThai
                  ? "ลากและวางการ์ดเพื่อเปลี่ยนกำหนดส่ง หรือคลิกที่ช่องวันที่เพื่อสร้างงานใหม่"
                  : "Drag and drop cards to change due dates, or click a date to add a new task"}
              </p>
            </div>
          </div>

          {/* Status Color Legend */}
          <div
            className="flex items-center gap-4 text-xs font-semibold px-4 py-2 rounded-2xl shadow-sm"
            style={{
              background: "var(--bg-surface-hover)",
              border: "1px solid var(--border-surface)",
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#007aeb]"></span>
              <span style={{ color: "var(--text-secondary)" }}>
                {isThai ? STATUS_CONFIG.todo.labelTh : STATUS_CONFIG.todo.labelEn}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
              <span style={{ color: "var(--text-secondary)" }}>
                {isThai ? STATUS_CONFIG["in-progress"].labelTh : STATUS_CONFIG["in-progress"].labelEn}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00b884]"></span>
              <span style={{ color: "var(--text-secondary)" }}>
                {isThai ? STATUS_CONFIG.completed.labelTh : STATUS_CONFIG.completed.labelEn}
              </span>
            </div>
          </div>
        </div>

        {/* Custom Calendar Styles */}
        <style>{`
          .personal-calendar-container .fc {
            font-family: inherit;
            --fc-border-color: var(--border-surface);
            --fc-today-bg-color: rgba(59, 130, 246, 0.12);
          }
          .personal-calendar-container .fc-header-toolbar {
            margin-bottom: 1.25rem !important;
            flex-wrap: wrap;
            gap: 0.75rem;
          }
          .personal-calendar-container .fc-toolbar-title {
            font-size: 1.25rem !important;
            font-weight: 800 !important;
            color: var(--text-primary) !important;
            letter-spacing: -0.025em;
          }
          .personal-calendar-container .fc-button {
            background-color: var(--bg-surface-hover) !important;
            border: 1px solid var(--border-surface) !important;
            color: var(--text-primary) !important;
            font-weight: 600 !important;
            font-size: 0.8125rem !important;
            padding: 0.4rem 0.85rem !important;
            border-radius: 0.5rem !important;
            transition: all 0.2s ease !important;
            text-transform: capitalize !important;
          }
          .personal-calendar-container .fc-button:hover {
            background-color: var(--brand-color) !important;
            color: #ffffff !important;
            border-color: var(--brand-color) !important;
          }
          .personal-calendar-container .fc-button-active {
            background-color: var(--brand-color) !important;
            border-color: var(--brand-color) !important;
            color: #ffffff !important;
            box-shadow: 0 0 12px rgba(59, 130, 246, 0.4) !important;
          }
          .personal-calendar-container .fc-col-header-cell {
            background-color: var(--bg-surface-hover) !important;
            padding: 0.65rem 0 !important;
            border-color: var(--border-surface) !important;
          }
          .personal-calendar-container .fc-col-header-cell-cushion {
            color: var(--text-secondary) !important;
            font-weight: 700 !important;
            font-size: 0.8125rem !important;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .personal-calendar-container .fc-daygrid-day-number {
            color: var(--text-secondary) !important;
            font-size: 0.8125rem !important;
            font-weight: 600 !important;
            padding: 0.35rem 0.5rem !important;
          }
          .personal-calendar-container .fc-daygrid-day:hover {
            background-color: var(--bg-surface-hover);
            cursor: pointer;
          }
          .personal-calendar-container .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
            color: var(--brand-color) !important;
            font-weight: 800 !important;
          }
          .personal-calendar-container .fc table {
            border-collapse: collapse !important;
            box-sizing: border-box !important;
          }
          .personal-calendar-container .fc td,
          .personal-calendar-container .fc th {
            box-sizing: border-box !important;
          }
          .personal-calendar-container .fc-event {
            background: transparent !important;
            border: none !important;
            margin: 0 0 3px 0 !important;
            cursor: grab !important;
          }
          .personal-calendar-container .fc-event.fc-event-mirror {
            z-index: 99999 !important;
            pointer-events: none !important;
            cursor: grabbing !important;
          }
          .personal-calendar-container .fc-event-dragging {
            opacity: 0.3 !important;
          }
          .personal-calendar-container .fc .fc-daygrid-day-frame {
            min-height: 100% !important;
            position: relative !important;
          }
          .personal-calendar-container .fc .fc-daygrid-day-bg {
            position: absolute !important;
            inset: 0 !important;
          }
          .personal-calendar-container .fc-highlight {
            background: rgba(56, 189, 248, 0.25) !important;
            border: 2px dashed rgba(56, 189, 248, 0.8) !important;
            box-sizing: border-box !important;
          }
          .personal-calendar-container .fc-daygrid-day-events {
            min-height: 4.5rem;
          }
          .personal-calendar-container .fc-more-link {
            color: #38bdf8 !important;
            font-weight: 700 !important;
            font-size: 0.75rem !important;
            padding: 2px 6px !important;
            border-radius: 4px !important;
            transition: all 0.2s ease !important;
          }
          .personal-calendar-container .fc-more-link:hover {
            background-color: rgba(56, 189, 248, 0.2) !important;
            color: #7dd3fc !important;
          }
          .fc-popover {
            background-color: #1c2c38 !important;
            border: 1px solid rgba(71, 85, 105, 0.6) !important;
            border-radius: 1rem !important;
            box-shadow: 0 20px 30px -5px rgba(0, 0, 0, 0.8), 0 10px 15px -5px rgba(0, 0, 0, 0.6) !important;
            overflow: hidden !important;
            z-index: 9999 !important;
          }
          .fc-popover-header {
            background-color: #16242f !important;
            padding: 0.6rem 0.85rem !important;
            border-bottom: 1px solid rgba(71, 85, 105, 0.4) !important;
          }
          .fc-popover-title {
            color: #f8fafc !important;
            font-size: 0.875rem !important;
            font-weight: 700 !important;
            letter-spacing: -0.01em !important;
          }
          .fc-popover-close {
            color: #94a3b8 !important;
            opacity: 0.8 !important;
            font-size: 1.1rem !important;
            transition: color 0.2s ease !important;
            cursor: pointer !important;
          }
          .fc-popover-close:hover {
            color: #ffffff !important;
            opacity: 1 !important;
          }
          .fc-popover-body {
            padding: 0.75rem !important;
            background-color: #1c2c38 !important;
            max-height: 280px !important;
            overflow-y: auto !important;
          }
        `}</style>

        {/* FullCalendar Component */}
        <div className="personal-calendar-container">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={isThai ? thLocale : "en"}
            events={events}
            editable={true}
            droppable={true}
            snapDuration="24:00:00"
            dragRevertDuration={0}
            eventDragMinDistance={3}
            drop={handleExternalDrop}
            eventDragStart={handleEventDragStart}
            eventDragStop={handleEventDragStop}
            eventDrop={handleEventDrop}
            eventClick={handleEventClick}
            dateClick={(info) => onAddTask("todo", info.dateStr)}
            eventContent={renderEventContent}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,dayGridWeek",
            }}
            dayMaxEvents={3}
            height="auto"
          />
        </div>
      </div>

      {/* Unscheduled Tasks Section - Bidirectional Dropzone */}
      <div
        id="unscheduled-tasks-dropzone"
        className="glass-panel rounded-3xl p-6 shadow-xl transition-all duration-200"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-surface)",
        }}
      >
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3"
          style={{ borderBottom: "1px solid var(--border-surface)" }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-amber-400 text-lg">📌</span>
            <h3
              className="text-sm font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {isThai
                ? `งานที่ยังไม่ได้กำหนดส่ง (${undatedTasks.length})`
                : `Tasks Without Due Date (${undatedTasks.length})`}
            </h3>
          </div>
          <span
            className="text-xs font-semibold flex items-center gap-1.5"
            style={{ color: "var(--brand-color)" }}
          >
            <span></span>
            <span>
              {isThai
                ? "ลากงานขึ้นปฏิทินเพื่อใส่วันที่ หรือลากงานจากปฏิทินลงมาที่นี่เพื่อยกเลิกกำหนดส่ง"
                : "Drag up to schedule, or drag down here to unschedule"}
            </span>
          </span>
        </div>

        {/* Outer Container with persistent Ref */}
        <div ref={externalTasksContainerRef} className="w-full">
          {undatedTasks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {undatedTasks.map((task) => {
                const statusConf =
                  STATUS_CONFIG[task.status] || STATUS_CONFIG["todo"];
                return (
                  <div
                    key={task.id}
                    data-task={JSON.stringify(task)}
                    onClick={() => onEditTask(task)}
                    className="fc-external-task flex items-center justify-between p-3.5 rounded-2xl shadow-sm transition-colors hover:shadow-md cursor-grab active:cursor-grabbing select-none group"
                    style={{
                      background: "var(--bg-surface-hover)",
                      border: "1px solid var(--border-surface)",
                    }}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden pointer-events-none">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: statusConf.color }}
                      ></span>
                      <span
                        className="text-xs font-bold truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {task.title}
                      </span>
                    </div>
                    <span
                      className="text-[10px] opacity-70 transition-colors flex-shrink-0 ml-2 pointer-events-none"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      ⋮⋮
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="py-6 px-4 text-center text-xs rounded-2xl shadow-inner flex items-center justify-center gap-2"
              style={{
                background: "var(--bg-surface-hover)",
                color: "var(--text-secondary)",
                border: "1px dashed var(--border-surface)",
              }}
            >
              <span></span>
              <span>
                {isThai
                  ? "ไม่มีงานค้าง (คุณสามารถลากงานจากบนปฏิทินลงมาวางที่นี่เพื่อยกเลิกกำหนดส่งได้)"
                  : "No unscheduled tasks (Drag any task from the calendar down here to remove its due date)"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(PersonalTaskCalendar);
