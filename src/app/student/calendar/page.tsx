"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiHome, FiCalendar, FiBell, FiUser, FiLogOut, FiClock, FiMapPin } from "react-icons/fi";
import { signOut } from "next-auth/react";

interface TimetableEntry {
  id: string;
  dayOrder: string;
  period: number;
  timeRange: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  roomNo: string;
}

export default function CalendarPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("I");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/student/calendar")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error || "Failed to load calendar data.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("An error occurred while fetching data.");
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

  const dayOrders = ["I", "II", "III", "IV", "V"];
  const currentEntries: TimetableEntry[] = data?.timetable?.[activeTab] || [];

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
          <Link href="/student/calendar" className="nav-item active">
            <FiCalendar className="nav-icon" /> Calendar
          </Link>
          <Link href="/student/messages" className="nav-item">
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
            <h1>Weekly Calendar</h1>
            <p className="student-subtitle">Class: {data?.classId || "N/A"}</p>
          </div>
        </header>

        {error && (
          <div style={{ backgroundColor: "#fef2f2", color: "#991b1b", padding: "1rem", borderRadius: "8px", marginBottom: "2rem" }}>
            {error}
          </div>
        )}

        <div className="premium-card" style={{ padding: 0, overflow: "hidden" }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
            {dayOrders.map(doStr => (
              <button
                key={doStr}
                onClick={() => setActiveTab(doStr)}
                style={{
                  flex: 1,
                  padding: "1rem",
                  textAlign: "center",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  backgroundColor: activeTab === doStr ? "#fff" : "transparent",
                  color: activeTab === doStr ? "#4f46e5" : "#6b7280",
                  borderBottom: activeTab === doStr ? "2px solid #4f46e5" : "2px solid transparent",
                  transition: "all 0.2s"
                }}
              >
                Day Order {doStr}
              </button>
            ))}
          </div>

          {/* Schedule List */}
          <div style={{ padding: "1.5rem" }}>
            {currentEntries.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#6b7280" }}>
                <FiCalendar style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.2 }} />
                <h3>No classes scheduled</h3>
                <p>Enjoy your free day!</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {currentEntries.map((entry) => (
                  <div key={entry.id} style={{ 
                    display: "flex", 
                    backgroundColor: "#fff", 
                    border: "1px solid #e5e7eb", 
                    borderRadius: "12px", 
                    padding: "1rem 1.5rem",
                    alignItems: "center",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                  }}>
                    <div style={{ marginRight: "1.5rem", minWidth: "120px" }}>
                      <div style={{ fontWeight: 700, color: "#111827", fontSize: "1.1rem" }}>Period {entry.period}</div>
                      <div style={{ color: "#6b7280", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.25rem" }}>
                        <FiClock /> {entry.timeRange}
                      </div>
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "#4f46e5", fontSize: "1.05rem" }}>
                        {entry.subjectName} ({entry.subjectCode})
                      </div>
                      <div style={{ color: "#4b5563", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                        {entry.facultyName}
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#374151", fontWeight: 500, backgroundColor: "#f3f4f6", padding: "0.5rem 1rem", borderRadius: "99px" }}>
                      <FiMapPin /> {entry.roomNo}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
