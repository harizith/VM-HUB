"use client";

import { BookOpen } from "lucide-react";

export default function TeacherCoursesPage() {
  return (
    <main className="student-main">
      <header className="student-header">
        <div>
          <h1>My Courses</h1>
          <p className="student-subtitle">Manage the subjects you are teaching</p>
        </div>
      </header>

      <div className="student-card" style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <div style={{ 
          width: "80px", 
          height: "80px", 
          borderRadius: "50%", 
          backgroundColor: "var(--bg-body)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          margin: "0 auto 1.5rem auto" 
        }}>
          <BookOpen size={40} style={{ color: "var(--royal-blue)", opacity: 0.5 }} />
        </div>
        <h2 style={{ fontSize: "1.5rem", color: "var(--text-main)", marginBottom: "0.5rem" }}>Courses Module in Development</h2>
        <p style={{ color: "var(--text-muted)", maxWidth: "500px", margin: "0 auto" }}>
          We are currently working on a dedicated courses module that will allow you to manage course materials, 
          assignments, and track student progress. This feature will be available soon.
        </p>
      </div>
    </main>
  );
}
