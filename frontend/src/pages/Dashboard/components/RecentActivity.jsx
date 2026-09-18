import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../lib/LanguageContext";
import { formatDateTime } from "../../../lib/dateUtils";

/**
 * คอมโพเนนต์แสดงบันทึกกิจกรรมล่าสุดบนแดชบอร์ด (RecentActivity Component) - Glassmorphism Theme
 */
const RecentActivity = ({ t, recentActivities = [] }) => {
  const { language } = useLanguage();
  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-white">
              {t("recentActivity")}
            </h3>
          </div>
          <Link
            to="/Activity"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-slate-300 no-underline"
          >
            {t("viewAll")} &rarr;
          </Link>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
          {recentActivities.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              {t("noActivityFound") || "ไม่มีบันทึกกิจกรรมล่าสุด"}
            </div>
          ) : (
            recentActivities.map((activity, index) => (
              <div
                key={activity.id || index}
                className="glass-card rounded-2xl p-4 flex justify-between items-start transition-all"
              >
                <div>
                  <p className="font-bold text-white text-sm">
                    {activity.fullname ||
                      activity.username ||
                      activity.user ||
                      "System"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {t(activity.action) || activity.action}
                  </p>
                </div>
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap ml-2">
                  {activity.created_at
                    ? formatDateTime(activity.created_at, language)
                    : activity.time || ""}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(RecentActivity);

