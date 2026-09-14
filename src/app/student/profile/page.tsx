"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiHome, FiCalendar, FiBell, FiUser, FiLogOut, FiMail, FiHash, FiBook, FiAward, FiCheckCircle } from "react-icons/fi";
import { signOut } from "next-auth/react";

export default function ProfilePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/student/profile")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error || "Failed to load profile.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("An error occurred while fetching profile data.");
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
          <Link href="/student/messages" className="nav-item">
            <FiBell className="nav-icon" /> Messages
          </Link>
          <Link href="/student/profile" className="nav-item active">
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
            <h1>Your Profile</h1>
            <p className="student-subtitle">Manage and view your academic details.</p>
          </div>
        </header>

        {error && (
          <div style={{ backgroundColor: "#fef2f2", color: "#991b1b", padding: "1rem", borderRadius: "8px", marginBottom: "2rem" }}>
            {error}
          </div>
        )}

        {data && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>
            {/* Identity Card */}
            <div className="premium-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "3rem 2rem" }}>
              <div style={{ 
                width: "120px", 
                height: "120px", 
                borderRadius: "50%", 
                backgroundColor: "#e0e7ff", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                marginBottom: "1.5rem",
                fontSize: "3rem",
                color: "#4f46e5",
                fontWeight: 700
              }}>
                {data.name.charAt(0).toUpperCase()}
              </div>
              <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.5rem", color: "#111827" }}>{data.name}</h2>
              <p style={{ margin: 0, color: "#6b7280", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FiMail /> {data.email}
              </p>
              
              <div style={{ marginTop: "2rem", width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
                  <span style={{ color: "#6b7280", display: "flex", alignItems: "center", gap: "0.5rem" }}><FiHash /> VM Number</span>
                  <strong style={{ color: "#111827" }}>{data.vmNo}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
                  <span style={{ color: "#6b7280", display: "flex", alignItems: "center", gap: "0.5rem" }}><FiCheckCircle /> Status</span>
                  <strong style={{ color: "#10b981" }}>{data.status}</strong>
                </div>
              </div>
            </div>

            {/* Academic Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div className="premium-card">
                <h3 style={{ margin: "0 0 1.5rem 0", color: "#111827", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FiBook /> Academic Information
                </h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                  <div>
                    <label style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: 600 }}>DEPARTMENT</label>
                    <div style={{ fontSize: "1.1rem", color: "#111827", fontWeight: 500, marginTop: "0.25rem" }}>B.Tech {data.profile.department}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: 600 }}>YEAR & SEMESTER</label>
                    <div style={{ fontSize: "1.1rem", color: "#111827", fontWeight: 500, marginTop: "0.25rem" }}>{data.profile.year} (Sem {data.profile.semester})</div>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: 600 }}>SECTION</label>
                    <div style={{ fontSize: "1.1rem", color: "#111827", fontWeight: 500, marginTop: "0.25rem" }}>{data.profile.section}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: 600 }}>BATCH</label>
                    <div style={{ fontSize: "1.1rem", color: "#111827", fontWeight: 500, marginTop: "0.25rem" }}>{data.profile.batch}</div>
                  </div>
                </div>
              </div>

              <div className="premium-card" style={{ background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)", color: "white" }}>
                <h3 style={{ margin: "0 0 1.5rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FiAward /> Performance Overview
                </h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Overall Attendance</div>
                    <div style={{ fontSize: "2rem", fontWeight: 700, marginTop: "0.25rem" }}>87.5%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>CGPA</div>
                    <div style={{ fontSize: "2rem", fontWeight: 700, marginTop: "0.25rem" }}>8.42</div>
                  </div>
                </div>
                <div style={{ marginTop: "1.5rem", fontSize: "0.85rem", opacity: 0.8 }}>
                  * This data is a mock representation until grades are synced.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
