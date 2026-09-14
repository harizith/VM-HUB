"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Inbox, User } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="student-layout">
      {/* LEFT SIDEBAR */}
      <aside className="student-sidebar">
        <div className="student-sidebar-logo">VM</div>
        
        <Link href="/dashboard" className={`student-nav-item ${pathname === "/dashboard" ? "active" : ""}`}>
          <Home size={24} />
        </Link>
        <Link href="/dashboard/calendar" className={`student-nav-item ${pathname === "/dashboard/calendar" ? "active" : ""}`}>
          <Calendar size={24} />
        </Link>
        <Link href="/dashboard/messages" className={`student-nav-item ${pathname === "/dashboard/messages" ? "active" : ""}`}>
          <Inbox size={24} />
        </Link>

        <div className="student-nav-bottom">
          <Link href="/dashboard/profile" className={`student-nav-item ${pathname === "/dashboard/profile" ? "active" : ""}`}>
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
