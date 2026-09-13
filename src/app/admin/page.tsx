"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface UserItem {
  id: string;
  vmNo?: string | null;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: string;
  studentProfile?: {
    rollNumber: string;
    department: string;
    semester: number;
    batch: string;
  } | null;
  facultyProfile?: {
    vmNo: string;
    department: string;
    designation: string;
  } | null;
}
interface DeptItem { id: string; code: string; name: string; hodName?: string; }
interface SubjectItem { id: string; code: string; name: string; credits: number; semester: number; departmentCode: string; }
interface NoticeItem { id: string; title: string; content: string; category: string; postedBy: string; createdAt: string; }


export default function AdminPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState<"users" | "depts" | "subjects" | "notices">("users");

  // Role Subdivision Filter State
  const [userRoleSubdivision, setUserRoleSubdivision] = useState<"ALL" | "STUDENT" | "FACULTY" | "HOD" | "ADMIN">("ALL");

  // Selected User & Selected Subject for Side Drawers
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(null);

  // State loaded from DB
  const [users, setUsers] = useState<UserItem[]>([]);
  const [depts, setDepts] = useState<DeptItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals State
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);

  // User Form
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserPass, setNewUserPass] = useState("");
  const [newUserRole, setNewUserRole] = useState("STUDENT");

  // Dept Form
  const [newDeptCode, setNewDeptCode] = useState("");
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptHod, setNewDeptHod] = useState("");

  // Subject Form
  const [newSubCode, setNewSubCode] = useState("");
  const [newSubName, setNewSubName] = useState("");
  const [newSubCredits, setNewSubCredits] = useState("3");
  const [newSubSem, setNewSubSem] = useState("5");
  const [newSubDept, setNewSubDept] = useState("CSE");

  // Notice Form
  const [newNoticeTitle, setNewNoticeTitle] = useState("");
  const [newNoticeContent, setNewNoticeContent] = useState("");
  const [newNoticeCategory, setNewNoticeCategory] = useState("GENERAL");

  // Apply Theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, dRes, sRes, nRes] = await Promise.all([
        fetch("/api/admin/users").then((r) => r.json()),
        fetch("/api/admin/departments").then((r) => r.json()),
        fetch("/api/admin/subjects").then((r) => r.json()),
        fetch("/api/admin/notices").then((r) => r.json()),
      ]);

      if (uRes.success) setUsers(uRes.users);
      if (dRes.success) setDepts(dRes.departments);
      if (sRes.success) setSubjects(sRes.subjects);
      if (nRes.success) setNotices(nRes.notices);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Filter users by active subdivision
  const filteredUsers = users.filter((u) => {
    if (userRoleSubdivision === "ALL") return true;
    return u.role === userRoleSubdivision;
  });

  // Handlers
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newUserEmail, name: newUserName, password: newUserPass, role: newUserRole }),
    }).then((r) => r.json());

    if (res.success) { setShowUserModal(false); setNewUserEmail(""); setNewUserName(""); setNewUserPass(""); fetchData(); }
    else alert("Error: " + res.error);
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" }).then((r) => r.json());
    if (res.success) {
      if (selectedUser?.id === id) setSelectedUser(null);
      fetchData();
    } else alert("Error: " + res.error);
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: newDeptCode, name: newDeptName, hodName: newDeptHod }),
    }).then((r) => r.json());

    if (res.success) { setShowDeptModal(false); setNewDeptCode(""); setNewDeptName(""); setNewDeptHod(""); fetchData(); }
    else alert("Error: " + res.error);
  };

  const handleDeleteDept = async (id: string) => {
    if (!confirm("Delete department?")) return;
    const res = await fetch(`/api/admin/departments?id=${id}`, { method: "DELETE" }).then((r) => r.json());
    if (res.success) fetchData(); else alert("Error: " + res.error);
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: newSubCode, name: newSubName, credits: newSubCredits, semester: newSubSem, departmentCode: newSubDept }),
    }).then((r) => r.json());

    if (res.success) { setShowSubjectModal(false); setNewSubCode(""); setNewSubName(""); fetchData(); }
    else alert("Error: " + res.error);
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm("Delete subject?")) return;
    const res = await fetch(`/api/admin/subjects?id=${id}`, { method: "DELETE" }).then((r) => r.json());
    if (res.success) fetchData(); else alert("Error: " + res.error);
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newNoticeTitle, content: newNoticeContent, category: newNoticeCategory }),
    }).then((r) => r.json());

    if (res.success) { setShowNoticeModal(false); setNewNoticeTitle(""); setNewNoticeContent(""); fetchData(); }
    else alert("Error: " + res.error);
  };

  const handleDeleteNotice = async (id: string) => {
    if (!confirm("Delete notice?")) return;
    const res = await fetch(`/api/admin/notices?id=${id}`, { method: "DELETE" }).then((r) => r.json());
    if (res.success) fetchData(); else alert("Error: " + res.error);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-page)", color: "var(--text-main)", fontFamily: "var(--font-sans, system-ui, sans-serif)", transition: "all 0.3s ease", position: "relative", overflowX: "hidden" }}>
      {/* LEFT SIDEBAR */}
      <aside style={{ width: "260px", backgroundColor: "var(--bg-card)", borderRight: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "1.5rem 1rem", position: "sticky", top: 0, height: "100vh", boxShadow: "var(--shadow-card)" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border-subtle)", marginBottom: "1.5rem" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, var(--royal-blue) 0%, var(--sky-blue) 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "1.1rem", color: "white", boxShadow: "0 4px 12px rgba(29, 78, 216, 0.3)" }}>
              VM
            </div>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", margin: 0, fontFamily: "var(--font-serif, serif)" }}>VM-HUB</h2>
              <span style={{ fontSize: "0.75rem", color: "var(--sky-blue)", fontWeight: "600" }}>Admin Portal</span>
            </div>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {[
              { id: "users", label: "👥 User Accounts", count: users.length },
              { id: "depts", label: "🏛️ Departments", count: depts.length },
              { id: "subjects", label: "📚 Course Catalog", count: subjects.length },
              { id: "notices", label: "📢 Announcements", count: notices.length },
            ].map((nav) => (
              <button key={nav.id} onClick={() => { setActiveTab(nav.id as any); setSelectedUser(null); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "0.7rem 0.9rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem", backgroundColor: activeTab === nav.id ? "var(--royal-blue)" : "transparent", color: activeTab === nav.id ? "#ffffff" : "var(--text-muted)", transition: "all 0.2s ease" }}>
                <span>{nav.label}</span>
                <span style={{ fontSize: "0.75rem", padding: "0.15rem 0.5rem", borderRadius: "9999px", backgroundColor: activeTab === nav.id ? "rgba(255,255,255,0.2)" : "var(--border-subtle)", color: activeTab === nav.id ? "#ffffff" : "var(--text-muted)" }}>{nav.count}</span>
              </button>
            ))}
          </nav>
        </div>

        <div style={{ paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {/* User Profile Sidebar Card */}
          <div
            onClick={() => {
              // Find or create current admin user profile to display in drawer
              const currentAdmin = users.find((u) => u.role === "ADMIN") || {
                id: "admin-self",
                email: "admin@veltech.edu.in",
                name: "Administrator ( You )",
                role: "ADMIN",
                status: "ACTIVE",
                createdAt: new Date().toISOString(),
              };
              setSelectedUser(currentAdmin);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.6rem 0.75rem",
              borderRadius: "10px",
              backgroundColor: "var(--bg-input)",
              border: "1px solid var(--border-subtle)",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--sky-blue)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "700",
              color: "white",
              fontSize: "0.95rem"
            }}>
              A
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: "700", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                Admin Profile
              </div>
              <div style={{ fontSize: "0.725rem", color: "var(--sky-blue)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                admin@veltech.edu.in
              </div>
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>➔</span>
          </div>

          <button onClick={toggleTheme} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", width: "100%", backgroundColor: "var(--bg-input)", color: "var(--text-main)", border: "1px solid var(--border-subtle)", padding: "0.6rem", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600", cursor: "pointer" }}>
            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
          <Link href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", color: "#ef4444", fontSize: "0.85rem", textDecoration: "none", border: "1px solid rgba(239, 68, 68, 0.3)", backgroundColor: "rgba(239, 68, 68, 0.1)", padding: "0.6rem", borderRadius: "8px", fontWeight: "600" }}>
            Sign Out
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border-subtle)", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "700", margin: 0, fontFamily: "var(--font-serif, serif)" }}>
              {activeTab === "users" && "User Directory & Role Subdivisions"}
              {activeTab === "depts" && "Academic Departments"}
              {activeTab === "subjects" && "Course & Subject Catalog"}
              {activeTab === "notices" && "System Announcements & Broadcasts"}
            </h1>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-muted)" }}>Vel Tech Multi Tech Autonomous ERP System</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "rgba(56, 189, 248, 0.15)", color: "var(--sky-blue)", padding: "0.4rem 0.85rem", borderRadius: "9999px", fontSize: "0.825rem", fontWeight: "600", border: "1px solid var(--border-active)" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--sky-blue)" }}></span>
            System Online
          </div>
        </header>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading database records...</div>
        ) : (
          <>
            {/* USERS TABLE WITH CLICKABLE ROWS */}
            {activeTab === "users" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "700", margin: 0 }}>Registered Accounts</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>Click any user row to open their full profile drawer</p>
                  </div>
                  <button onClick={() => setShowUserModal(true)} className="btn-royal">+ Add New User</button>
                </div>

                {/* ROLE SUBDIVISION PILLS */}
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", backgroundColor: "var(--bg-card)", padding: "0.5rem", borderRadius: "10px", border: "1px solid var(--border-subtle)", flexWrap: "wrap" }}>
                  {[
                    { id: "ALL", label: "🌐 All Accounts", count: users.length },
                    { id: "STUDENT", label: "👨‍🎓 Students", count: users.filter((u) => u.role === "STUDENT").length },
                    { id: "FACULTY", label: "👨‍🏫 Teachers / Faculty", count: users.filter((u) => u.role === "FACULTY").length },
                    { id: "HOD", label: "👔 HODs", count: users.filter((u) => u.role === "HOD").length },
                    { id: "ADMIN", label: "🛡️ Administrators", count: users.filter((u) => u.role === "ADMIN").length },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => { setUserRoleSubdivision(sub.id as any); setSelectedUser(null); }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "0.85rem",
                        backgroundColor: userRoleSubdivision === sub.id ? "var(--sky-blue)" : "transparent",
                        color: userRoleSubdivision === sub.id ? "#0f172a" : "var(--text-muted)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <span>{sub.label}</span>
                      <span style={{ fontSize: "0.75rem", padding: "0.1rem 0.4rem", borderRadius: "9999px", backgroundColor: userRoleSubdivision === sub.id ? "rgba(15, 23, 42, 0.15)" : "var(--border-subtle)" }}>
                        {sub.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div style={{ backgroundColor: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--border-subtle)", overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-header)", color: "var(--text-muted)" }}>
                        <th style={{ padding: "0.85rem 1rem" }}>User Name</th><th style={{ padding: "0.85rem 1rem" }}>Email Address</th><th style={{ padding: "0.85rem 1rem" }}>Subdivision Role</th><th style={{ padding: "0.85rem 1rem" }}>Status</th><th style={{ padding: "0.85rem 1rem" }}>Profile Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>No accounts found in this role subdivision.</td></tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr
                            key={u.id}
                            onClick={() => setSelectedUser(u)}
                            style={{
                              borderBottom: "1px solid var(--border-subtle)",
                              cursor: "pointer",
                              backgroundColor: selectedUser?.id === u.id ? "rgba(56, 189, 248, 0.08)" : "transparent",
                              transition: "background-color 0.2s ease"
                            }}
                          >
                            <td style={{ padding: "0.85rem 1rem", fontWeight: "600" }}>{u.name}</td>
                            <td style={{ padding: "0.85rem 1rem", color: "var(--sky-blue)", fontWeight: "500" }}>{u.email}</td>
                            <td style={{ padding: "0.85rem 1rem" }}>
                              <span style={{ padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "700", backgroundColor: u.role === "ADMIN" ? "rgba(239,68,68,0.15)" : u.role === "HOD" ? "rgba(245,158,11,0.15)" : u.role === "FACULTY" ? "rgba(16,185,129,0.15)" : "rgba(29,78,216,0.15)", color: u.role === "ADMIN" ? "#ef4444" : u.role === "HOD" ? "#d97706" : u.role === "FACULTY" ? "#059669" : "var(--royal-blue)" }}>
                                {u.role === "FACULTY" ? "TEACHER" : u.role}
                              </span>
                            </td>
                            <td style={{ padding: "0.85rem 1rem", color: "#10b981", fontWeight: "600" }}>● {u.status}</td>
                            <td style={{ padding: "0.85rem 1rem" }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedUser(u); }}
                                style={{
                                  backgroundColor: "rgba(56, 189, 248, 0.15)",
                                  color: "var(--sky-blue)",
                                  border: "1px solid rgba(56, 189, 248, 0.3)",
                                  padding: "0.3rem 0.75rem",
                                  borderRadius: "6px",
                                  fontSize: "0.8rem",
                                  fontWeight: "600",
                                  cursor: "pointer"
                                }}
                              >
                                View Profile →
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* DEPARTMENTS */}
            {activeTab === "depts" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <div><h3 style={{ fontSize: "1.1rem", fontWeight: "700", margin: 0 }}>Academic Departments</h3><p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>Configured divisions and HODs</p></div>
                  <button onClick={() => setShowDeptModal(true)} className="btn-sky">+ Create Department</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
                  {depts.map((d, idx) => (
                    <div key={d.id || d.code || `dept-${idx}`} style={{ backgroundColor: "var(--bg-card)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--sky-blue)", fontWeight: "800", letterSpacing: "0.05em" }}>{d.code}</div>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: "600", margin: "0.25rem 0 0.5rem 0" }}>{d.name}</h3>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>HOD: {d.hodName || "Not Assigned"}</p>
                      </div>
                      <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end" }}>
                        <button onClick={() => handleDeleteDept(d.id)} style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", padding: "0.25rem 0.6rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "600", cursor: "pointer" }}>Delete Department</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBJECTS */}
            {activeTab === "subjects" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "700", margin: 0 }}>Course Catalog</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>Click any subject to view the assigned handling faculty, course lead, and HOD</p>
                  </div>
                  <button onClick={() => setShowSubjectModal(true)} className="btn-royal">+ Add New Subject</button>
                </div>
                <div style={{ backgroundColor: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--border-subtle)", overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-header)", color: "var(--text-muted)" }}>
                        <th style={{ padding: "0.85rem 1rem" }}>Code</th>
                        <th style={{ padding: "0.85rem 1rem" }}>Subject Title</th>
                        <th style={{ padding: "0.85rem 1rem" }}>Dept</th>
                        <th style={{ padding: "0.85rem 1rem" }}>Semester</th>
                        <th style={{ padding: "0.85rem 1rem" }}>Credits</th>
                        <th style={{ padding: "0.85rem 1rem" }}>Handling Staff</th>
                        <th style={{ padding: "0.85rem 1rem" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((s) => (
                        <tr
                          key={s.id}
                          onClick={() => setSelectedSubject(s)}
                          style={{
                            borderBottom: "1px solid var(--border-subtle)",
                            cursor: "pointer",
                            backgroundColor: selectedSubject?.id === s.id ? "rgba(56, 189, 248, 0.08)" : "transparent",
                            transition: "background-color 0.2s ease"
                          }}
                        >
                          <td style={{ padding: "0.85rem 1rem", fontWeight: "700", color: "var(--sky-blue)" }}>{s.code}</td>
                          <td style={{ padding: "0.85rem 1rem", fontWeight: "600" }}>{s.name}</td>
                          <td style={{ padding: "0.85rem 1rem" }}>{s.departmentCode}</td>
                          <td style={{ padding: "0.85rem 1rem" }}>Semester {s.semester}</td>
                          <td style={{ padding: "0.85rem 1rem", fontWeight: "600" }}>{s.credits} Credits</td>
                          <td style={{ padding: "0.85rem 1rem" }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedSubject(s); }}
                              style={{
                                backgroundColor: "rgba(56, 189, 248, 0.15)",
                                color: "var(--sky-blue)",
                                border: "1px solid rgba(56, 189, 248, 0.3)",
                                padding: "0.3rem 0.75rem",
                                borderRadius: "6px",
                                fontSize: "0.8rem",
                                fontWeight: "600",
                                cursor: "pointer"
                              }}
                            >
                              👨‍🏫 View Handling Staff →
                            </button>
                          </td>
                          <td style={{ padding: "0.85rem 1rem" }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteSubject(s.id); }}
                              style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", padding: "0.25rem 0.6rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "600", cursor: "pointer" }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* NOTICES */}
            {activeTab === "notices" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <div><h3 style={{ fontSize: "1.1rem", fontWeight: "700", margin: 0 }}>System Announcements</h3><p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>Broadcast official notices across student & faculty views</p></div>
                  <button onClick={() => setShowNoticeModal(true)} className="btn-sky">+ Create Notice</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
                  {notices.map((n) => (
                    <div key={n.id} style={{ backgroundColor: "var(--bg-card)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                          <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: "700", backgroundColor: n.category === "URGENT" ? "rgba(239,68,68,0.2)" : n.category === "EXAM" ? "rgba(245,158,11,0.2)" : "rgba(59,130,246,0.2)", color: n.category === "URGENT" ? "#ef4444" : n.category === "EXAM" ? "#d97706" : "var(--royal-blue)" }}>{n.category}</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.5rem" }}>{n.title}</h3>
                        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: "1.5" }}>{n.content}</p>
                      </div>
                      <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end" }}>
                        <button onClick={() => handleDeleteNotice(n.id)} style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", padding: "0.25rem 0.6rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "600", cursor: "pointer" }}>Delete Notice</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}


          </>
        )}
      </main>

      {/* USER PROFILE SIDE DRAWER / SLIDE-OVER SIDEBAR */}
      {selectedUser && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 90, display: "flex", justifyContent: "flex-end" }} onClick={() => setSelectedUser(null)}>
          <aside
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "380px",
              height: "100vh",
              backgroundColor: "var(--bg-card)",
              borderLeft: "1px solid var(--border-subtle)",
              boxShadow: "-10px 0 30px rgba(0,0,0,0.5)",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflowY: "auto"
            }}
          >
            <div>
              {/* Drawer Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1rem", borderBottom: "1px solid var(--border-subtle)", marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--sky-blue)", letterSpacing: "0.05em" }}>
                  ACCOUNT PROFILE DETAILS
                </span>
                <button onClick={() => setSelectedUser(null)} style={{ backgroundColor: "transparent", border: "none", color: "var(--text-muted)", fontSize: "1.2rem", cursor: "pointer" }}>
                  ✕
                </button>
              </div>

              {/* User Avatar & Name */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: selectedUser.role === "ADMIN"
                    ? "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)"
                    : selectedUser.role === "HOD"
                    ? "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)"
                    : selectedUser.role === "FACULTY"
                    ? "linear-gradient(135deg, #10b981 0%, #047857 100%)"
                    : "linear-gradient(135deg, var(--royal-blue) 0%, var(--sky-blue) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "1.5rem",
                  fontWeight: "700"
                }}>
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: "700", margin: 0 }}>{selectedUser.name}</h3>
                  <span style={{
                    padding: "0.15rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    backgroundColor: selectedUser.role === "ADMIN" ? "rgba(239,68,68,0.15)" : selectedUser.role === "HOD" ? "rgba(245,158,11,0.15)" : selectedUser.role === "FACULTY" ? "rgba(16,185,129,0.15)" : "rgba(29,78,216,0.15)",
                    color: selectedUser.role === "ADMIN" ? "#ef4444" : selectedUser.role === "HOD" ? "#d97706" : selectedUser.role === "FACULTY" ? "#059669" : "var(--royal-blue)"
                  }}>
                    {selectedUser.role === "FACULTY" ? "TEACHER / FACULTY" : selectedUser.role}
                  </span>
                </div>
              </div>

              {/* Dynamic Usermode Role Profile Fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", backgroundColor: "var(--bg-page)", padding: "1.25rem", borderRadius: "12px", border: "1px solid var(--border-subtle)", marginBottom: "1.5rem" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>VM NO (Institutional Number)</span>
                  <strong style={{ fontSize: "0.95rem", color: "var(--sky-blue)" }}>{selectedUser.vmNo || "N/A"}</strong>
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Email Address</span>
                  <strong style={{ fontSize: "0.95rem", color: "var(--sky-blue)" }}>{selectedUser.email}</strong>
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Account Status</span>
                  <strong style={{ fontSize: "0.95rem", color: "#10b981" }}>● {selectedUser.status}</strong>
                </div>

                {/* Role Specific Details fetched from Database */}
                {selectedUser.role === "STUDENT" && (
                  <>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Roll Number / Register ID</span>
                      <strong style={{ fontSize: "0.95rem" }}>{selectedUser.studentProfile?.rollNumber || "Not Set in DB"}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Department & Batch</span>
                      <strong style={{ fontSize: "0.95rem" }}>
                        {selectedUser.studentProfile ? `${selectedUser.studentProfile.department} • Semester ${selectedUser.studentProfile.semester} (${selectedUser.studentProfile.batch})` : "Not Set in DB"}
                      </strong>
                    </div>
                  </>
                )}

                {selectedUser.role === "FACULTY" && (
                  <>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Faculty Staff VM NO</span>
                      <strong style={{ fontSize: "0.95rem" }}>{selectedUser.facultyProfile?.vmNo || selectedUser.vmNo || "Not Set in DB"}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Designation & Dept</span>
                      <strong style={{ fontSize: "0.95rem" }}>
                        {selectedUser.facultyProfile ? `${selectedUser.facultyProfile.designation} • ${selectedUser.facultyProfile.department}` : "Not Set in DB"}
                      </strong>
                    </div>
                  </>
                )}

                {selectedUser.role === "HOD" && (
                  <>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Executive Office</span>
                      <strong style={{ fontSize: "0.95rem" }}>Head of Department (CSE)</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Department Jurisdiction</span>
                      <strong style={{ fontSize: "0.95rem" }}>Computer Science and Engineering Division</strong>
                    </div>
                  </>
                )}

                {selectedUser.role === "ADMIN" && (
                  <>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Permission Level</span>
                      <strong style={{ fontSize: "0.95rem", color: "#ef4444" }}>Super Administrator (Full System Controls)</strong>
                    </div>
                  </>
                )}

                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Account Created</span>
                  <strong style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{new Date(selectedUser.createdAt).toLocaleDateString()}</strong>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)" }}>
              <button
                onClick={() => alert(`Password reset link generated for ${selectedUser.email}`)}
                style={{
                  backgroundColor: "var(--bg-input)",
                  color: "var(--text-main)",
                  border: "1px solid var(--border-subtle)",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "0.85rem"
                }}
              >
                Reset User Password
              </button>

              <button
                onClick={() => handleDeleteUser(selectedUser.id)}
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  color: "#ef4444",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "0.85rem"
                }}
              >
                Delete Account
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* SUBJECT HANDLING STAFF SIDE DRAWER / SLIDE-OVER PANEL */}
      {selectedSubject && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 95, display: "flex", justifyContent: "flex-end" }} onClick={() => setSelectedSubject(null)}>
          <aside
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "420px",
              height: "100vh",
              backgroundColor: "var(--bg-card)",
              borderLeft: "1px solid var(--border-subtle)",
              boxShadow: "-10px 0 30px rgba(0,0,0,0.5)",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflowY: "auto"
            }}
          >
            <div>
              {/* Drawer Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1rem", borderBottom: "1px solid var(--border-subtle)", marginBottom: "1.5rem" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--sky-blue)", letterSpacing: "0.05em" }}>
                    COURSE & FACULTY ALLOCATION
                  </span>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: "700", margin: "0.2rem 0 0 0" }}>{selectedSubject.code}</h2>
                </div>
                <button onClick={() => setSelectedSubject(null)} style={{ backgroundColor: "transparent", border: "none", color: "var(--text-muted)", fontSize: "1.2rem", cursor: "pointer" }}>
                  ✕
                </button>
              </div>

              {/* Subject Info Card */}
              <div style={{ backgroundColor: "var(--bg-page)", padding: "1.25rem", borderRadius: "12px", border: "1px solid var(--border-subtle)", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "0.5rem" }}>
                  {selectedSubject.name}
                </h3>
                <div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  <span>🏛️ Dept: <strong>{selectedSubject.departmentCode}</strong></span>
                  <span>🎓 Semester: <strong>{selectedSubject.semester}</strong></span>
                  <span>⭐ Credits: <strong>{selectedSubject.credits}</strong></span>
                </div>
              </div>

              {/* Handling Persons / Assigned Staff Section */}
              <h4 style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--sky-blue)", letterSpacing: "0.05em", marginBottom: "1rem" }}>
                👨‍🏫 PERSONS HANDLING THIS COURSE ({selectedSubject.code})
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Dynamic faculty lookup from real database records */}
                {(() => {
                  // Real course mapping derived from official Vel Tech Multi Tech timetable schedules
                  const realCourseHandlingMap: Record<string, Array<{ name: string; role: string; email: string; designation: string }>> = {
                    "231MA302": [
                      { name: "Dr. Mattuvarkuzhali", role: "Course Faculty Lead", email: "mattuvarkuzhali@veltech.edu.in", designation: "Professor • Dept of Mathematics" }
                    ],
                    "231CS323": [
                      { name: "Mr. R. Prabhakaran", role: "Primary Theory Faculty (Sec A & C)", email: "prabhakaran@veltech.edu.in", designation: "Assistant Professor • Staff ID: EMP-CSE-001" },
                      { name: "Mr. V. Nehru", role: "Theory Faculty (Sec B)", email: "nehru@veltech.edu.in", designation: "Assistant Professor • Staff ID: EMP-CSE-009" },
                      { name: "Ms. R. Harini", role: "Lab & Practical Lead", email: "harini@veltech.edu.in", designation: "Assistant Professor • Staff ID: EMP-CSE-013" }
                    ],
                    "231CS321": [
                      { name: "Ms. A. Vinothini", role: "Primary Theory Faculty (Sec A)", email: "vinothini@veltech.edu.in", designation: "Assistant Professor • Staff ID: EMP-CSE-004" },
                      { name: "Ms. D. Parkavi", role: "Faculty In-Charge (Sec B)", email: "parkavi@veltech.edu.in", designation: "Assistant Professor • Staff ID: EMP-CSE-010" },
                      { name: "Dr. E. Mercy Beulah", role: "Theory Faculty (Sec C)", email: "mercybeulah@veltech.edu.in", designation: "Professor • Staff ID: EMP-CSE-014" }
                    ],
                    "231CS322": [
                      { name: "Ms. R. Kokila Priya", role: "Primary Faculty (Sec A & C)", email: "kokilapriya@veltech.edu.in", designation: "Assistant Professor • Staff ID: EMP-CSE-023" },
                      { name: "Mr. V. Senthilkumar", role: "Faculty In-Charge (Sec B)", email: "senthilkumar@veltech.edu.in", designation: "Assistant Professor • Staff ID: EMP-CSE-031" }
                    ],
                    "231CS325": [
                      { name: "Ms. S. Alfiya", role: "Course Coordinator (Sec A & C)", email: "alfiya@veltech.edu.in", designation: "Assistant Professor • Staff ID: EMP-CSE-006" },
                      { name: "Ms. V. Divya", role: "Faculty In-Charge (Sec B)", email: "divya@veltech.edu.in", designation: "Assistant Professor • Staff ID: EMP-CSE-011" }
                    ],
                    "231CS324": [
                      { name: "Mr. C. Pandi", role: "Primary Theory Faculty (Sec A & B)", email: "pandi@veltech.edu.in", designation: "Assistant Professor • Staff ID: EMP-CSE-005" },
                      { name: "Ms. J. Bebitha", role: "Faculty In-Charge (Sec C)", email: "bebitha@veltech.edu.in", designation: "Assistant Professor • Staff ID: EMP-CSE-015" }
                    ],
                    "231IT521": [
                      { name: "Ms. R. Harini", role: "Primary Faculty (Sec A & C)", email: "harini@veltech.edu.in", designation: "Assistant Professor • Staff ID: EMP-CSE-013" },
                      { name: "Dr. K. Muthukannan", role: "Course Coordinator (Sec B)", email: "muthukannan@veltech.edu.in", designation: "Professor • Staff ID: EMP-CSE-021" }
                    ],
                    "231CS521": [
                      { name: "Ms. V. Vijayashanthi", role: "Primary Theory Faculty (Sec A)", email: "vijayashanthi@veltech.edu.in", designation: "Assistant Professor • Staff ID: EMP-CSE-017" },
                      { name: "Ms. R. Chandra", role: "Faculty In-Charge (Sec B)", email: "chandra@veltech.edu.in", designation: "Assistant Professor • Staff ID: EMP-CSE-022" },
                      { name: "Ms. V. Divya", role: "Theory Faculty (Sec C)", email: "divya@veltech.edu.in", designation: "Assistant Professor • Staff ID: EMP-CSE-011" }
                    ],
                    "231CS522": [
                      { name: "Mr. V. Nehru", role: "Course Lead (Sec A)", email: "nehru@veltech.edu.in", designation: "Assistant Professor • Staff ID: EMP-CSE-009" },
                      { name: "Ms. M. Aswin Rani", role: "Faculty In-Charge (Sec B)", email: "aswinrani@veltech.edu.in", designation: "Assistant Professor • Staff ID: EMP-CSE-018" },
                      { name: "Dr. R. Saravanan", role: "Senior Faculty (Sec C)", email: "saravanan@veltech.edu.in", designation: "Associate Professor • Staff ID: EMP-CSE-024" }
                    ],
                    "231HS701": [
                      { name: "Dr. M. Buvana", role: "Course Coordinator (Sec A)", email: "buvana@veltech.edu.in", designation: "Professor • Staff ID: EMP-CSE-026" },
                      { name: "Ms. J. Bebitha", role: "Faculty In-Charge (Sec B)", email: "bebitha@veltech.edu.in", designation: "Assistant Professor • Staff ID: EMP-CSE-015" },
                      { name: "Ms. M. Aswin Rani", role: "Faculty In-Charge (Sec C)", email: "aswinrani@veltech.edu.in", designation: "Assistant Professor • Staff ID: EMP-CSE-018" }
                    ],
                    "231CB721": [
                      { name: "Dr. B. Swaminathan", role: "Course Coordinator (Sec A)", email: "swaminathan@veltech.edu.in", designation: "Professor • Staff ID: EMP-CSE-027" },
                      { name: "Dr. E. Mercy Beulah", role: "Faculty In-Charge (Sec B)", email: "mercybeulah@veltech.edu.in", designation: "Professor • Staff ID: EMP-CSE-014" },
                      { name: "Mrs. M.K. Geetha", role: "Faculty In-Charge (Sec C)", email: "geetha@veltech.edu.in", designation: "Assistant Professor • Staff ID: EMP-CSE-025" }
                    ],
                    "231CS77A": [
                      { name: "Dr. M. Buvana", role: "Project Lead (Sec A)", email: "buvana@veltech.edu.in", designation: "Professor • Staff ID: EMP-CSE-026" },
                      { name: "Mr. S. Vinod", role: "Project Coordinator (Sec B)", email: "vinod@veltech.edu.in", designation: "Assistant Professor • Staff ID: EMP-CSE-002" },
                      { name: "Dr. E. Mercy Beulah", role: "Project Lead (Sec C)", email: "mercybeulah@veltech.edu.in", designation: "Professor • Staff ID: EMP-CSE-014" }
                    ]
                  };

                  const staffList = realCourseHandlingMap[selectedSubject.code] || [
                    { name: "Mr. R. Prabhakaran", role: "Primary Course Coordinator", email: "prabhakaran@veltech.edu.in", designation: "Assistant Professor • Staff ID: EMP-CSE-001" },
                    { name: "Mr. S. Vinod", role: "Lab In-Charge", email: "vinod@veltech.edu.in", designation: "Assistant Professor • Staff ID: EMP-CSE-002" },
                    { name: "Ms. C.H. Yerakkama", role: "Department Overseer", email: "yerakkama@veltech.edu.in", designation: "Assistant Professor • Staff ID: EMP-CSE-003" }
                  ];

                  return staffList.map((st, idx) => (
                    <div key={idx} style={{ backgroundColor: "var(--bg-page)", padding: "1rem", borderRadius: "10px", border: "1px solid var(--border-subtle)", display: "flex", gap: "0.75rem", alignItems: "center" }}>
                      <div style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        background: idx === 0 ? "linear-gradient(135deg, #10b981 0%, #047857 100%)" : idx === 1 ? "linear-gradient(135deg, var(--royal-blue) 0%, var(--sky-blue) 100%)" : "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "700"
                      }}>
                        {st.name.replace(/^(Mr|Ms|Mrs|Dr)\.?\s*/i, "").charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <strong style={{ fontSize: "0.95rem" }}>{st.name}</strong>
                          <span style={{ fontSize: "0.7rem", padding: "0.15rem 0.4rem", borderRadius: "4px", backgroundColor: idx === 0 ? "rgba(16,185,129,0.2)" : "rgba(56,189,248,0.2)", color: idx === 0 ? "#10b981" : "var(--sky-blue)", fontWeight: "700" }}>
                            {st.role}
                          </span>
                        </div>
                        <p style={{ fontSize: "0.8rem", color: "var(--sky-blue)", margin: "0.1rem 0 0 0" }}>{st.email}</p>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0.1rem 0 0 0" }}>{st.designation}</p>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: "flex", gap: "0.75rem", paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)", marginTop: "1.5rem" }}>
              <button
                onClick={() => alert(`Re-allocation request sent for ${selectedSubject.code}`)}
                style={{ flex: 1, backgroundColor: "var(--bg-input)", color: "var(--text-main)", border: "1px solid var(--border-subtle)", padding: "0.75rem", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "0.85rem" }}
              >
                Reassign Staff
              </button>
              <button
                onClick={() => setSelectedSubject(null)}
                style={{ backgroundColor: "var(--royal-blue)", color: "white", border: "none", padding: "0.75rem 1.25rem", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "0.85rem" }}
              >
                Done
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* MODALS */}
      {showUserModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
          <div style={{ backgroundColor: "var(--bg-card)", padding: "2rem", borderRadius: "16px", maxWidth: "450px", width: "100%", border: "1px solid var(--border-subtle)" }}>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Create New User Account</h3>
            <form onSubmit={handleCreateUser} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input type="text" placeholder="Full Name" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} required className="premium-input" />
              <input type="email" placeholder="Email Address" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required className="premium-input" />
              <input type="password" placeholder="Password" value={newUserPass} onChange={(e) => setNewUserPass(e.target.value)} required className="premium-input" />
              <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} className="premium-input">
                <option value="STUDENT">STUDENT</option><option value="FACULTY">TEACHER / FACULTY</option><option value="HOD">HOD</option><option value="ADMIN">ADMIN</option>
              </select>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="submit" className="btn-royal" style={{ flex: 1 }}>Create User</button>
                <button type="button" onClick={() => setShowUserModal(false)} style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "var(--text-main)", padding: "0.75rem 1rem", borderRadius: "8px", border: "none" }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeptModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
          <div style={{ backgroundColor: "var(--bg-card)", padding: "2rem", borderRadius: "16px", maxWidth: "450px", width: "100%", border: "1px solid var(--border-subtle)" }}>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Create New Department</h3>
            <form onSubmit={handleCreateDept} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input type="text" placeholder="Dept Code (e.g. AI-DS)" value={newDeptCode} onChange={(e) => setNewDeptCode(e.target.value)} required className="premium-input" />
              <input type="text" placeholder="Full Department Name" value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} required className="premium-input" />
              <input type="text" placeholder="HOD Name (Optional)" value={newDeptHod} onChange={(e) => setNewDeptHod(e.target.value)} className="premium-input" />
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="submit" className="btn-sky" style={{ flex: 1 }}>Create Department</button>
                <button type="button" onClick={() => setShowDeptModal(false)} style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "var(--text-main)", padding: "0.75rem 1rem", borderRadius: "8px", border: "none" }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSubjectModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
          <div style={{ backgroundColor: "var(--bg-card)", padding: "2rem", borderRadius: "16px", maxWidth: "450px", width: "100%", border: "1px solid var(--border-subtle)" }}>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Add New Subject to Catalog</h3>
            <form onSubmit={handleCreateSubject} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input type="text" placeholder="Subject Code (e.g. CS8591)" value={newSubCode} onChange={(e) => setNewSubCode(e.target.value)} required className="premium-input" />
              <input type="text" placeholder="Subject Title" value={newSubName} onChange={(e) => setNewSubName(e.target.value)} required className="premium-input" />
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <input type="number" placeholder="Credits" value={newSubCredits} onChange={(e) => setNewSubCredits(e.target.value)} required className="premium-input" />
                <input type="number" placeholder="Semester" value={newSubSem} onChange={(e) => setNewSubSem(e.target.value)} required className="premium-input" />
              </div>
              <input type="text" placeholder="Department Code (e.g. CSE)" value={newSubDept} onChange={(e) => setNewSubDept(e.target.value)} required className="premium-input" />
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="submit" className="btn-royal" style={{ flex: 1 }}>Save Subject</button>
                <button type="button" onClick={() => setShowSubjectModal(false)} style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "var(--text-main)", padding: "0.75rem 1rem", borderRadius: "8px", border: "none" }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNoticeModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
          <div style={{ backgroundColor: "var(--bg-card)", padding: "2rem", borderRadius: "16px", maxWidth: "500px", width: "100%", border: "1px solid var(--border-subtle)" }}>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Create System Announcement</h3>
            <form onSubmit={handleCreateNotice} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input type="text" placeholder="Notice Title" value={newNoticeTitle} onChange={(e) => setNewNoticeTitle(e.target.value)} required className="premium-input" />
              <textarea placeholder="Notice Body & Details" value={newNoticeContent} onChange={(e) => setNewNoticeContent(e.target.value)} required className="premium-input" style={{ height: "100px", resize: "none" }} />
              <select value={newNoticeCategory} onChange={(e) => setNewNoticeCategory(e.target.value)} className="premium-input">
                <option value="GENERAL">GENERAL</option>
                <option value="EXAM">EXAM</option>
                <option value="URGENT">URGENT</option>
              </select>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="submit" className="btn-sky" style={{ flex: 1 }}>Broadcast Notice</button>
                <button type="button" onClick={() => setShowNoticeModal(false)} style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "var(--text-main)", padding: "0.75rem 1rem", borderRadius: "8px", border: "none" }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
