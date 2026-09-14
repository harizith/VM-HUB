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
    <main className="student-main">
      <header className="student-header" style={{ marginBottom: "2rem" }}>
        <div>
          <h1>Your Profile</h1>
          <p className="student-subtitle">Manage and view your academic details.</p>
        </div>
      </header>

      {error && (
        <div style={{ backgroundColor: "var(--bg-card)", color: "#ef4444", padding: "1rem", borderRadius: "8px", marginBottom: "2rem", border: "1px solid #fca5a5" }}>
          {error}
        </div>
      )}

      {data && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>
          {/* Identity Card */}
          <div className="student-card premium-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "3rem 2rem" }}>
            <div style={{ 
              width: "120px", 
              height: "120px", 
              borderRadius: "50%", 
              backgroundColor: "var(--bg-card-header)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              marginBottom: "1.5rem",
              fontSize: "3rem",
              color: "var(--royal-blue)",
              fontWeight: 700
            }}>
              {data.name.charAt(0).toUpperCase()}
            </div>
            <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.5rem", color: "var(--text-main)" }}>{data.name}</h2>
            <p style={{ margin: 0, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiMail /> {data.email}
            </p>
            
            <div style={{ marginTop: "2rem", width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", backgroundColor: "var(--bg-card-header)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.5rem" }}><FiHash /> VM Number</span>
                <strong style={{ color: "var(--text-main)" }}>{data.vmNo}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", backgroundColor: "var(--bg-card-header)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.5rem" }}><FiCheckCircle /> Status</span>
                <strong style={{ color: "#10b981" }}>{data.status}</strong>
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="student-card premium-card">
              <h3 style={{ margin: "0 0 1.5rem 0", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FiBook /> Academic Information
              </h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>DEPARTMENT</label>
                  <div style={{ fontSize: "1.1rem", color: "var(--text-main)", fontWeight: 500, marginTop: "0.25rem" }}>B.Tech {data.profile.department}</div>
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>YEAR & SEMESTER</label>
                  <div style={{ fontSize: "1.1rem", color: "var(--text-main)", fontWeight: 500, marginTop: "0.25rem" }}>{data.profile.year} (Sem {data.profile.semester})</div>
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>SECTION</label>
                  <div style={{ fontSize: "1.1rem", color: "var(--text-main)", fontWeight: 500, marginTop: "0.25rem" }}>{data.profile.section}</div>
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>BATCH</label>
                  <div style={{ fontSize: "1.1rem", color: "var(--text-main)", fontWeight: 500, marginTop: "0.25rem" }}>{data.profile.batch}</div>
                </div>
              </div>
            </div>

            <div className="student-card premium-card" style={{ background: "linear-gradient(135deg, var(--royal-blue) 0%, #3b82f6 100%)", color: "white", border: "none" }}>
              <h3 style={{ margin: "0 0 1.5rem 0", display: "flex", alignItems: "center", gap: "0.5rem", color: "white" }}>
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
  );
}
