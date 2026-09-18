import React from "react";
import { Modal } from "react-bootstrap";
import { useLanguage } from "../../../lib/LanguageContext";
import SearchableUserSelect from "../../../components/SearchableUserSelect";
import CustomDateInput from "../../../components/CustomDateInput";

const EditProjectModal = ({
  showEditModal,
  setShowEditModal,
  handleEditSubmit,
  editFormData,
  setEditFormData,
  teamLeaders = [],
  users = [],
  t,
}) => {
  const { language } = useLanguage();
  const userList = users && users.length > 0 ? users : teamLeaders;

  return (
    <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
      <Modal.Body className="p-4" style={{ borderRadius: "1rem" }}>
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-1.5">
            <ion-icon
              name="create-outline"
              style={{ fontSize: "20px" }}
            ></ion-icon>
            <span>{t("editProjectTitle")}</span>
          </h5>
          <button
            className="btn-close"
            onClick={() => setShowEditModal(false)}
          ></button>
        </div>
        <form onSubmit={handleEditSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-bold">
              {t("modalProjectTitle")} <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control rounded-lg"
              value={editFormData.name}
              onChange={(e) =>
                setEditFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold">
              {t("modalProjectPriority")} <span className="text-danger">*</span>
            </label>
            <select
              className="form-select rounded-lg"
              value={editFormData.priority}
              onChange={(e) =>
                setEditFormData((prev) => ({
                  ...prev,
                  priority: e.target.value,
                }))
              }
              required
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="mb-3" lang={language === "th" ? "th-TH" : "en-GB"}>
            <label className="form-label small fw-bold">
              {t("modalProjectEndDate")} <span className="text-danger">*</span>
            </label>
            <CustomDateInput
              name="endDate"
              value={editFormData.endDate}
              onChange={(e) =>
                setEditFormData((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">
              {t("modalProjectTeamLeader")}{" "}
              <span className="text-danger">*</span>
            </label>
            <SearchableUserSelect
              users={userList}
              value={editFormData.teamLeaderId}
              name="teamLeaderId"
              onChange={(e) =>
                setEditFormData((prev) => ({
                  ...prev,
                  teamLeaderId: e.target.value,
                }))
              }
              allowedRoles={[
                "manager",
                "project_manager",
                "storyboard",
                "animation",
                "designer",
                "programmer",
              ]}
              placeholder={`-- ${t("modalProjectTeamLeader")} --`}
              required
            />
          </div>
          <div className="d-flex justify-content-end gap-2 pt-3 border-top mt-4">
            <button
              type="button"
              className="btn btn-danger px-4 py-2 rounded-lg"
              onClick={() => setShowEditModal(false)}
            >
              {t("cancelBtn")}
            </button>
            <button
              type="submit"
              className="btn btn-primary px-4 py-2 rounded-lg"
            >
              💾 {t("modalSaveProject")}
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default EditProjectModal;
