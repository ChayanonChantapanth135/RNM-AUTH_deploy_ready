import { useState, useEffect } from "react";
import axios from "axios";
import { getCurrentUser, signIn } from "../../../lib/auth";
import { useLanguage } from "../../../lib/LanguageContext";

export const useProfile = () => {
  const { t, language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  // Form Fields
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [leaderId, setLeaderId] = useState("");
  const [usersList, setUsersList] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  // Password Fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Feedback Messages
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          setErrorMsg("User session not found. Please log in.");
          setLoading(false);
          return;
        }

        // Fetch fresh details from DB and all users list
        const [res, usersRes] = await Promise.all([
          axios.get(`/auth/users/${currentUser.id}`),
          axios.get("/auth/users").catch(() => ({ data: [] })),
        ]);
        const fullUser = res.data;

        setUser(fullUser);
        setFullname(fullUser.fullname || "");
        setEmail(fullUser.email || "");
        setPhone(fullUser.phone || "");
        setLeaderId(fullUser.leader_id ? String(fullUser.leader_id) : "");
        setUsersList(Array.isArray(usersRes.data) ? usersRes.data : []);

        if (fullUser.avatar) {
          const baseUrl = axios.defaults.baseURL || "http://127.0.0.1:3000";
          const finalUrl = fullUser.avatar.startsWith("http")
            ? fullUser.avatar
            : `${baseUrl}${fullUser.avatar}`;
          setAvatarPreview(finalUrl);
        }
      } catch (err) {
        console.error("Error fetching user details:", err);
        setErrorMsg(t("profileLoadFailed"));
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [t]);

  // Auto-clear feedback messages after 5 seconds
  useEffect(() => {
    let timer;
    if (successMsg || errorMsg) {
      timer = setTimeout(() => {
        setSuccessMsg("");
        setErrorMsg("");
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [successMsg, errorMsg]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setSuccessMsg("");
      setErrorMsg("");
    }
  };

  const handleSaveProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!fullname.trim()) {
      setErrorMsg(t("profileUsernameEmpty"));
      return;
    }

    if (newPassword && !currentPassword) {
      setErrorMsg(t("currentPasswordRequired") || "Please enter your current password");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg(t("passwordsMismatch") || "Passwords do not match");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append("fullname", fullname.trim());
      formData.append("email", email.trim());
      formData.append("phone", phone.trim());
      formData.append("role", user.role);
      formData.append("status", user.status || "active");
      formData.append("creatorId", user.id); // Logging creator activity

      if (newPassword) {
        formData.append("password", newPassword);
        formData.append("currentPassword", currentPassword);
      }

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      if (leaderId) {
        formData.append("leader_id", leaderId);
      }

      const response = await axios.put(`/auth/users/${user.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        setSuccessMsg(t("profileUpdateSuccess"));
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Reload user details to refresh tokens/localStorage
        const res = await axios.get(`/auth/users/${user.id}`);
        const updatedUser = res.data;

        setUser(updatedUser);
        setLeaderId(updatedUser.leader_id ? String(updatedUser.leader_id) : "");

        // Update local session
        const currentToken = localStorage.getItem("userToken");
        const expiresAt = localStorage.getItem("userTokenExpiresAt");

        await signIn({
          token: currentToken,
          expiresInSeconds: expiresAt
            ? Math.round((Number(expiresAt) - Date.now()) / 1000)
            : 2400,
          user: {
            id: updatedUser.id,
            name: updatedUser.fullname,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
          },
        });
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setErrorMsg(err.response?.data?.message || t("profileUpdateFailed"));
    } finally {
      setSaving(false);
    }
  };

  return {
    t,
    language,
    loading,
    saving,
    user,
    fullname,
    setFullname,
    phone,
    setPhone,
    email,
    setEmail,
    leaderId,
    setLeaderId,
    usersList,
    avatarFile,
    avatarPreview,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    successMsg,
    errorMsg,
    setSuccessMsg,
    setErrorMsg,
    handleAvatarChange,
    handleSaveProfile,
  };
};
