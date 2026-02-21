import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FileText,
  Send,
  RefreshCw,
  Video,
  ClipboardCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  MessageSquare,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import api from "../services/api";
import BriefViewer from "../components/BriefViewer";
import PacketViewer from "../components/PacketViewer";
import SourcesPanel from "../components/SourcesPanel";

function SessionDetail() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [brief, setBrief] = useState(null);
  const [packet, setPacket] = useState(null);
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("brief");
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);

  const loadSession = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getSession(sessionId);
      setSession(data.session);
      setBrief(data.brief);
      setPacket(data.packet);
      setProfile(data.profile);
      setQuestions(data.questions);
      setCorrections(data.corrections || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (session?.status === "generating" || session?.status === "ingested") {
      const interval = setInterval(loadSession, 5000);
      return () => clearInterval(interval);
    }
  }, [session?.status, loadSession]);

  async function handleSendPacket() {
    try {
      setSending(true);
      await api.sendPacket(sessionId, {
        intervieweeEmail: session.intervieweeEmail,
        feedbackBaseUrl: window.location.origin,
      });
      await loadSession();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function handleUpdateBrief() {
    try {
      setUpdating(true);
      await api.updateBrief(sessionId);
      await loadSession();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        <p>Loading session...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="status-bar danger">
        <AlertCircle size={16} />
        {error || "Session not found"}
      </div>
    );
  }

  const isGenerating = ["creating", "generating", "ingested"].includes(session.status);
  const briefReady = ["generated", "ready", "packet_sent", "feedback_received", "updated", "completed"].includes(session.status);
  const hasFeedback = session.status === "feedback_received" || corrections.length > 0;
  const canSend = briefReady && !["packet_sent", "feedback_received", "updated", "completed"].includes(session.status);
  const canUpdate = hasFeedback && session.status !== "completed";

  const tabs = [
    { id: "brief", label: "Interviewer Brief", icon: FileText },
    { id: "packet", label: "Interviewee Packet", icon: Send },
    { id: "sources", label: "Sources & Transparency", icon: Shield },
  ];
  if (corrections.length > 0) {
    tabs.push({ id: "corrections", label: `Corrections (${corrections.length})`, icon: MessageSquare });
  }

  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>{session.companyName}</h1>
          <p style={{ color: "var(--tamu-gray-500)", marginTop: 4 }}>
            {session.leaderName && `${session.leaderName} · `}
            Session {sessionId}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {canSend && (
            <button className="btn btn-primary" onClick={handleSendPacket} disabled={sending}>
              {sending ? <span className="spinner" /> : <Send size={16} />}
              Send Pre-Packet
            </button>
          )}
          {canUpdate && (
            <button className="btn btn-success" onClick={handleUpdateBrief} disabled={updating}>
              {updating ? <span className="spinner" /> : <RefreshCw size={16} />}
              Update Brief with Corrections
            </button>
          )}
          {briefReady && (
            <Link to={`/interview/${sessionId}`} className="btn btn-secondary">
              <Video size={16} />
              Live Interview
            </Link>
          )}
          {session.status === "updated" || session.status === "feedback_received" ? (
            <Link to={`/synthesis/${sessionId}`} className="btn btn-secondary">
              <ClipboardCheck size={16} />
              Post-Call Synthesis
            </Link>
          ) : null}
        </div>
      </div>

      {/* Status Timeline */}
      <div className="card mb-4">
        <div className="card-body" style={{ padding: "16px 24px" }}>
          <div style={{ display: "flex", gap: 0, alignItems: "center" }}>
            {[
              { key: "created", label: "Created" },
              { key: "generated", label: "Brief Generated" },
              { key: "packet_sent", label: "Packet Sent" },
              { key: "feedback_received", label: "Feedback" },
              { key: "updated", label: "Brief Updated" },
              { key: "completed", label: "Completed" },
            ].map((step, idx, arr) => {
              const statusOrder = ["created", "generating", "ingested", "generated", "ready", "packet_sent", "feedback_received", "updated", "completed"];
              const currentIdx = statusOrder.indexOf(session.status);
              const stepIdx = statusOrder.indexOf(step.key);
              const isActive = stepIdx <= currentIdx;
              const isCurrent = step.key === session.status || (session.status === "ready" && step.key === "generated");

              return (
                <React.Fragment key={step.key}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "0 0 auto" }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: isActive ? "var(--tamu-maroon)" : "var(--tamu-gray-200)",
                        color: isActive ? "white" : "var(--tamu-gray-400)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 600,
                        border: isCurrent ? "2px solid var(--tamu-gold)" : "none",
                      }}
                    >
                      {isActive ? <CheckCircle2 size={14} /> : idx + 1}
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        marginTop: 4,
                        color: isActive ? "var(--tamu-gray-700)" : "var(--tamu-gray-400)",
                        fontWeight: isCurrent ? 600 : 400,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < arr.length - 1 && (
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        background: isActive ? "var(--tamu-maroon)" : "var(--tamu-gray-200)",
                        margin: "0 8px",
                        marginBottom: 20,
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {isGenerating && (
        <div className="card mb-4">
          <div className="card-body loading-overlay" style={{ padding: 40 }}>
            <div className="spinner" />
            <h3>Generating Intelligence Brief...</h3>
            <p style={{ color: "var(--tamu-gray-500)" }}>
              Analyzing sources, extracting entities, and crafting your interview preparation materials.
              This typically takes 30-60 seconds.
            </p>
          </div>
        </div>
      )}

      {briefReady && (
        <>
          <div style={{ display: "flex", gap: 2, marginBottom: -1, position: "relative", zIndex: 1 }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "12px 20px",
                  border: "1px solid var(--tamu-gray-200)",
                  borderBottom: activeTab === tab.id ? "1px solid white" : "1px solid var(--tamu-gray-200)",
                  background: activeTab === tab.id ? "white" : "var(--tamu-gray-50)",
                  borderRadius: "var(--radius) var(--radius) 0 0",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 14,
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  color: activeTab === tab.id ? "var(--tamu-maroon)" : "var(--tamu-gray-600)",
                }}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="card" style={{ borderTopLeftRadius: 0 }}>
            <div className="card-body">
              {activeTab === "brief" && <BriefViewer brief={brief} corrections={corrections} />}
              {activeTab === "packet" && <PacketViewer packet={packet} sessionId={sessionId} />}
              {activeTab === "sources" && <SourcesPanel session={session} profile={profile} />}
              {activeTab === "corrections" && <CorrectionsView corrections={corrections} />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CorrectionsView({ corrections }) {
  const typeColors = {
    factual_error: "badge-danger",
    missing_context: "badge-warning",
    outdated: "badge-info",
    nuance: "badge-neutral",
  };

  return (
    <div>
      <h3 className="section-title">Interviewee Corrections</h3>
      <p style={{ color: "var(--tamu-gray-500)", fontSize: 14, marginBottom: 20 }}>
        These corrections from the interviewee should anchor your conversation opening.
      </p>
      <div className="coaching-cue mb-4">
        [COACHING: Open with "Thanks for reviewing the packet. Let's start with what we got wrong."]
      </div>
      {corrections.map((c, idx) => (
        <div
          key={idx}
          style={{
            padding: 16,
            border: "1px solid var(--tamu-gray-200)",
            borderRadius: "var(--radius)",
            marginBottom: 12,
          }}
        >
          <div className="flex-between mb-2">
            <span className={`badge ${typeColors[c.correctionType] || "badge-neutral"}`}>
              {(c.correctionType || "correction").replace("_", " ")}
            </span>
            <span style={{ fontSize: 12, color: "var(--tamu-gray-400)" }}>{c.timestamp}</span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "var(--tamu-gray-500)", textTransform: "uppercase", fontWeight: 600 }}>
              Original Assertion:
            </span>
            <p style={{ fontSize: 14, color: "var(--tamu-gray-600)", textDecoration: "line-through" }}>
              {c.originalAssertion}
            </p>
          </div>
          <div>
            <span style={{ fontSize: 12, color: "var(--success)", textTransform: "uppercase", fontWeight: 600 }}>
              Correction:
            </span>
            <p style={{ fontSize: 14, fontWeight: 500 }}>{c.correction}</p>
          </div>
          {c.intervieweeNote && (
            <p style={{ fontSize: 13, color: "var(--tamu-gray-500)", marginTop: 8, fontStyle: "italic" }}>
              Note: {c.intervieweeNote}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default SessionDetail;
