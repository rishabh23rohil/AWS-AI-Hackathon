import React, { useState } from "react";
import { Image as ImageIcon, X } from "lucide-react";
import { EVIDENCE_ITEMS } from "./evidenceData";

function EvidenceCard({ item, onClick }) {
  const [error, setError] = useState(false);
  const src = `${process.env.PUBLIC_URL || ""}/screenshot/${item.filename}`;

  return (
    <div
      style={{
        background: "white",
        border: "1px solid var(--tamu-gray-200)",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "var(--shadow-sm)",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      role="button"
      tabIndex={0}
    >
      <div style={{ height: 160, background: "var(--tamu-gray-100)", position: "relative" }}>
        {!error ? (
          <img
            src={src}
            alt={item.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={() => setError(true)}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--tamu-gray-500)", fontSize: 12 }}>
            <ImageIcon size={32} style={{ marginBottom: 8 }} />
            Add {item.filename} to public/screenshot/
          </div>
        )}
        <div style={{ position: "absolute", bottom: 8, left: 8, right: 8, display: "flex", gap: 8 }}>
          <span style={{ padding: "2px 8px", borderRadius: 4, background: "rgba(0,0,0,0.6)", color: "white", fontSize: 10 }}>{item.region}</span>
          <span style={{ padding: "2px 8px", borderRadius: 4, background: "rgba(0,0,0,0.6)", color: "white", fontSize: 10 }}>{item.service}</span>
        </div>
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{item.title}</div>
        <p style={{ fontSize: 12, color: "var(--tamu-gray-600)", lineHeight: 1.4 }}>{item.what}</p>
      </div>
    </div>
  );
}

export default function EvidenceGallery() {
  const [lightbox, setLightbox] = useState(null);

  return (
    <div id="aws-console-evidence">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
        {EVIDENCE_ITEMS.map((item) => (
          <EvidenceCard
            key={item.filename}
            item={item}
            onClick={() => setLightbox(item)}
          />
        ))}
      </div>
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Screenshot lightbox"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={() => setLightbox(null)}
        >
          <div
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              background: "white",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "var(--shadow-lg)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: 16, borderBottom: "1px solid var(--tamu-gray-200)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>{lightbox.title}</strong>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
              >
                <X size={24} />
              </button>
            </div>
            <img
              src={`${process.env.PUBLIC_URL || ""}/screenshot/${lightbox.filename}`}
              alt={lightbox.title}
              style={{ maxWidth: "90vw", maxHeight: "75vh", display: "block" }}
            />
            <div style={{ padding: 12, fontSize: 13, color: "var(--tamu-gray-600)" }}>{lightbox.what}</div>
          </div>
        </div>
      )}
    </div>
  );
}
