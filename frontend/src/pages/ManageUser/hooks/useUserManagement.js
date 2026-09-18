import { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
// นำเข้า API_URL สำหรับใช้ต่อคำนำหน้าของรูปภาพโปรไฟล์ (Avatar) แบบไดนามิก
import { API_URL } from "../../../config";
import { formatDate } from "../../../lib/dateUtils";
import { getSocket } from "../../../lib/socket";

export const useUserManagement = (t, language = "en") => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters and Pagination
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Add/Edit User states
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "",
    leaderId: "",
    isActive: true,
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");
  const [pageSuccessMessage, setPageSuccessMessage] = useState("");

  // Delete & Status confirm modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedUserForStatus, setSelectedUserForStatus] = useState(null);

  // Import users modals state
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [importUsersList, setImportUsersList] = useState([]);
  const [importFileName, setImportFileName] = useState("");
  const [showImportResult, setShowImportResult] = useState(false);
  const [importResultDetails, setImportResultDetails] = useState({ imported: 0, updated: 0 });

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/auth/users");
      const mappedUsers = response.data.map((u) => {
        const name = u.fullname || "User";
        const initials =
          name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "U";

        let displayRole = "Storyboard";
        if (u.role === "admin") displayRole = "Admin";
        else if (u.role === "manager" || u.role === "project_manager") displayRole = "Project Manager";
        else if (u.role === "storyboard") displayRole = "Storyboard";
        else if (u.role === "animation") displayRole = "Animation";
        else if (u.role === "designer") displayRole = "Designer";
        else if (u.role === "programmer") displayRole = "Programmer";

        const isLeader = Boolean(Number(u.leader_count) > 0);

        return {
          id: u.id,
          name: name,
          fullname: name,
          email: u.email,
          phone: u.phone || "-",
          role: displayRole,
          rawRole: u.role,
          status: u.status || "active",
          startDate: u.start_date ? u.start_date.split("T")[0] : "",
          expireDate: u.expire_date ? u.expire_date.split("T")[0] : "",
          avatar: u.avatar || null,
          leaderId: u.leader_id || null,
          leaderName: u.leader_name || null,
          isLeader: isLeader,
          lastLogin: u.created_at
            ? formatDate(u.created_at, language)
            : "-",
          initials: initials,
        };
      });
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    const socket = getSocket();
    if (!socket) return;

    const handleRealtimeUsers = (payload) => {
      fetchUsers();

      // If the modal for this user is currently open in edit mode, sync form in real-time!
      if (payload && payload.userId) {
        setSelectedUserId((currentId) => {
          if (currentId && Number(currentId) === Number(payload.userId)) {
            const nameParts = (payload.fullname || "").split(" ");
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            let dbRole = (payload.role || "storyboard").toLowerCase();
            if (dbRole === "admin") dbRole = "admin";
            else if (dbRole === "manager" || dbRole === "project manager" || dbRole === "project_manager") dbRole = "manager";
            else if (dbRole === "storyboard") dbRole = "storyboard";
            else if (dbRole === "animation") dbRole = "animation";
            else if (dbRole === "designer") dbRole = "designer";
            else if (dbRole === "programmer") dbRole = "programmer";

            setFormData((prev) => ({
              ...prev,
              email: payload.email !== undefined ? payload.email : prev.email,
              firstName: firstName || prev.firstName,
              lastName: lastName !== undefined ? lastName : prev.lastName,
              phone: payload.phone !== undefined && payload.phone !== "-" ? payload.phone : prev.phone,
              role: dbRole || prev.role,
              leaderId: payload.leader_id !== undefined ? (payload.leader_id ? String(payload.leader_id) : "") : prev.leaderId,
              startDate: payload.start_date !== undefined ? (payload.start_date ? payload.start_date.split("T")[0] : "") : prev.startDate,
              expireDate: payload.expire_date !== undefined ? (payload.expire_date ? payload.expire_date.split("T")[0] : "") : prev.expireDate,
              isActive: payload.status !== undefined ? payload.status === "active" : prev.isActive,
            }));

            if (payload.avatar) {
              setAvatarPreview(payload.avatar.startsWith("http") ? payload.avatar : `${API_URL}${payload.avatar}`);
            }
          }
          return currentId;
        });
      }
    };

    socket.on("user:created", handleRealtimeUsers);
    socket.on("user:updated", handleRealtimeUsers);
    socket.on("user:deleted", handleRealtimeUsers);

    return () => {
      socket.off("user:created", handleRealtimeUsers);
      socket.off("user:updated", handleRealtimeUsers);
      socket.off("user:deleted", handleRealtimeUsers);
    };
  }, []);

  // Reset page to 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, statusFilter, searchQuery]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setSelectedUserId(null);
    setFormData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      role: "storyboard",
      leaderId: "",
      startDate: "",
      expireDate: "",
      isActive: true,
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setModalError("");
    setModalSuccess("");
    setShowAddModal(true);
  };

  const handleOpenEdit = (user) => {
    setIsEditMode(true);
    setSelectedUserId(user.id);
    const nameParts = user.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    let dbRole = "storyboard";
    if (user.role === "Admin") dbRole = "admin";
    else if (user.role === "Project Manager") dbRole = "manager";
    else if (user.role === "Storyboard") dbRole = "storyboard";
    else if (user.role === "Animation") dbRole = "animation";
    else if (user.role === "Designer") dbRole = "designer";
    else if (user.role === "Programmer") dbRole = "programmer";

    setFormData({
      email: user.email,
      password: "", // blank password means unchanged
      firstName: firstName,
      lastName: lastName,
      phone: user.phone && user.phone !== "-" ? user.phone : "",
      role: dbRole,
      leaderId: user.leaderId ? String(user.leaderId) : "",
      startDate: user.startDate || "",
      expireDate: user.expireDate || "",
      isActive: user.status === "active",
    });
    setAvatarFile(null);
    setAvatarPreview(user.avatar ? (user.avatar.startsWith("http") ? user.avatar : `${API_URL}${user.avatar}`) : null);
    setModalError("");
    setModalSuccess("");
    setShowAddModal(true);
  };

  const handleCreateOrUpdateUser = async (e) => {
    e.preventDefault();
    setModalError("");
    setModalSuccess("");

    if (formData.startDate && formData.expireDate && formData.startDate > formData.expireDate) {
      setModalError("วันเริ่มใช้งานไม่สามารถมากกว่าวันหมดอายุได้");
      return;
    }

    const data = new FormData();
    data.append("fullname", `${formData.firstName} ${formData.lastName}`.trim());
    data.append("email", formData.email);
    if (formData.password) {
      data.append("password", formData.password);
    }
    data.append("phone", formData.phone || "");
    data.append("role", formData.role);
    data.append("leader_id", formData.leaderId || "");
    data.append("start_date", formData.startDate || "");
    data.append("expire_date", formData.expireDate || "");
    data.append("status", formData.isActive ? "active" : "suspended");
    if (avatarFile) {
      data.append("avatar", avatarFile);
    }
    data.append("creatorId", currentUser?.id || "");

    try {
      if (isEditMode) {
        await axios.put(`/auth/users/${selectedUserId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setModalSuccess(t("userUpdatedSuccess") || "บันทึกการแก้ไขเรียบร้อยแล้ว!");
      } else {
        await axios.post("/auth/users", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setModalSuccess(t("userCreatedSuccess") || "สร้างบัญชีผู้ใช้ใหม่เรียบร้อยแล้ว!");
      }
      fetchUsers();
      setTimeout(() => {
        setShowAddModal(false);
      }, 500);
    } catch (err) {
      setModalError(err.response?.data?.message || (isEditMode ? t("userUpdateFailed") : t("userAddFailed")));
    }
  };

  const handleToggleStatus = (user) => {
    setSelectedUserForStatus(user);
    setShowStatusModal(true);
  };

  const handleStatusConfirm = async () => {
    if (!selectedUserForStatus) return;
    const nextStatus = selectedUserForStatus.status === "active" ? "suspended" : "active";
    try {
      await axios.put(`/auth/users/${selectedUserForStatus.id}`, {
        fullname: selectedUserForStatus.name,
        email: selectedUserForStatus.email,
        role: selectedUserForStatus.role,
        status: nextStatus,
        creatorId: currentUser?.id || "",
      });
      fetchUsers();
      setShowStatusModal(false);
    } catch (err) {
      alert(t("statusChangeFailed"));
    }
  };

  const handleDeleteUser = (user) => {
    setSelectedUserForDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUserForDelete) return;
    try {
      await axios.delete(`/auth/users/${selectedUserForDelete.id}`, {
        params: { creatorId: currentUser?.id || "" }
      });
      fetchUsers();
      setShowDeleteModal(false);
      setPageSuccessMessage(t("deleteUserSuccess") || "Delete Success");
      setTimeout(() => setPageSuccessMessage(""), 4000);
    } catch (err) {
      alert(t("deleteFailed") || "การลบข้อมูลล้มเหลว กรุณาลองใหม่อีกครั้ง");
    }
  };

  // ฟังก์ชันอ่านและตรวจสอบไฟล์ CSV หรือ Excel ก่อนนำเข้า
  const handleImportFile = async (file) => {
    if (!file) return;

    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (fileExtension === "xlsx" || fileExtension === "xls") {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

          if (jsonData.length === 0) {
            alert(t("importFailed") + " (Empty file)");
            return;
          }

          // Map properties to lowercase keys
          const parsedUsers = jsonData.map((row) => {
            const userObj = {};
            Object.entries(row).forEach(([key, val]) => {
              userObj[key.trim().toLowerCase()] = String(val).trim();
            });
            return userObj;
          });

          setImportUsersList(parsedUsers);
          setImportFileName(file.name);
          setShowImportConfirm(true);
        } catch (err) {
          console.error("Error parsing Excel:", err);
          alert((t("importFailed") || "Import failed") + " (Invalid Excel file)");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const lines = text.split(/\r?\n/);
        if (lines.length <= 1) {
          alert(t("importFailed") + " (Empty file)");
          return;
        }

        // ดึงรายชื่อ Header คอลัมน์จากแถวแรกสุด
        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
        const parsedUsers = [];

        // วนลูปอ่านข้อมูลผู้ใช้แต่ละแถว
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const columns = line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
          if (columns.length < headers.length) continue;

          const userObj = {};
          headers.forEach((header, idx) => {
            userObj[header] = columns[idx] || "";
          });
          parsedUsers.push(userObj);
        }

        if (parsedUsers.length === 0) {
          alert(t("importFailed") + " (No valid rows)");
          return;
        }

        // เก็บข้อมูลที่ประมวลผลได้ลง State และเปิดป๊อปอัปยืนยันการนำเข้า
        setImportUsersList(parsedUsers);
        setImportFileName(file.name);
        setShowImportConfirm(true);
      };
      reader.readAsText(file);
    }
  };

  // ฟังก์ชันกดยืนยันการนำเข้าและส่งข้อมูลไปยังหลังบ้านเพื่อบันทึก
  const handleImportConfirm = async () => {
    try {
      setLoading(true);
      setShowImportConfirm(false);
      const response = await axios.post("/auth/users/import", {
        users: importUsersList,
        userId: currentUser?.id,
      });
      // จัดเก็บข้อมูลสถิติจำนวนที่สร้างใหม่และอัปเดตเพื่อนำไปรายงานผล
      setImportResultDetails({
        imported: response.data.imported || 0,
        updated: response.data.updated || 0,
      });
      setShowImportResult(true); // เปิดป๊อปอัปรายงานผลสำเร็จ
      await fetchUsers(); // โหลดตารางผู้ใช้ใหม่
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || t("importFailed"));
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันส่งออกรายชื่อผู้ใช้ทั้งหมดเป็นไฟล์ Excel (.xlsx)
  // ฟังก์ชันดาวน์โหลดเทมเพลต Excel สำหรับนำเข้าผู้ใช้งาน
  const handleDownloadTemplate = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Template");

      worksheet.columns = [
        { header: "fullname", key: "fullname", width: 25 },
        { header: "email", key: "email", width: 30 },
        { header: "phone", key: "phone", width: 18 },
        { header: "role", key: "role", width: 18 },
        { header: "leader_email", key: "leader_email", width: 30 },
        { header: "status", key: "status", width: 15 },
        { header: "start_date", key: "start_date", width: 18 },
        { header: "expire_date", key: "expire_date", width: 18 },
        { header: "password", key: "password", width: 18 },
      ];

      // ตัวอย่างข้อมูลในเทมเพลต
      worksheet.addRow({
        fullname: "Somchai Jaidee",
        email: "somchai@company.com",
        phone: "+66812345678",
        role: "storyboard",
        leader_email: "leader@company.com",
        status: "active",
        start_date: "2026-09-01",
        expire_date: "2027-09-01",
        password: "password123",
      });

      worksheet.addRow({
        fullname: "Somsak Rakdee",
        email: "somsak@company.com",
        phone: "+66898765432",
        role: "programmer",
        leader_email: "",
        status: "active",
        start_date: "",
        expire_date: "",
        password: "",
      });

      // ตกแต่งส่วนหัวตาราง
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4F46E5" }, // Indigo
      };

      const roleOptions = ["admin", "manager", "storyboard", "animation", "designer", "programmer"];
      const statusOptions = ["active", "suspended"];

      worksheet.dataValidations.add("D2:D500", {
        type: "list",
        allowBlank: true,
        formulae: [`"${roleOptions.join(",")}"`],
        showErrorMessage: true,
        errorTitle: "Invalid Role",
        error: "Please select a role from the dropdown list."
      });

      worksheet.dataValidations.add("F2:F500", {
        type: "list",
        allowBlank: true,
        formulae: [`"${statusOptions.join(",")}"`],
        showErrorMessage: true,
        errorTitle: "Invalid Status",
        error: "Please select a status from the dropdown list."
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "Import_Users_Template.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating Excel template:", error);
      // Fallback to static template
      const link = document.createElement("a");
      link.href = "/Import_Users_Template.xlsx";
      link.setAttribute("download", "Import_Users_Template.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // ฟังก์ชันส่งออกรายชื่อผู้ใช้ทั้งหมดเป็นไฟล์ Excel (.xlsx)
  const handleExportExcel = async () => {
    if (users.length === 0) {
      alert("No users to export");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Users");

      // Define columns
      worksheet.columns = [
        { header: "fullname", key: "fullname", width: 25 },
        { header: "email", key: "email", width: 30 },
        { header: "phone", key: "phone", width: 18 },
        { header: "role", key: "role", width: 18 },
        { header: "leader_email", key: "leader_email", width: 30 },
        { header: "status", key: "status", width: 15 },
        { header: "start_date", key: "start_date", width: 18 },
        { header: "expire_date", key: "expire_date", width: 18 },
      ];

      // Add user rows
      users.forEach((u) => {
        let rawRole = "storyboard";
        if (u.role === "Admin") rawRole = "admin";
        else if (u.role === "Project Manager") rawRole = "manager";
        else if (u.role === "Storyboard") rawRole = "storyboard";
        else if (u.role === "Animation") rawRole = "animation";
        else if (u.role === "Designer") rawRole = "designer";
        else if (u.role === "Programmer") rawRole = "programmer";

        const leaderUser = u.leaderId ? users.find((lead) => Number(lead.id) === Number(u.leaderId)) : null;

        worksheet.addRow({
          fullname: u.name || "",
          email: u.email || "",
          phone: u.phone !== "-" ? u.phone : "",
          role: rawRole,
          leader_email: leaderUser ? leaderUser.email : "",
          status: u.status || "active",
          start_date: u.startDate || "",
          expire_date: u.expireDate || "",
        });
      });

      // Style header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF059669" }, // Emerald
      };

      // Define role options & status options
      const roleOptions = ["admin", "manager", "storyboard", "animation", "designer", "programmer"];
      const statusOptions = ["active", "suspended"];

      worksheet.dataValidations.add("D2:D500", {
        type: "list",
        allowBlank: true,
        formulae: [`"${roleOptions.join(",")}"`],
        showErrorMessage: true,
        errorTitle: "Invalid Role",
        error: "Please select a role from the dropdown list."
      });

      worksheet.dataValidations.add("F2:F500", {
        type: "list",
        allowBlank: true,
        formulae: [`"${statusOptions.join(",")}"`],
        showErrorMessage: true,
        errorTitle: "Invalid Status",
        error: "Please select a status from the dropdown list."
      });

      // Write to buffer and trigger download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);

      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      link.setAttribute("download", `user_xport_${dateStr}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting Excel with ExcelJS:", error);
      alert("Failed to export Excel file");
    }
  };

  // Filtered Users computation
  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === "all" || user.role.toLowerCase() === roleFilter.toLowerCase();
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;

    const matchesTopSearch =
      searchQuery === "" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGlobalSearch =
      globalSearch === "" ||
      user.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(globalSearch.toLowerCase());

    return matchesRole && matchesStatus && matchesTopSearch && matchesGlobalSearch;
  });

  return {
    currentUser,
    setCurrentUser,
    users,
    loading,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    globalSearch,
    setGlobalSearch,
    entriesPerPage,
    setEntriesPerPage,
    currentPage,
    setCurrentPage,
    currentUser,
    setCurrentUser,
    selectedUserId,
    showAddModal,
    setShowAddModal,
    isEditMode,
    formData,
    avatarPreview,
    modalError,
    modalSuccess,
    pageSuccessMessage,
    setPageSuccessMessage,
    showDeleteModal,
    setShowDeleteModal,
    selectedUserForDelete,
    showStatusModal,
    setShowStatusModal,
    selectedUserForStatus,
    showImportConfirm,
    setShowImportConfirm,
    importFileName,
    importUsersList,
    showImportResult,
    setShowImportResult,
    importResultDetails,
    handleInputChange,
    handleAvatarChange,
    handleOpenAdd,
    handleOpenEdit,
    handleCreateOrUpdateUser,
    handleToggleStatus,
    handleStatusConfirm,
    handleDeleteUser,
    handleDeleteConfirm,
    handleImportFile,
    handleImportConfirm,
    handleExportExcel,
    handleDownloadTemplate,
    filteredUsers,
  };
};
