import React, { useState } from "react";
import {
  Shield,
  Eye,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  FileSearch,
  Users,
  Activity,
} from "lucide-react";

function GovernanceDashboard() {
  const [activeSection, setActiveSection] = useState("audit");

  const mockAuditLog = [
    { time: "2025-03-15 10:32:01", user: "student@tamu.edu", action: "CREATE_SESSION", resource: "abc123", sources: ["company website", "linkedin"] },
    { time: "2025-03-15 10:32:45", user: "system", action: "INGEST_SOURCES", resource: "abc123", sources: ["2 URLs processed"] },
    { time: "2025-03-15 10:33:12", user: "system", action: "GENERATE_BRIEF", resource: "abc123", sources: ["bedrock_claude", "url_content"] },
    { time: "2025-03-15 10:33:15", user: "system", action: "QUALITY_CHECK", resource: "abc123", sources: ["score: 85/100"] },
    { time: "2025-03-15 10:45:00", user: "student@tamu.edu", action: "SEND_PACKET", resource: "abc123", sources: ["email delivery"] },
    { time: "2025-03-15 14:20:00", user: "interviewee", action: "SUBMIT_CORRECTIONS", resource: "abc123", sources: ["2 corrections, 3 questions selected"] },
    { time: "2025-03-15 14:20:30", user: "student@tamu.edu", action: "UPDATE_BRIEF", resource: "abc123", sources: ["corrections integrated"] },
    { time: "2025-03-16 09:30:00", user: "student@tamu.edu", action: "POST_CALL_SYNTHESIS", resource: "abc123", sources: ["interview notes mapped"] },
  ];

  const sections = [
    { id: "audit", label: "Audit Log", icon: FileSearch },
    { id: "consent", label: "Consent Tracking", icon: Lock },
    { id: "triggers", label: "Explicit Triggers", icon: Activity },
    { id: "transparency", label: "Transparency", icon: Eye },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Governance Dashboard</h1>
        <p style={{ color: "var(--tamu-gray-500)", marginTop: 4 }}>
          Trust, safety, and compliance monitoring for the Texas Insights Engine
        </p>
      </div>

      {/* Governance Stats */}
      <div className="grid-3 mb-6" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {[
          { label: "Explicit Triggers", value: "100%", desc: "No proactive AI actions", icon: Shield, color: "var(--success)" },
          { label: "Source Transparency", value: "100%", desc: "All assertions tagged", icon: Eye, color: "var(--info)" },
          { label: "Consent Tracked", value: "100%", desc: "All packets consented", icon: Lock, color: "var(--tamu-maroon)" },
          { label: "Audit Coverage", value: "100%", desc: "All actions logged", icon: FileSearch, color: "var(--tamu-gold)" },
        ].map((stat) => (
          <div className="card" key={stat.label}>
            <div className="card-body" style={{ textAlign: "center", padding: 20 }}>
              <stat.icon size={24} color={stat.color} style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{stat.label}</div>
              <div style={{ fontSize: 11, color: "var(--tamu-gray-500)" }}>{stat.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`btn ${activeSection === s.id ? "btn-primary" : "btn-secondary"}`}
          >
            <s.icon size={16} />
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === "audit" && (
        <div className="card">
          <div className="card-header">
            <h2>Audit Trail</h2>
            <span style={{ fontSize: 13, color: "var(--tamu-gray-500)" }}>
              Every system action is logged with full provenance
            </span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--tamu-gray-50)", textAlign: "left" }}>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Timestamp</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>User</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Action</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Resource</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {mockAuditLog.map((entry, idx) => (
                  <tr
                    key={idx}
                    style={{ borderTop: "1px solid var(--tamu-gray-100)" }}
                  >
                    <td style={{ padding: "10px 16px", fontFamily: "monospace", fontSize: 12 }}>
                      {entry.time}
                    </td>
                    <td style={{ padding: "10px 16px" }}>{entry.user}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <span className="badge badge-info">{entry.action}</span>
                    </td>
                    <td style={{ padding: "10px 16px", fontFamily: "monospace" }}>{entry.resource}</td>
                    <td style={{ padding: "10px 16px", color: "var(--tamu-gray-500)" }}>
                      {entry.sources.join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === "consent" && (
        <div className="card">
          <div className="card-header">
            <h2>Consent Model</h2>
          </div>
          <div className="card-body">
            <div className="grid-2">
              {[
                {
                  title: "Opt-In Only",
                  desc: "No data is sent to an interviewee without the interviewer explicitly clicking 'Send Pre-Packet.' This is the primary consent gate.",
                  status: "Active",
                },
                {
                  title: "Interviewee Consent",
                  desc: "Pre-packet footer includes clear statement of data sources and an opt-out link. Corrections are deleted on opt-out.",
                  status: "Active",
                },
                {
                  title: "Proprietary Data Consent",
                  desc: "Admins uploading TAMU documents must confirm authority to share. Upload consent is logged.",
                  status: "Active",
                },
                {
                  title: "Data Retention",
                  desc: "Interview data retained for academic term + 1 year. Interviewees can request deletion at any time.",
                  status: "Policy Set",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    padding: 16,
                    border: "1px solid var(--tamu-gray-200)",
                    borderRadius: "var(--radius)",
                  }}
                >
                  <div className="flex-between mb-2">
                    <h4 style={{ fontWeight: 600 }}>{item.title}</h4>
                    <span className="badge badge-success">{item.status}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--tamu-gray-600)" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === "triggers" && (
        <div className="card">
          <div className="card-header">
            <h2>Explicit Trigger History</h2>
            <span className="badge badge-success">No proactive AI actions</span>
          </div>
          <div className="card-body">
            <div className="status-bar success mb-4">
              <CheckCircle2 size={16} />
              Every research action requires a user click. No background data fetching occurs.
            </div>
            <div style={{ fontSize: 14, lineHeight: 2 }}>
              <p><strong>Trigger 1 — "Create Session"</strong>: Student explicitly creates a session and provides URLs. This starts all downstream AI work.</p>
              <p><strong>Trigger 2 — "Send Packet"</strong>: Interviewer explicitly clicks to send the pre-packet. No automatic sending.</p>
              <p><strong>Trigger 3 — "Update Brief"</strong>: Interviewer explicitly regenerates brief with corrections.</p>
              <p><strong>Trigger 4 — "Generate Synthesis"</strong>: Interviewer explicitly triggers post-call synthesis.</p>
            </div>
            <div className="divider" />
            <h4 className="section-title">Rate Limits</h4>
            <div className="status-bar info">
              <AlertTriangle size={16} />
              Maximum 5 brief generations per user per day (hackathon). Prevents mass profiling.
            </div>
          </div>
        </div>
      )}

      {activeSection === "transparency" && (
        <div className="card">
          <div className="card-header">
            <h2>Transparency Controls</h2>
          </div>
          <div className="card-body">
            <div className="grid-2">
              {[
                {
                  title: "Source Tagging",
                  desc: "Every assertion tagged with [Public], [Proprietary: docName], or [LLM Inference]",
                  icon: Eye,
                },
                {
                  title: "PII Detection",
                  desc: "Amazon Comprehend PII detection on all outputs before sending. SSN, phone, personal email redacted.",
                  icon: Shield,
                },
                {
                  title: "Encryption",
                  desc: "S3 server-side encryption (AES-256). DynamoDB encryption at rest. All API endpoints require Cognito auth.",
                  icon: Lock,
                },
                {
                  title: "No Web Scraping",
                  desc: "Hackathon: LLM knowledge only. Production: opt-in RSS feeds with admin approval.",
                  icon: Activity,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    padding: 16,
                    border: "1px solid var(--tamu-gray-200)",
                    borderRadius: "var(--radius)",
                    display: "flex",
                    gap: 12,
                  }}
                >
                  <item.icon size={20} color="var(--tamu-maroon)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: 4 }}>{item.title}</h4>
                    <p style={{ fontSize: 13, color: "var(--tamu-gray-600)" }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GovernanceDashboard;
