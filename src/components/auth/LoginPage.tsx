'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  ShieldCheck,
  GraduationCap,
  Users,
  BookOpen,
  Lock,
  ArrowRight,
  Sparkles,
  Sun,
  Moon,
  Building,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const LoginPage: React.FC = () => {
  const { login, users, theme, toggleTheme } = useApp();
  const [email, setEmail] = useState('vkharizith@gmail.com');
  const [password, setPassword] = useState('123456789');
  const [error, setError] = useState<string | null>(null);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = login(email, password);
    if (success) {
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      } catch {}
    } else {
      setError('Invalid academic credentials. Use vkharizith@gmail.com / 123456789 or select a persona below.');
    }
  };

  const handlePersonaLogin = (userEmail: string) => {
    setError(null);
    const success = login(userEmail, '123456789');
    if (success) {
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      } catch {}
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white flex flex-col justify-between p-4 sm:p-6 transition-colors">
      {/* Top Header */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs tracking-tighter">
            VM
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">VM HUB</span>
            <span className="text-[10px] ml-2 px-1.5 py-0.2 rounded font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Institutional SSO
            </span>
          </div>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>
      </div>

      {/* Main Login Box */}
      <div className="w-full max-w-4xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Side: Brand Narrative */}
        <div className="lg:col-span-5 space-y-4 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Academic Management & Broadcast Gateway</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Institutional Operations & Broadcast Portal
          </h1>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Unified academic gateway for Attendance Verification, Targeted Announcements, Mentorship Routing, and Digital On-Duty Petitions.
          </p>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400 font-mono">
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span>Fast Checklist Attendance Ledger</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span>Targeted Counselor & Class Broadcasts</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span>Statutory 75% Bunk Forecaster & What-If Simulation</span>
            </p>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Institutional Authentication</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sign in with your university account or click a verified persona below
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleManualLogin} className="space-y-3.5 text-xs">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-semibold animate-in fade-in">
                {error}
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Institutional Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Security Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <span>Authenticate & Enter Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Access Persona Grid */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Quick Access Personas (1-Click Test):</span>
              <span className="text-[10px] text-slate-400">All Roles Configured</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {users.map((u) => {
                const isCurrent = email === u.email;

                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setEmail(u.email);
                      setPassword('123456789');
                      handlePersonaLogin(u.email);
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isCurrent
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-slate-900 dark:text-white font-bold shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-md object-cover border border-slate-200 dark:border-slate-700" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white leading-tight text-[11px]">{u.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{u.role}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-black text-white dark:bg-white dark:text-black'
                          : u.role === 'hod'
                          ? 'bg-blue-600 text-white'
                          : u.role === 'teacher'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                          : 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {u.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Institutional Security Badges */}
      <div className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 py-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
        <p>© 2026 VM HUB Systems Inc. All rights reserved.</p>
        <div className="flex items-center gap-4 font-mono text-[10px]">
          <span>🔒 256-Bit SSL Encrypted</span>
          <span>🏛️ FERPA Compliant</span>
          <span>🛡️ SOC-2 Type II Certified</span>
        </div>
      </div>
    </div>
  );
};
