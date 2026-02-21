import React, { useState } from "react";
import AwsIcon from "./AwsIcon";
import { STACK_ITEMS } from "./stackData";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function StackGrid() {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div id="stack" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
      {STACK_ITEMS.map((item, i) => {
        const id = item.names.join("-");
        const open = expandedId === id;
        return (
          <div
            key={id}
            style={{
              background: "white",
              border: "1px solid var(--tamu-gray-200)",
              borderRadius: 12,
              padding: 20,
              boxShadow: "var(--shadow-sm)",
              transition: "box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              {item.names.slice(0, 2).map((n) => (
                <AwsIcon key={n} name={n} size={28} />
              ))}
              <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: "var(--tamu-gray-900)" }}>
                {item.names.join(" + ")}
              </div>
            </div>
            <p style={{ fontSize: 13, color: "var(--tamu-gray-600)", lineHeight: 1.5, marginBottom: 8 }}>
              {item.purpose}
            </p>
            <button
              type="button"
              onClick={() => setExpandedId(open ? null : id)}
              style={{
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
              {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              Why chosen
            </button>
            {open && (
              <p style={{ marginTop: 8, fontSize: 12, color: "var(--tamu-gray-600)", lineHeight: 1.5, paddingTop: 8, borderTop: "1px solid var(--tamu-gray-100)" }}>
                {item.why}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
