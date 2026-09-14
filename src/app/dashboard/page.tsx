"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="student-main">
      <header className="student-header">
        <div>
          <div className="student-date">Thursday, 6 August</div>
          <h1>Hey Ananya</h1>
        </div>
        <div className="student-course-info">
          <strong>B.Tech CSE</strong>
          Semester 5 - Section A
        </div>
      </header>

      {/* Main Top Section: Banner + Up Next */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Happening Now Banner */}
        <div className="student-banner">
          {/* Progress Ring */}
          <div style={{ position: "relative", width: "120px", height: "120px", flexShrink: 0 }}>
            <svg viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="10" />
              {/* Stroke Dasharray: 2 * Math.PI * 50 = 314.15 */}
              <circle cx="60" cy="60" r="50" fill="none" stroke="#f59e0b" strokeWidth="10" strokeDasharray="314.15" strokeDashoffset="100" strokeLinecap="round" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <span style={{ fontSize: "0.6rem", fontWeight: "700", letterSpacing: "0.05em", color: "rgba(255,255,255,0.7)" }}>PERIOD 4</span>
              <span style={{ fontSize: "1.1rem", fontWeight: "800" }}>18 min</span>
              <span style={{ fontSize: "0.7rem", fontWeight: "600", color: "rgba(255,255,255,0.7)" }}>left</span>
            </div>
          </div>
          
          <div style={{ zIndex: 1 }}>
            <div style={{ fontSize: "0.85rem", fontWeight: "700", letterSpacing: "0.05em", color: "rgba(255,255,255,0.7)", marginBottom: "0.5rem" }}>HAPPENING NOW</div>
            <h2 style={{ fontSize: "2rem", fontWeight: "700", margin: "0 0 1rem 0" }}>Data Structures</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.9rem" }}>
              <span style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: "0.2rem 0.6rem", borderRadius: "6px", fontWeight: "600" }}>vm87563</span>
              <span>Room N301 - C3 Block</span>
            </div>
          </div>
        </div>

        {/* Up Next Card */}
        <div className="student-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>UP NEXT • 12:20</div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.5rem 0" }}>Operating Systems Lab</h3>
            <div style={{ fontSize: "0.85rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>v2p4</span>
            </div>
            <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.5rem" }}>
              Lab 2 • C3 Block
            </div>
          </div>
          <button style={{ backgroundColor: "#fef3c7", color: "#d97706", border: "none", padding: "0.6rem 1rem", borderRadius: "8px", fontWeight: "700", fontSize: "0.85rem", alignSelf: "flex-start" }}>
            Starts in 30 min
          </button>
        </div>
      </div>

      {/* Today's Timetable */}
      <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#0f172a", marginBottom: "1rem" }}>Today's timetable</h3>
      <div className="student-timetable-scroll">
        {[
          { period: 1, time: "8:00 - 8:50", subject: "PQT", active: false },
          { period: 2, time: "8:50 - 9:40", subject: "DS", active: false },
          { period: 3, time: "9:40 - 10:30", subject: "DS", active: false },
          { period: 4, time: "11:00 - 11:50", subject: "PQT", active: true },
          { period: 5, time: "12:20 - 1:10", subject: "OS Lab", active: false },
          { period: 6, time: "1:40 - 2:30", subject: "OS Lab", active: false },
          { period: 7, time: "2:35 - 3:25", subject: "SPOT", active: false },
          { period: 8, time: "3:30 - 4:20", subject: "PQT", active: false },
        ].map((p, i) => (
          <div key={i} className={`period-card ${p.active ? "active" : ""}`}>
            <div className="period-number" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>P{p.period}</span>
              {p.active && <span style={{ color: "#f59e0b" }}>★</span>}
            </div>
            <div className="period-time">{p.time.split(" - ")[0]}</div>
            <div className="period-subject">{p.subject}</div>
          </div>
        ))}
      </div>

      {/* Bottom Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem", marginTop: "1.5rem" }}>
        {/* Attendance Card */}
        <div className="student-card" style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div className="attendance-ring" style={{ position: "relative" }}>
            <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="10" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="10" strokeDasharray="251.2" strokeDashoffset="32.65" strokeLinecap="round" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "1.2rem", color: "#0f172a" }}>
              87%
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>ATTENDANCE</div>
            <div style={{ fontSize: "1rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.25rem" }}>Overall this semester</div>
            <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "#10b981" }}>Above the 75% attendance bar</div>
          </div>
        </div>

        {/* Notices Card */}
        <div className="student-card">
          <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#0f172a", marginBottom: "1rem" }}>Department notices</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.75rem", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ backgroundColor: "#fef3c7", color: "#d97706", padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.7rem", fontWeight: "700" }}>EXAM</span>
                <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "#334155" }}>Cia 1</span>
              </div>
              <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>2h ago</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ backgroundColor: "#e0e7ff", color: "#4f46e5", padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.7rem", fontWeight: "700" }}>EVENT</span>
                <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "#334155" }}>27/8/27</span>
              </div>
              <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>1d ago</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
