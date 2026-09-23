"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Database, Loader2, Paperclip } from "lucide-react";

export default function AdminAgentChat({ onTimetableUpdated }: { onTimetableUpdated?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "agent"; content: string; data?: any }[]>([
    { role: "agent", content: "Hello! I am your local database agent. Ask me to fetch or search data (e.g., 'fetch timetable for CSE A', 'search faculty Smith')." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [pendingConflicts, setPendingConflicts] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (pendingConflicts && pendingConflicts.length > 0) {
      setIsOpen(true);
      setIsConfirming(true);
      setMessages(prev => [...prev, {
        role: "agent",
        content: `I found ${pendingConflicts.length} records that conflict with existing timetable data (e.g. different subject or faculty). Do you want me to **update** the database with these new records, or **skip** them?`,
        data: { conflicts: pendingConflicts }
      }]);
    }
  }, [pendingConflicts]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setMessages(prev => [...prev, { role: "user", content: `(Uploaded ${file.name})` }]);
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("/api/admin/timetable/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        let msg = `Inserted ${data.count} new records. Skipped ${data.skippedCount} exact duplicates.`;
        if (data.conflicts && data.conflicts.length > 0) {
           setPendingConflicts(data.conflicts);
        } else {
           setMessages(prev => [...prev, { role: "agent", content: msg + " No conflicts found." }]);
           if (onTimetableUpdated) onTimetableUpdated();
        }
      } else {
        setMessages(prev => [...prev, { role: "agent", content: "Error uploading file: " + (data.error || JSON.stringify(data.details)) }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "agent", content: "Failed to upload excel file." }]);
    } finally {
      setIsLoading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    if (isConfirming) {
       const lowerMsg = userMessage.toLowerCase();
       if (lowerMsg.includes("update") || lowerMsg.includes("yes")) {
         try {
           const res = await fetch("/api/admin/timetable/confirm", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ conflicts: pendingConflicts })
           });
           const data = await res.json();
           if (data.success) {
             setMessages(prev => [...prev, { role: "agent", content: `Successfully updated ${data.count} records.` }]);
             if (onTimetableUpdated) onTimetableUpdated();
           } else {
             setMessages(prev => [...prev, { role: "agent", content: `Error updating: ${data.error}` }]);
           }
         } catch (e) {
           setMessages(prev => [...prev, { role: "agent", content: "Failed to confirm updates." }]);
         }
       } else if (lowerMsg.includes("skip") || lowerMsg.includes("no")) {
         setMessages(prev => [...prev, { role: "agent", content: "Skipped conflicting records." }]);
       } else {
         setMessages(prev => [...prev, { role: "agent", content: "Please reply with 'update' to apply the changes, or 'skip' to ignore them." }]);
         setIsLoading(false);
         return;
       }
       
       setIsConfirming(false);
       setPendingConflicts([]);
       setIsLoading(false);
       return;
    }

    try {
      const res = await fetch("/api/admin/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        role: "agent", 
        content: data.reply || "Done.", 
        data: data.data 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "agent", content: "Error connecting to local agent." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          backgroundColor: "var(--royal-blue)",
          color: "white",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          cursor: "pointer",
          border: "none",
          zIndex: 9999
        }}
      >
        <Database size={28} />
      </button>
    );
  }

  return (
    <div style={{
      position: "fixed",
      bottom: "2rem",
      right: "2rem",
      width: "380px",
      height: "550px",
      backgroundColor: "var(--bg-card)",
      borderRadius: "16px",
      boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
      display: "flex",
      flexDirection: "column",
      border: "1px solid var(--border-subtle)",
      zIndex: 9999,
      overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{
        padding: "1rem",
        backgroundColor: "var(--royal-blue)",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "600" }}>
          <Database size={18} />
          Local DB Agent
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem", backgroundColor: "var(--bg-main)" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ 
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "85%"
          }}>
            <div style={{
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              backgroundColor: m.role === "user" ? "var(--sky-blue)" : "var(--bg-input)",
              color: m.role === "user" ? "white" : "var(--text-main)",
              border: m.role === "agent" ? "1px solid var(--border-subtle)" : "none",
              fontSize: "0.9rem",
              lineHeight: "1.4"
            }}>
              {m.content}
            </div>
            {m.data && (
              <div style={{ 
                marginTop: "0.5rem", 
                display: "flex", 
                flexDirection: "column", 
                gap: "0.5rem",
                maxHeight: "300px",
                overflowY: "auto",
                paddingRight: "0.25rem"
              }}>
                {Array.isArray(m.data) ? (
                  m.data.map((item, idx) => (
                    <div key={idx} style={{ padding: "0.5rem", backgroundColor: "var(--bg-input)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                      {typeof item === 'object' && item !== null ? (
                        Object.entries(item).map(([key, val]) => (
                          <div key={key} style={{ fontSize: "0.8rem", marginBottom: "0.25rem", color: "var(--text-main)" }}>
                            <strong style={{ color: "var(--royal-blue)" }}>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: "0.8rem", color: "var(--text-main)" }}>{String(item)}</div>
                      )}
                    </div>
                  ))
                ) : typeof m.data === 'object' && m.data !== null ? (
                  <div style={{ padding: "0.5rem", backgroundColor: "var(--bg-input)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                    {Object.entries(m.data).map(([key, val]) => (
                      <div key={key} style={{ fontSize: "0.8rem", marginBottom: "0.25rem", color: "var(--text-main)" }}>
                        <strong style={{ color: "var(--royal-blue)" }}>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: "0.8rem", padding: "0.5rem", backgroundColor: "var(--bg-input)", borderRadius: "8px" }}>
                    {String(m.data)}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div style={{ alignSelf: "flex-start", padding: "0.75rem", color: "var(--text-muted)" }}>
            <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "1rem", borderTop: "1px solid var(--border-subtle)", display: "flex", gap: "0.5rem", backgroundColor: "var(--bg-card)" }}>
        <label style={{
            padding: "0.75rem",
            borderRadius: "8px",
            backgroundColor: "var(--bg-input)",
            color: "var(--text-main)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--border-subtle)",
          }}>
          <Paperclip size={18} />
          <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} style={{ display: "none" }} />
        </label>
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Ask me to search or fetch..."
          style={{
            flex: 1,
            padding: "0.75rem",
            borderRadius: "8px",
            border: "1px solid var(--border-subtle)",
            backgroundColor: "var(--bg-input)",
            color: "var(--text-main)",
            outline: "none"
          }}
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          style={{
            padding: "0.75rem",
            borderRadius: "8px",
            backgroundColor: "var(--royal-blue)",
            color: "white",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: (!input.trim() || isLoading) ? 0.6 : 1
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
