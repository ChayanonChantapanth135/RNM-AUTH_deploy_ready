import React, { useState, useEffect, useRef } from "react";

const roleLabels = {
  admin: "🔑 Admin",
  manager: "💼 Project Manager",
  project_manager: "💼 Project Manager",
  storyboard: "📝 Storyboard",
  animation: "🎬 Animation",
  designer: "🎨 Designer",
  programmer: "💻 Programmer",
};

export default function SearchableUserSelect({
  users = [],
  value = "",
  onChange,
  placeholder = "-- Select Assignee --",
  allowedRoles = null,
  required = false,
  className = "",
  triggerClassName = "",
  triggerStyle = {},
  placement = "auto", // "auto" | "top" | "bottom"
  name = "assignedTo",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDirection, setOpenDirection] = useState("down"); // "down" | "up"
  const containerRef = useRef(null);

  // Auto calculate direction or follow placement
  useEffect(() => {
    if (placement === "top") {
      setOpenDirection("up");
      return;
    }
    if (placement === "bottom") {
      setOpenDirection("down");
      return;
    }

    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownHeight = 280;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < dropdownHeight || spaceAbove > spaceBelow) {
        setOpenDirection("up");
      } else {
        setOpenDirection("down");
      }
    }
  }, [isOpen, placement]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset search query when dropdown opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Find currently selected user
  const selectedUser = users.find((u) => String(u.id) === String(value));

  // Filter and group users
  const filteredUsers = users.filter((u) => {
    const rawRole = (u.rawRole || u.role || "user").toLowerCase().replace(/ /g, "_");
    // Check role filter
    if (allowedRoles) {
      const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase().replace(/ /g, "_"));
      if (!normalizedAllowed.includes(rawRole)) return false;
    } else {
      // Default: exclude standard 'user' role
      if (rawRole === "user") return false;
    }

    // Check search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const usernameMatch =
        (u.fullname || u.username) && (u.fullname || u.username).toLowerCase().includes(query);
      const roleMatch = (u.role || "").toLowerCase().includes(query) || rawRole.includes(query);
      const roleLabelMatch =
        (roleLabels[rawRole] && roleLabels[rawRole].toLowerCase().includes(query)) ||
        (roleLabels[u.role] && roleLabels[u.role].toLowerCase().includes(query));
      return usernameMatch || roleMatch || roleLabelMatch;
    }

    return true;
  });

  // Group by role
  const grouped = filteredUsers.reduce((acc, u) => {
    const role = (u.rawRole || u.role || "user").toLowerCase().replace(/ /g, "_");
    if (!acc[role]) acc[role] = [];
    acc[role].push(u);
    return acc;
  }, {});

  const roleOrder = ["admin", "manager", "project_manager", "storyboard", "animation", "designer", "programmer"];
  const sortedGroupEntries = Object.entries(grouped).sort(([roleA], [roleB]) => {
    const indexA = roleOrder.indexOf(roleA);
    const indexB = roleOrder.indexOf(roleB);
    const orderA = indexA !== -1 ? indexA : 999;
    const orderB = indexB !== -1 ? indexB : 999;
    return orderA - orderB;
  });

  const handleSelect = (userId) => {
    onChange({ target: { name, value: userId } });
    setIsOpen(false);
  };

  return (
    <div
      className={`position-relative ${className}`}
      ref={containerRef}
      style={{ zIndex: isOpen ? 100 : 1 }}
    >
      {/* Hidden input to satisfy HTML5 validation if required */}
      {required && (
        <input
          type="text"
          value={value || ""}
          required
          tabIndex={-1}
          style={{
            position: "absolute",
            opacity: 0,
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            pointerEvents: "none",
          }}
          readOnly
        />
      )}

      {/* Dropdown Button */}
      <div
        className={`w-full text-sm d-flex align-items-center justify-content-between transition-all ${
          triggerClassName ? triggerClassName : "form-control rounded-xl py-2.5 px-3 text-sm shadow-sm"
        }`}
        style={{
          cursor: "pointer",
          ...(triggerClassName
            ? {
                color: selectedUser
                  ? "var(--text-primary, #0f172a)"
                  : "var(--text-secondary, #64748b)",
              }
            : {}),
          ...triggerStyle,
          ...(isOpen && !triggerClassName
            ? {
                borderColor: "var(--brand-color, #3b82f6)",
                boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.15)",
              }
            : {}),
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          style={{
            color: triggerStyle.color
              ? triggerStyle.color
              : triggerClassName
              ? selectedUser
                ? "var(--text-primary, #0f172a)"
                : "var(--text-secondary, #64748b)"
              : selectedUser
              ? "inherit"
              : "#94a3b8",
            fontWeight: "400",
            fontSize: "0.875rem",
          }}
        >
          {selectedUser ? (selectedUser.fullname || selectedUser.name || selectedUser.username) : placeholder}
        </span>
        <span
          style={{
            fontSize: "0.75rem",
            color: triggerClassName ? "var(--text-secondary, #94a3b8)" : "#94a3b8",
            marginLeft: "8px",
          }}
        >
          {isOpen ? "▲" : "▼"}
        </span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="position-absolute w-100 bg-white border rounded-xl shadow-2xl"
          style={{
            ...(openDirection === "up"
              ? { bottom: "calc(100% + 4px)", marginBottom: 0 }
              : { top: "calc(100% + 4px)", marginTop: 0 }),
            left: 0,
            zIndex: 1060,
            maxHeight: "280px",
            overflowY: "auto",
            borderRadius: "0.75rem",
            backgroundColor: "#ffffff",
            borderColor: "#cbd5e1",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Search Box */}
          <div className="p-2 border-bottom sticky-top" style={{ backgroundColor: "#ffffff" }}>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="🔍 Search name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: "#f8fafc",
                color: "#0f172a",
                borderColor: "#cbd5e1",
                fontSize: "0.85rem",
              }}
            />
          </div>

          {/* Options */}
          <div className="py-1" style={{ backgroundColor: "#ffffff" }}>
            {/* Unassigned / Clear option */}
            <div
              className={`py-2 px-3 text-sm cursor-pointer ${
                !value ? "fw-bold" : ""
              }`}
              style={{
                cursor: "pointer",
                color: "#dc2626",
                backgroundColor: !value ? "#fef2f2" : "transparent",
                fontWeight: !value ? "700" : "500",
                fontSize: "0.85rem",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fee2e2")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = !value ? "#fef2f2" : "transparent")
              }
              onClick={() => handleSelect("")}
            >
              -- Clear / Unassigned --
            </div>

            {sortedGroupEntries.length === 0 ? (
              <div
                className="text-center py-3 text-sm"
                style={{ color: "#64748b", fontSize: "0.85rem" }}
              >
                No users found
              </div>
            ) : (
              sortedGroupEntries.map(([role, list]) => (
                <div key={role}>
                  <div
                    className="px-3 py-1.5 text-xs fw-bold text-uppercase border-top border-bottom"
                    style={{
                      fontSize: "0.75rem",
                      color: "#475569",
                      backgroundColor: "#f1f5f9",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {roleLabels[role] || role}
                  </div>
                  {list.map((u) => {
                    const isSelected = String(u.id) === String(value);
                    const userName = u.fullname || u.name || u.username;
                    return (
                      <div
                        key={u.id}
                        className="py-2 px-3 text-sm cursor-pointer d-flex align-items-center justify-content-between"
                        style={{
                          cursor: "pointer",
                          color: isSelected ? "#ffffff" : "#0f172a",
                          backgroundColor: isSelected ? "#2563eb" : "transparent",
                          fontWeight: isSelected ? "600" : "400",
                          fontSize: "0.875rem",
                          transition: "background-color 0.15s ease, color 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = "#f8fafc";
                            e.currentTarget.style.color = "#0284c7";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "#0f172a";
                          }
                        }}
                        onClick={() => handleSelect(u.id)}
                      >
                        <span>{userName}</span>
                        {isSelected && <span style={{ fontSize: "0.8rem" }}>✓</span>}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
