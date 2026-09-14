"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiHome, FiCalendar, FiBell, FiUser, FiLogOut, FiMessageSquare, FiAlertCircle, FiInfo } from "react-icons/fi";
import { signOut } from "next-auth/react";

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  postedBy: string;
  createdAt: string;
}

export default function MessagesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/student/notices")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setNotices(json.data);
        } else {
          setError(json.error || "Failed to load messages.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("An error occurred while fetching messages.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="admin-layout">
        <div className="admin-content" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  const getCategoryIcon = (cat: string) => {
    switch (cat.toUpperCase()) {
      case "URGENT": return <FiAlertCircle style={{ color: "#ef4444" }} />;
      case "EXAM": return <FiCalendar style={{ color: "#f59e0b" }} />;
      default: return <FiInfo style={{ color: "#3b82f6" }} />;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat.toUpperCase()) {
      case "URGENT": return { bg: "#fef2f2", text: "#ef4444", border: "#fca5a5" };
      case "EXAM": return { bg: "#fffbeb", text: "#d97706", border: "#fcd34d" };
      default: return { bg: "#eff6ff", text: "#3b82f6", border: "#bfdbfe" };
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="brand-logo">S</span>
          <span className="brand-text">Student Portal</span>
        </div>
        <nav className="admin-nav">
          <Link href="/student" className="nav-item">
            <FiHome className="nav-icon" /> Dashboard
          </Link>
          <Link href="/student/calendar" className="nav-item">
            <FiCalendar className="nav-icon" /> Calendar
          </Link>
          <Link href="/student/messages" className="nav-item active">
            <FiBell className="nav-icon" /> Messages
          </Link>
          <Link href="/student/profile" className="nav-item">
            <FiUser className="nav-icon" /> Profile
          </Link>
        </nav>
        <div className="admin-logout">
          <button onClick={() => signOut({ callbackUrl: "/" })} className="logout-btn">
            <FiLogOut className="nav-icon" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-content">
        <header className="student-header" style={{ marginBottom: "2rem" }}>
          <div>
            <h1>Messages & Notices</h1>
            <p className="student-subtitle">Official communications from your department and college.</p>
          </div>
        </header>

        {error && (
          <div style={{ backgroundColor: "#fef2f2", color: "#991b1b", padding: "1rem", borderRadius: "8px", marginBottom: "2rem" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {notices.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 2rem", backgroundColor: "#fff", borderRadius: "16px", border: "1px dashed #d1d5db" }}>
              <FiMessageSquare style={{ fontSize: "3rem", color: "#9ca3af", marginBottom: "1rem" }} />
              <h3 style={{ color: "#374151" }}>No messages yet</h3>
              <p style={{ color: "#6b7280" }}>You're all caught up!</p>
            </div>
          ) : (
            notices.map((notice) => {
              const colors = getCategoryColor(notice.category);
              return (
                <div key={notice.id} className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      {getCategoryIcon(notice.category)}
                      <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#111827" }}>{notice.title}</h3>
                    </div>
                    <span style={{ 
                      fontSize: "0.75rem", 
                      fontWeight: 600, 
                      padding: "0.25rem 0.5rem", 
                      borderRadius: "6px",
                      backgroundColor: colors.bg,
                      color: colors.text,
                      border: `1px solid ${colors.border}`
                    }}>
                      {notice.category.toUpperCase()}
                    </span>
                  </div>
                  
                  <p style={{ margin: 0, color: "#4b5563", lineHeight: "1.5" }}>
                    {notice.content}
                  </p>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem", fontSize: "0.85rem", color: "#9ca3af" }}>
                    <span>Posted by: {notice.postedBy}</span>
                    <span>{new Date(notice.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
