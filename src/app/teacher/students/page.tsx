"use client";

import { useEffect, useState } from "react";
import { Users, Search, Filter, MoreVertical, CheckCircle, XCircle, Mail, Phone, ChevronDown } from "lucide-react";

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [dateString, setDateString] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<number | "All">("All");

  useEffect(() => {
    fetch("/api/teacher/students")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStudents(data.data.students || []);
          setTodayClasses(data.data.todayClasses || []);
          setAttendanceRecords(data.data.attendance || []);
          setDateString(data.data.dateString || new Date().toISOString().split("T")[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (student.vmNo && student.vmNo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (selectedPeriod !== "All") {
      const cls = todayClasses.find(c => c.period === selectedPeriod);
      return matchesSearch && cls && student.computedClassId === cls.classId;
    }
    return matchesSearch;
  });

  const handleToggleAttendance = async (studentId: string, status: string, classId: string, subjectCode: string, dayOrder: number) => {
    if (selectedPeriod === "All") return alert("Please select a specific period to mark attendance.");
    
    try {
      const res = await fetch("/api/teacher/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          classId,
          dateString,
          dayOrder,
          period: selectedPeriod,
          subjectCode,
          status
        })
      });
      const data = await res.json();
      if (data.success) {
        setAttendanceRecords(prev => {
          const filtered = prev.filter(a => !(a.studentId === studentId && a.period === selectedPeriod));
          return [...filtered, data.data];
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="student-main">
      <header className="student-header">
        <div>
          <h1>My Students</h1>
          <p className="student-subtitle">Manage and track student progress and attendance</p>
        </div>
        <div className="student-course-info" style={{ display: "flex", gap: "1rem" }}>
          <button style={{ backgroundColor: "var(--royal-blue)", color: "white", padding: "0.6rem 1.2rem", borderRadius: "8px", border: "none", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Users size={16} /> Add Student
          </button>
        </div>
      </header>

      {/* Analytics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <div className="student-card premium-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "12px", backgroundColor: "rgba(56, 189, 248, 0.1)", color: "var(--sky-blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0, color: "var(--text-main)" }}>{students.length}</h3>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>Total Students</p>
          </div>
        </div>
        <div className="student-card premium-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "12px", backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0, color: "var(--text-main)" }}>94%</h3>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>Avg Attendance</p>
          </div>
        </div>
        <div className="student-card premium-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "12px", backgroundColor: "rgba(168, 85, 247, 0.1)", color: "#a855f7", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Filter size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0, color: "var(--text-main)" }}>4</h3>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>Active Classes</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", flex: 1, minWidth: "300px", position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input 
            type="text" 
            placeholder="Search students by name or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", padding: "0.8rem 1rem 0.8rem 2.8rem", borderRadius: "10px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-input)", color: "var(--text-main)", outline: "none", fontSize: "0.95rem" }}
          />
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value === "All" ? "All" : Number(e.target.value))}
            style={{ padding: "0.8rem 1.2rem", borderRadius: "10px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card)", color: "var(--text-main)", fontWeight: "600", cursor: "pointer", outline: "none" }}
          >
            <option value="All">All Periods</option>
            {todayClasses.map(c => (
              <option key={c.id} value={c.period}>Period {c.period} ({c.classId} - {c.subjectCode})</option>
            ))}
          </select>
          <button style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.8rem 1.2rem", borderRadius: "10px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card)", color: "var(--text-main)", fontWeight: "600", cursor: "pointer" }}>
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="student-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-input)", borderBottom: "1px solid var(--border-subtle)" }}>
                <th style={{ padding: "1rem 1.5rem", fontWeight: "700", color: "var(--text-muted)", fontSize: "0.8rem", letterSpacing: "0.05em" }}>STUDENT</th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: "700", color: "var(--text-muted)", fontSize: "0.8rem", letterSpacing: "0.05em" }}>ROLL NO / VM NO</th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: "700", color: "var(--text-muted)", fontSize: "0.8rem", letterSpacing: "0.05em" }}>DEPARTMENT</th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: "700", color: "var(--text-muted)", fontSize: "0.8rem", letterSpacing: "0.05em" }}>ATTENDANCE</th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: "700", color: "var(--text-muted)", fontSize: "0.8rem", letterSpacing: "0.05em" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading students...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>No students found matching your criteria.</td>
                </tr>
              ) : (
                filteredStudents.map((student, i) => {
                  const currentClass = selectedPeriod !== "All" ? todayClasses.find(c => c.period === selectedPeriod) : null;
                  const attRecord = currentClass ? attendanceRecords.find(a => a.studentId === student.id && a.period === selectedPeriod) : null;
                  const currentStatus = attRecord ? attRecord.status : null;

                  return (
                    <tr key={student.id} style={{ borderBottom: i === filteredStudents.length - 1 ? "none" : "1px solid var(--border-subtle)", transition: "background-color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-input)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                          <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", color: "var(--text-main)", fontSize: "0.9rem" }}>
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: "700", color: "var(--text-main)" }}>{student.name}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "1rem 1.5rem", color: "var(--text-main)", fontWeight: "600", fontSize: "0.9rem" }}>
                        {student.studentProfile?.rollNumber || student.vmNo || "N/A"}
                      </td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <span style={{ backgroundColor: "rgba(56, 189, 248, 0.1)", color: "var(--sky-blue)", padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "600" }}>
                          {student.computedClassId || "Unknown"}
                        </span>
                      </td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        {selectedPeriod === "All" ? (
                           <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Select Period</span>
                        ) : (
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button 
                              onClick={() => handleToggleAttendance(student.id, "PRESENT", currentClass.classId, currentClass.subjectCode, currentClass.dayOrder)}
                              style={{ padding: "0.4rem 0.8rem", borderRadius: "6px", border: "1px solid", backgroundColor: currentStatus === "PRESENT" ? "rgba(34, 197, 94, 0.1)" : "transparent", borderColor: currentStatus === "PRESENT" ? "#22c55e" : "var(--border-subtle)", color: currentStatus === "PRESENT" ? "#22c55e" : "var(--text-muted)", cursor: "pointer", fontWeight: "600", fontSize: "0.8rem" }}
                            >
                              Present
                            </button>
                            <button 
                              onClick={() => handleToggleAttendance(student.id, "ABSENT", currentClass.classId, currentClass.subjectCode, currentClass.dayOrder)}
                              style={{ padding: "0.4rem 0.8rem", borderRadius: "6px", border: "1px solid", backgroundColor: currentStatus === "ABSENT" ? "rgba(239, 68, 68, 0.1)" : "transparent", borderColor: currentStatus === "ABSENT" ? "#ef4444" : "var(--border-subtle)", color: currentStatus === "ABSENT" ? "#ef4444" : "var(--text-muted)", cursor: "pointer", fontWeight: "600", fontSize: "0.8rem" }}
                            >
                              Absent
                            </button>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid var(--border-subtle)", backgroundColor: "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", cursor: "pointer" }} title="Email Student">
                            <Mail size={16} />
                          </button>
                          <button style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid var(--border-subtle)", backgroundColor: "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", cursor: "pointer" }} title="More Options">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
