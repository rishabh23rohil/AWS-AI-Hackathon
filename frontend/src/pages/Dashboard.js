import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import api from "../services/api";

const STATUS_CONFIG = {
  created: { label: "Created", badge: "badge-neutral" },
  generating: { label: "Generating Brief...", badge: "badge-info" },
  ingested: { label: "Sources Ingested", badge: "badge-info" },
  generated: { label: "Brief Ready", badge: "badge-success" },
  ready: { label: "Ready", badge: "badge-success" },
  packet_sent: { label: "Packet Sent", badge: "badge-warning" },
  feedback_received: { label: "Feedback Received", badge: "badge-success" },
  updated: { label: "Brief Updated", badge: "badge-success" },
  completed: { label: "Completed", badge: "badge-success" },
  quality_failed: { label: "Quality Review", badge: "badge-danger" },
  opted_out: { label: "Opted Out", badge: "badge-danger" },
};

function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      setLoading(true);
      const data = await api.listSessions();
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    total: sessions.length,
    active: sessions.filter((s) =>
      ["generated", "ready", "packet_sent", "feedback_received", "updated"].includes(s.status)
    ).length,
    completed: sessions.filter((s) => s.status === "completed").length,
    generating: sessions.filter((s) =>
      ["creating", "generating", "ingested"].includes(s.status)
    ).length,
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        <p>Loading your sessions...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between mb-6">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--tamu-gray-900)" }}>
            Dashboard
          </h1>
          <p style={{ color: "var(--tamu-gray-500)", marginTop: 4 }}>
            Manage your business intelligence interview sessions
          </p>
        </div>
        <Link to="/create" className="btn btn-primary btn-lg">
          <PlusCircle size={18} />
          New Session
        </Link>
      </div>

      {error && (
        <div className="status-bar danger mb-4">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="grid-3 mb-6" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {[
          { label: "Total Sessions", value: stats.total, icon: Building2, color: "var(--tamu-maroon)" },
          { label: "Active", value: stats.active, icon: Sparkles, color: "var(--info)" },
          { label: "Generating", value: stats.generating, icon: Clock, color: "var(--warning)" },
          { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "var(--success)" },
        ].map((stat) => (
          <div className="card" key={stat.label}>
            <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "var(--radius)",
                  background: `${stat.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <stat.icon size={22} color={stat.color} />
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 13, color: "var(--tamu-gray-500)" }}>{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sessions.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Building2 size={48} style={{ marginBottom: 16, color: "var(--tamu-gray-300)" }} />
            <h3>No sessions yet</h3>
            <p style={{ marginBottom: 20 }}>
              Create your first interview session to get started
            </p>
            <Link to="/create" className="btn btn-primary">
              <PlusCircle size={16} />
              Create First Session
            </Link>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h2>Interview Sessions</h2>
            <span style={{ fontSize: 13, color: "var(--tamu-gray-500)" }}>
              {sessions.length} total
            </span>
          </div>
          <div>
            {sessions.map((session) => {
              const statusCfg = STATUS_CONFIG[session.status] || STATUS_CONFIG.created;
              return (
                <Link
                  key={session.sessionId}
                  to={`/session/${session.sessionId}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 24px",
                    borderBottom: "1px solid var(--tamu-gray-100)",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "background 0.1s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--tamu-gray-50)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "var(--radius)",
                        background: "var(--tamu-maroon)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 16,
                      }}
                    >
                      {(session.companyName || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{session.companyName}</div>
                      <div style={{ fontSize: 13, color: "var(--tamu-gray-500)" }}>
                        {session.leaderName && `${session.leaderName} · `}
                        {session.createdAt && new Date(session.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span className={`badge ${statusCfg.badge}`}>{statusCfg.label}</span>
                    {session.qualityScore && (
                      <span className="badge badge-info">Q: {session.qualityScore}</span>
                    )}
                    <ChevronRight size={16} color="var(--tamu-gray-400)" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
