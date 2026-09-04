'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/layout/Header';
import { LoginPage } from '@/components/auth/LoginPage';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { HODDashboard } from '@/components/hod/HODDashboard';
import { TeacherDashboard } from '@/components/teacher/TeacherDashboard';
import { StudentDashboard } from '@/components/student/StudentDashboard';

export default function Home() {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentUser.role === 'admin' && <AdminDashboard />}
        {currentUser.role === 'hod' && <HODDashboard />}
        {currentUser.role === 'teacher' && <TeacherDashboard />}
        {currentUser.role === 'student' && <StudentDashboard />}
      </main>

      <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        VM HUB • Academic Operations & Broadcast Platform
      </footer>
    </div>
  );
}
