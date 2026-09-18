import React from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import TaskColumn from "./TaskColumn";

const TaskBoard = ({ data, onDragEnd, onAddTask, onEditTask, onDeleteTask }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {data.columnOrder.map((columnId) => {
          const column = data.columns[columnId];
          const tasks = column.taskIds
            .map((taskId) => data.tasks[taskId])
            .filter(Boolean);

          return (
            <TaskColumn
              key={column.id}
              column={column}
              tasks={tasks}
              onAddTask={onAddTask}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
            />
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default React.memo(TaskBoard);
