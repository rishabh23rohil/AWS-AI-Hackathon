import React from "react";
import { Eye, Globe, Database, Cpu, FileText } from "lucide-react";

function SourcesPanel({ session, profile }) {
  const sourceTypes = [
    {
      type: "Public URLs",
      icon: Globe,
      color: "var(--info)",
      items: (session?.urls || []).map((url) => ({ label: url, tag: "Public" })),
    },
    {
      type: "AI Model Knowledge",
      icon: Cpu,
      color: "var(--tamu-maroon)",
      items: [{ label: "Amazon Bedrock (Claude Sonnet) — general industry knowledge", tag: "LLM Inference" }],
    },
  ];

  if (session?.sourceCount > 0) {
    sourceTypes.push({
      type: "Extracted Content",
      icon: FileText,
      color: "var(--success)",
      items: [
        { label: `${session.chunkCount || 0} text chunks extracted`, tag: "Processed" },
        { label: `${session.entityCount || 0} entities identified`, tag: "Comprehend" },
      ],
    });
  }

  return (
    <div>
      <h3 className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Eye size={18} />
        Sources & Transparency
      </h3>
      <p style={{ fontSize: 14, color: "var(--tamu-gray-500)", marginBottom: 20 }}>
        Every assertion in the brief is traceable to one of these sources. No data was fetched without an explicit user trigger.
      </p>

      {sourceTypes.map((source) => (
        <div
          key={source.type}
          style={{
            border: "1px solid var(--tamu-gray-200)",
            borderRadius: "var(--radius)",
            marginBottom: 16,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              background: "var(--tamu-gray-50)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderBottom: "1px solid var(--tamu-gray-200)",
            }}
          >
            <source.icon size={18} color={source.color} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>{source.type}</span>
          </div>
          <div style={{ padding: "12px 16px" }}>
            {source.items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: idx < source.items.length - 1 ? "1px solid var(--tamu-gray-100)" : "none",
                }}
              >
                <span style={{ fontSize: 13, wordBreak: "break-all" }}>{item.label}</span>
                <span
                  className={`source-tag ${
                    item.tag === "Public"
                      ? "source-public"
                      : item.tag === "LLM Inference"
                      ? "source-inferred"
                      : "source-proprietary"
                  }`}
                  style={{ flexShrink: 0, marginLeft: 8 }}
                >
                  {item.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Provenance Explanation */}
      <div
        style={{
          padding: 16,
          background: "var(--tamu-gray-50)",
          borderRadius: "var(--radius)",
          border: "1px solid var(--tamu-gray-200)",
          marginTop: 24,
        }}
      >
        <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
          How We Tag Sources
        </h4>
        <div style={{ fontSize: 13, color: "var(--tamu-gray-600)", lineHeight: 1.8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span className="source-tag source-public">Public</span>
            Information from public URLs, press releases, or industry reports
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span className="source-tag source-proprietary">Proprietary</span>
            Data from TAMU-uploaded documents, prior transcripts, or faculty notes
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span className="source-tag source-inferred">LLM Inference</span>
            AI-generated hypotheses based on industry knowledge (clearly flagged)
          </div>
        </div>
      </div>

      {/* Industry Classification */}
      {profile?.industryClassification && (
        <div style={{ marginTop: 24 }}>
          <h4 className="section-title">AI Industry Classification</h4>
          <div className="grid-2">
            {Object.entries(profile.industryClassification).map(([key, value]) =>
              value ? (
                <div key={key} style={{ padding: 12, border: "1px solid var(--tamu-gray-200)", borderRadius: "var(--radius)" }}>
                  <div style={{ fontSize: 11, color: "var(--tamu-gray-500)", textTransform: "uppercase", fontWeight: 600 }}>
                    {key.replace(/([A-Z])/g, " $1")}
                  </div>
                  <div style={{ fontWeight: 500, marginTop: 2 }}>{value}</div>
                </div>
              ) : null
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SourcesPanel;
