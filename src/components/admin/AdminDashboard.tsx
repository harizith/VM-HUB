'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Role, Course } from '@/types';
import {
  ShieldCheck,
  Users,
  BookOpen,
  Trash2,
  Award,
  Search,
  Activity,
  UserPlus,
  Plus,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    courses,
    attendanceSessions,
    addUser,
    deleteUser,
    updateMentorship,
    addCourse,
    deleteCourse,
    resetDatabase,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'mentorship' | 'courses' | 'system'>('users');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | Role>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Add User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('student');
  const [newUserDept, setNewUserDept] = useState('Computer Science & Engineering');
  const [newUserRoll, setNewUserRoll] = useState('');
  const [newUserSection, setNewUserSection] = useState('CSE-A');
  const [newUserDesignation, setNewUserDesignation] = useState('Assistant Professor');

  // Add Course Modal State
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseCredits, setCourseCredits] = useState(4);
  const [courseTeacherId, setCourseTeacherId] = useState(users.find((u) => u.role === 'teacher')?.id || 'FAC001');

  // Mentee Assignment State
  const facultyMembers = users.filter((u) => u.role === 'teacher');
  const studentMembers = users.filter((u) => u.role === 'student');
  const [selectedMentorId, setSelectedMentorId] = useState<string>(facultyMembers[0]?.id || '');
  const selectedMentor = facultyMembers.find((f) => f.id === selectedMentorId) || facultyMembers[0];

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      department: newUserDept,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      rollNo: newUserRole === 'student' ? newUserRoll || `21CS${Math.floor(100 + Math.random() * 900)}` : undefined,
      section: newUserRole === 'student' ? newUserSection : undefined,
      semester: newUserRole === 'student' ? 5 : undefined,
      designation: newUserRole === 'teacher' || newUserRole === 'hod' ? newUserDesignation : undefined,
    });

    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    } catch {}

    setNewUserName('');
    setNewUserEmail('');
    setNewUserRoll('');
    setShowAddUserModal(false);
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseName.trim()) return;

    const teacher = users.find((u) => u.id === courseTeacherId);

    const newCourseObj: Course = {
      code: courseCode.trim().toUpperCase(),
      name: courseName.trim(),
      credits: courseCredits,
      semester: 5,
      department: 'Computer Science & Engineering',
      teacherId: courseTeacherId,
      teacherName: teacher?.name || 'Assigned Faculty',
      section: 'CSE-A',
      totalClasses: 36,
      completedClasses: 0,
      syllabusTopics: [
        { topic: 'Module 1: Foundations & Architecture', isCompleted: false, targetDate: '2026-09-15' },
        { topic: 'Module 2: Advanced Implementations', isCompleted: false, targetDate: '2026-09-30' },
      ],
    };

    addCourse(newCourseObj);
    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    } catch {}

    setCourseCode('');
    setCourseName('');
    setShowAddCourseModal(false);
  };

  const handleToggleMentee = (studentId: string) => {
    if (!selectedMentor) return;
    const currentMentees = selectedMentor.menteeIds || [];
    let updatedMentees: string[];

    if (currentMentees.includes(studentId)) {
      updatedMentees = currentMentees.filter((id) => id !== studentId);
    } else {
      updatedMentees = [...currentMentees, studentId];
    }

    updateMentorship(selectedMentor.id, updatedMentees);
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.rollNo?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Academic Executive Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Super Admin Hub</h1>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-black text-white dark:bg-white dark:text-black">
                  Master Console
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Master Administrator: <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{currentUser?.email}</span>
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium">
                  Directory: {users.length} Active Accounts
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium">
                  Active Courses: {courses.length}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                  ⚡ All Services Synchronized
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" /> Provision User
            </button>
            <button
              onClick={() => setShowAddCourseModal(true)}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs hover:bg-slate-200 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Course
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Users className="w-4 h-4" /> User Directory ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('mentorship')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'mentorship'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Award className="w-4 h-4" /> Mentee-Mentor Allocation Matrix
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'courses'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Academic Course Catalog ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'system'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Activity className="w-4 h-4" /> Audit Log & Security Trail
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: USER DIRECTORY & PROVISIONING                     */}
      {/* ======================================================== */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'admin', 'hod', 'teacher', 'student'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setUserRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    userRoleFilter === r
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {r === 'all' ? 'All Roles' : r}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, roll..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* User Table */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                  <th className="py-2.5 px-3">User Profile</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Roll / Designation</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">{u.name}</p>
                          <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : u.role === 'hod'
                            ? 'bg-blue-600 text-white'
                            : u.role === 'teacher'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{u.department}</td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-mono">
                      {u.rollNo ? `Roll: ${u.rollNo} (${u.section})` : u.designation || 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {u.id !== 'ADM001' ? (
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${u.name} from the database?`)) {
                              deleteUser(u.id);
                            }
                          }}
                          className="p-1.5 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Root Account</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MENTEE-MENTOR ALLOCATION MATRIX                   */}
      {/* ======================================================== */}
      {activeTab === 'mentorship' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* Faculty Selector */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Faculty Mentor Roster
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Click a professor to allocate their assigned mentees</p>

              <div className="space-y-2">
                {facultyMembers.map((fac) => {
                  const isSelected = fac.id === selectedMentor?.id;
                  const menteeCount = (fac.menteeIds || []).length;

                  return (
                    <button
                      key={fac.id}
                      onClick={() => setSelectedMentorId(fac.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-600 text-slate-900 dark:text-white font-bold shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={fac.avatar} alt={fac.name} className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{fac.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{fac.designation}</p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-blue-600 text-white">
                        {menteeCount} Mentees
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Student Mentee Allocation Checklist */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Assign Mentees to <span className="text-blue-600 dark:text-blue-400">{selectedMentor?.name}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Toggle checkboxes to update counselor mapping in real time</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                  {(selectedMentor?.menteeIds || []).length} Assigned
                </span>
              </div>

              <div className="space-y-2">
                {studentMembers.map((stu) => {
                  const isAssignedToThisMentor = (selectedMentor?.menteeIds || []).includes(stu.id);

                  return (
                    <div
                      key={stu.id}
                      onClick={() => handleToggleMentee(stu.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isAssignedToThisMentor
                          ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-500 text-slate-900 dark:text-white font-semibold'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={stu.avatar} alt={stu.name} className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{stu.name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{stu.rollNo} • Section {stu.section}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                          Current Counselor: <strong className="text-slate-800 dark:text-slate-200">{stu.mentorName || 'None'}</strong>
                        </span>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border font-bold text-xs ${
                            isAssignedToThisMentor
                              ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                          }`}
                        >
                          {isAssignedToThisMentor && '✓'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: COURSE CATALOG                                    */}
      {/* ======================================================== */}
      {activeTab === 'courses' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Academic Course Catalog ({courses.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Department curriculum and faculty instructor mappings</p>
            </div>
            <button
              onClick={() => setShowAddCourseModal(true)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Course
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div key={course.code} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                    {course.code} • {course.credits} Credits
                  </span>
                  <button
                    onClick={() => {
                      if (confirm(`Delete course ${course.code}?`)) {
                        deleteCourse(course.code);
                      }
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete Course"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">{course.name}</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Instructor: {course.teacherName}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Section: {course.section} • Semester {course.semester}</p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Classes Logged:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">{course.completedClasses}/{course.totalClasses}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: AUDIT LOG & SECURITY                              */}
      {/* ======================================================== */}
      {activeTab === 'system' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Security & Master Activity Ledger
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Real-time audit log of attendance recordings and user operations</p>
            </div>
            <button
              onClick={() => {
                if (confirm('Reset all demo state to original initial records?')) {
                  resetDatabase();
                }
              }}
              className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 transition-all"
            >
              Reset Database
            </button>
          </div>

          <div className="space-y-2">
            {attendanceSessions.map((s) => (
              <div key={s.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Attendance Committed: {s.courseCode} ({s.section})</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Faculty: {s.teacherName} • Date: {s.date} ({s.timeSlot})</p>
                </div>
                <span className="text-blue-600 dark:text-blue-400 font-mono font-black">{s.presentCount}/{s.totalStudents} Present</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Provision Academic User
            </h3>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Institutional Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john.doe@vmhub.edu"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Role Designation</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as Role)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Faculty / Mentor</option>
                    <option value="hod">Head of Dept (HOD)</option>
                    <option value="admin">Super Administrator</option>
                  </select>
                </div>

                {newUserRole === 'student' ? (
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Roll Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 21CS150"
                      value={newUserRoll}
                      onChange={(e) => setNewUserRoll(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. Associate Professor"
                      value={newUserDesignation}
                      onChange={(e) => setNewUserDesignation(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                >
                  Create User Account
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Add Academic Course / Subject
            </h3>

            <form onSubmit={handleAddCourse} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Code</label>
                  <input
                    type="text"
                    required
                    placeholder="CS504"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Course Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Cloud Computing & DevOps"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Assigned Instructor</label>
                <select
                  value={courseTeacherId}
                  onChange={(e) => setCourseTeacherId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {facultyMembers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                >
                  Create Course
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
