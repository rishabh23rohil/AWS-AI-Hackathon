import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Mic,
  Video,
  CheckCircle2,
  XCircle,
  ChevronRight,
  MessageSquare,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import api from "../services/api";

function LiveInterview() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [brief, setBrief] = useState(null);
  const [corrections, setCorrections] = useState([]);
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentPhase, setCurrentPhase] = useState("opening");
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [notes, setNotes] = useState({
    corrections: [],
    keyInsights: [],
    surprises: [],
    constraints: [],
    followUpActions: [],
  });
  const [noteInput, setNoteInput] = useState("");
  const [noteCategory, setNoteCategory] = useState("keyInsights");
  const [mergeDecisions, setMergeDecisions] = useState([]);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  const loadSession = useCallback(async () => {
    try {
      const data = await api.getSession(sessionId);
      setSession(data.session);
      setBrief(data.brief);
      setCorrections(data.corrections || []);
      setQuestions(data.questions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    let interval;
    if (timerRunning) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function addNote() {
    if (!noteInput.trim()) return;
    setNotes((prev) => ({
      ...prev,
      [noteCategory]: [...prev[noteCategory], noteInput.trim()],
    }));
    setNoteInput("");
  }

  function handleMerge(suggestion, accepted) {
    setMergeDecisions((prev) => [...prev, { suggestion, accepted, timestamp: timer }]);
    if (accepted) {
      setNotes((prev) => ({
        ...prev,
        keyInsights: [...prev.keyInsights, `[AI] ${suggestion}`],
      }));
    }
  }

  const phases = [
    { id: "opening", label: "Opening", time: "2 min", color: "var(--tamu-maroon)" },
    { id: "corrections", label: "Corrections", time: "5 min", color: "var(--warning)" },
    { id: "selected", label: "Selected Qs", time: "15 min", color: "var(--info)" },
    { id: "additional", label: "AI Questions", time: "8 min", color: "var(--success)" },
    { id: "wrapup", label: "Wrap-Up", time: "3 min", color: "var(--tamu-gold)" },
  ];

  const allQuestions = questions?.questions || [];
  const selectedQIds = session?.selectedQuestions || [];
  const selectedQs = allQuestions.filter((q) => selectedQIds.includes(q.id));
  const additionalQs = allQuestions.filter((q) => !selectedQIds.includes(q.id));

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        <p>Loading interview materials...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex-between mb-4">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>
            Live Interview: {session?.companyName}
          </h1>
          <p style={{ color: "var(--tamu-gray-500)" }}>
            {session?.leaderName && `With ${session.leaderName}`}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              fontFamily: "monospace",
              color: timerRunning ? "var(--tamu-maroon)" : "var(--tamu-gray-400)",
            }}
          >
            {formatTime(timer)}
          </div>
          <button
            className={`btn ${timerRunning ? "btn-danger" : "btn-primary"}`}
            onClick={() => setTimerRunning(!timerRunning)}
          >
            <Clock size={16} />
            {timerRunning ? "Pause" : "Start Timer"}
          </button>
        </div>
      </div>

      {/* Phase Navigator */}
      <div className="card mb-4">
        <div className="card-body" style={{ padding: "12px 20px" }}>
          <div style={{ display: "flex", gap: 8 }}>
            {phases.map((phase) => (
              <button
                key={phase.id}
                onClick={() => setCurrentPhase(phase.id)}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  border: currentPhase === phase.id ? `2px solid ${phase.color}` : "1px solid var(--tamu-gray-200)",
                  borderRadius: "var(--radius)",
                  background: currentPhase === phase.id ? `${phase.color}10` : "white",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13, color: phase.color }}>{phase.label}</div>
                <div style={{ fontSize: 11, color: "var(--tamu-gray-400)" }}>{phase.time}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: "1fr 380px" }}>
        {/* Left: Interview Guide */}
        <div>
          {currentPhase === "opening" && (
            <div className="card">
              <div className="card-header">
                <h2>Opening (2 minutes)</h2>
              </div>
              <div className="card-body">
                <div className="coaching-cue mb-4">
                  [START HERE: "Thanks for reviewing the packet. What did we get wrong?"]
                </div>
                <div className="coaching-cue mb-4">
                  [LET THEM TALK. Do not interrupt. Take notes on corrections.]
                </div>
                {corrections.length > 0 ? (
                  <div className="status-bar success mb-4">
                    <CheckCircle2 size={16} />
                    Interviewee submitted {corrections.length} correction(s). Review them below.
                  </div>
                ) : (
                  <div className="status-bar warning mb-4">
                    <AlertTriangle size={16} />
                    No pre-packet response received. Open with: "We prepared some thoughts — how close are we?"
                  </div>
                )}
                <div style={{ marginTop: 16 }}>
                  <h4 className="section-title">What We Think We Know</h4>
                  {brief?.page1_companyContext?.whatWeThinkWeKnow?.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: 12,
                        border: "1px solid var(--tamu-gray-200)",
                        borderRadius: "var(--radius)",
                        marginBottom: 8,
                        background: item.wasCorrection ? "var(--danger-bg)" : "white",
                      }}
                    >
                      <div style={{ fontSize: 14 }}>{item.assertion}</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                        <span className={`confidence-${(item.confidence || "").toLowerCase()}`} style={{ fontSize: 12 }}>
                          [{item.confidence}]
                        </span>
                        <span className={`source-tag source-${(item.sourceType || "public").toLowerCase()}`}>
                          {item.sourceType}
                        </span>
                      </div>
                      {item.correctionNote && (
                        <div style={{ marginTop: 8, padding: 8, background: "var(--danger-bg)", borderRadius: 4, fontSize: 13 }}>
                          Correction: {item.correctionNote}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentPhase === "corrections" && (
            <div className="card">
              <div className="card-header">
                <h2>Corrections Deep Dive (5 minutes)</h2>
              </div>
              <div className="card-body">
                <div className="coaching-cue mb-4">
                  [ASK: "What surprised you about what we had?" — capture each correction as a structured delta]
                </div>
                {corrections.length > 0 ? (
                  corrections.map((c, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: 16,
                        border: "2px solid var(--warning)",
                        borderRadius: "var(--radius)",
                        marginBottom: 12,
                        background: "var(--warning-bg)",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: 13, color: "var(--warning)", marginBottom: 4 }}>
                        CORRECTION #{idx + 1} — {(c.correctionType || "").replace("_", " ").toUpperCase()}
                      </div>
                      <div style={{ fontSize: 14, textDecoration: "line-through", color: "var(--tamu-gray-500)", marginBottom: 4 }}>
                        {c.originalAssertion}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{c.correction}</div>
                      <div className="coaching-cue mt-4" style={{ margin: "8px 0 0 0" }}>
                        [PROBE: Ask why this matters. What does this correction reveal about the business?]
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No corrections submitted. Proceed to selected questions.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {(currentPhase === "selected" || currentPhase === "additional") && (
            <div className="card">
              <div className="card-header">
                <h2>
                  {currentPhase === "selected"
                    ? `Selected Questions (${selectedQs.length > 0 ? selectedQs.length : allQuestions.length})`
                    : `Additional Questions (${additionalQs.length})`}
                </h2>
              </div>
              <div className="card-body">
                {currentPhase === "selected" && (
                  <div className="coaching-cue mb-4">
                    [PROBE deeper on each. Use silence as a tool. Don't rush to the next question.]
                  </div>
                )}
                {currentPhase === "additional" && (
                  <div className="coaching-cue mb-4">
                    [SKIP if time is short. Prioritize depth over breadth.]
                  </div>
                )}
                {(currentPhase === "selected" ? (selectedQs.length > 0 ? selectedQs : allQuestions.slice(0, 5)) : additionalQs).map(
                  (q, idx) => (
                    <div
                      key={q.id}
                      style={{
                        padding: 16,
                        border: currentQuestionIdx === idx && currentPhase === "selected"
                          ? "2px solid var(--tamu-maroon)"
                          : "1px solid var(--tamu-gray-200)",
                        borderRadius: "var(--radius)",
                        marginBottom: 12,
                        cursor: "pointer",
                      }}
                      onClick={() => setCurrentQuestionIdx(idx)}
                    >
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{q.question}</div>
                      <div style={{ fontSize: 13, color: "var(--info)", marginBottom: 4 }}>
                        Follow-up: "{q.followUpStem}"
                      </div>
                      <div style={{ fontSize: 12, color: "var(--tamu-gray-500)", marginBottom: 4 }}>
                        Objective: {q.objective}
                      </div>
                      <div className="coaching-cue" style={{ margin: "8px 0 0 0" }}>
                        [{q.coachingCue}]
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {currentPhase === "wrapup" && (
            <div className="card">
              <div className="card-header">
                <h2>Wrap-Up (3 minutes)</h2>
              </div>
              <div className="card-body">
                <div className="coaching-cue mb-4">
                  [Before hanging up, confirm top 3 constraints]
                </div>
                <div style={{ padding: 16, border: "1px solid var(--tamu-gray-200)", borderRadius: "var(--radius)", marginBottom: 16 }}>
                  <h4 style={{ fontWeight: 600, marginBottom: 8 }}>Closing Protocol</h4>
                  <ol style={{ paddingLeft: 20, fontSize: 14, lineHeight: 2 }}>
                    <li>Thank the interviewee for their time and corrections</li>
                    <li>Confirm top 3 constraints they face</li>
                    <li>Ask: "Is there anyone else we should speak with?"</li>
                    <li>Ask permission to share a summary of insights</li>
                    <li>Confirm any follow-up actions</li>
                  </ol>
                </div>
                <div className="coaching-cue">
                  [MERGE/NOT MERGE: Review all AI-suggested notes now. Accept or reject each.]
                </div>
                <div className="mt-4" style={{ textAlign: "center" }}>
                  <Link
                    to={`/synthesis/${sessionId}`}
                    className="btn btn-primary btn-lg"
                  >
                    <Sparkles size={18} />
                    Begin Post-Call Synthesis
                    <ArrowRight size={18} />
                  </Link>
                  <p style={{ fontSize: 12, color: "var(--tamu-gray-400)", marginTop: 8 }}>
                    Complete within 10 minutes while memory is fresh
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Notes Panel */}
        <div>
          <div className="card" style={{ position: "sticky", top: 80 }}>
            <div className="card-header">
              <h2>Live Notes</h2>
              <span style={{ fontSize: 12, color: "var(--tamu-gray-500)" }}>
                {Object.values(notes).flat().length} notes
              </span>
            </div>
            <div className="card-body">
              <div style={{ marginBottom: 16 }}>
                <select
                  value={noteCategory}
                  onChange={(e) => setNoteCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid var(--tamu-gray-300)",
                    borderRadius: "var(--radius)",
                    fontSize: 13,
                    marginBottom: 8,
                  }}
                >
                  <option value="corrections">Corrections</option>
                  <option value="keyInsights">Key Insights</option>
                  <option value="surprises">Surprises</option>
                  <option value="constraints">Constraints</option>
                  <option value="followUpActions">Follow-Up Actions</option>
                </select>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addNote())}
                    placeholder="Type a note and press Enter..."
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      border: "1px solid var(--tamu-gray-300)",
                      borderRadius: "var(--radius)",
                      fontSize: 13,
                    }}
                  />
                  <button className="btn btn-primary btn-sm" onClick={addNote}>
                    Add
                  </button>
                </div>
              </div>

              {/* Merge/Not Merge Suggestions */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--tamu-gray-500)", marginBottom: 8, textTransform: "uppercase" }}>
                  AI Suggestions
                </div>
                {["Consider asking about their pricing strategy", "Probe deeper on their competitive moat"].map(
                  (suggestion, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: 10,
                        border: "1px solid var(--info)",
                        borderRadius: "var(--radius)",
                        background: "var(--info-bg)",
                        marginBottom: 8,
                        fontSize: 13,
                      }}
                    >
                      <div style={{ marginBottom: 8 }}>
                        <Sparkles size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
                        {suggestion}
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleMerge(suggestion, true)}
                          style={{ padding: "4px 10px", fontSize: 12 }}
                        >
                          <CheckCircle2 size={12} /> Merge
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleMerge(suggestion, false)}
                          style={{ padding: "4px 10px", fontSize: 12 }}
                        >
                          <XCircle size={12} /> Skip
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="divider" />

              {/* Notes Display */}
              {Object.entries(notes).map(([category, items]) => {
                if (items.length === 0) return null;
                const labels = {
                  corrections: "Corrections",
                  keyInsights: "Key Insights",
                  surprises: "Surprises",
                  constraints: "Constraints",
                  followUpActions: "Follow-Up Actions",
                };
                return (
                  <div key={category} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--tamu-gray-500)", marginBottom: 6, textTransform: "uppercase" }}>
                      {labels[category]} ({items.length})
                    </div>
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: "6px 10px",
                          fontSize: 13,
                          borderLeft: "3px solid var(--tamu-maroon)",
                          marginBottom: 4,
                          background: item.startsWith("[AI]") ? "var(--info-bg)" : "var(--tamu-gray-50)",
                        }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveInterview;
