import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import AwsIcon from "./AwsIcon";

const CONNECTOR_H = <div className="tech-step-connector-h" aria-hidden />;
const CONNECTOR_V = <div className="tech-step-connector-v" aria-hidden />;

function StepCard({ step, index, isActive, onClick, accentColor }) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((o) => !o);

  const card = (
    <div
      id={step.id}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      style={{
        background: "white",
        borderRadius: 12,
        border: `2px solid ${isActive ? "var(--tamu-maroon)" : "var(--tamu-gray-200)"}`,
        boxShadow: isActive ? "var(--shadow-md)" : "var(--shadow-sm)",
        padding: "20px 24px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        minWidth: 0,
        maxWidth: 320,
      }}
      className="tech-step-card"
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: accentColor || "var(--tamu-maroon)",
            color: "white",
            fontSize: 14,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {index + 1}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--tamu-gray-900)", marginBottom: 6 }}>
            {step.name}
          </div>
          <p style={{ fontSize: 13, color: "var(--tamu-gray-600)", lineHeight: 1.5, marginBottom: 12 }}>
            {step.description}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            {step.services.map((s) => (
              <span
                key={s}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 8px",
                  borderRadius: 6,
                  background: "var(--tamu-gray-100)",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--tamu-gray-700)",
                }}
              >
                <AwsIcon name={s} size={14} />
                {s}
              </span>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "var(--tamu-gray-500)", marginBottom: 4 }}>
            <strong>In:</strong> {step.inputs}
          </div>
          <div style={{ fontSize: 11, color: "var(--tamu-gray-500)" }}>
            <strong>Out:</strong> {step.outputs}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggle();
            }}
            style={{
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              color: "var(--tamu-maroon)",
              fontWeight: 600,
            }}
          >
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Failure & retry
          </button>
          {open && (
            <div
              style={{
                marginTop: 8,
                padding: 12,
                background: "var(--tamu-gray-50)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--tamu-gray-700)",
                lineHeight: 1.5,
              }}
            >
              {step.failureBehavior}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return card;
}

export default function FlowStepper({ steps, accentColor }) {
  const [activeId, setActiveId] = useState(steps[0]?.id || null);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: 8,
        justifyContent: "flex-start",
      }}
      className="tech-flow-stepper"
    >
      {steps.map((step, i) => (
        <React.Fragment key={step.id}>
          {i > 0 && CONNECTOR_H}
          <StepCard
            step={step}
            index={i}
            isActive={activeId === step.id}
            onClick={() => setActiveId(step.id)}
            accentColor={accentColor}
          />
        </React.Fragment>
      ))}
    </div>
  );
}
