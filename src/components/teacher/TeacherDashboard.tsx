'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AttendanceStatus, AnnouncementPriority } from '@/types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Users,
  Award,
  BookOpen,
  Search,
  CheckCheck,
  Megaphone,
  UserCheck,
  FileText,
  History,
  Download,
  Calendar,
  Building,
  Filter,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TeacherDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    courses,
    announcements,
    leaveRequests,
    attendanceSessions,
    markAttendance,
    addAnnouncement,
    reviewLeave,
    toggleSyllabusTopic,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'attendance' | 'announcements' | 'leaves' | 'syllabus'>('attendance');

  // Teacher's assigned courses
  const teacherCourses = courses.filter((c) => c.teacherId === currentUser?.id);
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>(teacherCourses[0]?.code || 'CS501');
  const selectedCourse = courses.find((c) => c.code === selectedCourseCode) || courses[0];

  // Teacher's mentees
  const menteeStudents = users.filter((u) => u.role === 'student' && u.mentorId === currentUser?.id);

  // Students in selected course section
  const sectionStudents = users.filter(
    (u) => u.role === 'student' && u.section === selectedCourse?.section
  );

  // --- FAST CHECKLIST ATTENDANCE STATE ---
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState<number>(1);
  const [timeSlot, setTimeSlot] = useState<string>('09:00 AM - 10:00 AM');
  const [studentStatusMap, setStudentStatusMap] = useState<Record<string, AttendanceStatus>>(() => {
    const initial: Record<string, AttendanceStatus> = {};
    sectionStudents.forEach((s) => {
      initial[s.id] = 'present';
    });
    return initial;
  });
  const [searchFilter, setSearchFilter] = useState('');
  const [attendanceSuccessMessage, setAttendanceSuccessMessage] = useState<string | null>(null);

  // --- ANNOUNCEMENT COMPOSER STATE ---
  const [announceTarget, setAnnounceTarget] = useState<'class' | 'mentees'>('class');
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');
  const [announcePriority, setAnnouncePriority] = useState<AnnouncementPriority>('important');
  const [announceCategory, setAnnounceCategory] = useState<'General' | 'Academic' | 'Exam' | 'Mentorship'>('Academic');
  const [announceSuccess, setAnnounceSuccess] = useState(false);

  // Attendance stats for the active draft session
  const totalStudentsInSession = sectionStudents.length;
  const presentCount = Object.values(studentStatusMap).filter((s) => s === 'present').length;
  const absentCount = Object.values(studentStatusMap).filter((s) => s === 'absent').length;
  const lateCount = Object.values(studentStatusMap).filter((s) => s === 'late').length;
  const odCount = Object.values(studentStatusMap).filter((s) => s === 'od').length;
  const attendanceRate = totalStudentsInSession > 0 ? Math.round(((presentCount + odCount) / totalStudentsInSession) * 100) : 100;

  // Toggle single student status
  const handleToggleStatus = (studentId: string, status: AttendanceStatus) => {
    setStudentStatusMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Bulk actions
  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    sectionStudents.forEach((s) => {
      updated[s.id] = status;
    });
    setStudentStatusMap(updated);
  };

  // Export Attendance CSV
  const handleExportCSV = () => {
    const headers = 'Roll No,Student Name,Status,Course,Date,Period\n';
    const rows = sectionStudents
      .map(
        (s) =>
          `"${s.rollNo}","${s.name}","${studentStatusMap[s.id] || 'present'}","${selectedCourse.code}","${attendanceDate}","Period ${period}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Attendance_${selectedCourse.code}_${attendanceDate}.csv`;
    a.click();
  };

  // Submit Fast Attendance Session
  const handleSubmitAttendance = () => {
    if (!currentUser || !selectedCourse) return;

    const records = sectionStudents.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      rollNo: s.rollNo || 'N/A',
      status: studentStatusMap[s.id] || 'present',
    }));

    markAttendance({
      courseCode: selectedCourse.code,
      courseName: selectedCourse.name,
      section: selectedCourse.section,
      date: attendanceDate,
      timeSlot,
      period,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      records,
      totalStudents: sectionStudents.length,
      presentCount,
      absentCount,
      lateCount,
      odCount,
    });

    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    } catch {}

    setAttendanceSuccessMessage(`Official attendance record saved for ${selectedCourse.code} (Section ${selectedCourse.section}).`);
    setTimeout(() => setAttendanceSuccessMessage(null), 4000);
  };

  // Submit Announcement (Class or Mentee)
  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !announceTitle.trim() || !announceContent.trim()) return;

    if (announceTarget === 'class') {
      addAnnouncement({
        title: announceTitle.trim(),
        content: announceContent.trim(),
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorRole: 'teacher',
        scope: 'class_section',
        targetClass: selectedCourse.section,
        targetCourse: selectedCourse.code,
        priority: announcePriority,
        category: announceCategory,
      });
    } else {
      addAnnouncement({
        title: `⭐ [Mentee Channel] ${announceTitle.trim()}`,
        content: announceContent.trim(),
        authorId: currentUser.id,
        authorName: `${currentUser.name} (Faculty Mentor)`,
        authorRole: 'teacher',
        scope: 'mentees',
        targetMenteeGroupMentorId: currentUser.id,
        priority: announcePriority,
        category: 'Mentorship',
      });
    }

    setAnnounceTitle('');
    setAnnounceContent('');
    setAnnounceSuccess(true);
    setTimeout(() => setAnnounceSuccess(false), 3500);
  };

  const pendingLeaves = leaveRequests.filter((l) => l.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Top Academic Faculty Banner */}
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
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                  {currentUser?.designation}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentUser?.department} • Employee ID: <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{currentUser?.id}</span>
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium">
                  Assigned Subjects: {teacherCourses.map((c) => c.code).join(', ')}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded bg-blue-600 text-white font-semibold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Mentorship Group: {menteeStudents.length} Students
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stat Tiles */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Leave Petitions</p>
              <p className="text-base font-black text-blue-600 dark:text-blue-400">{pendingLeaves.length} Pending</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Lectures Logged</p>
              <p className="text-base font-black text-slate-900 dark:text-white">{attendanceSessions.length} Sessions</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'attendance'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <UserCheck className="w-4 h-4" /> Fast Checklist Attendance
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'announcements'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Megaphone className="w-4 h-4" /> Class & Mentee Announcements
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'leaves'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" /> Leave & OD Approvals
            {pendingLeaves.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                {pendingLeaves.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('syllabus')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'syllabus'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Syllabus Progress Ledger
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: FAST CHECKLIST ATTENDANCE                         */}
      {/* ======================================================== */}
      {activeTab === 'attendance' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Controls Bar: Course, Date, Period, Time */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Attendance Ledger & Roll Call
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">1-tap roll call with live statutory percentage calculations</p>
              </div>

              {/* Course Selector & Export */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedCourseCode}
                  onChange={(e) => setSelectedCourseCode(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {teacherCourses.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code}: {c.name} ({c.section})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 flex items-center gap-1.5"
                  title="Download Attendance CSV"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
              </div>
            </div>

            {/* Session Parameters: Date, Period, Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Session Date</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Period Hour</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value={1}>Hour 1 (09:00 - 10:00 AM)</option>
                  <option value={2}>Hour 2 (10:00 - 11:00 AM)</option>
                  <option value={3}>Hour 3 (11:15 - 12:15 PM)</option>
                  <option value={4}>Hour 4 (01:00 - 02:00 PM)</option>
                  <option value={5}>Hour 5 (02:00 - 03:00 PM)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Time Slot Label</label>
                <input
                  type="text"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Live Stats Summary & Bulk Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider">Metrics:</span>
                <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                  {presentCount} Present
                </span>
                <span className="px-2.5 py-1 rounded bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 font-bold border border-red-200 dark:border-red-800">
                  {absentCount} Absent
                </span>
                <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 font-bold border border-amber-200 dark:border-amber-800">
                  {lateCount} Late
                </span>
                <span className="px-2.5 py-1 rounded bg-cyan-50 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-200 font-bold border border-cyan-200 dark:border-cyan-800">
                  {odCount} On-Duty
                </span>
                <span className="px-2.5 py-1 rounded bg-black text-white dark:bg-white dark:text-black font-black font-mono">
                  {attendanceRate}%
                </span>
              </div>

              {/* Bulk Toggle Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMarkAll('present')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-1 shadow-xs"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll('absent')}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-all"
                >
                  Mark All Absent
                </button>
              </div>
            </div>
          </div>

          {/* Success Banner */}
          {attendanceSuccessMessage && (
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>{attendanceSuccessMessage}</span>
            </div>
          )}

          {/* Student Checklist Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Student Enrollment Roster ({sectionStudents.length})</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">Section {selectedCourse.section}</span>
              </div>
              {/* Search */}
              <div className="relative w-48 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student or roll number..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[620px]">
                <thead>
                  <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                    <th className="py-2.5 px-3 font-semibold">Student Name</th>
                    <th className="py-2.5 px-3 font-semibold">Roll Number</th>
                    <th className="py-2.5 px-3 font-semibold">Mentorship Status</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Attendance Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sectionStudents
                    .filter((s) => s.name.toLowerCase().includes(searchFilter.toLowerCase()) || s.rollNo?.toLowerCase().includes(searchFilter.toLowerCase()))
                    .map((student) => {
                      const status = studentStatusMap[student.id] || 'present';
                      const isMentee = student.mentorId === currentUser?.id;

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={student.avatar}
                                alt={student.name}
                                className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                              />
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                                  {student.name}
                                  {isMentee && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                                      Your Mentee
                                    </span>
                                  )}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300 font-bold">{student.rollNo}</td>
                          <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{student.mentorName || 'Unassigned'}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center justify-center gap-1">
                              {/* Present */}
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(student.id, 'present')}
                                className={`px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
                                  status === 'present'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-50'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Present
                              </button>

                              {/* Absent */}
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(student.id, 'absent')}
                                className={`px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
                                  status === 'absent'
                                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                }`}
                              >
                                <XCircle className="w-3.5 h-3.5" /> Absent
                              </button>

                              {/* Late */}
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(student.id, 'late')}
                                className={`px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
                                  status === 'late'
                                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-50'
                                }`}
                              >
                                <Clock className="w-3.5 h-3.5" /> Late
                              </button>

                              {/* OD */}
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(student.id, 'od')}
                                className={`px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
                                  status === 'od'
                                    ? 'bg-cyan-600 text-white shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-cyan-50'
                                }`}
                              >
                                <Award className="w-3.5 h-3.5" /> OD
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Bottom Finalize Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ready to commit session: <strong className="text-slate-900 dark:text-white">{presentCount} Present</strong>, <strong className="text-slate-900 dark:text-white">{absentCount} Absent</strong>.
              </p>
              <button
                onClick={handleSubmitAttendance}
                className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Commit Attendance Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ANNOUNCEMENTS (CLASS & MENTEES)                   */}
      {/* ======================================================== */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* Left Column: Composer */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Publish Academic Announcement</h3>
                </div>
                {announceSuccess && (
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-bold animate-pulse">
                    ✓ Notice Dispatched
                  </span>
                )}
              </div>

              <form onSubmit={handleSendAnnouncement} className="space-y-4 text-xs">
                {/* Target Scope */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Target Audience</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAnnounceTarget('class')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        announceTarget === 'class'
                          ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-600 text-blue-950 dark:text-white font-bold shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <p className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold">
                        <Users className="w-3.5 h-3.5" /> Class Enrollment
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        Dispatched to all students of {selectedCourse.code} ({selectedCourse.section})
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAnnounceTarget('mentees')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        announceTarget === 'mentees'
                          ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-600 text-blue-950 dark:text-white font-bold shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <p className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold">
                        <Award className="w-3.5 h-3.5" /> My Mentees ({menteeStudents.length})
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        Private academic channel restricted to your assigned mentees
                      </p>
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Subject Header</label>
                  <input
                    type="text"
                    required
                    placeholder={
                      announceTarget === 'mentees'
                        ? 'e.g. Monthly Academic Mentorship Review & Portfolio Audit'
                        : 'e.g. Assessment Task 2 Deadline Extension & Lab Viva Instructions'
                    }
                    value={announceTitle}
                    onChange={(e) => setAnnounceTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                  />
                </div>

                {/* Priority & Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Priority Classification</label>
                    <select
                      value={announcePriority}
                      onChange={(e) => setAnnouncePriority(e.target.value as AnnouncementPriority)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
                    >
                      <option value="normal">Routine Circular</option>
                      <option value="important">Important Notice</option>
                      <option value="urgent">Urgent Statutory Action</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Notice Category</label>
                    <select
                      value={announceCategory}
                      onChange={(e) => setAnnounceCategory(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
                    >
                      <option value="Academic">Academic Curriculum</option>
                      <option value="Exam">Examinations & Assessments</option>
                      <option value="Mentorship">Mentorship Counseling</option>
                      <option value="General">Administrative General</option>
                    </select>
                  </div>
                </div>

                {/* Message Body */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Notice Content</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide official academic directives, room numbers, resource URLs, or task instructions..."
                    value={announceContent}
                    onChange={(e) => setAnnounceContent(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Dispatch Official Circular
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Sent Broadcast Feed */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Dispatched Circular Ledger
            </h3>

            <div className="space-y-3">
              {announcements
                .filter((a) => a.authorId === currentUser?.id)
                .map((ann) => (
                  <div key={ann.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                            ann.scope === 'mentees'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {ann.scope === 'mentees' ? '⭐ Mentee Channel' : `Section ${ann.targetClass || ''}`}
                        </span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                            ann.priority === 'urgent'
                              ? 'bg-black text-white dark:bg-white dark:text-black'
                              : ann.priority === 'important'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
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
                      <span>Category: {ann.category}</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold font-mono">Acknowledged by {ann.readBy.length}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: LEAVE & OD APPROVALS                              */}
      {/* ======================================================== */}
      {activeTab === 'leaves' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Student On-Duty & Leave Adjudication Queue
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Formal review and approval ledger for student absence petitions</p>
            </div>
          </div>

          <div className="space-y-3">
            {leaveRequests.map((leave) => {
              const isPending = leave.status === 'pending';
              return (
                <div
                  key={leave.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isPending
                      ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                      : leave.status === 'approved'
                      ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      : 'bg-red-50/30 dark:bg-red-950/20 border-red-200 dark:border-red-900'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{leave.studentName}</span>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">({leave.rollNo})</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                        Sec {leave.section}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                          leave.type === 'od'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
                            : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {leave.type} PETITION
                      </span>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded font-mono uppercase ${
                        leave.status === 'approved'
                          ? 'bg-blue-600 text-white'
                          : leave.status === 'rejected'
                          ? 'bg-black text-white dark:bg-white dark:text-black'
                          : 'bg-amber-500 text-slate-950 font-black animate-pulse'
                      }`}
                    >
                      {leave.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                    <strong className="text-slate-900 dark:text-white">Duration:</strong> {leave.startDate} to {leave.endDate} ({leave.totalDays} days)
                  </p>

                  <p className="text-xs text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 mb-3">
                    <strong>Petition Reason:</strong> {leave.reason}
                  </p>

                  {leave.documentName && (
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-1 font-semibold">
                      📎 Supporting Evidence: {leave.documentName}
                    </p>
                  )}

                  {isPending ? (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <button
                        onClick={() => reviewLeave(leave.id, 'approved', 'Authorized: Verification verified by course faculty.')}
                        className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Grant Approval
                      </button>
                      <button
                        onClick={() => reviewLeave(leave.id, 'rejected', 'Declined: Conflict with mandatory schedule or lack of documentation.')}
                        className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Decline Request
                      </button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                      Adjudicated by {leave.reviewedByName || 'Faculty'} on {new Date(leave.reviewedAt || '').toLocaleDateString()}: <span className="italic">"{leave.reviewRemarks}"</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: SYLLABUS PROGRESS LEDGER                          */}
      {/* ======================================================== */}
      {activeTab === 'syllabus' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Syllabus Coverage & Curriculum Pacing
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Subject: {selectedCourse.name} ({selectedCourse.code}) • Click modules to update completion status</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Completed Lectures</p>
              <p className="text-sm font-black text-blue-600 dark:text-blue-400 font-mono">
                {selectedCourse.completedClasses} / {selectedCourse.totalClasses} Hours
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {selectedCourse.syllabusTopics.map((topic, idx) => (
              <div
                key={idx}
                onClick={() => toggleSyllabusTopic(selectedCourse.code, idx)}
                className={`p-3.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                  topic.isCompleted
                    ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 text-slate-900 dark:text-white'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] ${
                      topic.isCompleted ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {topic.isCompleted ? '✓' : idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {topic.topic}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Target Session: {topic.targetDate}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded font-mono font-bold ${
                    topic.isCompleted
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {topic.isCompleted ? 'Covered' : 'Pending Lecture'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
