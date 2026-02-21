import React from "react";

const FILL = "#232F3E";
const ORANGE = "#FF9900";
const TEAL = "#61DAFB";

const INLINE = {
  "API Gateway": (
    <svg viewBox="0 0 48 48" fill="none"><rect x="4" y="12" width="40" height="24" rx="4" stroke={FILL} strokeWidth="2" fill="white"/><path d="M12 24h24M24 12v24" stroke={FILL} strokeWidth="2" strokeLinecap="round"/></svg>
  ),
  Lambda: (
    <svg viewBox="0 0 48 48" fill="none"><path d="M24 6L8 42h12l4-16 4 16h12L24 6z" stroke={FILL} strokeWidth="2" strokeLinejoin="round" fill="white"/></svg>
  ),
  "Step Functions": (
    <svg viewBox="0 0 48 48" fill="none"><rect x="6" y="14" width="16" height="20" rx="2" stroke={FILL} strokeWidth="2" fill="white"/><rect x="26" y="14" width="16" height="20" rx="2" stroke={FILL} strokeWidth="2" fill="white"/><path d="M22 24h4" stroke={FILL} strokeWidth="2" strokeLinecap="round"/></svg>
  ),
  Bedrock: (
    <svg viewBox="0 0 48 48" fill="none"><path d="M24 8l16 10v12L24 40 8 30V18L24 8z" stroke={FILL} strokeWidth="2" strokeLinejoin="round" fill="white"/></svg>
  ),
  DynamoDB: (
    <svg viewBox="0 0 48 48" fill="none"><rect x="8" y="10" width="32" height="28" rx="2" stroke={FILL} strokeWidth="2" fill="white"/><path d="M8 20h32M8 28h32" stroke={FILL} strokeWidth="2"/></svg>
  ),
  S3: (
    <svg viewBox="0 0 48 48" fill="none"><path d="M24 8c-4 0-6 2-8 4l-4 4c-2 2 0 4 2 4h20c2 0 4-2 2-4l-4-4c-2-2-4-4-8-4z" stroke={FILL} strokeWidth="2" fill="white"/><path d="M8 20v16c0 2 2 4 4 4h24c2 0 4-2 4-4V20" stroke={FILL} strokeWidth="2" fill="white"/></svg>
  ),
  Cognito: (
    <svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="18" r="8" stroke={FILL} strokeWidth="2" fill="white"/><path d="M12 38c0-6 5-10 12-10s12 4 12 10" stroke={FILL} strokeWidth="2" strokeLinecap="round"/></svg>
  ),
  Comprehend: (
    <svg viewBox="0 0 48 48" fill="none"><path d="M12 28l6-6 4 4 8-12 4 4" stroke={FILL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="6" y="34" width="36" height="6" rx="1" stroke={FILL} strokeWidth="2" fill="white"/></svg>
  ),
  Textract: (
    <svg viewBox="0 0 48 48" fill="none"><rect x="8" y="8" width="32" height="32" rx="2" stroke={FILL} strokeWidth="2" fill="white"/><path d="M14 18h20M14 24h14M14 30h10" stroke={FILL} strokeWidth="2" strokeLinecap="round"/></svg>
  ),
  SES: (
    <svg viewBox="0 0 48 48" fill="none"><path d="M8 14l16 12 16-12v18a2 2 0 01-2 2H10a2 2 0 01-2-2V14z" stroke={FILL} strokeWidth="2" fill="white"/></svg>
  ),
  React: (
    <svg viewBox="0 0 48 48" fill="none"><ellipse cx="24" cy="24" rx="8" ry="20" stroke={TEAL} strokeWidth="2"/><ellipse cx="24" cy="24" rx="8" ry="20" stroke={TEAL} strokeWidth="2" transform="rotate(60 24 24)"/><ellipse cx="24" cy="24" rx="8" ry="20" stroke={TEAL} strokeWidth="2" transform="rotate(120 24 24)"/><circle cx="24" cy="24" r="4" fill={TEAL}/></svg>
  ),
  Amplify: (
    <svg viewBox="0 0 48 48" fill="none"><path d="M24 6L8 18v12l16 12 16-12V18L24 6z" stroke={ORANGE} strokeWidth="2" fill="white"/></svg>
  ),
  "Claude 3 Sonnet": (
    <svg viewBox="0 0 48 48" fill="none"><path d="M24 8l16 10v12L24 40 8 30V18L24 8z" stroke={FILL} strokeWidth="2" strokeLinejoin="round" fill="white"/></svg>
  ),
};

export default function AwsIcon({ name, size = 32 }) {
  const el = INLINE[name];
  if (el) {
    return (
      <span style={{ width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {React.cloneElement(el, { width: size, height: size, style: { width: size, height: size } })}
      </span>
    );
  }
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--tamu-gray-200)",
        color: "var(--tamu-gray-700)",
        fontSize: size * 0.4,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {(name || "?")[0]}
    </span>
  );
}
