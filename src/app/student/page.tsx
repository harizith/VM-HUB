"use client";

import { useEffect, useState } from "react";
import { Users, Megaphone, Calendar as CalendarIcon } from "lucide-react";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/student/dashboard")
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setData(res.data);
        } else {
          console.error("Failed to load dashboard data:", res.error);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("API error:", err);
        setLoading(false);
      });
  }, []);

  if (!mounted) return null;

  // Real date for the UI
  const dateStr = new Date().toLocaleDateString("en-US", { weekday: 'long', day: 'numeric', month: 'long' });

  // Get active period logic (Simplified based on current time)
  const now = new Date();
  const currentHour = now.getHours();
  let activePeriod = 0;
  if (currentHour >= 8 && currentHour < 9) activePeriod = 1;
  else if (currentHour >= 9 && currentHour < 10) activePeriod = 2;
  else if (currentHour >= 10 && currentHour < 11) activePeriod = 3;
  else if (currentHour >= 11 && currentHour < 12) activePeriod = 4;
  else if (currentHour >= 12 && currentHour < 13) activePeriod = 5;
  else if (currentHour >= 13 && currentHour < 14) activePeriod = 6;
  else if (currentHour >= 14 && currentHour < 15) activePeriod = 7;
  else if (currentHour >= 15 && currentHour < 16) activePeriod = 8;

  const happeningNow = data?.timetable?.find((t: any) => t.period === activePeriod);
  const upNext = data?.timetable?.find((t: any) => t.period === activePeriod + 1);

  if (loading) {
    return (
      <main className="student-main" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h2 style={{ color: "var(--text-muted)" }}>Loading your personalized dashboard...</h2>
      </main>
    );
  }

  return (
    <main className="student-main">
      <header className="student-header">
        <div>
          <div className="student-date">{dateStr} • Day Order {data?.currentDayOrder || "III"}</div>
          <h1>Hey {data?.student?.name ? data.student.name.split(" ")[0] : "Student"}</h1>
        </div>
        <div className="student-course-info">
          <strong>B.Tech {data?.student?.department || "CSE"}</strong>
          Semester {data?.student?.semester || 5} - Section {data?.student?.section || "A"}
        </div>
      </header>

      {/* Main Top Section: Banner + Up Next */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
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
              <span style={{ fontSize: "0.6rem", fontWeight: "700", letterSpacing: "0.05em", color: "rgba(255,255,255,0.7)" }}>PERIOD {activePeriod || 1}</span>
              <span style={{ fontSize: "1.1rem", fontWeight: "800" }}>-- min</span>
              <span style={{ fontSize: "0.7rem", fontWeight: "600", color: "rgba(255,255,255,0.7)" }}>left</span>
            </div>
          </div>
          
          <div style={{ zIndex: 1 }}>
            <div style={{ fontSize: "0.85rem", fontWeight: "700", letterSpacing: "0.05em", color: "rgba(255,255,255,0.7)", marginBottom: "0.5rem" }}>HAPPENING NOW</div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: "700", margin: "0 0 1rem 0" }}>{happeningNow ? happeningNow.subjectName : "Free Period"}</h2>
            {happeningNow && (
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.9rem" }}>
                <span style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: "0.2rem 0.6rem", borderRadius: "6px", fontWeight: "600" }}>{happeningNow.facultyName}</span>
                <span>Room {happeningNow.roomNo}</span>
              </div>
            )}
          </div>
        </div>

        {/* Up Next Card */}
        <div className="student-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>UP NEXT • P{activePeriod + 1}</div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.5rem 0" }}>{upNext ? upNext.subjectName : "No Classes Scheduled"}</h3>
            {upNext && (
              <>
                <div style={{ fontSize: "0.85rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>{upNext.facultyName}</span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.5rem" }}>
                  {upNext.roomNo}
                </div>
              </>
            )}
          </div>
          {upNext && (
            <button style={{ backgroundColor: "#fef3c7", color: "#d97706", border: "none", padding: "0.6rem 1rem", borderRadius: "8px", fontWeight: "700", fontSize: "0.85rem", alignSelf: "flex-start" }}>
              Upcoming
            </button>
          )}
        </div>
      </div>

      {/* Today's Timetable */}
      <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#0f172a", marginBottom: "1rem" }}>Today's timetable (Day Order {data?.currentDayOrder})</h3>
      
      {(!data?.timetable || data.timetable.length === 0) ? (
        <div style={{ padding: "2rem", backgroundColor: "#fff", borderRadius: "12px", border: "1px dashed #cbd5e1", textAlign: "center", color: "#64748b", marginBottom: "2rem" }}>
          No timetable found in the database for your class ({data?.student?.classId}) on Day Order {data?.currentDayOrder}. <br />
          <strong>(Please add timetable entries in the Admin Panel to see them here).</strong>
        </div>
      ) : (
        <div className="student-timetable-scroll">
          {data.timetable.map((p: any, i: number) => {
            const isActive = p.period === activePeriod;
            return (
              <div key={i} className={`period-card ${isActive ? "active" : ""}`}>
                <div className="period-number" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>P{p.period}</span>
                  {isActive && <span style={{ color: "#f59e0b" }}>★</span>}
                </div>
                <div className="period-time">{p.timeRange || `Period ${p.period}`}</div>
                <div className="period-subject">{p.subjectName}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginTop: "1.5rem" }}>
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
