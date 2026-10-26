"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiHome, FiCalendar, FiBell, FiUser, FiLogOut, FiMessageSquare, FiAlertCircle, FiInfo } from "react-icons/fi";
import { Megaphone, ArrowLeft } from "lucide-react";

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  audience?: string;
  postedBy: string;
  createdAt: string;
}

export default function TeacherNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/teacher/notices")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setNotices(json.data || []);
        } else {
          setError(json.error || "Failed to load notices.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("An error occurred while fetching notices.");
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
    switch ((cat || "").toUpperCase()) {
      case "URGENT": return <FiAlertCircle style={{ color: "#ef4444" }} />;
      case "EXAM": return <FiCalendar style={{ color: "#f59e0b" }} />;
      default: return <FiInfo style={{ color: "#3b82f6" }} />;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch ((cat || "").toUpperCase()) {
      case "URGENT": return { bg: "rgba(239, 68, 68, 0.15)", text: "#ef4444", border: "rgba(239, 68, 68, 0.3)" };
      case "EXAM": return { bg: "rgba(245, 158, 11, 0.15)", text: "#d97706", border: "rgba(245, 158, 11, 0.3)" };
      default: return { bg: "rgba(59, 130, 246, 0.15)", text: "#3b82f6", border: "rgba(59, 130, 246, 0.3)" };
    }
  };

  return (
    <main className="student-main">
      <header className="student-header" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <Link href="/teacher" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none" }}>
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
          </div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Megaphone size={24} style={{ color: "var(--royal-blue)" }} /> Staff Announcements & Circulars
          </h1>
          <p className="student-subtitle">Official communications from the Principal, Dean, and Department Heads.</p>
        </div>
      </header>

      {error && (
        <div style={{ backgroundColor: "var(--bg-card)", color: "#ef4444", padding: "1rem", borderRadius: "8px", marginBottom: "2rem", border: "1px solid #fca5a5" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {notices.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", backgroundColor: "var(--bg-card)", borderRadius: "16px", border: "1px dashed var(--border-subtle)" }}>
            <FiMessageSquare style={{ fontSize: "3rem", color: "var(--text-muted)", marginBottom: "1rem" }} />
            <h3 style={{ color: "var(--text-main)" }}>No notices yet</h3>
            <p style={{ color: "var(--text-muted)" }}>All staff announcements will appear here.</p>
          </div>
        ) : (
          notices.map((notice) => {
            const colors = getCategoryColor(notice.category);
            return (
              <div key={notice.id} className="student-card premium-card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {getCategoryIcon(notice.category)}
                    <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text-main)" }}>{notice.title}</h3>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    {notice.audience && (
                      <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", borderRadius: "4px", backgroundColor: "var(--bg-body)", color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}>
                        {notice.audience}
                      </span>
                    )}
                    <span style={{ 
                      fontSize: "0.75rem", 
                      fontWeight: 700, 
                      padding: "0.25rem 0.6rem", 
                      borderRadius: "6px",
                      backgroundColor: colors.bg,
                      color: colors.text,
                      border: `1px solid ${colors.border}`
                    }}>
                      {(notice.category || "GENERAL").toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <p style={{ margin: 0, color: "var(--text-muted)", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                  {notice.content}
                </p>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)", paddingTop: "0.75rem" }}>
                  <span>Posted by: <strong style={{ color: "var(--text-main)" }}>{notice.postedBy}</strong></span>
                  <span>{new Date(notice.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
