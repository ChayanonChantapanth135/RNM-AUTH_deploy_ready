import React, { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useLanguage } from "../../lib/LanguageContext";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * คอมโพเนนต์หน้า 404 (NotFoundPage Component) - Ultra-Modern Glassmorphic Design
 */
const NotFoundPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const badgeRef = useRef(null);
  const codeRef = useRef(null);
  const contentRef = useRef(null);
  const actionsRef = useRef(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: -20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6 }
      )
        .fromTo(
          codeRef.current,
          { opacity: 0, scale: 0.8, filter: "blur(10px)" },
          { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.8 },
          "-=0.3"
        )
        .fromTo(
          contentRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.4"
        )
        .fromTo(
          actionsRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.3"
        );
    },
    { scope: containerRef }
  );

  const isLoggedIn = Boolean(localStorage.getItem("userToken"));

  return (
    <div
      className="min-h-screen flex flex-col font-sans relative overflow-hidden"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10">
        {/* Subtle Ambient Glow */}
        <div
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none -top-10 -right-10"
          style={{ background: "var(--brand-color, #6366f1)" }}
        />
        <div
          className="absolute w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none -bottom-10 -left-10"
          style={{ background: "var(--brand-color, #06b6d4)" }}
        />

        <div
          ref={containerRef}
          className="max-w-2xl w-full text-center py-12 px-6 sm:px-10 rounded-3xl relative backdrop-blur-xl transition-all"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-surface)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
        >
          {/* Badge */}
          <div ref={badgeRef} className="mb-6 inline-block">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"
              style={{
                backgroundColor: "var(--bg-surface-hover)",
                color: "var(--brand-color, #6366f1)",
                border: "1px solid var(--border-surface)",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              {t("notFoundBadge") || "404 Error"}
            </span>
          </div>

          {/* 404 Large Number */}
          <div ref={codeRef} className="relative select-none my-2">
            <h1
              className="text-8xl sm:text-9xl font-black tracking-tighter leading-none"
              style={{
                background:
                  "linear-gradient(135deg, var(--text-primary) 0%, var(--brand-color, #6366f1) 50%, var(--text-secondary) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.15))",
              }}
            >
              404
            </h1>
          </div>

          {/* Title & Description */}
          <div ref={contentRef} className="space-y-3 mt-4">
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {t("notFoundTitle") || "Page Not Found"}
            </h2>
            <p
              className="text-sm sm:text-base max-w-lg mx-auto leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("notFoundDesc") ||
                "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."}
            </p>
          </div>

          {/* Action Buttons */}
          <div
            ref={actionsRef}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8"
          >
            {/* Go Back button */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm hover:scale-102 active:scale-98"
              style={{
                backgroundColor: "var(--bg-surface-hover)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-surface)",
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>{t("notFoundPrevious") || "Go Back"}</span>
            </button>

            {/* Dashboard / Home Link */}
            {isLoggedIn ? (
              <Link
                to="/Dashboard"
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 flex items-center gap-2 no-underline cursor-pointer shadow-lg hover:scale-102 active:scale-98 glow-button"
                style={{
                  backgroundColor: "var(--brand-color, #6366f1)",
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                <span>{t("notFoundDashboard") || "Go to Dashboard"}</span>
              </Link>
            ) : (
              <Link
                to="/Home"
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 flex items-center gap-2 no-underline cursor-pointer shadow-lg hover:scale-102 active:scale-98 glow-button"
                style={{
                  backgroundColor: "var(--brand-color, #6366f1)",
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span>{t("notFoundBackHome") || "Back to Home"}</span>
              </Link>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFoundPage;
