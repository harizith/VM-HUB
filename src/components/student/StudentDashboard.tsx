'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { LeaveType } from '@/types';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Megaphone,
  Send,
  Sliders,
  TrendingUp,
  Download,
  GraduationCap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    courses,
    announcements,
    leaveRequests,
    getStudentAttendanceForCourse,
    getStudentOverallAttendance,
    markAnnouncementRead,
    applyLeave,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'attendance' | 'announcements' | 'leaves' | 'timetable'>('attendance');

  // Announcement filter
  const [announcementFilter, setAnnouncementFilter] = useState<'all' | 'hod' | 'teacher' | 'mentorship'>('all');

  // Leave application form state
  const [leaveType, setLeaveType] = useState<LeaveType>('od');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveDocName, setLeaveDocName] = useState('');
  const [leaveSuccess, setLeaveSuccess] = useState(false);

  // What-If Simulator state
  const [simulatedCourseCode, setSimulatedCourseCode] = useState<string>(courses[0]?.code || 'CS501');
  const [simMissClasses, setSimMissClasses] = useState<number>(0);
  const [simAttendClasses, setSimAttendClasses] = useState<number>(0);

  if (!currentUser) return null;

  const studentCourses = courses.filter((c) => c.section === currentUser.section);
  const overallStats = getStudentOverallAttendance(currentUser.id);
  const myLeaves = leaveRequests.filter((l) => l.studentId === currentUser.id);

  // Filter announcements for this student
  const myAnnouncements = announcements.filter((a) => {
    if (a.scope === 'all_dept' || a.scope === 'all_students') return true;
    if (a.scope === 'class_section' && a.targetClass === currentUser.section) return true;
    if (a.scope === 'mentees' && a.targetMenteeGroupMentorId === currentUser.mentorId) return true;
    return false;
  });

  const filteredAnnouncements = myAnnouncements.filter((a) => {
    if (announcementFilter === 'hod') return a.authorRole === 'hod';
    if (announcementFilter === 'teacher') return a.authorRole === 'teacher' && a.scope !== 'mentees';
    if (announcementFilter === 'mentorship') return a.scope === 'mentees';
    return true;
  });

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !leaveReason.trim()) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    applyLeave({
      studentId: currentUser.id,
      studentName: currentUser.name,
      rollNo: currentUser.rollNo || '21CS000',
      section: currentUser.section || 'CSE-A',
      type: leaveType,
      startDate,
      endDate,
      totalDays: isNaN(diffDays) ? 1 : Math.max(1, diffDays),
      reason: leaveReason.trim(),
      documentName: leaveDocName || (leaveType === 'od' ? 'od_invitation_letter.pdf' : 'medical_prescription.pdf'),
    });

    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    } catch {}

    setLeaveReason('');
    setStartDate('');
    setEndDate('');
    setLeaveDocName('');
    setLeaveSuccess(true);
    setTimeout(() => setLeaveSuccess(false), 4000);
  };

  // What-If Simulator calculations
  const simCurrentStats = getStudentAttendanceForCourse(currentUser.id, simulatedCourseCode);
  const simTotal = simCurrentStats.total + simMissClasses + simAttendClasses;
  const simAttended = simCurrentStats.attended + simAttendClasses;
  const simPercentage = simTotal > 0 ? Math.round((simAttended / simTotal) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Top Student Academic Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-14 h-14 rounded-xl object-cover border border-slate-300 dark:border-slate-700 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{currentUser.name}</h1>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Student Dossier
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Roll Number: <span className="font-mono font-bold text-slate-900 dark:text-white">{currentUser.rollNo}</span> • Section {currentUser.section} • Semester {currentUser.semester}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs px-2.5 py-0.5 rounded bg-blue-600 text-white font-semibold">
                  ⭐ Faculty Counselor: {currentUser.mentorName || 'Prof. Sarah Jenkins'}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium">
                  {currentUser.department}
                </span>
              </div>
            </div>
          </div>

          {/* Overall Attendance Meter */}
          <div className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" className="text-slate-200 dark:text-slate-800" fill="transparent" />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="4"
                  className={overallStats.percentage >= 75 ? 'text-blue-600 dark:text-blue-400' : 'text-red-500'}
                  strokeDasharray={150}
                  strokeDashoffset={150 - (150 * overallStats.percentage) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-xs font-mono font-black text-slate-900 dark:text-white">{overallStats.percentage}%</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Statutory Attendance Status</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {overallStats.attended} of {overallStats.total} Sessions Logged
              </p>
              {overallStats.percentage >= 75 ? (
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">✓ Exam Eligible (75% Minimum Met)</span>
              ) : (
                <span className="text-[10px] text-red-600 font-bold animate-pulse">⚠️ Attendance Shortage (&lt;75%)</span>
              )}
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
            <TrendingUp className="w-4 h-4" /> Attendance Ledger & Forecaster
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'announcements'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Megaphone className="w-4 h-4" /> Academic Circulars & Counselor Feed
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'leaves'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" /> On-Duty & Leave Petitions
            {myLeaves.filter((l) => l.status === 'pending').length > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                {myLeaves.filter((l) => l.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'timetable'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Calendar className="w-4 h-4" /> Timetable Matrix
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: ATTENDANCE & BUNK FORECASTER                      */}
      {/* ======================================================== */}
      {activeTab === 'attendance' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Subject Attendance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {studentCourses.map((course) => {
              const stats = getStudentAttendanceForCourse(currentUser.id, course.code);
              const isSafe = stats.percentage >= 75;

              return (
                <div
                  key={course.code}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:border-blue-500 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-bold">
                        {course.code}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-1 leading-snug">{course.name}</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{course.teacherName}</p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xl font-mono font-black ${
                          isSafe ? 'text-blue-600 dark:text-blue-400' : 'text-red-500'
                        }`}
                      >
                        {stats.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full ${isSafe ? 'bg-blue-600' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(100, stats.percentage)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>{stats.attended} Attended</span>
                      <span>{stats.total} Total Sessions</span>
                    </div>
                  </div>

                  {/* Bunk Forecaster Badge */}
                  <div
                    className={`p-2.5 rounded-xl text-xs font-medium border ${
                      isSafe
                        ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-200'
                        : 'bg-red-50/50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-950 dark:text-red-200'
                    }`}
                  >
                    {isSafe ? (
                      <p className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                        <span>
                          Safe to miss <strong className="text-blue-700 dark:text-blue-300 font-bold">{stats.safeBunks}</strong> {stats.safeBunks === 1 ? 'class' : 'classes'} before reaching statutory 75%.
                        </span>
                      </p>
                    ) : (
                      <p className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                        <span>
                          Must attend next <strong className="text-red-700 dark:text-red-300 font-bold">{stats.neededTo75}</strong> consecutive classes to reach 75%.
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive What-If Bunk Simulator */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Statutory Attendance Simulator (What-If Projection)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Model future class attendance or approved absences to verify continuous exam eligibility</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              {/* Select Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Select Subject</label>
                <select
                  value={simulatedCourseCode}
                  onChange={(e) => {
                    setSimulatedCourseCode(e.target.value);
                    setSimMissClasses(0);
                    setSimAttendClasses(0);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {studentCourses.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Slider: Miss Classes */}
              <div>
                <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-1.5 font-medium">
                  <span>Simulate Absences:</span>
                  <span className="font-mono font-bold text-red-600">{simMissClasses} classes</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={simMissClasses}
                  onChange={(e) => {
                    setSimMissClasses(Number(e.target.value));
                    setSimAttendClasses(0);
                  }}
                  className="w-full accent-black dark:accent-white cursor-pointer"
                />
              </div>

              {/* Slider: Attend Next Classes */}
              <div>
                <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-1.5 font-medium">
                  <span>Simulate Present:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{simAttendClasses} classes</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={simAttendClasses}
                  onChange={(e) => {
                    setSimAttendClasses(Number(e.target.value));
                    setSimMissClasses(0);
                  }}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Projected Result Box */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <p className="text-slate-600 dark:text-slate-400">
                  Current Status: <span className="font-bold text-slate-900 dark:text-white font-mono">{simCurrentStats.percentage}%</span> ({simCurrentStats.attended}/{simCurrentStats.total})
                </p>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                  Projected Record: <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">{simAttended}/{simTotal}</span> sessions
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Projected Rate</p>
                  <p className={`text-2xl font-black font-mono ${simPercentage >= 75 ? 'text-blue-600 dark:text-blue-400' : 'text-red-500'}`}>
                    {simPercentage}%
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded font-mono font-bold text-[11px] ${
                    simPercentage >= 75 ? 'bg-blue-600 text-white' : 'bg-red-600 text-white animate-pulse'
                  }`}
                >
                  {simPercentage >= 75 ? '✓ Exam Eligible' : '⚠️ Statutory Shortage'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: UNIFIED ANNOUNCEMENTS & MENTOR FEED               */}
      {/* ======================================================== */}
      {activeTab === 'announcements' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setAnnouncementFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                announcementFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All Circulars ({myAnnouncements.length})
            </button>
            <button
              onClick={() => setAnnouncementFilter('mentorship')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                announcementFilter === 'mentorship'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              ⭐ Counselor Channel ({myAnnouncements.filter((a) => a.scope === 'mentees').length})
            </button>
            <button
              onClick={() => setAnnouncementFilter('teacher')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                announcementFilter === 'teacher'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              📚 Course Instructors
            </button>
            <button
              onClick={() => setAnnouncementFilter('hod')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                announcementFilter === 'hod'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              👔 HOD Circulars
            </button>
          </div>

          {/* Feed Items */}
          <div className="space-y-3">
            {filteredAnnouncements.map((ann) => {
              const isUnread = !ann.readBy.includes(currentUser.id);
              const isMenteeMsg = ann.scope === 'mentees';

              return (
                <div
                  key={ann.id}
                  onClick={() => markAnnouncementRead(ann.id)}
                  className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all cursor-pointer shadow-xs ${
                    isMenteeMsg
                      ? 'border-blue-500 dark:border-blue-600 bg-blue-50/20 dark:bg-blue-950/20'
                      : isUnread
                      ? 'border-blue-300 dark:border-blue-800'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <img src={ann.authorAvatar} alt={ann.authorName} className="w-7 h-7 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{ann.authorName}</span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                          isMenteeMsg
                            ? 'bg-blue-600 text-white'
                            : ann.authorRole === 'hod'
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {isMenteeMsg ? '⭐ COUNSELOR DIRECT' : ann.scope === 'all_dept' ? 'DEPARTMENT CIRCULAR' : 'COURSE NOTICE'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
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
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{ann.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">{ann.content}</p>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Classification: {ann.category}</span>
                    {isUnread ? (
                      <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                        ● Click to acknowledge
                      </span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1">✓ Acknowledged</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: DIGITAL OD & LEAVE APPLICATION                    */}
      {/* ======================================================== */}
      {activeTab === 'leaves' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* Apply Form */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Submit Leave / On-Duty Petition</h3>
                </div>
                {leaveSuccess && (
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-bold animate-pulse">
                    ✓ Petition Submitted
                  </span>
                )}
              </div>

              <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
                {/* Leave Type */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Petition Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setLeaveType('od')}
                      className={`p-2 rounded-lg border text-center font-bold transition-all ${
                        leaveType === 'od'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      On-Duty (OD)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeaveType('medical')}
                      className={`p-2 rounded-lg border text-center font-bold transition-all ${
                        leaveType === 'medical'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Medical
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeaveType('event')}
                      className={`p-2 rounded-lg border text-center font-bold transition-all ${
                        leaveType === 'event'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Institutional
                    </button>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                    />
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Official Justification / Event Scope</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="State the academic competition, symposium, illness, or institutional assignment..."
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs resize-none"
                  />
                </div>

                {/* Document label */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Attachment File Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. hackathon_invitation.pdf or clinical_certificate.pdf"
                    value={leaveDocName}
                    onChange={(e) => setLeaveDocName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Submit Petition for Review
                </button>
              </form>
            </div>
          </div>

          {/* Status & Timeline */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Submitted Petitions Ledger ({myLeaves.length})
            </h3>

            <div className="space-y-3">
              {myLeaves.map((leave) => {
                const isApproved = leave.status === 'approved';
                const isPending = leave.status === 'pending';

                return (
                  <div
                    key={leave.id}
                    className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all shadow-xs ${
                      isApproved
                        ? 'border-blue-300 dark:border-blue-800'
                        : isPending
                        ? 'border-amber-300 dark:border-amber-800 bg-amber-50/10'
                        : 'border-red-300 dark:border-red-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                            leave.type === 'od'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {leave.type}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {leave.startDate} to {leave.endDate} ({leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'})
                        </span>
                      </div>

                      <span
                        className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded uppercase ${
                          isApproved
                            ? 'bg-blue-600 text-white'
                            : isPending
                            ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                            : 'bg-black text-white dark:bg-white dark:text-black'
                        }`}
                      >
                        {leave.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">{leave.reason}</p>

                    {/* Timeline Tracker */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Submitted: {new Date(leave.appliedAt).toLocaleDateString()}</span>
                      {leave.reviewedByName && (
                        <span className="text-slate-700 dark:text-slate-300">
                          Adjudicated by <strong className="text-slate-900 dark:text-white">{leave.reviewedByName}</strong>: <em>"{leave.reviewRemarks}"</em>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: TIMETABLE                                         */}
      {/* ======================================================== */}
      {activeTab === 'timetable' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-in fade-in duration-200">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Academic Timetable Matrix (Section {currentUser.section})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
              <div key={day} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="font-bold text-blue-600 dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 pb-1">{day}</p>
                <div className="space-y-1.5">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <p className="font-bold text-slate-900 dark:text-white text-[11px]">CS501 (OS)</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">09:00 - 10:00 AM</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <p className="font-bold text-slate-900 dark:text-white text-[11px]">CS502 (Algorithms)</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">10:00 - 11:00 AM</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <p className="font-bold text-slate-900 dark:text-white text-[11px]">CS503 (Networks)</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">11:15 - 12:15 PM</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                    <p className="font-bold text-blue-700 dark:text-blue-300 text-[11px]">Counseling / Lab</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">02:00 - 03:30 PM</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
