import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

function BriefViewer({ brief, corrections }) {
  const [expandedSections, setExpandedSections] = useState({
    context: true,
    questions: true,
    capture: false,
  });

  function toggleSection(key) {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  if (!brief) {
    return (
      <div className="empty-state">
        <p>Brief not yet generated. Please wait for the pipeline to complete.</p>
      </div>
    );
  }

  const page1 = brief.page1_companyContext || {};
  const page2 = brief.page2_questionSequence || {};
  const page3 = brief.page3_insightCapture || {};
  const header = page1.companyHeader || {};

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--tamu-maroon)" }}>
          {brief.title || `Interviewer Brief: ${header.name || "Company"}`}
        </h2>
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          {header.industry && <span className="badge badge-info">{header.industry}</span>}
          {header.region && <span className="badge badge-neutral">{header.region}</span>}
          {header.stage && <span className="badge badge-neutral">{header.stage}</span>}
        </div>
      </div>

      {/* Page 1: Company Context */}
      <SectionHeader
        title="Page 1: Company Context"
        expanded={expandedSections.context}
        onToggle={() => toggleSection("context")}
      />
      {expandedSections.context && (
        <div style={{ marginBottom: 24 }}>
          {page1.companyOverview && (
            <div className="mb-4">
              <h4 className="section-title">Company Overview</h4>
              <p style={{ fontSize: 15, lineHeight: 1.8 }}>{page1.companyOverview}</p>
            </div>
          )}

          {page1.marketContext && (
            <div className="mb-4">
              <h4 className="section-title">Market Context</h4>
              <p style={{ fontSize: 15, lineHeight: 1.8 }}>{page1.marketContext}</p>
            </div>
          )}

          {page1.revenueModelHypothesis && (
            <div className="mb-4">
              <h4 className="section-title">Revenue Model Hypothesis</h4>
              <div style={{ padding: 16, border: "1px solid var(--tamu-gray-200)", borderRadius: "var(--radius)" }}>
                <p style={{ fontSize: 14 }}>{page1.revenueModelHypothesis.text}</p>
                <span className={`confidence-${(page1.revenueModelHypothesis.confidence || "").toLowerCase()}`}>
                  Confidence: {page1.revenueModelHypothesis.confidence}
                </span>
              </div>
            </div>
          )}

          <h4 className="section-title">"What We Think We Know"</h4>
          {page1.openingCoachingCue && (
            <div className="coaching-cue mb-3">{page1.openingCoachingCue}</div>
          )}
          {(page1.whatWeThinkWeKnow || []).map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: 14,
                border: `1px solid ${item.wasCorrection ? "var(--danger)" : "var(--tamu-gray-200)"}`,
                borderRadius: "var(--radius)",
                marginBottom: 8,
                background: item.wasCorrection ? "var(--danger-bg)" : "white",
              }}
            >
              <p style={{ fontSize: 14, marginBottom: 6 }}>{item.assertion}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span className={`confidence-${(item.confidence || "").toLowerCase()}`} style={{ fontSize: 12 }}>
                  [{item.confidence}]
                </span>
                <span className={`source-tag source-${(item.sourceType || "public").toLowerCase()}`}>
                  {item.sourceType}
                </span>
              </div>
              {item.correctionNote && (
                <div style={{ marginTop: 8, padding: 8, background: "var(--warning-bg)", borderRadius: 4, fontSize: 13 }}>
                  Corrected: {item.correctionNote}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Page 2: Question Sequence */}
      <SectionHeader
        title="Page 2: Question Sequence"
        expanded={expandedSections.questions}
        onToggle={() => toggleSection("questions")}
      />
      {expandedSections.questions && (
        <div style={{ marginBottom: 24 }}>
          {(page2.selectedQuestions || []).length > 0 && (
            <>
              <h4 className="section-title" style={{ color: "var(--tamu-maroon)" }}>
                Interviewee-Selected Questions
              </h4>
              {page2.selectedQuestions.map((q, idx) => (
                <QuestionCard key={idx} question={q} highlighted />
              ))}
            </>
          )}

          <h4 className="section-title">
            {(page2.selectedQuestions || []).length > 0 ? "Additional Questions" : "AI-Generated Questions"}
          </h4>
          {(page2.additionalQuestions || []).map((q, idx) => (
            <QuestionCard key={idx} question={q} />
          ))}

          {(page2.knowledgeGaps || []).length > 0 && (
            <>
              <h4 className="section-title" style={{ marginTop: 20 }}>Knowledge Gaps to Explore</h4>
              {page2.knowledgeGaps.map((gap, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 10,
                    borderLeft: "3px solid var(--warning)",
                    background: "var(--warning-bg)",
                    marginBottom: 6,
                    fontSize: 14,
                  }}
                >
                  {typeof gap === "string" ? gap : gap.gap || gap.text || JSON.stringify(gap)}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Page 3: Insight Capture */}
      <SectionHeader
        title="Page 3: Insight Capture & Wrap-Up"
        expanded={expandedSections.capture}
        onToggle={() => toggleSection("capture")}
      />
      {expandedSections.capture && (
        <div>
          <h4 className="section-title">Live Notes Template</h4>
          <div className="grid-2 mb-4">
            {["Corrections", "Key Insights", "Surprises", "Follow-Up Actions"].map((field) => (
              <div
                key={field}
                style={{
                  padding: 16,
                  border: "1px dashed var(--tamu-gray-300)",
                  borderRadius: "var(--radius)",
                  minHeight: 80,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--tamu-gray-500)", marginBottom: 8 }}>
                  {field}
                </div>
                <div style={{ fontSize: 13, color: "var(--tamu-gray-400)", fontStyle: "italic" }}>
                  Notes will be captured during the interview...
                </div>
              </div>
            ))}
          </div>

          {page3.closingProtocol && (
            <div className="mb-4">
              <h4 className="section-title">Closing Protocol</h4>
              <p style={{ fontSize: 14 }}>{page3.closingProtocol}</p>
            </div>
          )}
          {page3.closingCoachingCue && (
            <div className="coaching-cue">{page3.closingCoachingCue}</div>
          )}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title, expanded, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
        background: "var(--tamu-gray-50)",
        border: "1px solid var(--tamu-gray-200)",
        borderRadius: "var(--radius)",
        cursor: "pointer",
        marginBottom: expanded ? 16 : 12,
      }}
    >
      <span style={{ fontWeight: 600, fontSize: 15, color: "var(--tamu-gray-800)" }}>
        {title}
      </span>
      {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
    </button>
  );
}

function QuestionCard({ question, highlighted }) {
  const q = typeof question === "string" ? { question } : question;

  return (
    <div
      style={{
        padding: 16,
        border: highlighted ? "2px solid var(--tamu-maroon)" : "1px solid var(--tamu-gray-200)",
        borderRadius: "var(--radius)",
        marginBottom: 12,
        background: highlighted ? "rgba(80, 0, 0, 0.02)" : "white",
      }}
    >
      <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 8 }}>
        {q.question || q.text || q}
      </div>
      {q.followUpStem && (
        <div style={{ fontSize: 13, color: "var(--info)", marginBottom: 4 }}>
          Follow-up: "{q.followUpStem}"
        </div>
      )}
      {q.objective && (
        <div style={{ fontSize: 12, color: "var(--tamu-gray-500)", marginBottom: 4 }}>
          Objective: {q.objective}
        </div>
      )}
      {q.coachingCue && <div className="coaching-cue" style={{ margin: "8px 0 0 0" }}>[{q.coachingCue}]</div>}
    </div>
  );
}

export default BriefViewer;
