"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, User, LogOut, Sun, Moon, Bell, Clock as ClockIcon, BookOpen, Layers } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Clock from "@/components/Clock";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/student/dashboard")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setStudentInfo(res.data.student);
        }
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { href: "/student", label: "Dashboard", Icon: Home },
    { href: "/student/calendar", label: "Calendar & Schedule", Icon: Calendar },
    { href: "/student/messages", label: "Announcements", Icon: Bell },
  ];

  return (
    <div className="admin-layout">
      {/* MOBILE SIDEBAR OVERLAY */}
      <div
        className={`admin-sidebar-overlay ${isMobileSidebarOpen ? "open" : ""}`}
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      {/* LEFT SIDEBAR (Matching Admin Mode) */}
      <aside className={`admin-sidebar ${isMobileSidebarOpen ? "open" : ""}`}>
        <div>
          {/* Brand Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              paddingBottom: "1.5rem",
              borderBottom: "1px solid var(--border-subtle)",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, var(--royal-blue) 0%, var(--sky-blue) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "800",
                fontSize: "1.1rem",
                color: "white",
                boxShadow: "0 4px 12px rgba(29, 78, 216, 0.3)",
              }}
            >
              VM
            </div>
            <div>
              <h2
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  margin: 0,
                  fontFamily: "var(--font-serif, serif)",
                }}
              >
                VM-HUB
              </h2>
              <span style={{ fontSize: "0.75rem", color: "var(--sky-blue)", fontWeight: "600" }}>
                Student Portal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {navItems.map((nav) => {
              const isActive = pathname === nav.href;
              return (
                <Link
                  key={nav.href}
                  href={nav.href}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    padding: "0.7rem 0.9rem",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    backgroundColor: isActive ? "var(--royal-blue)" : "transparent",
                    color: isActive ? "#ffffff" : "var(--text-muted)",
                    transition: "all 0.2s ease",
                    textDecoration: "none",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <nav.Icon size={16} /> {nav.label}
                  </span>
                  {isActive && (
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: "#ffffff",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Card */}
        <div
          style={{
            paddingTop: "1rem",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {/* User Profile Card (Click to open Drawer) */}
          <div
            onClick={() => setShowProfileDrawer(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.6rem 0.75rem",
              borderRadius: "10px",
              backgroundColor: "var(--bg-input)",
              border: "1px solid var(--border-subtle)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--sky-blue)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, var(--royal-blue) 0%, var(--sky-blue) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                color: "white",
                fontSize: "0.95rem",
              }}
            >
              {studentInfo?.name ? studentInfo.name.charAt(0) : "S"}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div
                style={{
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {studentInfo?.name || "Student Profile"}
              </div>
              <div
                style={{
                  fontSize: "0.725rem",
                  color: "var(--sky-blue)",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {studentInfo?.registerNo || studentInfo?.department || "Student"}
              </div>
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>➔</span>
          </div>

          {/* Theme Switcher */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                width: "100%",
                backgroundColor: "var(--bg-input)",
                color: "var(--text-main)",
                border: "1px solid var(--border-subtle)",
                padding: "0.6rem",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {theme === "dark" ? (
                <>
                  <Sun size={16} /> Light Mode
                </>
              ) : (
                <>
                  <Moon size={16} /> Dark Mode
                </>
              )}
            </button>
          )}

          {/* Sign Out */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              color: "#ef4444",
              fontSize: "0.85rem",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              padding: "0.6rem",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="admin-main">
        {/* TOP BAR WITH HAMBURGER BUTTON (Mobile Friendly) */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          <button
            className="hamburger-btn"
            onClick={() => setIsMobileSidebarOpen(true)}
            style={{ display: "flex" }}
          >
            ☰
          </button>
        </div>

        {children}
      </div>

      {/* STUDENT PROFILE SIDE DRAWER (Same as Admin User Drawer) */}
      {showProfileDrawer && (
        <div className="admin-drawer-container" onClick={() => setShowProfileDrawer(false)}>
          <aside onClick={(e) => e.stopPropagation()} className="admin-drawer">
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "1rem",
                  borderBottom: "1px solid var(--border-subtle)",
                  marginBottom: "1.5rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: "800",
                    color: "var(--sky-blue)",
                    letterSpacing: "0.05em",
                  }}
                >
                  STUDENT PROFILE DETAILS
                </span>
                <button
                  onClick={() => setShowProfileDrawer(false)}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    fontSize: "1.2rem",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Profile Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, var(--royal-blue) 0%, var(--sky-blue) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "1.5rem",
                    fontWeight: "700",
                  }}
                >
                  {studentInfo?.name ? studentInfo.name.charAt(0) : "S"}
                </div>
                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: "700", margin: 0 }}>
                    {studentInfo?.name || "Student"}
                  </h3>
                  <span
                    style={{
                      padding: "0.15rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      backgroundColor: "rgba(56, 189, 248, 0.15)",
                      color: "var(--sky-blue)",
                    }}
                  >
                    STUDENT ACCOUNT
                  </span>
                </div>
              </div>

              {/* Profile Details List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.875rem" }}>
                <div
                  style={{
                    padding: "0.75rem",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>
                    REGISTER NUMBER
                  </span>
                  <strong style={{ color: "var(--text-main)" }}>
                    {studentInfo?.registerNo || "N/A"}
                  </strong>
                </div>

                <div
                  style={{
                    padding: "0.75rem",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>
                    DEPARTMENT & SECTION
                  </span>
                  <strong style={{ color: "var(--text-main)" }}>
                    {studentInfo?.department || "CSE"} • Section {studentInfo?.section || "A"}
                  </strong>
                </div>

                <div
                  style={{
                    padding: "0.75rem",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>
                    YEAR & SEMESTER
                  </span>
                  <strong style={{ color: "var(--text-main)" }}>
                    Year {studentInfo?.year || "II"} • Semester {studentInfo?.semester || "3"}
                  </strong>
                </div>

                <div
                  style={{
                    padding: "0.75rem",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>
                    CLASS ID
                  </span>
                  <strong style={{ color: "var(--sky-blue)" }}>
                    {studentInfo?.classId || `${studentInfo?.year || "II"}-${studentInfo?.department || "CSE"}-${studentInfo?.section || "A"}`}
                  </strong>
                </div>

                <Link
                  href="/student/profile"
                  onClick={() => setShowProfileDrawer(false)}
                  style={{
                    marginTop: "0.5rem",
                    padding: "0.65rem",
                    borderRadius: "8px",
                    backgroundColor: "var(--royal-blue)",
                    color: "white",
                    fontWeight: "600",
                    textAlign: "center",
                    textDecoration: "none",
                    fontSize: "0.85rem",
                  }}
                >
                  Edit Full Profile & Password
                </Link>
              </div>
            </div>

            <div style={{ paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)" }}>
              <button
                onClick={() => setShowProfileDrawer(false)}
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-input)",
                  color: "var(--text-main)",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Close Drawer
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
