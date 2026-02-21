import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import AwsIcon from "./AwsIcon";
import {
  COMPONENT_BREAKDOWN,
  STATE_MACHINE_STATES,
  DATA_MODEL,
  API_CONTRACTS,
} from "./architectureDeepDiveData";

const SECTIONS = [
  { id: "components", label: "Component breakdown", icon: "Lambda" },
  { id: "statemachine", label: "Step Functions state machine", icon: "Step Functions" },
  { id: "datamodel", label: "Data model", icon: "DynamoDB" },
  { id: "api", label: "API contracts", icon: "API Gateway" },
  { id: "iam", label: "IAM & security", icon: "Cognito" },
  { id: "observability", label: "Observability & reliability", icon: "S3" },
  { id: "cost", label: "Cost & scale", icon: "S3" },
];

function AccordionItem({ id, label, icon, children, open, onToggle }) {
  return (
    <div
      style={{
        border: "1px solid var(--tamu-gray-200)",
        borderRadius: 12,
        marginBottom: 12,
        overflow: "hidden",
        background: "white",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 20px",
          background: open ? "var(--tamu-gray-50)" : "white",
          border: "none",
          cursor: "pointer",
          fontSize: 15,
          fontWeight: 600,
          color: "var(--tamu-gray-900)",
          textAlign: "left",
        }}
      >
        {open ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        <AwsIcon name={icon} size={24} />
        {label}
      </button>
      {open && (
        <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--tamu-gray-100)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function ArchitectureDeepDive() {
  const [openId, setOpenId] = useState("components");

  return (
    <div id="architecture-deep-dive">
      {SECTIONS.map((s) => (
        <AccordionItem
          key={s.id}
          id={s.id}
          label={s.label}
          icon={s.icon}
          open={openId === s.id}
          onToggle={() => setOpenId(openId === s.id ? null : s.id)}
        >
          {s.id === "components" && (
            <div style={{ paddingTop: 16 }}>
              {COMPONENT_BREAKDOWN.map((c) => (
                <div
                  key={c.name}
                  style={{
                    marginBottom: 20,
                    padding: 16,
                    background: "var(--tamu-gray-50)",
                    borderRadius: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <AwsIcon name={c.name} size={28} />
                    <strong style={{ fontSize: 15 }}>{c.name}</strong>
                  </div>
                  <p style={{ fontSize: 13, marginBottom: 6 }}><strong>Responsibility:</strong> {c.responsibility}</p>
                  <p style={{ fontSize: 13, marginBottom: 6 }}><strong>Why:</strong> {c.why}</p>
                  <p style={{ fontSize: 13, marginBottom: 6 }}><strong>Scaling:</strong> {c.scaling}</p>
                  <p style={{ fontSize: 13 }}><strong>Failure:</strong> {c.failure}</p>
                </div>
              ))}
            </div>
          )}
          {s.id === "statemachine" && (
            <div style={{ paddingTop: 16 }}>
              <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--tamu-gray-200)" }}>
                    <th style={{ textAlign: "left", padding: "8px 12px" }}>State</th>
                    <th style={{ textAlign: "left", padding: "8px 12px" }}>Type</th>
                    <th style={{ textAlign: "left", padding: "8px 12px" }}>Next</th>
                    <th style={{ textAlign: "left", padding: "8px 12px" }}>Retry</th>
                    <th style={{ textAlign: "left", padding: "8px 12px" }}>Catch</th>
                  </tr>
                </thead>
                <tbody>
                  {STATE_MACHINE_STATES.map((row) => (
                    <tr key={row.state} style={{ borderBottom: "1px solid var(--tamu-gray-100)" }}>
                      <td style={{ padding: "8px 12px", fontWeight: 600 }}>{row.state}</td>
                      <td style={{ padding: "8px 12px" }}>{row.type}</td>
                      <td style={{ padding: "8px 12px" }}>{row.next}</td>
                      <td style={{ padding: "8px 12px" }}>{row.retry}</td>
                      <td style={{ padding: "8px 12px" }}>{row.catch}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ marginTop: 12, fontSize: 12, color: "var(--tamu-gray-600)" }}>
                Idempotency: execution name = brief-{`{sessionId}`}; one run per session.
              </p>
            </div>
          )}
          {s.id === "datamodel" && (
            <div style={{ paddingTop: 16 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--tamu-gray-500)", marginBottom: 6 }}>DynamoDB</div>
                <pre style={{ background: "var(--tamu-gray-900)", color: "var(--tamu-gray-100)", padding: 16, borderRadius: 8, overflow: "auto", fontSize: 12 }}>{DATA_MODEL.dynamoDB}</pre>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--tamu-gray-500)", marginBottom: 6 }}>S3 prefixes</div>
                <pre style={{ background: "var(--tamu-gray-900)", color: "var(--tamu-gray-100)", padding: 16, borderRadius: 8, overflow: "auto", fontSize: 12 }}>{DATA_MODEL.s3}</pre>
              </div>
              <p style={{ fontSize: 13 }}><strong>Versioning:</strong> {DATA_MODEL.versioning}</p>
            </div>
          )}
          {s.id === "api" && (
            <div style={{ paddingTop: 16 }}>
              <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--tamu-gray-200)" }}>
                    <th style={{ textAlign: "left", padding: "8px 12px" }}>Method</th>
                    <th style={{ textAlign: "left", padding: "8px 12px" }}>Path</th>
                    <th style={{ textAlign: "left", padding: "8px 12px" }}>Auth</th>
                    <th style={{ textAlign: "left", padding: "8px 12px" }}>In / Out</th>
                  </tr>
                </thead>
                <tbody>
                  {API_CONTRACTS.map((row) => (
                    <tr key={row.path + row.method} style={{ borderBottom: "1px solid var(--tamu-gray-100)" }}>
                      <td style={{ padding: "8px 12px", fontWeight: 600 }}>{row.method}</td>
                      <td style={{ padding: "8px 12px", fontFamily: "monospace" }}>{row.path}</td>
                      <td style={{ padding: "8px 12px" }}>{row.auth}</td>
                      <td style={{ padding: "8px 12px", fontSize: 12 }}>In: {row.in} — Out: {row.out}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {s.id === "iam" && (
            <div style={{ paddingTop: 16 }}>
              <ul style={{ listStyle: "disc", paddingLeft: 20, fontSize: 13, lineHeight: 1.8 }}>
                <li><strong>Cognito JWT:</strong> Interviewer endpoints require valid ID token in Authorization header. Claims (sub, email) passed to Lambda.</li>
                <li><strong>Public API:</strong> POST /sessions/{`{sessionId}`}/corrections has Auth: NONE for interviewee feedback.</li>
                <li><strong>Lambda IAM:</strong> Each function has minimal policies (DynamoDB CRUD on specific tables, S3, Bedrock, etc.).</li>
                <li><strong>No long-lived credentials:</strong> No access keys in code; roles assumed at runtime.</li>
              </ul>
            </div>
          )}
          {s.id === "observability" && (
            <div style={{ paddingTop: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
                {["CloudWatch logs per Lambda", "Step Functions execution history (console)", "Retry + exponential backoff on Lambda/state", "Partial failure: ingest continues if at least one URL succeeds", "Audit trail: DynamoDB AuditLogTable + S3 lifecycle"].map((t) => (
                  <div key={t} style={{ padding: 12, background: "var(--tamu-gray-50)", borderRadius: 8, fontSize: 13 }}>{t}</div>
                ))}
              </div>
            </div>
          )}
          {s.id === "cost" && (
            <div style={{ paddingTop: 16, fontSize: 13, lineHeight: 1.7 }}>
              <p>Serverless: pay per execution and per request. No idle cost. Bedrock usage isolated to generate_brief, update_brief, and post_call_synthesis. Scales with number of sessions and concurrent users. DynamoDB on-demand and S3 storage scale automatically.</p>
            </div>
          )}
        </AccordionItem>
      ))}
    </div>
  );
}
