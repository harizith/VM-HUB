"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, MessageCircle, User } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="student-layout">
      {/* LEFT SIDEBAR */}
      <aside className="student-sidebar">
        <div className="student-sidebar-logo">VM</div>
        
        <Link href="/student" className={`student-nav-item ${pathname === "/student" ? "active" : ""}`}>
          <Home size={20} />
        </Link>
        <Link href="/student/calendar" className={`student-nav-item ${pathname === "/student/calendar" ? "active" : ""}`}>
          <Calendar size={20} />
        </Link>
        <Link href="/student/messages" className={`student-nav-item ${pathname === "/student/messages" ? "active" : ""}`}>
          <MessageCircle size={20} />
        </Link>

        <div style={{ marginTop: "auto" }}>
          <Link href="/student/profile" className={`student-nav-item ${pathname === "/student/profile" ? "active" : ""}`}>
            <User size={24} />
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}
