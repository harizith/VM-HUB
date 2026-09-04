export type Role = 'admin' | 'hod' | 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  avatar: string;
  rollNo?: string;
  phone?: string;
  // Student specific
  semester?: number;
  section?: string;
  mentorId?: string;
  mentorName?: string;
  // Teacher/HOD specific
  designation?: string;
  assignedSubjects?: string[];
  menteeIds?: string[];
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'od';

export interface StudentAttendanceStatus {
  studentId: string;
  studentName: string;
  rollNo: string;
  status: AttendanceStatus;
  remark?: string;
}

export interface AttendanceSession {
  id: string;
  courseCode: string;
  courseName: string;
  section: string;
  date: string;
  timeSlot: string;
  period: number;
  teacherId: string;
  teacherName: string;
  records: StudentAttendanceStatus[];
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  odCount: number;
  createdAt: string;
}

export type AnnouncementPriority = 'normal' | 'important' | 'urgent';
export type AnnouncementScope = 'all_dept' | 'all_faculty' | 'all_students' | 'class_section' | 'mentees';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  authorAvatar: string;
  scope: AnnouncementScope;
  targetClass?: string; // e.g., "CSE-A" or "CS501"
  targetCourse?: string;
  targetMenteeGroupMentorId?: string;
  priority: AnnouncementPriority;
  category: 'General' | 'Academic' | 'Exam' | 'Event' | 'Mentorship' | 'Urgent';
  attachments?: { name: string; size: string; url?: string }[];
  createdAt: string;
  readBy: string[]; // List of user IDs who read it
}

export type LeaveType = 'medical' | 'od' | 'casual' | 'event';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  section: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  documentName?: string;
  status: LeaveStatus;
  appliedAt: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewRemarks?: string;
}

export interface Course {
  code: string;
  name: string;
  credits: number;
  semester: number;
  department: string;
  teacherId: string;
  teacherName: string;
  section: string;
  totalClasses: number;
  completedClasses: number;
  syllabusTopics: { topic: string; isCompleted: boolean; targetDate: string }[];
}

export interface StudentCourseAttendance {
  courseCode: string;
  courseName: string;
  teacherName: string;
  attended: number;
  total: number;
  percentage: number;
  recentHistory: { date: string; status: AttendanceStatus }[];
}
