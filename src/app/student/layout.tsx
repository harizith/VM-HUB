"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, MessageCircle, User, LogOut, Sun, Moon } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="student-layout">
      {/* LEFT SIDEBAR */}
      <aside className="student-sidebar">
        <div className="student-sidebar-logo">VM</div>
        
        <div className="student-nav-group">
          <Link href="/student" className={`student-nav-item ${pathname === "/student" ? "active" : ""}`} title="Dashboard">
            <Home size={22} />
          </Link>
          <Link href="/student/calendar" className={`student-nav-item ${pathname === "/student/calendar" ? "active" : ""}`} title="Calendar">
            <Calendar size={22} />
          </Link>
          <Link href="/student/messages" className={`student-nav-item ${pathname === "/student/messages" ? "active" : ""}`} title="Messages">
            <MessageCircle size={22} />
          </Link>
        </div>

        <div className="student-nav-bottom">
          {mounted && (
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
              className="student-nav-item" 
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
            </button>
          )}

          <Link href="/student/profile" className={`student-nav-item ${pathname === "/student/profile" ? "active" : ""}`} title="Profile">
            <User size={22} />
          </Link>

          <button onClick={() => signOut({ callbackUrl: "/" })} className="student-nav-item text-red-500 hover:text-red-400" title="Sign Out">
            <LogOut size={22} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="student-main-container">
        {children}
      </div>
    </div>
  );
}
