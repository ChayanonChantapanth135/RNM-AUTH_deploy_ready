import React from "react";
import { Modal } from "react-bootstrap";
import SearchableUserSelect from "../../../components/SearchableUserSelect";
import CustomDateInput from "../../../components/CustomDateInput";
import { useLanguage } from "../../../lib/LanguageContext";

const AddTaskModal = ({
  showAddTaskModal,
  setShowAddTaskModal,
  selectedProject,
  taskFormData,
  setTaskFormData,
  users,
  handleAddTaskSubmit,
  t,
}) => {
  const { language } = useLanguage();
  return (
    <Modal
      show={showAddTaskModal}
      onHide={() => setShowAddTaskModal(false)}
      centered
    >
      <Modal.Body className="p-4" style={{ borderRadius: "1rem" }}>
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-1.5">
            <ion-icon
              name="add-circle-outline"
              style={{ fontSize: "20px" }}
            ></ion-icon>
            <span>{t("createTaskTitle")}</span>
          </h5>
          <button
            className="btn-close"
            onClick={() => setShowAddTaskModal(false)}
          ></button>
        </div>
        <form onSubmit={handleAddTaskSubmit}>
          {/* Project Name (Read Only) */}
          <div className="mb-3">
            <label className="form-label small fw-bold">
              {t("taskProjectLabel")}
            </label>
            <input
              type="text"
              className="form-control bg-light rounded-lg text-muted"
              value={selectedProject ? selectedProject.name : ""}
              readOnly
            />
          </div>

          {/* Title / Task Name */}
          <div className="mb-3">
            <label className="form-label small fw-bold">
              {t("taskNameLabel")} <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control rounded-lg"
              placeholder={t("taskNamePlaceholder")}
              value={taskFormData.title}
              onChange={(e) =>
                setTaskFormData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              required
            />
          </div>

          {/* Task Type */}
          <div className="mb-3">
            <label className="form-label small fw-bold">
              {t("taskTypeLabel")} <span className="text-danger">*</span>
            </label>
            <select
              className="form-select rounded-lg"
              value={taskFormData.taskType}
              onChange={(e) =>
                setTaskFormData((prev) => ({
                  ...prev,
                  taskType: e.target.value,
                }))
              }
              required
            >
              <option value="แปล">{t("taskTypeTranslate")}</option>
              <option value="สตอรี่บอร์ด">{t("taskTypeStoryboard")}</option>
              <option value="ออกแบบ">{t("taskTypeGraphicDesign")}</option>
              <option value="อนิเมชัน">{t("taskTypeAnimation")}</option>
              <option value="ตัดต่อ">{t("taskTypeVideoEdit")}</option>
              <option value="พัฒนาโปรแกรม">{t("taskTypeDevelopment")}</option>
              <option value="อื่นๆ">{t("taskTypeOthers")}</option>
            </select>
          </div>

          {/* Custom Task Type (Shown if อื่นๆ is selected) */}
          {taskFormData.taskType === "อื่นๆ" && (
            <div className="mb-3">
              <label className="form-label small fw-bold">
                {t("customTaskTypeLabel")}{" "}
                <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control rounded-lg"
                placeholder={t("customTaskTypePlaceholder")}
                value={taskFormData.customTaskType}
                onChange={(e) =>
                  setTaskFormData((prev) => ({
                    ...prev,
                    customTaskType: e.target.value,
                  }))
                }
                required
              />
            </div>
          )}

          {/* Description */}
          <div className="mb-3">
            <label className="form-label small fw-bold">
              {t("taskDescLabel")}
            </label>
            <textarea
              className="form-control rounded-lg"
              rows="2"
              placeholder={t("taskDescPlaceholder")}
              value={taskFormData.description}
              onChange={(e) =>
                setTaskFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>

          {/* Priority */}
          <div className="mb-3">
            <label className="form-label small fw-bold">
              {t("taskPriorityLabel")} <span className="text-danger">*</span>
            </label>
            <select
              className="form-select rounded-lg"
              value={taskFormData.priority}
              onChange={(e) =>
                setTaskFormData((prev) => ({
                  ...prev,
                  priority: e.target.value,
                }))
              }
              required
            >
              <option value="High">{t("priorityHigh")}</option>
              <option value="Medium">{t("priorityMedium")}</option>
              <option value="Low">{t("priorityLow")}</option>
            </select>
          </div>

          {/* Due Date */}
          <div className="mb-3" lang={language === "th" ? "th-TH" : "en-GB"}>
            <label className="form-label small fw-bold">
              {t("taskDueDateLabel")} <span className="text-danger">*</span>
            </label>
            <CustomDateInput
              name="dueDate"
              value={taskFormData.dueDate}
              onChange={(e) =>
                setTaskFormData((prev) => ({
                  ...prev,
                  dueDate: e.target.value,
                }))
              }
              required
            />
          </div>

          {/* Assignee */}
          <div className="mb-3">
            <label className="form-label small fw-bold">
              {t("taskAssigneeLabel")} <span className="text-danger">*</span>
            </label>
            <SearchableUserSelect
              users={users}
              value={taskFormData.assignedTo}
              onChange={(e) =>
                setTaskFormData((prev) => ({
                  ...prev,
                  assignedTo: e.target.value,
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
              placeholder={`-- ${t("selectAssignee")} --`}
              required
            />
          </div>

          <div className="d-flex justify-content-end gap-2 pt-3 border-top mt-4">
            <button
              type="button"
              className="btn btn-danger px-4 py-2 rounded-lg"
              onClick={() => setShowAddTaskModal(false)}
            >
              {t("cancelBtn")}
            </button>
            <button
              type="submit"
              className="btn btn-primary px-4 py-2 rounded-lg"
            >
              + {t("createTaskBtn")}
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default AddTaskModal;
