import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  CheckCircle2,
  AlertCircle,
  Send,
  MessageSquare,
  FileText,
  Shield,
} from "lucide-react";
import api from "../services/api";

function IntervieweeFeedback() {
  const { sessionId } = useParams();
  const [packet, setPacket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const [corrections, setCorrections] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [optedOut, setOptedOut] = useState(false);

  const loadPacket = useCallback(async () => {
    try {
      const data = await api.getSession(sessionId);
      setPacket(data.packet);
    } catch (err) {
      setError("Unable to load the interview packet. Please check your link.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadPacket();
  }, [loadPacket]);

  function addCorrection() {
    setCorrections([
      ...corrections,
      { originalAssertion: "", correction: "", correctionType: "factual_error", note: "" },
    ]);
  }

  function updateCorrection(idx, field, value) {
    const updated = [...corrections];
    updated[idx][field] = value;
    setCorrections(updated);
  }

  function removeCorrection(idx) {
    setCorrections(corrections.filter((_, i) => i !== idx));
  }

  function toggleQuestion(qId) {
    setSelectedQuestions((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : prev.length < 3 ? [...prev, qId] : prev
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      const validCorrections = corrections.filter(
        (c) => c.originalAssertion.trim() && c.correction.trim()
      );
      await api.submitCorrections(sessionId, {
        corrections: validCorrections,
        selectedQuestions,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOptOut() {
    if (!window.confirm("Opt out of this process? We will not use your feedback and the interviewer will proceed without your corrections or question selection.")) return;
    try {
      setSubmitting(true);
      setError(null);
      await api.submitCorrections(sessionId, { optOut: true });
      setOptedOut(true);
    } catch (err) {
      setError(err.message || "Unable to opt out.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        <p>Loading your interview packet...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: 600, margin: "60px auto", textAlign: "center" }}>
        <CheckCircle2 size={64} color="var(--success)" style={{ marginBottom: 20 }} />
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Thank You!</h1>
        <p style={{ fontSize: 16, color: "var(--tamu-gray-600)", marginBottom: 8 }}>
          Your feedback has been recorded. The interviewer will incorporate your corrections
          and prioritize the questions you selected.
        </p>
        <p style={{ fontSize: 14, color: "var(--tamu-gray-500)" }}>
          You can close this page. We look forward to our conversation!
        </p>
      </div>
    );
  }

  if (optedOut) {
    return (
      <div style={{ maxWidth: 600, margin: "60px auto", textAlign: "center" }}>
        <CheckCircle2 size={64} color="var(--tamu-gray-500)" style={{ marginBottom: 20 }} />
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>You have opted out</h1>
        <p style={{ fontSize: 16, color: "var(--tamu-gray-600)" }}>
          We have recorded your choice. The interviewer will proceed without your corrections or question selection. You may close this page.
        </p>
      </div>
    );
  }

  if (error && !packet) {
    return (
      <div style={{ maxWidth: 600, margin: "60px auto" }}>
        <div className="status-bar danger">
          <AlertCircle size={16} />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--tamu-maroon) 0%, #7a1a1a 100%)",
          color: "white",
          padding: 32,
          borderRadius: "var(--radius-lg)",
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>
          {packet?.header?.institution || "Texas A&M University — Mays Business School"}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          Interview Preparation Packet
        </h1>
        <p style={{ opacity: 0.85 }}>
          {packet?.header?.companyName || "Your Organization"}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* What We Learned */}
        <div className="card mb-4">
          <div className="card-header">
            <h2>
              <FileText size={18} style={{ verticalAlign: "middle", marginRight: 8 }} />
              What We Learned About Your Organization
            </h2>
          </div>
          <div className="card-body">
            <div style={{ fontSize: 15, lineHeight: 1.8, whiteSpace: "pre-line" }}>
              {packet?.whatWeLearned || "Loading..."}
            </div>
          </div>
        </div>

        {/* Accuracy Request */}
        <div
          className="card mb-4"
          style={{ borderLeft: "4px solid var(--tamu-gold)" }}
        >
          <div className="card-body">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "var(--tamu-maroon)" }}>
              Your Corrections Matter
            </h3>
            <p style={{ fontSize: 14, color: "var(--tamu-gray-600)" }}>
              {packet?.accuracyRequest ||
                "Please let us know what we got right, what we got wrong, and what we missed."}
            </p>
            <p style={{ fontSize: 12, color: "var(--tamu-gray-500)", marginTop: 4 }}>
              E.g. something we got wrong, something we missed, or important context.
            </p>

            <div className="mt-4">
              {corrections.map((c, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 16,
                    border: "1px solid var(--tamu-gray-200)",
                    borderRadius: "var(--radius)",
                    marginBottom: 12,
                    background: "var(--tamu-gray-50)",
                  }}
                >
                  <div className="flex-between mb-2">
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Correction #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeCorrection(idx)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--danger)",
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="form-group">
                    <label>Which statement needs correction?</label>
                    <textarea
                      value={c.originalAssertion}
                      onChange={(e) => updateCorrection(idx, "originalAssertion", e.target.value)}
                      placeholder="Copy or describe the statement from above..."
                      rows={2}
                    />
                  </div>
                  <div className="form-group">
                    <label>What's the correct information?</label>
                    <textarea
                      value={c.correction}
                      onChange={(e) => updateCorrection(idx, "correction", e.target.value)}
                      placeholder="Tell us what's actually true..."
                      rows={2}
                    />
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label>Correction Type</label>
                      <select
                        value={c.correctionType}
                        onChange={(e) => updateCorrection(idx, "correctionType", e.target.value)}
                      >
                        <option value="factual_error">Factual Error</option>
                        <option value="missing_context">Missing Context</option>
                        <option value="outdated">Outdated Information</option>
                        <option value="nuance">Needs Nuance</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Additional Notes (optional)</label>
                      <input
                        type="text"
                        value={c.note}
                        onChange={(e) => updateCorrection(idx, "note", e.target.value)}
                        placeholder="Any context you'd like to add..."
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-secondary" onClick={addCorrection}>
                <MessageSquare size={16} />
                Add a Correction
              </button>
            </div>
          </div>
        </div>

        {/* Question Selection — Plan: "Select top 2–3 questions" */}
        <div className="card mb-4">
          <div className="card-header">
            <h2>Select Your Top Questions</h2>
            <span style={{ fontSize: 13, color: "var(--tamu-gray-500)" }}>
              Select 2–3 that interest you most (up to 3)
            </span>
          </div>
          <div className="card-body">
            <p style={{ fontSize: 14, color: "var(--tamu-gray-500)", marginBottom: 16 }}>
              Which questions interest you most? We'll prioritize these in our conversation.
            </p>
            {(packet?.questionMenu || []).map((q) => {
              const isSelected = selectedQuestions.includes(q.id);
              return (
                <div
                  key={q.id}
                  onClick={() => toggleQuestion(q.id)}
                  style={{
                    padding: 16,
                    border: `2px solid ${isSelected ? "var(--tamu-maroon)" : "var(--tamu-gray-200)"}`,
                    borderRadius: "var(--radius)",
                    marginBottom: 12,
                    cursor: "pointer",
                    background: isSelected ? "rgba(80, 0, 0, 0.03)" : "white",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        border: `2px solid ${isSelected ? "var(--tamu-maroon)" : "var(--tamu-gray-300)"}`,
                        background: isSelected ? "var(--tamu-maroon)" : "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      {isSelected && <CheckCircle2 size={14} color="white" />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 15 }}>{q.question}</div>
                      {q.context && (
                        <div style={{ fontSize: 13, color: "var(--tamu-gray-500)", marginTop: 4 }}>
                          {q.context}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transparency Footer — Plan: data sources listed, opt-out link, statement */}
        <div className="card mb-4" style={{ background: "var(--tamu-gray-50)" }}>
          <div className="card-body">
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <Shield size={20} color="var(--tamu-gray-400)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 13, color: "var(--tamu-gray-500)" }}>
                <p style={{ marginBottom: 8 }}>
                  <strong>Sources Used:</strong>{" "}
                  {(packet?.transparencyFooter?.sourcesUsed || []).join(", ") || "Public sources and TAMU staff data"}
                </p>
                <p style={{ marginBottom: 8 }}>
                  {packet?.transparencyFooter?.statement ||
                    "No data was collected without your knowledge; all sources are public or provided by TAMU staff."}
                </p>
                <p style={{ marginBottom: 8 }}>
                  {packet?.transparencyFooter?.optOutNote || "You may opt out of this process at any time."}{" "}
                  <button
                    type="button"
                    onClick={handleOptOut}
                    disabled={submitting}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--tamu-maroon)",
                      textDecoration: "underline",
                      cursor: submitting ? "not-allowed" : "pointer",
                      padding: 0,
                      fontSize: "inherit",
                    }}
                  >
                    Opt out
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="status-bar danger mb-4">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner" /> Submitting...
              </>
            ) : (
              <>
                <Send size={18} />
                Submit Feedback
              </>
            )}
          </button>
          <p style={{ fontSize: 12, color: "var(--tamu-gray-400)", marginTop: 8 }}>
            {corrections.length} correction{corrections.length !== 1 ? "s" : ""} &middot;{" "}
            {selectedQuestions.length} question{selectedQuestions.length !== 1 ? "s" : ""} selected
          </p>
        </div>
      </form>
    </div>
  );
}

export default IntervieweeFeedback;
