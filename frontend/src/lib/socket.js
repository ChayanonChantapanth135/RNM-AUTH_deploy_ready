import { io } from "socket.io-client";
import { API_URL } from "../config";

let socket = null;

/**
 * ดึงหรือสร้างการเชื่อมต่อ Socket.io instance พร้อม Token อัตโนมัติ
 */
export const getSocket = () => {
  const token = localStorage.getItem("userToken");

  if (!socket) {
    socket = io(API_URL, {
      auth: {
        token: token || "",
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socket.on("connect", () => {
      // เมื่อเชื่อมต่อสำเร็จ หากมี token ให้ส่งยืนยันห้อง notification
      const currentToken = localStorage.getItem("userToken");
      if (currentToken) {
        socket.emit("authenticate", currentToken);
      }
    });

    socket.on("connect_error", (err) => {
      // Silently handle or debug
      // console.warn("Socket connection error:", err.message);
    });
  } else {
    // หาก token เปลี่ยน หรือมีการ reconnect
    if (socket.connected && token) {
      socket.emit("authenticate", token);
    }
  }

  return socket;
};

/**
 * อัปเดต Token ใหม่ใน Socket (เช่น เมื่อล็อกอินใหม่)
 */
export const updateSocketAuth = () => {
  const token = localStorage.getItem("userToken");
  if (socket) {
    socket.auth = { token: token || "" };
    if (socket.connected) {
      socket.emit("authenticate", token);
    } else {
      socket.connect();
    }
  }
};

/**
 * ปิดการเชื่อมต่อ Socket (เช่น เมื่อ Logout)
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
