import React from "react";
import { Modal } from "react-bootstrap";
import SearchableUserSelect from "../../../components/SearchableUserSelect";
import CustomDateInput from "../../../components/CustomDateInput";

const UserModal = ({
  showAddModal,
  setShowAddModal,
  isEditMode,
  isSelf,
  selectedUserId,
  users = [],
  formData,
  handleInputChange,
  handleAvatarChange,
  avatarPreview,
  modalError,
  modalSuccess,
  handleCreateOrUpdateUser,
  t,
}) => {
  return (
    <Modal
      show={showAddModal}
      onHide={() => setShowAddModal(false)}
      size="lg"
      centered
    >
      <Modal.Body className="p-4" style={{ borderRadius: "1rem" }}>
        {/* Modal Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <h5
            className="modal-title d-flex align-items-center gap-2"
            style={{ fontWeight: "700" }}
          >
            <span></span> {isEditMode ? t("editUserTitle") : t("addUserTitle")}
          </h5>
          <button
            className="btn btn-sm btn-outline-secondary px-3 py-1.5 rounded-lg"
            onClick={() => setShowAddModal(false)}
          >
            {t("backBtn")}
          </button>
        </div>

        {modalError && (
          <div
            className="alert alert-danger py-2 px-3 rounded-lg mb-3"
            style={{ fontSize: "0.85rem" }}
          >
            ⚠️ {modalError}
          </div>
        )}
        {modalSuccess && (
          <div
            className="alert alert-success py-2 px-3 rounded-lg mb-3"
            style={{ fontSize: "0.85rem" }}
          >
            ✅ {modalSuccess}
          </div>
        )}

        <form onSubmit={handleCreateOrUpdateUser}>
          <div className="row g-3">
            {/* Left Column */}
            <div className="col-md-8 d-flex flex-column gap-3">
              {/* Email */}
              <div>
                <label
                  className="form-label mb-1"
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    color: "var(--text-secondary)",
                  }}
                >
                  {t("modalEmailLabel")} <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-control rounded-xl py-2.5 px-3 text-sm focus:outline-none transition-all shadow-sm"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label
                  className="form-label mb-1"
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    color: "var(--text-secondary)",
                  }}
                >
                  {t("modalPasswordLabel")}{" "}
                  {!isEditMode && <span className="text-danger">*</span>}
                </label>
                <input
                  type="password"
                  name="password"
                  className="form-control rounded-xl py-2.5 px-3 text-sm focus:outline-none transition-all shadow-sm"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={isEditMode ? "••••••••" : ""}
                  required={!isEditMode}
                />
              </div>

              {/* First Name & Last Name */}
              <div className="row g-2">
                <div className="col">
                  <label
                    className="form-label mb-1"
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {t("modalFirstNameLabel")}{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-control rounded-xl py-2.5 px-3 text-sm focus:outline-none transition-all shadow-sm"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col">
                  <label
                    className="form-label mb-1"
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {t("modalLastNameLabel")}{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    className="form-control rounded-xl py-2.5 px-3 text-sm focus:outline-none transition-all shadow-sm"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label
                  className="form-label mb-1"
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    color: "var(--text-secondary)",
                  }}
                >
                  {t("modalPhoneLabel")}
                </label>
                <input
                  type="text"
                  name="phone"
                  className="form-control rounded-xl py-2.5 px-3 text-sm focus:outline-none transition-all shadow-sm"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+66"
                />
              </div>

              {/* Leader Selection */}
              <div>
                <label
                  className="form-label mb-1"
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    color: "var(--text-secondary)",
                  }}
                >
                  {t("modalLeaderLabel") || "หัวหน้า"}
                </label>
                <SearchableUserSelect
                  users={users.filter(
                    (u) =>
                      !selectedUserId ||
                      Number(u.id) !== Number(selectedUserId),
                  )}
                  value={formData.leaderId || ""}
                  name="leaderId"
                  onChange={handleInputChange}
                  placeholder={t("modalLeaderPlaceholder") || "-- Clear --"}
                  allowedRoles={[
                    "admin",
                    "manager",
                    "project_manager",
                    "storyboard",
                    "animation",
                    "designer",
                    "programmer",
                  ]}
                  placement="auto"
                  className="w-100"
                />
              </div>

              {/* Account Validity: Start Date & Expire Date */}
              <div className="row g-2">
                <div className="col-12 col-sm-6">
                  <label
                    className="form-label mb-1"
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {t("modalStartDateLabel") || "วันเริ่มใช้งาน"}
                  </label>
                  <CustomDateInput
                    name="startDate"
                    value={formData.startDate || ""}
                    onChange={handleInputChange}
                    placeholder="DD/MM/YYYY"
                    placement="auto"
                    className="form-control rounded-xl py-2 px-3 text-sm focus:outline-none transition-all shadow-sm"
                  />
                  <small
                    className="text-muted d-block mt-0.5"
                    style={{ fontSize: "0.72rem" }}
                  >
                    {t("modalStartDatePlaceholder") || "ไม่ระบุ (เริ่มทันที)"}
                  </small>
                </div>
                <div className="col-12 col-sm-6">
                  <label
                    className="form-label mb-1"
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {t("modalExpireDateLabel") || "วันหมดอายุ"}
                  </label>
                  <CustomDateInput
                    name="expireDate"
                    value={formData.expireDate || ""}
                    onChange={handleInputChange}
                    placeholder="DD/MM/YYYY"
                    placement="auto"
                    className="form-control rounded-xl py-2 px-3 text-sm focus:outline-none transition-all shadow-sm"
                  />
                  <small
                    className="text-muted d-block mt-0.5"
                    style={{ fontSize: "0.72rem" }}
                  >
                    {t("modalExpireDatePlaceholder") ||
                      "ไม่ระบุ (ไม่มีวันหมดอายุ)"}
                  </small>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-md-4 d-flex flex-column gap-3">
              {/* Avatar Upload */}
              <div className="text-center">
                <label
                  className="form-label text-secondary mb-2 d-block"
                  style={{ fontSize: "0.85rem", fontWeight: "600" }}
                >
                  {t("modalAvatarLabel")}
                </label>
                <div
                  className="mx-auto rounded-circle overflow-hidden d-flex align-items-center justify-content-center text-white mb-2"
                  style={{
                    width: "90px",
                    height: "90px",
                    backgroundColor: avatarPreview ? "transparent" : "#0d6efd",
                    fontSize: "2rem",
                    fontWeight: "bold",
                    border: "2px solid #ddd",
                  }}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : formData.firstName ? (
                    formData.firstName[0]?.toUpperCase()
                  ) : (
                    "U"
                  )}
                </div>
                <input
                  type="file"
                  id="avatarUploadInput"
                  className="d-none"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary px-3 rounded-lg"
                  onClick={() =>
                    document.getElementById("avatarUploadInput").click()
                  }
                >
                  {t("uploadPhotoBtn") || "อัปโหลดภาพ"}
                </button>
              </div>

              {/* Role Selection */}
              <div>
                <label
                  className="form-label mb-1"
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    color: "var(--text-secondary)",
                  }}
                >
                  {t("modalRoleLabel")} <span className="text-danger">*</span>
                </label>
                <select
                  name="role"
                  className="form-select rounded-xl py-2.5 px-3 text-sm focus:outline-none transition-all cursor-pointer shadow-sm"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Project Manager</option>
                  <option value="storyboard">Storyboard</option>
                  <option value="animation">Animation</option>
                  <option value="designer">Designer</option>
                  <option value="programmer">Programmer</option>
                </select>
              </div>

              {/* Active Toggle Switch */}
              <div>
                <label
                  className="form-label mb-2 d-block"
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    color: "var(--text-secondary)",
                  }}
                >
                  {t("modalStatusLabel") || "สถานะ"}
                </label>
                <div
                  className={`d-flex align-items-center gap-3 ${isSelf ? "opacity-50" : ""}`}
                  title={
                    isSelf
                      ? t("cannotChangeSelfStatus") ||
                        "ไม่สามารถเปลี่ยนสถานะของตนเองได้"
                      : ""
                  }
                >
                  <div
                    onClick={() => {
                      if (isSelf) return;
                      handleInputChange({
                        target: {
                          name: "isActive",
                          type: "checkbox",
                          checked: !formData.isActive,
                        },
                      });
                    }}
                    style={{
                      width: "52px",
                      height: "28px",
                      backgroundColor: formData.isActive
                        ? "#10b981"
                        : "#cbd5e1",
                      borderRadius: "9999px",
                      padding: "3px",
                      cursor: isSelf ? "not-allowed" : "pointer",
                      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                      display: "flex",
                      alignItems: "center",
                      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        backgroundColor: "#ffffff",
                        borderRadius: "50%",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        transform: formData.isActive
                          ? "translateX(24px)"
                          : "translateX(0px)",
                        transition:
                          "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                  </div>
                  <span
                    onClick={() => {
                      if (isSelf) return;
                      handleInputChange({
                        target: {
                          name: "isActive",
                          type: "checkbox",
                          checked: !formData.isActive,
                        },
                      });
                    }}
                    className={`fw-bold select-none ${isSelf ? "cursor-not-allowed" : "cursor-pointer"}`}
                    style={{
                      fontSize: "0.9rem",
                      color: formData.isActive ? "#10b981" : "#ef4444",
                    }}
                  >
                    {formData.isActive
                      ? t("statusActive") || "ใช้งาน"
                      : t("statusSuspended") || "ระงับการใช้งาน"}
                  </span>
                </div>
                {isSelf && (
                  <small
                    className="text-muted mt-1 d-block"
                    style={{ fontSize: "0.75rem" }}
                  >
                    *{" "}
                    {t("cannotChangeSelfStatus") ||
                      "ไม่สามารถเปลี่ยนสถานะของตนเองได้"}
                  </small>
                )}
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
            <button
              type="button"
              className="btn btn-secondary px-4 rounded-lg"
              onClick={() => setShowAddModal(false)}
            >
              {t("modalCancelBtn")}
            </button>
            <button
              type="submit"
              className="btn btn-primary px-4 rounded-lg d-flex align-items-center gap-2"
            >
              {isEditMode ? t("modalSaveBtn") : t("modalCreateBtn")}
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default UserModal;
