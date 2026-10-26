"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiHome, FiCalendar, FiBell, FiUser, FiLogOut, FiMessageSquare, FiAlertCircle, FiInfo } from "react-icons/fi";
import { Megaphone, ArrowLeft, Plus } from "lucide-react";

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  audience?: string;
  postedBy: string;
  createdAt: string;
}

export default function HodNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Post Notice Form
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticeAudience, setNoticeAudience] = useState("ALL");
  const [noticeCategory, setNoticeCategory] = useState("GENERAL");
  const [postingNotice, setPostingNotice] = useState(false);

  const fetchNotices = () => {
    fetch("/api/hod/notices")
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
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;
    setPostingNotice(true);
    try {
      const res = await fetch("/api/hod/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: noticeTitle,
          content: noticeContent,
          audience: noticeAudience,
          category: noticeCategory
        })
      });
      const resData = await res.json();
      if (resData.success) {
        setNoticeTitle("");
        setNoticeContent("");
        setShowNoticeForm(false);
        fetchNotices();
      } else {
        alert(resData.error || "Failed to post notice");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
    setPostingNotice(false);
  };

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
      <header className="student-header" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <Link href="/hod" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none" }}>
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
          </div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Megaphone size={24} style={{ color: "var(--royal-blue)" }} /> Department & College Announcements
          </h1>
          <p className="student-subtitle">Publish circulars to students, faculty, or view system wide notices.</p>
        </div>

        <button 
          onClick={() => setShowNoticeForm(!showNoticeForm)} 
          className="btn-sky"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <Plus size={16} /> {showNoticeForm ? "Close Form" : "Broadcast New Notice"}
        </button>
      </header>

      {/* Notice Broadcast Form */}
      {showNoticeForm && (
        <div className="student-card premium-card" style={{ marginBottom: "2rem", border: "1px solid var(--royal-blue)" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text-main)" }}>Publish Announcement</h3>
          <form onSubmit={handlePostNotice} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input
              type="text"
              placeholder="Announcement Title (e.g. Model Exam Schedule 2026)"
              value={noticeTitle}
              onChange={(e) => setNoticeTitle(e.target.value)}
              required
              className="premium-input"
            />
            <textarea
              placeholder="Announcement details, guidelines, or venue details..."
              value={noticeContent}
              onChange={(e) => setNoticeContent(e.target.value)}
              required
              className="premium-input"
              style={{ minHeight: "100px", resize: "vertical" }}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem", display: "block" }}>Audience</label>
                <select
                  value={noticeAudience}
                  onChange={(e) => setNoticeAudience(e.target.value)}
                  className="premium-input"
                  style={{ width: "100%" }}
                >
                  <option value="ALL">All (Students & Faculty)</option>
                  <option value="STUDENT">Students Only</option>
                  <option value="FACULTY">Faculty Only</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem", display: "block" }}>Category</label>
                <select
                  value={noticeCategory}
                  onChange={(e) => setNoticeCategory(e.target.value)}
                  className="premium-input"
                  style={{ width: "100%" }}
                >
                  <option value="GENERAL">General</option>
                  <option value="URGENT">Urgent</option>
                  <option value="EXAM">Exam</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button type="button" onClick={() => setShowNoticeForm(false)} style={{ background: "transparent", border: "1px solid var(--border-subtle)", padding: "0.6rem 1.2rem", borderRadius: "8px", color: "var(--text-muted)", cursor: "pointer" }}>Cancel</button>
              <button type="submit" className="btn-sky" disabled={postingNotice}>
                {postingNotice ? "Publishing..." : "Publish Broadcast"}
              </button>
            </div>
          </form>
        </div>
      )}

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
            <p style={{ color: "var(--text-muted)" }}>Published circulars will appear here.</p>
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
