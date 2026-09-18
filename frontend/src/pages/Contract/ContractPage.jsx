import React, { useState } from "react";
import axios from "axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useLanguage } from "../../lib/LanguageContext";
import ContactInfoCards from "./components/ContactInfoCards";
import ContactForm from "./components/ContactForm";

/**
 * คอมโพเนนต์หน้าติดต่อเรา (ContractPage Component) - Clean Modular Architecture
 */
const ContractPage = () => {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await axios.post("/auth/contact", formData);
      setSubmitted(true);
      setFormData({ fullName: "", email: "", subject: "", message: "" });
      setTimeout(() => setSubmitted(false), 7000);
    } catch (error) {
      console.error("Error sending contact message:", error);
      const msg =
        error.response?.data?.message ||
        "Failed to send message. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfos = [
    {
      icon: "📍",
      titleKey: "contactAddressLabel",
      valKey: "contactAddressVal",
      gradient: "from-blue-500/20 to-teal-500/20",
    },
    {
      icon: "📧",
      titleKey: "contactEmailLabel",
      val: "chayanon.sent@gmail.com / linkzy.1547@gmail.com",
      gradient: "from-indigo-500/20 to-purple-500/20",
    },
    {
      icon: "📞",
      titleKey: "contactPhoneLabel",
      val: "+66 2 123 4567 / +66 81 234 5678",
      gradient: "from-emerald-500/20 to-cyan-500/20",
    },
    {
      icon: "⏰",
      titleKey: "contactHoursLabel",
      valKey: "contactHoursVal",
      gradient: "from-amber-500/20 to-rose-500/20",
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col font-sans relative overflow-hidden"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <Header />

      {/* Ambient Orbs */}
      <div className="absolute top-10 left-1/4 w-[450px] h-[450px] rounded-full pointer-events-none ambient-blob-1"></div>
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none ambient-blob-2"></div>
      <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] rounded-full pointer-events-none ambient-blob-3"></div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 animate-fade-in-up relative z-10">
        {/* Hero Header */}
        <div
          className="rounded-3xl p-8 md:p-12 mb-14 shadow-xl relative overflow-hidden text-center flex flex-col items-center"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-surface)",
          }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-3xl flex flex-col items-center">
            <span
              className="inline-block px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wider mb-4 uppercase shadow-sm"
              style={{
                background: "rgba(6, 182, 212, 0.15)",
                color: "#0891b2",
                border: "1px solid rgba(6, 182, 212, 0.3)",
              }}
            >
              📞 {t("contractTitle")}
            </span>
            <h1
              className="text-3xl md:text-5xl font-black leading-tight mb-4 tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {t("contractTitle")}
            </h1>
            <p
              className="text-sm md:text-base leading-relaxed font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("contractSubtitle")}
            </p>
          </div>
        </div>

        {/* Success Alert Toast */}
        {submitted && (
          <div className="mb-8 w-full py-4 px-6 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center gap-3 shadow-lg animate-fade-in-down border-0">
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black">
              ✓
            </span>
            <span>{t("sendMessageSuccess")}</span>
          </div>
        )}

        {/* Error Alert Toast */}
        {errorMessage && (
          <div className="mb-8 w-full py-4 px-6 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center gap-3 shadow-lg animate-fade-in-down border-0">
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-black">
              ✕
            </span>
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Contact Cards */}
          <ContactInfoCards contactInfos={contactInfos} t={t} />

          {/* Right Column: Contact Form */}
          <ContactForm
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            t={t}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContractPage;
