import React, { useState, useEffect } from "react";
import { MAIN_FLOW_STEPS, POST_BRIEF_FLOW_STEPS } from "../components/tech-architecture/flowData";
import FlowStepper from "../components/tech-architecture/FlowStepper";
import ArchitectureDeepDive from "../components/tech-architecture/ArchitectureDeepDive";
import StackGrid from "../components/tech-architecture/StackGrid";
import EvidenceGallery from "../components/tech-architecture/EvidenceGallery";

const TOC_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "end-to-end-flow", label: "End-to-End Flow" },
  { id: "after-brief", label: "After Brief Is Ready" },
  { id: "architecture-deep-dive", label: "Architecture Deep Dive" },
  { id: "stack", label: "Stack" },
  { id: "data-security", label: "Data, Security & Reliability" },
  { id: "aws-console-evidence", label: "AWS Console Evidence" },
];

const BADGES = ["Serverless", "AWS Native", "GenAI (Bedrock)", "Cognito-secured", "Auditable"];

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function TechAndArchitecture() {
  const [tocOpen, setTocOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id || activeSection);
        });
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );
    TOC_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [activeSection]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 48px" }}>
      {/* Hero */}
      <section id="overview" style={{ padding: "32px 0 40px", borderBottom: "1px solid var(--tamu-gray-200)" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--tamu-gray-900)", marginBottom: 8, letterSpacing: "-0.02em" }}>
          Tech & Architecture
        </h1>
        <p style={{ fontSize: 18, color: "var(--tamu-gray-600)", marginBottom: 24, lineHeight: 1.5 }}>
          End-to-end serverless GenAI interview intelligence pipeline
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {BADGES.map((b) => (
            <span
              key={b}
              style={{
                padding: "8px 14px",
                borderRadius: 20,
                background: "var(--tamu-maroon)",
                color: "white",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {b}
            </span>
          ))}
        </div>
      </section>

      <div className="tech-page-layout" style={{ display: "flex", gap: 32, alignItems: "flex-start", marginTop: 32 }}>
        {/* Sticky TOC — desktop */}
        <aside
          className="tech-toc-sticky"
          style={{
            width: 200,
            flexShrink: 0,
          }}
        >
          <div style={{ position: "sticky", top: 88 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--tamu-gray-500)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
              On this page
            </div>
            <nav>
              {TOC_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToId(item.id)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 0",
                    marginBottom: 2,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    color: activeSection === item.id ? "var(--tamu-maroon)" : "var(--tamu-gray-600)",
                    fontWeight: activeSection === item.id ? 600 : 400,
                    borderLeft: activeSection === item.id ? "3px solid var(--tamu-maroon)" : "3px solid transparent",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile TOC dropdown */}
        <div
          style={{
            display: "none",
            marginBottom: 24,
            width: "100%",
          }}
          className="tech-toc-mobile"
        >
          <button
            type="button"
            onClick={() => setTocOpen((o) => !o)}
            style={{
              width: "100%",
              padding: "12px 16px",
              background: "white",
              border: "1px solid var(--tamu-gray-200)",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            On this page
            <span style={{ transform: tocOpen ? "rotate(180deg)" : "none" }}>▼</span>
          </button>
          {tocOpen && (
            <div style={{ marginTop: 4, padding: 12, background: "white", border: "1px solid var(--tamu-gray-200)", borderRadius: 8 }}>
              {TOC_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { scrollToId(item.id); setTocOpen(false); }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 0",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    color: "var(--tamu-gray-700)",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <main className="tech-page-main" style={{ flex: 1, minWidth: 0 }}>
          {/* End-to-End Flow */}
          <section style={{ marginBottom: 48 }}>
            <h2 id="end-to-end-flow" style={{ fontSize: 22, fontWeight: 700, color: "var(--tamu-gray-900)", marginBottom: 8 }}>
              End-to-End Flow
            </h2>
            <p style={{ fontSize: 14, color: "var(--tamu-gray-600)", marginBottom: 24, lineHeight: 1.5 }}>
              Create Session through Brief Ready. Horizontal on desktop; cards stack on small screens.
            </p>
            <div className="card" style={{ padding: 24, overflow: "auto" }}>
              <FlowStepper steps={MAIN_FLOW_STEPS} accentColor="var(--tamu-maroon)" />
            </div>
          </section>

          {/* After Brief Is Ready */}
          <section style={{ marginBottom: 48 }}>
            <h2 id="after-brief" style={{ fontSize: 22, fontWeight: 700, color: "var(--tamu-gray-900)", marginBottom: 8 }}>
              After Brief Is Ready
            </h2>
            <p style={{ fontSize: 14, color: "var(--tamu-gray-600)", marginBottom: 24, lineHeight: 1.5 }}>
              Send packet → interviewee feedback → update brief → post-call synthesis.
            </p>
            <div className="card" style={{ padding: 24, overflow: "auto", borderLeft: "4px solid var(--tamu-gold)" }}>
              <FlowStepper steps={POST_BRIEF_FLOW_STEPS} accentColor="var(--tamu-gold)" />
            </div>
          </section>

          {/* Architecture Deep Dive */}
          <section style={{ marginBottom: 48 }}>
            <h2 id="architecture-deep-dive" style={{ fontSize: 22, fontWeight: 700, color: "var(--tamu-gray-900)", marginBottom: 8 }}>
              Architecture Deep Dive
            </h2>
            <p style={{ fontSize: 14, color: "var(--tamu-gray-600)", marginBottom: 24, lineHeight: 1.5 }}>
              Component breakdown, state machine, data model, API contracts, IAM, observability, cost.
            </p>
            <ArchitectureDeepDive />
          </section>

          {/* Stack */}
          <section style={{ marginBottom: 48 }}>
            <h2 id="stack" style={{ fontSize: 22, fontWeight: 700, color: "var(--tamu-gray-900)", marginBottom: 8 }}>
              Stack
            </h2>
            <p style={{ fontSize: 14, color: "var(--tamu-gray-600)", marginBottom: 24, lineHeight: 1.5 }}>
              Technologies and AWS services; expand “Why chosen” for rationale.
            </p>
            <StackGrid />
          </section>

          {/* Data, Security & Reliability — summary cards */}
          <section id="data-security" style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--tamu-gray-900)", marginBottom: 8 }}>
              Data, Security & Reliability
            </h2>
            <p style={{ fontSize: 14, color: "var(--tamu-gray-600)", marginBottom: 24, lineHeight: 1.5 }}>
              Summarized; see Architecture Deep Dive for full detail.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {[
                { title: "Data", text: "DynamoDB single-table (PK/SK, GSI); S3 versioned briefs and artifacts. No PII in logs." },
                { title: "Security", text: "Cognito JWT for interviewer APIs; /corrections public by design. Lambda IAM least-privilege; no long-lived keys." },
                { title: "Reliability", text: "Step Functions retries and catch; Lambda retries; partial failure handling in ingest. Audit table for every action." },
              ].map((c) => (
                <div key={c.title} className="card" style={{ padding: 20 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: "var(--tamu-maroon)" }}>{c.title}</h3>
                  <p style={{ fontSize: 13, color: "var(--tamu-gray-600)", lineHeight: 1.5 }}>{c.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* AWS Console Evidence */}
          <section style={{ marginBottom: 48 }}>
            <h2 id="aws-console-evidence" style={{ fontSize: 22, fontWeight: 700, color: "var(--tamu-gray-900)", marginBottom: 8 }}>
              AWS Console Evidence
            </h2>
            <p style={{ fontSize: 14, color: "var(--tamu-gray-600)", marginBottom: 24, lineHeight: 1.5 }}>
              Screenshots with “What this shows.” Click to open lightbox.
            </p>
            <EvidenceGallery />
          </section>

          <footer style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--tamu-gray-200)", fontSize: 12, color: "var(--tamu-gray-500)" }}>
            Texas Insights Engine · Mays Business School, Texas A&M University · AWS AI Hackathon 2025
          </footer>
        </main>
      </div>

      {/* Show mobile TOC, hide desktop TOC on small screens */}
      <style>{`
        @media (max-width: 768px) {
          .tech-toc-sticky { display: none !important; }
          .tech-toc-mobile { display: block !important; }
          .tech-flow-stepper .tech-step-card { max-width: none !important; }
        }
      `}</style>
    </div>
  );
}
