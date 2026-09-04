'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AnnouncementPriority, AnnouncementScope } from '@/types';
import {
  BookOpen,
  Users,
  Megaphone,
  Send,
  TrendingUp,
  GraduationCap,
  Download,
  Building,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const HODDashboard: React.FC = () => {
  const { currentUser, users, courses, announcements, attendanceSessions, addAnnouncement } = useApp();

  const [activeTab, setActiveTab] = useState<'broadcast' | 'overview' | 'roster'>('broadcast');

  // Announcement composer state
  const [targetScope, setTargetScope] = useState<AnnouncementScope>('all_dept');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastPriority, setBroadcastPriority] = useState<AnnouncementPriority>('important');
  const [broadcastCategory, setBroadcastCategory] = useState<'General' | 'Academic' | 'Exam' | 'Event' | 'Urgent'>('General');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Department statistics
  const deptStudents = users.filter((u) => u.role === 'student');
  const deptFaculty = users.filter((u) => u.role === 'teacher');
  const totalCourses = courses.length;

  // Calculate average department attendance
  let totalRecords = 0;
  let totalPresent = 0;
  attendanceSessions.forEach((s) => {
    totalRecords += s.totalStudents;
    totalPresent += s.presentCount + s.odCount;
  });
  const deptAvgAttendance = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 84;

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !broadcastTitle.trim() || !broadcastContent.trim()) return;

    addAnnouncement({
      title: broadcastTitle.trim(),
      content: broadcastContent.trim(),
      authorId: currentUser.id,
      authorName: `${currentUser.name} (Head of Department)`,
      authorRole: 'hod',
      scope: targetScope,
      priority: broadcastPriority,
      category: broadcastCategory,
    });

    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    } catch {}

    setBroadcastTitle('');
    setBroadcastContent('');
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 4000);
  };

  const hodAnnouncements = announcements.filter((a) => a.authorRole === 'hod');

  return (
    <div className="space-y-6">
      {/* Top Department Executive Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-14 h-14 rounded-xl object-cover border border-slate-300 dark:border-slate-700 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{currentUser?.name}</h1>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-blue-600 text-white">
                  Head of Department
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentUser?.department} • Academic Executive Console
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium">
                  Faculty Body: {deptFaculty.length} Professors
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium">
                  Enrolled Students: {deptStudents.length} Candidates
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                  Aggregate Attendance: {deptAvgAttendance}%
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Active Courses</p>
              <p className="text-base font-black text-blue-600 dark:text-blue-400 font-mono">{totalCourses}</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Official Circulars</p>
              <p className="text-base font-black text-slate-900 dark:text-white font-mono">{hodAnnouncements.length}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'broadcast'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Megaphone className="w-4 h-4" /> Department Broadcast Center
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Curriculum & Section Health Overview
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'roster'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Users className="w-4 h-4" /> Department Directory & Rosters
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: DEPARTMENT BROADCAST & ANNOUNCEMENT SYSTEM        */}
      {/* ======================================================== */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* Broadcast Composer */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Dispatch Department-Wide Announcement</h3>
                </div>
                {broadcastSuccess && (
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-bold animate-pulse">
                    ✓ Circular Dispatched to Department
                  </span>
                )}
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
                {/* Target Scope */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Audience Scope</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetScope('all_dept')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        targetScope === 'all_dept'
                          ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-600 text-blue-950 dark:text-white font-bold shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">📢 All Department</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Faculty + Students</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetScope('all_students')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        targetScope === 'all_students'
                          ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-600 text-blue-950 dark:text-white font-bold shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">🧑‍🎓 All Students</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">All Semesters</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetScope('all_faculty')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        targetScope === 'all_faculty'
                          ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-600 text-blue-950 dark:text-white font-bold shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">👨‍🏫 Faculty Only</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Professors & Staff</p>
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Official Circular Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Schedule for Mid-Term Examinations / Department Research Grants"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                  />
                </div>

                {/* Priority & Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Urgency Classification</label>
                    <select
                      value={broadcastPriority}
                      onChange={(e) => setBroadcastPriority(e.target.value as AnnouncementPriority)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                    >
                      <option value="normal">Standard Notification</option>
                      <option value="important">Important Notice</option>
                      <option value="urgent">Urgent Statutory Directive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Notice Scope</label>
                    <select
                      value={broadcastCategory}
                      onChange={(e) => setBroadcastCategory(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                    >
                      <option value="General">General Department Memorandum</option>
                      <option value="Academic">Academic Curriculum</option>
                      <option value="Exam">Mid-Term & Final Assessments</option>
                      <option value="Event">Symposium & Technical Seminars</option>
                      <option value="Urgent">Administrative Alert</option>
                    </select>
                  </div>
                </div>

                {/* Message Body */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Memorandum Body</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Provide official directives, scheduling instructions, compliance protocols, or meeting details..."
                    value={broadcastContent}
                    onChange={(e) => setBroadcastContent(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Broadcast to Selected Audience
                </button>
              </form>
            </div>
          </div>

          {/* Broadcast History */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Active Department Memorandums ({hodAnnouncements.length})
            </h3>

            <div className="space-y-3">
              {hodAnnouncements.map((ann) => (
                <div key={ann.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-blue-50 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                        {ann.scope === 'all_dept' ? '👥 All Department' : ann.scope === 'all_students' ? '🧑‍🎓 All Students' : '👨‍🏫 Faculty Only'}
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                          ann.priority === 'urgent'
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : ann.priority === 'important'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {ann.priority}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ann.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{ann.content}</p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Classification: {ann.category}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold font-mono">Dispatched to all stakeholders</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ACADEMIC & CLASS OVERVIEW                         */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">CSE-A Attendance Index</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">88.5%</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">↑ High Health</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">38 Sessions logged this semester</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">CSE-B Attendance Index</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">81.2%</span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">→ Statutory Compliant</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">32 Sessions logged this semester</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Curriculum Velocity</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">76%</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">On Track</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Target mid-term lectures completed</p>
            </div>
          </div>

          {/* Course Status Matrix */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Department Curriculum Delivery & Faculty Distribution</h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[620px]">
                <thead>
                  <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                    <th className="py-2.5 px-3">Subject Name</th>
                    <th className="py-2.5 px-3">Faculty Instructor</th>
                    <th className="py-2.5 px-3">Section</th>
                    <th className="py-2.5 px-3">Sessions Completed</th>
                    <th className="py-2.5 px-3">Curriculum Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {courses.map((c) => {
                    const completedTopics = c.syllabusTopics.filter((t) => t.isCompleted).length;
                    const totalTopics = c.syllabusTopics.length;
                    const pct = Math.round((completedTopics / totalTopics) * 100);

                    return (
                      <tr key={c.code} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{c.code} • {c.credits} Credits</p>
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-semibold">{c.teacherName}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold">
                            {c.section}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                          {c.completedClasses} / {c.totalClasses}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-blue-600"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="font-bold font-mono text-blue-600 dark:text-blue-400">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: DEPARTMENT ROSTER                                 */}
      {/* ======================================================== */}
      {activeTab === 'roster' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
          {/* Faculty Members */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Faculty Body ({deptFaculty.length})
            </h3>
            <div className="space-y-3">
              {deptFaculty.map((f) => (
                <div key={f.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img src={f.avatar} alt={f.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{f.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{f.email}</p>
                      <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">{f.designation}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                      {f.menteeIds?.length || 0} Mentees
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Students Directory */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Enrolled Candidates ({deptStudents.length})
            </h3>
            <div className="space-y-3">
              {deptStudents.map((s) => (
                <div key={s.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img src={s.avatar} alt={s.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{s.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{s.rollNo} • Section {s.section}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Mentor: {s.mentorName || 'Unassigned'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">Semester {s.semester}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
