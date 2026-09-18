import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { getCurrentUser } from "../../../lib/auth";
import { API_URL } from "../../../config";
import { useLanguage } from "../../../lib/LanguageContext";

const defaultColumnData = {
  tasks: {},
  columns: {
    todo: {
      id: "todo",
      title: "TO DO",
      color: "#007aeb",
      status: "todo",
      taskIds: [],
    },
    "in-progress": {
      id: "in-progress",
      title: "IN PROGRESS",
      color: "#f59e0b",
      status: "in-progress",
      taskIds: [],
    },
    completed: {
      id: "completed",
      title: "COMPLETED",
      color: "#00b884",
      status: "completed",
      taskIds: [],
    },
  },
  columnOrder: ["todo", "in-progress", "completed"],
};

// Helper แปลง YYYY-MM-DD -> DD/MM/YYYY
const formatToDDMMYYYY = (isoDate) => {
  if (!isoDate) return "";
  const parts = isoDate.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoDate;
};

// Helper แปลง DD/MM/YYYY -> YYYY-MM-DD
const parseDDMMYYYYtoISO = (dmyStr) => {
  if (!dmyStr) return null;
  const parts = dmyStr.split("/");
  if (parts.length === 3) {
    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return dmyStr;
};

export const usePersonalTasks = () => {
  const { language } = useLanguage();
  const [data, setData] = useState(defaultColumnData);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  const isThai = language === "th";

  // ดึงข้อมูล User ปัจจุบันอย่างถูกต้อง
  useEffect(() => {
    const initUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user && user.id) {
          setCurrentUserId(user.id);
        } else {
          const userData = localStorage.getItem("userData");
          if (userData) {
            const parsed = JSON.parse(userData);
            setCurrentUserId(parsed.id);
          }
        }
      } catch (err) {
        console.error("Error loading current user:", err);
      }
    };
    initUser();
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const url = currentUserId
        ? `${API_URL}/auth/personal-tasks?userId=${currentUserId}`
        : `${API_URL}/auth/personal-tasks`;
      const res = await axios.get(url);
      const taskList = res.data || [];

      const newTasks = {};
      const todoTaskIds = [];
      const inProgressTaskIds = [];
      const completedTaskIds = [];

      taskList.forEach((task) => {
        const taskIdStr = `task-${task.id}`;
        let currentStatus = task.status;
        if (!currentStatus) {
          currentStatus = task.is_completed ? "completed" : "todo";
        }

        newTasks[taskIdStr] = {
          id: taskIdStr,
          dbId: task.id,
          title: task.title,
          status: currentStatus,
          is_completed: currentStatus === "completed" ? 1 : 0,
          task_date: task.task_date,
          created_at: task.created_at,
        };

        if (currentStatus === "completed") {
          completedTaskIds.push(taskIdStr);
        } else if (currentStatus === "in-progress") {
          inProgressTaskIds.push(taskIdStr);
        } else {
          todoTaskIds.push(taskIdStr);
        }
      });

      setData({
        tasks: newTasks,
        columns: {
          todo: { ...defaultColumnData.columns.todo, taskIds: todoTaskIds },
          "in-progress": {
            ...defaultColumnData.columns["in-progress"],
            taskIds: inProgressTaskIds,
          },
          completed: {
            ...defaultColumnData.columns.completed,
            taskIds: completedTaskIds,
          },
        },
        columnOrder: ["todo", "in-progress", "completed"],
      });
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId !== null) {
      fetchTasks();
    }
  }, [currentUserId, fetchTasks]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const startCol = data.columns[source.droppableId];
    const finishCol = data.columns[destination.droppableId];

    if (startCol === finishCol) {
      const newTaskIds = Array.from(startCol.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...startCol, taskIds: newTaskIds };
      setData((prev) => ({
        ...prev,
        columns: { ...prev.columns, [newColumn.id]: newColumn },
      }));

      // บันทึกลำดับตำแหน่ง (Position) ใหม่ลง Database
      try {
        const reorderPayload = newTaskIds.map((tid, idx) => ({
          id: data.tasks[tid].dbId,
          status: startCol.id,
          position: idx,
        }));
        await axios.put(`${API_URL}/auth/personal-tasks/reorder`, {
          tasks: reorderPayload,
        });
      } catch (err) {
        console.error("Failed to reorder tasks in db:", err);
      }
      return;
    }

    const startTaskIds = Array.from(startCol.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = { ...startCol, taskIds: startTaskIds };

    const finishTaskIds = Array.from(finishCol.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = { ...finishCol, taskIds: finishTaskIds };

    const movedTask = data.tasks[draggableId];
    const newStatus = destination.droppableId;

    setData((prev) => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [draggableId]: {
          ...prev.tasks[draggableId],
          status: newStatus,
          is_completed: newStatus === "completed" ? 1 : 0,
        },
      },
      columns: {
        ...prev.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    }));

    try {
      // บันทึกลำดับตำแหน่งและสถานะของทั้ง 2 คอลัมน์ลง Database
      const startReorder = startTaskIds.map((tid, idx) => ({
        id: data.tasks[tid].dbId,
        status: startCol.id,
        position: idx,
      }));
      const finishReorder = finishTaskIds.map((tid, idx) => ({
        id: data.tasks[tid].dbId,
        status: finishCol.id,
        position: idx,
      }));

      await axios.put(`${API_URL}/auth/personal-tasks/reorder`, {
        tasks: [...startReorder, ...finishReorder],
      });
    } catch (err) {
      console.error("Failed to update status & order in db:", err);
      Swal.fire({
        icon: "error",
        title: isThai ? "เกิดข้อผิดพลาด" : "Error",
        text: isThai ? "ไม่สามารถอัปเดตลำดับงานได้" : "Failed to update task order",
      });
      fetchTasks();
    }
  };

  const handleAddTask = async (columnId, initialDate = null) => {
    const targetColumn = data.columns[columnId] || data.columns["todo"];
    const targetStatus = targetColumn.id;

    const initialDateISO = initialDate ? (initialDate.includes("T") ? initialDate.split("T")[0] : initialDate) : "";
    const initialDateDMY = initialDateISO ? formatToDDMMYYYY(initialDateISO) : "";

    const { value: formValues } = await Swal.fire({
      title: `<span class="text-xl font-semibold text-gray-800">${
        isThai ? `เพิ่ม Task ใหม่ (${targetColumn?.title || ""})` : `Add New Task (${targetColumn?.title || ""})`
      }</span>`,
      html: `
        <div class="flex flex-col gap-3 text-left">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">${
              isThai ? "ชื่องาน" : "Task Title"
            } <span class="text-red-500">*</span></label>
            <input id="swal-task-title" class="swal2-input !m-0 !w-full" placeholder="${
              isThai ? "กรอกชื่องานของคุณ..." : "Enter your task title..."
            }" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">${
              isThai ? "วันที่กำหนด (วัน/เดือน/ปี)" : "Due Date (DD/MM/YYYY)"
            }</label>
            <div class="relative flex items-center">
              <input 
                id="swal-task-date-display" 
                type="text" 
                class="swal2-input !m-0 !w-full pr-10 cursor-pointer" 
                value="${initialDateDMY}"
                placeholder="DD/MM/YYYY" 
                readonly 
              />
              <input 
                id="swal-task-date-native" 
                type="date" 
                value="${initialDateISO}"
                class="absolute right-2 opacity-0 w-8 h-8 cursor-pointer" 
              />
              <span class="absolute right-3 pointer-events-none text-gray-500 text-lg">📅</span>
            </div>
          </div>
        </div>
      `,
      didOpen: () => {
        const displayInput = document.getElementById("swal-task-date-display");
        const nativeInput = document.getElementById("swal-task-date-native");

        if (displayInput && nativeInput) {
          displayInput.addEventListener("click", () => {
            if (nativeInput.showPicker) {
              nativeInput.showPicker();
            } else {
              nativeInput.focus();
            }
          });

          nativeInput.addEventListener("change", (e) => {
            displayInput.value = formatToDDMMYYYY(e.target.value);
          });
        }
      },
      focusConfirm: false,
      returnFocus: false,
      heightAuto: false,
      showCancelButton: true,
      confirmButtonText: isThai ? "บันทึก" : "Save",
      cancelButtonText: isThai ? "ยกเลิก" : "Cancel",
      confirmButtonColor: "#007aeb",
      cancelButtonColor: "#6c757d",
      preConfirm: () => {
        const title = document.getElementById("swal-task-title").value.trim();
        const dateDisplay = document.getElementById("swal-task-date-display").value.trim();
        if (!title) {
          Swal.showValidationMessage(isThai ? "กรุณากรอกชื่องาน" : "Please enter task title");
          return false;
        }
        const isoDate = parseDDMMYYYYtoISO(dateDisplay);
        return { title, task_date: isoDate || null };
      },
    });

    if (formValues) {
      try {
        let uid = currentUserId;
        if (!uid) {
          const user = await getCurrentUser();
          uid = user?.id || null;
        }
        if (!uid) {
          const rawUser = localStorage.getItem("userData");
          if (rawUser) {
            uid = JSON.parse(rawUser).id;
          }
        }

        await axios.post(`${API_URL}/auth/personal-tasks`, {
          user_id: uid,
          title: formValues.title,
          status: targetStatus,
          is_completed: targetStatus === "completed" ? 1 : 0,
          task_date: formValues.task_date,
        });

        Swal.fire({
          icon: "success",
          title: isThai ? "เพิ่มงานสำเร็จ" : "Task created",
          timer: 1500,
          showConfirmButton: false,
        });

        fetchTasks();
      } catch (err) {
        console.error("Error creating personal task:", err);
        const errMsg = err.response?.data?.message || err.message || (isThai ? "ไม่สามารถเพิ่มงานได้" : "Failed to create task");
        Swal.fire({
          icon: "error",
          title: isThai ? "เกิดข้อผิดพลาด" : "Error",
          text: errMsg,
        });
      }
    }
  };

  const handleEditTask = async (task) => {
    const formattedDateISO = task.task_date
      ? new Date(task.task_date).toISOString().split("T")[0]
      : "";
    const formattedDateDMY = formatToDDMMYYYY(formattedDateISO);

    const { value: formValues } = await Swal.fire({
      title: `<span class="text-xl font-semibold text-gray-800">${
        isThai ? "แก้ไข Task" : "Edit Task"
      }</span>`,
      html: `
        <div class="flex flex-col gap-3 text-left">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">${
              isThai ? "ชื่องาน" : "Task Title"
            } <span class="text-red-500">*</span></label>
            <input id="swal-edit-title" class="swal2-input !m-0 !w-full" value="${task.title.replace(/"/g, "&quot;")}" placeholder="${
              isThai ? "กรอกชื่องานของคุณ..." : "Enter task title..."
            }" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">${
              isThai ? "วันที่กำหนด (วัน/เดือน/ปี)" : "Due Date (DD/MM/YYYY)"
            }</label>
            <div class="relative flex items-center">
              <input 
                id="swal-edit-date-display" 
                type="text" 
                class="swal2-input !m-0 !w-full pr-10 cursor-pointer" 
                value="${formattedDateDMY}"
                placeholder="DD/MM/YYYY" 
                readonly 
              />
              <input 
                id="swal-edit-date-native" 
                type="date" 
                value="${formattedDateISO}"
                class="absolute right-2 opacity-0 w-8 h-8 cursor-pointer" 
              />
              <span class="absolute right-3 pointer-events-none text-gray-500 text-lg">📅</span>
            </div>
          </div>
        </div>
      `,
      didOpen: () => {
        const displayInput = document.getElementById("swal-edit-date-display");
        const nativeInput = document.getElementById("swal-edit-date-native");

        if (displayInput && nativeInput) {
          displayInput.addEventListener("click", () => {
            if (nativeInput.showPicker) {
              nativeInput.showPicker();
            } else {
              nativeInput.focus();
            }
          });

          nativeInput.addEventListener("change", (e) => {
            displayInput.value = formatToDDMMYYYY(e.target.value);
          });
        }
      },
      focusConfirm: false,
      returnFocus: false,
      heightAuto: false,
      showCancelButton: true,
      confirmButtonText: isThai ? "บันทึกการแก้ไข" : "Save Changes",
      cancelButtonText: isThai ? "ยกเลิก" : "Cancel",
      confirmButtonColor: "#007aeb",
      cancelButtonColor: "#6c757d",
      preConfirm: () => {
        const title = document.getElementById("swal-edit-title").value.trim();
        const dateDisplay = document.getElementById("swal-edit-date-display").value.trim();
        if (!title) {
          Swal.showValidationMessage(isThai ? "กรุณากรอกชื่องาน" : "Please enter task title");
          return false;
        }
        const isoDate = parseDDMMYYYYtoISO(dateDisplay);
        return { title, task_date: isoDate || null };
      },
    });

    if (formValues) {
      try {
        await axios.put(`${API_URL}/auth/personal-tasks/${task.dbId}`, {
          title: formValues.title,
          task_date: formValues.task_date,
        });

        Swal.fire({
          icon: "success",
          title: isThai ? "แก้ไขงานสำเร็จ" : "Task updated",
          timer: 1500,
          showConfirmButton: false,
          returnFocus: false,
          heightAuto: false,
        });

        fetchTasks();
      } catch (err) {
        console.error("Error updating personal task:", err);
        const errMsg = err.response?.data?.message || err.message || (isThai ? "ไม่สามารถแก้ไขงานได้" : "Failed to update task");
        Swal.fire({
          icon: "error",
          title: isThai ? "เกิดข้อผิดพลาด" : "Error",
          text: errMsg,
          returnFocus: false,
          heightAuto: false,
        });
      }
    }
  };

  const handleDeleteTask = async (task) => {
    const result = await Swal.fire({
      title: isThai ? "ยืนยันการลบ?" : "Are you sure?",
      text: isThai ? `คุณต้องการลบงาน "${task.title}" หรือไม่?` : `Do you want to delete "${task.title}"?`,
      icon: "warning",
      showCancelButton: true,
      returnFocus: false,
      heightAuto: false,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: isThai ? "ลบ" : "Delete",
      cancelButtonText: isThai ? "ยกเลิก" : "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `${API_URL}/auth/personal-tasks/${task.dbId}`
        );
        Swal.fire({
          icon: "success",
          title: isThai ? "ลบงานสำเร็จ" : "Task deleted",
          timer: 1200,
          showConfirmButton: false,
        });
        fetchTasks();
      } catch (err) {
        console.error("Error deleting task:", err);
        Swal.fire(isThai ? "ข้อผิดพลาด" : "Error", isThai ? "ไม่สามารถลบงานได้" : "Failed to delete task", "error");
      }
    }
  };

  const handleUpdateTaskDate = async (taskDbId, newDateStr) => {
    const isoDate = newDateStr
      ? (newDateStr.includes("T") ? newDateStr.split("T")[0] : newDateStr)
      : null;

    // Optimistic UI update
    setData((prev) => {
      const taskIdStr = `task-${taskDbId}`;
      if (!prev.tasks[taskIdStr]) return prev;
      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          [taskIdStr]: {
            ...prev.tasks[taskIdStr],
            task_date: isoDate,
          },
        },
      };
    });

    try {
      await axios.put(`${API_URL}/auth/personal-tasks/${taskDbId}`, {
        task_date: isoDate,
      });

      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: "#1e293b",
        color: "#ffffff",
      });
      Toast.fire({
        icon: "success",
        title: isThai ? "ย้ายวันที่กำหนดส่งเรียบร้อยแล้ว" : "Due date updated successfully",
      });
    } catch (err) {
      console.error("Error updating task date:", err);
      Swal.fire({
        icon: "error",
        title: isThai ? "เกิดข้อผิดพลาด" : "Error",
        text: isThai ? "ไม่สามารถอัปเดตวันที่ได้" : "Failed to update date",
      });
      fetchTasks(); // Rollback on error
    }
  };

  const handleUpdateTaskStatus = async (taskDbId, newStatus) => {
    const isCompleted = newStatus === "completed" ? 1 : 0;

    // Optimistic UI update
    setData((prev) => {
      const taskIdStr = `task-${taskDbId}`;
      if (!prev.tasks[taskIdStr]) return prev;

      const oldStatus = prev.tasks[taskIdStr].status;
      if (oldStatus === newStatus) return prev;

      const oldCol = prev.columns[oldStatus] || prev.columns["todo"];
      const newCol = prev.columns[newStatus] || prev.columns["todo"];

      const oldTaskIds = oldCol.taskIds.filter((id) => id !== taskIdStr);
      const newTaskIds = [...newCol.taskIds, taskIdStr];

      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          [taskIdStr]: {
            ...prev.tasks[taskIdStr],
            status: newStatus,
            is_completed: isCompleted,
          },
        },
        columns: {
          ...prev.columns,
          [oldCol.id]: { ...oldCol, taskIds: oldTaskIds },
          [newCol.id]: { ...newCol, taskIds: newTaskIds },
        },
      };
    });

    try {
      await axios.put(`${API_URL}/auth/personal-tasks/${taskDbId}`, {
        status: newStatus,
        is_completed: isCompleted,
      });

      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
        showCloseButton: false,
        background: "#1e293b",
        color: "#ffffff",
      });
      Toast.fire({
        icon: "success",
        title: isThai ? "เปลี่ยนสถานะสำเร็จ" : "Status changed",
      });
    } catch (err) {
      console.error("Error updating task status:", err);
      fetchTasks(); // Rollback on error
    }
  };

  const createTask = async (columnId, { title, task_date }) => {
    const targetColumn = data.columns[columnId] || data.columns["todo"];
    const targetStatus = targetColumn.id;

    try {
      let uid = currentUserId;
      if (!uid) {
        const user = await getCurrentUser();
        uid = user?.id || null;
      }
      if (!uid) {
        const rawUser = localStorage.getItem("userData");
        if (rawUser) {
          uid = JSON.parse(rawUser).id;
        }
      }

      await axios.post(`${API_URL}/auth/personal-tasks`, {
        user_id: uid,
        title,
        status: targetStatus,
        is_completed: targetStatus === "completed" ? 1 : 0,
        task_date,
      });

      Swal.fire({
        icon: "success",
        title: isThai ? "เพิ่มงานสำเร็จ" : "Task created",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchTasks();
      return true;
    } catch (err) {
      console.error("Error creating personal task:", err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        (isThai ? "ไม่สามารถเพิ่มงานได้" : "Failed to create task");
      Swal.fire({
        icon: "error",
        title: isThai ? "เกิดข้อผิดพลาด" : "Error",
        text: errMsg,
      });
      return false;
    }
  };

  const updateTask = async (taskId, { title, task_date }) => {
    try {
      const cleanId = String(taskId).replace(/^task-/, "");
      await axios.put(`${API_URL}/auth/personal-tasks/${cleanId}`, {
        title,
        task_date,
      });

      Swal.fire({
        icon: "success",
        title: isThai ? "แก้ไขงานสำเร็จ" : "Task updated",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchTasks();
      return true;
    } catch (err) {
      console.error("Error updating personal task:", err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        (isThai ? "ไม่สามารถแก้ไขงานได้" : "Failed to update task");
      Swal.fire({
        icon: "error",
        title: isThai ? "เกิดข้อผิดพลาด" : "Error",
        text: errMsg,
      });
      return false;
    }
  };

  return {
    data,
    loading,
    fetchTasks,
    handleDragEnd,
    createTask,
    updateTask,
    handleAddTask,
    handleEditTask,
    handleDeleteTask,
    handleUpdateTaskDate,
    handleUpdateTaskStatus,
  };
};


