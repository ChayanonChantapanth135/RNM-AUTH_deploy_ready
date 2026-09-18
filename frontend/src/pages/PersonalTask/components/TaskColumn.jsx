import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";
import { useLanguage } from "../../../lib/LanguageContext";

const TaskColumn = ({ column, tasks, onAddTask, onEditTask, onDeleteTask }) => {
  const { t } = useLanguage();

  return (
    <div
      className="rounded-2xl p-3.5 flex flex-col shadow-xl h-[620px] transition-all"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-surface)",
      }}
    >
      {/* Header ของคอลัมน์ */}
      <div
        className="group flex items-center justify-between mb-2 pb-2 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border-surface)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full inline-block shadow-sm"
            style={{ backgroundColor: column.color || "var(--brand-color)" }}
          ></span>
          <h3
            className="text-sm font-bold tracking-wider"
            style={{ color: "var(--text-primary)" }}
          >
            {t(column.title) || column.title}
          </h3>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: "var(--bg-surface-hover)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-surface)",
            }}
          >
            {tasks.length}
          </span>
        </div>

        <button
          title="Add Task"
          onClick={() => onAddTask(column.id)}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer transition-all opacity-0 invisible group-hover:opacity-100 group-hover:visible shadow-sm"
          style={{
            background: "var(--bg-surface-hover)",
            color: "var(--brand-color)",
            border: "1px solid var(--border-surface)",
          }}
        >
          +
        </button>
      </div>

      {/* พื้นที่ Droppable ความสูงเท่ากันทุกคอลัมน์ พร้อมเลื่อน Scrollbar เมื่อการ์ดล้น */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto overflow-x-hidden p-1 rounded-xl transition-colors ${
              snapshot.isDraggingOver
                ? "bg-slate-700/40 ring-2 ring-dashed ring-teal-400/50"
                : "bg-transparent"
            }`}
            style={{
              scrollbarWidth: "thin",
            }}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                column={column}
                index={index}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default React.memo(TaskColumn);
