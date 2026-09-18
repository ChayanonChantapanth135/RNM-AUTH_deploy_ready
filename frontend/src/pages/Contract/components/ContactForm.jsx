import React from "react";

const ContactForm = ({ formData, setFormData, handleSubmit, isSubmitting = false, t }) => {
  return (
    <div className="lg:col-span-7 flex flex-col h-full">
      <h2 className="text-xl font-bold mb-8 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
        <span>✉️</span> {t("sendMessageTitle")}
      </h2>

      <div 
        className="rounded-3xl p-8 shadow-xl flex-1 flex flex-col"
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-surface)",
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-4 flex-1 flex flex-col">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>
                {t("formFullName")} *
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder={t("formFullNamePlaceholder")}
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-sm disabled:opacity-60"
                style={{
                  backgroundColor: "var(--bg-surface-hover)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-surface)",
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>
                {t("formEmail")} *
              </label>
              <input
                type="email"
                required
                disabled={isSubmitting}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder={t("formEmailPlaceholder")}
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-sm disabled:opacity-60"
                style={{
                  backgroundColor: "var(--bg-surface-hover)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-surface)",
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>
                {t("formSubject")} *
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                placeholder={t("formSubjectPlaceholder")}
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-sm disabled:opacity-60"
                style={{
                  backgroundColor: "var(--bg-surface-hover)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-surface)",
                }}
              />
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>
                {t("formMessage")} *
              </label>
              <textarea
                required
                disabled={isSubmitting}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder={t("formMessagePlaceholder")}
                className="w-full flex-1 min-h-[120px] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-sm resize-y disabled:opacity-60"
                style={{
                  backgroundColor: "var(--bg-surface-hover)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-surface)",
                }}
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-xl text-white font-bold text-sm shadow-lg transition-all glow-button cursor-pointer hover:scale-101 active:scale-99 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            style={{
              backgroundColor: "var(--brand-color, #0d9488)",
            }}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>{t("submitting") || "Sending..."}</span>
              </>
            ) : (
              t("sendMessageBtn")
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
