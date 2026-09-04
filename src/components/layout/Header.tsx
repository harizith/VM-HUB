'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Role } from '@/types';
import {
  ShieldCheck,
  GraduationCap,
  Users,
  BookOpen,
  Bell,
  LogOut,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Sun,
  Moon,
  Search,
  CheckCircle2,
  Building,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    logout,
    announcements,
    markAnnouncementRead,
    resetDatabase,
    users,
    setCurrentUser,
    theme,
    toggleTheme,
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  if (!currentUser) return null;

  // Filter unread notifications relevant to current user
  const userAnnouncements = announcements.filter((a) => {
    if (currentUser.role === 'admin') return true;
    if (a.scope === 'all_dept') return true;
    if (currentUser.role === 'hod') return a.authorRole === 'hod' || a.scope === 'all_faculty';
    if (currentUser.role === 'teacher') {
      return a.scope === 'all_faculty' || a.authorId === currentUser.id;
    }
    if (currentUser.role === 'student') {
      if (a.scope === 'all_students') return true;
      if (a.scope === 'class_section' && a.targetClass === currentUser.section) return true;
      if (a.scope === 'mentees' && a.targetMenteeGroupMentorId === currentUser.mentorId) return true;
    }
    return false;
  });

  const unreadCount = userAnnouncements.filter((a) => !a.readBy.includes(currentUser.id)).length;

  const roleStyles: Record<Role, { badge: string; label: string; icon: React.ReactNode }> = {
    admin: {
      badge: 'bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white',
      label: 'Super Admin',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    },
    hod: {
      badge: 'bg-blue-600 text-white dark:bg-blue-600 dark:text-white',
      label: 'Head of Department',
      icon: <BookOpen className="w-3.5 h-3.5" />,
    },
    teacher: {
      badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
      label: 'Faculty / Mentor',
      icon: <Users className="w-3.5 h-3.5" />,
    },
    student: {
      badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700',
      label: 'Student Portal',
      icon: <GraduationCap className="w-3.5 h-3.5" />,
    },
  };

  const currentRoleStyle = roleStyles[currentUser.role];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Academic Department Tag */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs tracking-tighter">
            VM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">VM HUB</span>
              <span className="text-[10px] px-2 py-0.2 rounded font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                v2.4 Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              {currentUser.department} • Academic Session 2026–2027
            </p>
          </div>
        </div>

        {/* Center: Role Selector Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowNotifMenu(false);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${currentRoleStyle.badge}`}
            >
              <span className="flex items-center gap-1.5">
                {currentRoleStyle.icon}
                <span className="hidden md:inline font-medium text-[11px] opacity-80">Persona:</span>
                <span>{currentRoleStyle.label}</span>
              </span>
              <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${showRoleMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Persona Switcher Menu */}
            {showRoleMenu && (
              <div className="absolute top-full mt-2 left-0 sm:right-0 sm:left-auto w-80 rounded-xl bg-white dark:bg-slate-900 p-2 shadow-2xl z-50 border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Switch Academic Persona</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Select any role to test its specific operational workflows</p>
                </div>

                <div className="space-y-1">
                  {users.map((u) => {
                    const isSelected = u.id === currentUser.id;
                    const rStyle = roleStyles[u.role];
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          setCurrentUser(u);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-100'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                              {u.name}
                              {isSelected && <span className="text-[9px] text-blue-600 dark:text-blue-400 font-bold">• Active</span>}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">{u.email}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${rStyle.badge}`}>
                          {rStyle.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Light/Dark Theme, Notification Hub, Reset, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Notifications Drawer Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowRoleMenu(false);
              }}
              className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Official Circulars & Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Menu */}
            {showNotifMenu && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 p-3 shadow-2xl z-50 border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[440px] overflow-y-auto">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Department Circulars & Messages</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      {userAnnouncements.length}
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => userAnnouncements.forEach((a) => markAnnouncementRead(a.id))}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {userAnnouncements.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">No official circulars at this time.</p>
                ) : (
                  <div className="space-y-2">
                    {userAnnouncements.map((ann) => {
                      const isUnread = !ann.readBy.includes(currentUser.id);
                      return (
                        <div
                          key={ann.id}
                          onClick={() => markAnnouncementRead(ann.id)}
                          className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                            isUnread
                              ? 'bg-blue-50/70 border-blue-300 dark:bg-blue-950/40 dark:border-blue-700'
                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                                ann.scope === 'mentees'
                                  ? 'bg-blue-600 text-white'
                                  : ann.priority === 'urgent'
                                  ? 'bg-black text-white dark:bg-white dark:text-black'
                                  : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                              }`}
                            >
                              {ann.scope === 'mentees' ? '⭐ Mentee Channel' : ann.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(ann.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{ann.title}</p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">{ann.content}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reset Demo Data */}
          <button
            onClick={() => {
              if (confirm('Reset academic records to factory default data?')) {
                resetDatabase();
              }
            }}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors hidden sm:block"
            title="Reset Database to Initial Records"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-lg object-cover border border-slate-300 dark:border-slate-700 shadow-xs"
            />
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[130px]">{currentUser.email}</p>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
