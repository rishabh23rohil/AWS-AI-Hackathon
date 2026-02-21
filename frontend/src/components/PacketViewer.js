import React from "react";
import { ExternalLink, Shield, Copy } from "lucide-react";

function PacketViewer({ packet, sessionId }) {
  if (!packet) {
    return (
      <div className="empty-state">
        <p>Packet not yet generated.</p>
      </div>
    );
  }

  const feedbackUrl = `${window.location.origin}/feedback/${sessionId}`;

  function copyLink() {
    navigator.clipboard.writeText(feedbackUrl);
  }

  return (
    <div>
      <div className="flex-between mb-4">
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>Interviewee Pre-Packet Preview</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={copyLink}>
            <Copy size={14} />
            Copy Feedback Link
          </button>
          <a
            href={feedbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
          >
            <ExternalLink size={14} />
            Preview
          </a>
        </div>
      </div>

      {/* Simulated Packet */}
      <div
        style={{
          border: "1px solid var(--tamu-gray-200)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "var(--tamu-maroon)",
            color: "white",
            padding: "24px 32px",
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
            {packet.header?.institution || "Texas A&M University — Mays Business School"}
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
            Interview Preparation
          </h2>
          <div style={{ fontSize: 14, opacity: 0.9 }}>
            {packet.header?.companyName || "Company"}
          </div>
        </div>

        <div style={{ padding: "24px 32px" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "var(--tamu-maroon)" }}>
            What We Learned About Your Organization
          </h3>
          <div style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-line", marginBottom: 24 }}>
            {packet.whatWeLearned}
          </div>

          <div
            style={{
              background: "var(--tamu-gray-50)",
              padding: 16,
              borderRadius: "var(--radius)",
              marginBottom: 24,
              borderLeft: "4px solid var(--tamu-gold)",
            }}
          >
            <p style={{ fontSize: 14, fontStyle: "italic", color: "var(--tamu-gray-700)" }}>
              {packet.accuracyRequest}
            </p>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            Questions for Discussion
          </h3>
          <p style={{ fontSize: 13, color: "var(--tamu-gray-500)", marginBottom: 12 }}>
            Please select 2-3 questions that interest you most:
          </p>
          {(packet.questionMenu || []).map((q, idx) => (
            <div
              key={idx}
              style={{
                padding: 14,
                border: "1px solid var(--tamu-gray-200)",
                borderRadius: "var(--radius)",
                marginBottom: 8,
              }}
            >
              <div style={{ fontWeight: 500, fontSize: 14 }}>{q.question}</div>
              {q.context && (
                <div style={{ fontSize: 12, color: "var(--tamu-gray-500)", marginTop: 4 }}>
                  {q.context}
                </div>
              )}
            </div>
          ))}
        </div>

        <div
          style={{
            padding: "16px 32px",
            background: "var(--tamu-gray-50)",
            borderTop: "1px solid var(--tamu-gray-200)",
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <Shield size={16} color="var(--tamu-gray-400)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 12, color: "var(--tamu-gray-500)" }}>
            <p>
              <strong>Sources:</strong>{" "}
              {(packet.transparencyFooter?.sourcesUsed || []).join(", ")}
            </p>
            <p>{packet.transparencyFooter?.statement}</p>
            <p>{packet.transparencyFooter?.optOutNote}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PacketViewer;
