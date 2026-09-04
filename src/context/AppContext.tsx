'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Role,
  Course,
  Announcement,
  LeaveRequest,
  AttendanceSession,
} from '@/types';
import {
  INITIAL_USERS,
  INITIAL_COURSES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_ATTENDANCE_SESSIONS,
} from '@/data/mockData';

interface AppContextType {
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  currentUser: User | null;
  users: User[];
  courses: Course[];
  announcements: Announcement[];
  leaveRequests: LeaveRequest[];
  attendanceSessions: AttendanceSession[];
  
  // Auth & Session
  login: (email: string, password?: string) => { success: boolean; message?: string };
  logout: () => void;
  switchRole: (role: Role) => void;
  setCurrentUser: (user: User) => void;
  
  // Attendance
  markAttendance: (session: Omit<AttendanceSession, 'id' | 'createdAt'>) => AttendanceSession;
  getStudentAttendanceForCourse: (studentId: string, courseCode: string) => {
    attended: number;
    total: number;
    percentage: number;
    safeBunks: number;
    neededTo75: number;
    history: { date: string; status: string; sessionName: string }[];
  };
  getStudentOverallAttendance: (studentId: string) => {
    attended: number;
    total: number;
    percentage: number;
    safeBunks: number;
    neededTo75: number;
  };
  
  // Announcements
  addAnnouncement: (data: Omit<Announcement, 'id' | 'createdAt' | 'readBy' | 'authorAvatar'>) => Announcement;
  markAnnouncementRead: (id: string) => void;
  deleteAnnouncement: (id: string) => void;
  
  // Leaves / OD
  applyLeave: (data: Omit<LeaveRequest, 'id' | 'appliedAt' | 'status'>) => LeaveRequest;
  reviewLeave: (id: string, status: 'approved' | 'rejected', remarks?: string) => void;
  
  // Syllabus
  toggleSyllabusTopic: (courseCode: string, topicIndex: number) => void;

  // Admin Operations
  addUser: (user: Omit<User, 'id'>) => User;
  deleteUser: (id: string) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  updateMentorship: (mentorId: string, menteeIds: string[]) => void;
  addCourse: (course: Course) => void;
  deleteCourse: (code: string) => void;
  
  // Reset
  resetDatabase: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  THEME: 'edupulse_theme_v2',
  USERS: 'edupulse_users_v2',
  COURSES: 'edupulse_courses_v2',
  ANNOUNCEMENTS: 'edupulse_announcements_v2',
  LEAVES: 'edupulse_leaves_v2',
  ATTENDANCE: 'edupulse_attendance_v2',
  CURRENT_USER: 'edupulse_current_user_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>(INITIAL_ATTENDANCE_SESSIONS);
  const [currentUser, setCurrentUserState] = useState<User | null>(INITIAL_USERS[0]); // Default to Super Admin
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const storedTheme = (localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark') || 'light';
      setTheme(storedTheme);
      if (storedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const storedCourses = localStorage.getItem(STORAGE_KEYS.COURSES);
      const storedAnnouncements = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      const storedLeaves = localStorage.getItem(STORAGE_KEYS.LEAVES);
      const storedAttendance = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      const storedCurrentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);

      if (storedUsers) setUsers(JSON.parse(storedUsers));
      if (storedCourses) setCourses(JSON.parse(storedCourses));
      if (storedAnnouncements) setAnnouncements(JSON.parse(storedAnnouncements));
      if (storedLeaves) setLeaveRequests(JSON.parse(storedLeaves));
      if (storedAttendance) setAttendanceSessions(JSON.parse(storedAttendance));
      if (storedCurrentUser) {
        setCurrentUserState(JSON.parse(storedCurrentUser));
      } else {
        setCurrentUserState(INITIAL_USERS[0]);
      }
    } catch (e) {
      console.error('Error loading data from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
      localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaveRequests));
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceSessions));
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch (e) {
      console.error('Error saving data to localStorage', e);
    }
  }, [theme, users, courses, announcements, leaveRequests, attendanceSessions, currentUser, isLoaded]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
  };

  const login = (email: string, password?: string) => {
    const trimmedEmail = email.trim().toLowerCase();

    // Check pre-configured Admin credentials
    if (trimmedEmail === 'vkharizith@gmail.com') {
      if (password && password !== '123456789') {
        return { success: false, message: 'Invalid Admin Password! Please use 123456789' };
      }
      const adminUser = users.find((u) => u.email.toLowerCase() === 'vkharizith@gmail.com') || INITIAL_USERS[0];
      setCurrentUserState(adminUser);
      return { success: true };
    }

    // Check other registered users
    const matched = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (matched) {
      setCurrentUserState(matched);
      return { success: true };
    }

    return { success: false, message: 'Account not found. Please check your email or select a demo role.' };
  };

  const logout = () => {
    setCurrentUserState(null);
  };

  const switchRole = (role: Role) => {
    const targetUser = users.find((u) => u.role === role);
    if (targetUser) {
      setCurrentUserState(targetUser);
    }
  };

  const markAttendance = (sessionData: Omit<AttendanceSession, 'id' | 'createdAt'>): AttendanceSession => {
    const newSession: AttendanceSession = {
      ...sessionData,
      id: `ATT-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
    };

    setAttendanceSessions((prev) => [newSession, ...prev]);

    // Update course completed classes counter
    setCourses((prev) =>
      prev.map((c) =>
        c.code === sessionData.courseCode && c.section === sessionData.section
          ? { ...c, completedClasses: c.completedClasses + 1 }
          : c
      )
    );

    return newSession;
  };

  const getStudentAttendanceForCourse = (studentId: string, courseCode: string) => {
    const relevantSessions = attendanceSessions.filter((s) => s.courseCode === courseCode);
    let attended = 0;
    let total = 0;
    const history: { date: string; status: string; sessionName: string }[] = [];

    relevantSessions.forEach((s) => {
      const rec = s.records.find((r) => r.studentId === studentId);
      if (rec) {
        total += 1;
        if (rec.status === 'present' || rec.status === 'od') {
          attended += 1;
        }
        history.push({
          date: s.date,
          status: rec.status,
          sessionName: s.courseName,
        });
      }
    });

    const baseTotal = 24;
    const baseAttended = studentId === 'STU004' ? 16 : studentId === 'STU002' ? 18 : 21;
    const finalTotal = total + baseTotal;
    const finalAttended = attended + baseAttended;
    const percentage = finalTotal > 0 ? Math.round((finalAttended / finalTotal) * 100) : 100;

    const maxTotalAllowed = Math.floor(finalAttended / 0.75);
    const safeBunks = Math.max(0, maxTotalAllowed - finalTotal);

    let neededTo75 = 0;
    if (percentage < 75) {
      neededTo75 = Math.max(0, Math.ceil((0.75 * finalTotal - finalAttended) / 0.25));
    }

    return {
      attended: finalAttended,
      total: finalTotal,
      percentage,
      safeBunks,
      neededTo75,
      history,
    };
  };

  const getStudentOverallAttendance = (studentId: string) => {
    let totalAttended = 0;
    let totalClasses = 0;

    courses.forEach((c) => {
      const stats = getStudentAttendanceForCourse(studentId, c.code);
      totalAttended += stats.attended;
      totalClasses += stats.total;
    });

    const percentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 100;
    const maxTotalAllowed = Math.floor(totalAttended / 0.75);
    const safeBunks = Math.max(0, maxTotalAllowed - totalClasses);
    let neededTo75 = 0;
    if (percentage < 75) {
      neededTo75 = Math.max(0, Math.ceil((0.75 * totalClasses - totalAttended) / 0.25));
    }

    return {
      attended: totalAttended,
      total: totalClasses,
      percentage,
      safeBunks,
      neededTo75,
    };
  };

  const addAnnouncement = (
    data: Omit<Announcement, 'id' | 'createdAt' | 'readBy' | 'authorAvatar'>
  ): Announcement => {
    const authorAvatar = currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
    const newAnnouncement: Announcement = {
      ...data,
      id: `ANN-${Date.now().toString(36).toUpperCase()}`,
      authorAvatar,
      createdAt: new Date().toISOString(),
      readBy: currentUser ? [currentUser.id] : [],
    };

    setAnnouncements((prev) => [newAnnouncement, ...prev]);
    return newAnnouncement;
  };

  const markAnnouncementRead = (id: string) => {
    if (!currentUser) return;
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === id && !a.readBy.includes(currentUser.id)
          ? { ...a, readBy: [...a.readBy, currentUser.id] }
          : a
      )
    );
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  const applyLeave = (data: Omit<LeaveRequest, 'id' | 'appliedAt' | 'status'>): LeaveRequest => {
    const newLeave: LeaveRequest = {
      ...data,
      id: `LEV-${Date.now().toString(36).toUpperCase()}`,
      status: 'pending',
      appliedAt: new Date().toISOString(),
    };

    setLeaveRequests((prev) => [newLeave, ...prev]);
    return newLeave;
  };

  const reviewLeave = (id: string, status: 'approved' | 'rejected', remarks?: string) => {
    setLeaveRequests((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status,
              reviewRemarks: remarks || (status === 'approved' ? 'Approved by faculty.' : 'Rejected by faculty.'),
              reviewedBy: currentUser?.id,
              reviewedByName: currentUser?.name,
              reviewedAt: new Date().toISOString(),
            }
          : l
      )
    );
  };

  const toggleSyllabusTopic = (courseCode: string, topicIndex: number) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.code === courseCode) {
          const updatedTopics = [...c.syllabusTopics];
          if (updatedTopics[topicIndex]) {
            updatedTopics[topicIndex] = {
              ...updatedTopics[topicIndex],
              isCompleted: !updatedTopics[topicIndex].isCompleted,
            };
          }
          return { ...c, syllabusTopics: updatedTopics };
        }
        return c;
      })
    );
  };

  const addUser = (userData: Omit<User, 'id'>): User => {
    const prefix =
      userData.role === 'admin'
        ? 'ADM'
        : userData.role === 'hod'
        ? 'HOD'
        : userData.role === 'teacher'
        ? 'FAC'
        : 'STU';
    const newUser: User = {
      ...userData,
      id: `${prefix}${Math.floor(100 + Math.random() * 900)}`,
    };

    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
    if (currentUser?.id === id) {
      setCurrentUserState((prev) => (prev ? { ...prev, ...data } : prev));
    }
  };

  const updateMentorship = (mentorId: string, menteeIds: string[]) => {
    const mentor = users.find((u) => u.id === mentorId);
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === mentorId) {
          return { ...u, menteeIds };
        }
        if (menteeIds.includes(u.id) && u.role === 'student') {
          return { ...u, mentorId, mentorName: mentor?.name };
        }
        if (u.mentorId === mentorId && !menteeIds.includes(u.id)) {
          return { ...u, mentorId: undefined, mentorName: undefined };
        }
        return u;
      })
    );
  };

  const addCourse = (course: Course) => {
    setCourses((prev) => [...prev, course]);
  };

  const deleteCourse = (code: string) => {
    setCourses((prev) => prev.filter((c) => c.code !== code));
  };

  const resetDatabase = () => {
    setUsers(INITIAL_USERS);
    setCourses(INITIAL_COURSES);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setLeaveRequests(INITIAL_LEAVE_REQUESTS);
    setAttendanceSessions(INITIAL_ATTENDANCE_SESSIONS);
    setCurrentUserState(INITIAL_USERS[0]);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        currentUser,
        users,
        courses,
        announcements,
        leaveRequests,
        attendanceSessions,
        login,
        logout,
        switchRole,
        setCurrentUser,
        markAttendance,
        getStudentAttendanceForCourse,
        getStudentOverallAttendance,
        addAnnouncement,
        markAnnouncementRead,
        deleteAnnouncement,
        applyLeave,
        reviewLeave,
        toggleSyllabusTopic,
        addUser,
        deleteUser,
        updateUser,
        updateMentorship,
        addCourse,
        deleteCourse,
        resetDatabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
