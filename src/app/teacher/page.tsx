"use client";

import { useEffect, useState } from "react";
import { Users, Megaphone, Calendar as CalendarIcon, BookOpen } from "lucide-react";

export default function TeacherDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/teacher/dashboard")
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
          <h1>Welcome back, {data?.teacher?.name ? data.teacher.name : "Faculty"}</h1>
        </div>
        <div className="student-course-info">
          <strong>Department of {data?.teacher?.department || "CSE"}</strong>
          {data?.teacher?.designation || "Faculty Mode"}
        </div>
      </header>

      {/* Main Top Section: Banner + Up Next */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Happening Now Banner */}
        <div className="student-banner">
          {/* Progress Ring */}
          <div style={{ position: "relative", width: "120px", height: "120px", flexShrink: 0 }}>
            <svg viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="#f59e0b" strokeWidth="10" strokeDasharray="314.15" strokeDashoffset="100" strokeLinecap="round" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <span style={{ fontSize: "0.6rem", fontWeight: "700", letterSpacing: "0.05em", color: "rgba(255,255,255,0.7)" }}>PERIOD {activePeriod || 1}</span>
              <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "#fff" }}>-- min</span>
              <span style={{ fontSize: "0.7rem", fontWeight: "600", color: "rgba(255,255,255,0.7)" }}>left</span>
            </div>
          </div>
          
          <div style={{ zIndex: 1 }}>
            <div style={{ fontSize: "0.85rem", fontWeight: "700", letterSpacing: "0.05em", color: "rgba(255,255,255,0.7)", marginBottom: "0.5rem" }}>TEACHING NOW</div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: "700", margin: "0 0 1rem 0", color: "#fff" }}>{happeningNow ? happeningNow.subjectName : "Free Period"}</h2>
            {happeningNow && (
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.9rem", color: "#fff" }}>
                <span style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: "0.2rem 0.6rem", borderRadius: "6px", fontWeight: "600" }}>Class: {happeningNow.classId}</span>
                <span>Room {happeningNow.roomNo}</span>
              </div>
            )}
          </div>
        </div>

        {/* Up Next Card */}
        <div className="student-card premium-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>UP NEXT • P{activePeriod + 1}</div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-main)", margin: "0 0 0.5rem 0" }}>{upNext ? upNext.subjectName : "No Classes Scheduled"}</h3>
            {upNext && (
              <>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontWeight: "600", color: "var(--sky-blue)" }}>Class: {upNext.classId}</span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                  Room: {upNext.roomNo}
                </div>
              </>
            )}
          </div>
          {upNext && (
            <button style={{ backgroundColor: "rgba(217, 119, 6, 0.1)", color: "#d97706", border: "none", padding: "0.6rem 1rem", borderRadius: "8px", fontWeight: "700", fontSize: "0.85rem", alignSelf: "flex-start" }}>
              Upcoming
            </button>
          )}
        </div>
      </div>

      {/* Today's Timetable */}
      <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "1rem" }}>My Schedule (Day Order {data?.currentDayOrder})</h3>
      
      {(!data?.timetable || data.timetable.length === 0) ? (
        <div style={{ padding: "2rem", backgroundColor: "var(--bg-card)", borderRadius: "12px", border: "1px dashed var(--border-subtle)", textAlign: "center", color: "var(--text-muted)", marginBottom: "2rem" }}>
          You have no classes scheduled for Day Order {data?.currentDayOrder}. Enjoy your free day!
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
                <div style={{ fontSize: "0.75rem", color: isActive ? "rgba(255,255,255,0.7)" : "var(--text-muted)", marginTop: "0.5rem", fontWeight: "600" }}>{p.classId}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginTop: "1.5rem" }}>
        {/* Quick Actions Card */}
        <div className="student-card premium-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>QUICK ACTIONS</div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-main)", margin: "0 0 0.5rem 0" }}>Mark Attendance</h3>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              {data?.timetable?.length > 0 ? `You have ${data.timetable.length} classes today.` : "No classes today."}
            </div>
          </div>
          <button style={{ backgroundColor: "rgba(56, 189, 248, 0.1)", color: "var(--sky-blue)", border: "none", padding: "0.6rem 1rem", borderRadius: "8px", fontWeight: "700", fontSize: "0.85rem", alignSelf: "flex-start", marginTop: "1rem" }}>
            Mark Now
          </button>
        </div>

        {/* Notices Card */}
        <div className="student-card premium-card">
          <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "1rem" }}>Staff notices</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.7rem", fontWeight: "700" }}>URGENT</span>
                <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text-main)" }}>Department Meeting</span>
              </div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>2h ago</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ backgroundColor: "rgba(79, 70, 229, 0.1)", color: "#4f46e5", padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.7rem", fontWeight: "700" }}>EVENT</span>
                <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text-main)" }}>Tech Symposium</span>
              </div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>1d ago</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
