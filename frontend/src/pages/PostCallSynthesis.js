import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Target,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import api from "../services/api";

function PostCallSynthesis() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [synthesis, setSynthesis] = useState(null);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    corrections: "",
    keyInsights: "",
    surprises: "",
    constraints: "",
    followUpActions: "",
    rawNotes: "",
  });

  const loadSession = useCallback(async () => {
    try {
      const data = await api.getSession(sessionId);
      setSession(data.session);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  function splitLines(text) {
    return text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const data = await api.submitSynthesis(sessionId, {
        corrections: splitLines(form.corrections),
        keyInsights: splitLines(form.keyInsights),
        surprises: splitLines(form.surprises),
        constraints: splitLines(form.constraints),
        followUpActions: splitLines(form.followUpActions),
        rawNotes: form.rawNotes,
      });
      setSynthesis(data.synthesis);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (synthesis) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div
          style={{
            background: "linear-gradient(135deg, var(--success) 0%, #047857 100%)",
            color: "white",
            padding: 32,
            borderRadius: "var(--radius-lg)",
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          <CheckCircle2 size={48} style={{ marginBottom: 12 }} />
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            Synthesis Complete
          </h1>
          <p style={{ opacity: 0.9 }}>
            Insights mapped to the Texas Insights Engine knowledge graph
          </p>
        </div>

        {/* Company Profile */}
        <div className="card mb-4">
          <div className="card-header">
            <h2>Company Profile</h2>
          </div>
          <div className="card-body">
            <div className="grid-3">
              {Object.entries(synthesis.companyProfile || {}).map(([key, value]) =>
                value ? (
                  <div key={key}>
                    <div style={{ fontSize: 12, color: "var(--tamu-gray-500)", textTransform: "uppercase", fontWeight: 600 }}>
                      {key.replace(/([A-Z])/g, " $1")}
                    </div>
                    <div style={{ fontWeight: 500, marginTop: 2 }}>{value}</div>
                  </div>
                ) : null
              )}
            </div>
          </div>
        </div>

        {/* Constraint Map */}
        <div className="card mb-4">
          <div className="card-header">
            <h2>
              <Target size={18} style={{ verticalAlign: "middle", marginRight: 8 }} />
              Constraint Map
            </h2>
          </div>
          <div className="card-body">
            {(synthesis.constraintMap?.top3Constraints || []).map((c, idx) => (
              <div
                key={idx}
                style={{
                  padding: 12,
                  border: "1px solid var(--tamu-gray-200)",
                  borderRadius: "var(--radius)",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{c.constraint}</div>
                  <span className="badge badge-neutral" style={{ marginTop: 4 }}>{c.type}</span>
                </div>
                {c.confirmed && <CheckCircle2 size={16} color="var(--success)" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid-2 mb-4">
          {/* Strategic Tensions */}
          <div className="card">
            <div className="card-header">
              <h2>
                <AlertTriangle size={18} style={{ verticalAlign: "middle", marginRight: 8 }} />
                Strategic Tensions
              </h2>
            </div>
            <div className="card-body">
              {(synthesis.strategicTensions || []).map((t, idx) => (
                <div key={idx} style={{ marginBottom: 12 }}>
                  <div className="flex-between">
                    <span style={{ fontWeight: 500, fontSize: 14 }}>{t.tension}</span>
                    <span className={`badge ${t.riskLevel === "high" ? "badge-danger" : t.riskLevel === "medium" ? "badge-warning" : "badge-success"}`}>
                      {t.riskLevel}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--tamu-gray-500)", marginTop: 4 }}>{t.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Opportunities */}
          <div className="card">
            <div className="card-header">
              <h2>
                <Lightbulb size={18} style={{ verticalAlign: "middle", marginRight: 8 }} />
                AI Opportunities
              </h2>
            </div>
            <div className="card-body">
              {(synthesis.aiOpportunities || []).map((opp, idx) => (
                <div key={idx} style={{ marginBottom: 12 }}>
                  <div className="flex-between">
                    <span style={{ fontWeight: 500, fontSize: 14 }}>{opp.area}</span>
                    <span className={`badge ${opp.estimatedImpact === "high" ? "badge-success" : "badge-info"}`}>
                      {opp.estimatedImpact} impact
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--tamu-gray-500)", marginTop: 4 }}>{opp.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Deltas */}
        {synthesis.keyDeltasFromProfile?.length > 0 && (
          <div className="card mb-4">
            <div className="card-header">
              <h2>
                <TrendingUp size={18} style={{ verticalAlign: "middle", marginRight: 8 }} />
                Key Deltas from Original Profile
              </h2>
            </div>
            <div className="card-body">
              {synthesis.keyDeltasFromProfile.map((delta, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 10,
                    borderLeft: "3px solid var(--tamu-maroon)",
                    marginBottom: 8,
                    fontSize: 14,
                  }}
                >
                  {delta}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unresolved */}
        {synthesis.unresolvedQuestions?.length > 0 && (
          <div className="card mb-4">
            <div className="card-header">
              <h2>Unresolved Questions</h2>
            </div>
            <div className="card-body">
              {synthesis.unresolvedQuestions.map((q, idx) => (
                <div key={idx} style={{ padding: 8, fontSize: 14, marginBottom: 4 }}>
                  {idx + 1}. {q}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 32, marginBottom: 40 }}>
          <Link to="/" className="btn btn-primary btn-lg">
            Back to Dashboard
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div className="mb-6">
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Post-Call Synthesis</h1>
        <p style={{ color: "var(--tamu-gray-500)", marginTop: 4 }}>
          {session?.companyName} — Complete within 10 minutes while memory is fresh
        </p>
      </div>

      <div className="status-bar warning mb-4">
        <AlertCircle size={16} />
        Enter your notes from the interview. The AI will map them to the Texas Insights Engine schema.
      </div>

      {error && (
        <div className="status-bar danger mb-4">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {[
          { key: "corrections", label: "Corrections from the Interviewee", hint: "What did the AI get wrong? One per line." },
          { key: "keyInsights", label: "Key Insights Discovered", hint: "The most important things you learned. One per line." },
          { key: "surprises", label: "Surprises", hint: "What was unexpected? One per line." },
          { key: "constraints", label: "Top Constraints Identified", hint: "Business constraints the interviewee confirmed. One per line." },
          { key: "followUpActions", label: "Follow-Up Actions", hint: "Next steps agreed upon. One per line." },
        ].map((field) => (
          <div className="card mb-4" key={field.key}>
            <div className="card-body">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>{field.label}</label>
                <textarea
                  value={form[field.key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.hint}
                  rows={4}
                />
                <div className="hint">{field.hint}</div>
              </div>
            </div>
          </div>
        ))}

        <div className="card mb-4">
          <div className="card-body">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Raw Notes (optional)</label>
              <textarea
                value={form.rawNotes}
                onChange={(e) => setForm((prev) => ({ ...prev, rawNotes: e.target.value }))}
                placeholder="Paste any additional raw notes from the call..."
                rows={6}
              />
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner" /> Synthesizing...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Synthesis
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PostCallSynthesis;
