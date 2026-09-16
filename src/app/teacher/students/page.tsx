"use client";

import { useEffect, useState } from "react";
import { Users, Search, GraduationCap } from "lucide-react";

interface StudentItem {
  id: string;
  vmNo?: string | null;
  email: string;
  name: string;
  studentProfile?: {
    rollNumber: string;
    department: string;
    semester: number;
    batch: string;
  } | null;
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/teacher/students")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setStudents(json.data);
        } else {
          console.error("Failed to load students:", json.error);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.vmNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentProfile?.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="student-main" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <main className="student-main">
      <header className="student-header">
        <div>
          <h1>Student Directory</h1>
          <p className="student-subtitle">View and search for student information</p>
        </div>
      </header>

      <div className="student-card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Users size={20} style={{ color: "var(--royal-blue)" }} />
            <h2 style={{ fontSize: "1.25rem", margin: 0 }}>All Students</h2>
            <span style={{ backgroundColor: "var(--bg-body)", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "600" }}>
              {filteredStudents.length}
            </span>
          </div>

          <div style={{ position: "relative", width: "300px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search by name, VM No, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem 1rem 0.6rem 2.2rem",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-input)",
                color: "var(--text-main)",
                outline: "none",
                fontSize: "0.9rem"
              }}
            />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="student-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-header)", borderBottom: "2px solid var(--border-subtle)" }}>
                <th style={{ padding: "1rem", textAlign: "left", color: "var(--text-muted)", fontWeight: "600", fontSize: "0.85rem" }}>Student Name</th>
                <th style={{ padding: "1rem", textAlign: "left", color: "var(--text-muted)", fontWeight: "600", fontSize: "0.85rem" }}>VM No</th>
                <th style={{ padding: "1rem", textAlign: "left", color: "var(--text-muted)", fontWeight: "600", fontSize: "0.85rem" }}>Department</th>
                <th style={{ padding: "1rem", textAlign: "left", color: "var(--text-muted)", fontWeight: "600", fontSize: "0.85rem" }}>Semester</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--bg-body)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--royal-blue)", fontWeight: "bold" }}>
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: "600", color: "var(--text-main)" }}>{student.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "1rem", color: "var(--text-main)" }}>
                      <span style={{ backgroundColor: "var(--bg-body)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.85rem", border: "1px solid var(--border-subtle)" }}>
                        {student.vmNo || student.studentProfile?.rollNumber || "N/A"}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", color: "var(--text-main)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <GraduationCap size={14} style={{ color: "var(--sky-blue)" }} />
                        {student.studentProfile?.department || "N/A"}
                      </div>
                    </td>
                    <td style={{ padding: "1rem", color: "var(--text-main)" }}>
                      {student.studentProfile?.semester ? `Semester ${student.studentProfile.semester}` : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>
                    No students found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
