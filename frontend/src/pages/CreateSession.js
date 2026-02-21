import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  User,
  Mail,
  Link2,
  Upload,
  Sparkles,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";
import api from "../services/api";

function CreateSession() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    companyName: "",
    leaderName: "",
    intervieweeEmail: "",
    urls: [""],
    hasPdfUpload: false,
  });

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateUrl(index, value) {
    const urls = [...form.urls];
    urls[index] = value;
    setForm((prev) => ({ ...prev, urls }));
  }

  function addUrl() {
    setForm((prev) => ({ ...prev, urls: [...prev.urls, ""] }));
  }

  function removeUrl(index) {
    const urls = form.urls.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, urls: urls.length ? urls : [""] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.companyName.trim()) {
      setError("Company name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...form,
        urls: form.urls.filter((u) => u.trim()),
      };

      const result = await api.createSession(payload);
      navigate(`/session/${result.sessionId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div className="mb-6">
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Create Interview Session</h1>
        <p style={{ color: "var(--tamu-gray-500)", marginTop: 4 }}>
          Enter the company and interviewee details. The AI will generate your
          intelligence brief automatically.
        </p>
      </div>

      {error && (
        <div className="status-bar danger mb-4">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card mb-4">
          <div className="card-header">
            <h2>
              <Building2
                size={18}
                style={{ verticalAlign: "middle", marginRight: 8 }}
              />
              Company Information
            </h2>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label>
                Company Name <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
                placeholder="e.g., Acme Corporation"
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>
                  <User
                    size={14}
                    style={{ verticalAlign: "middle", marginRight: 4 }}
                  />
                  Business Leader Name
                </label>
                <input
                  type="text"
                  value={form.leaderName}
                  onChange={(e) => updateField("leaderName", e.target.value)}
                  placeholder="e.g., Jane Smith"
                />
              </div>
              <div className="form-group">
                <label>
                  <Mail
                    size={14}
                    style={{ verticalAlign: "middle", marginRight: 4 }}
                  />
                  Interviewee Email
                </label>
                <input
                  type="email"
                  value={form.intervieweeEmail}
                  onChange={(e) =>
                    updateField("intervieweeEmail", e.target.value)
                  }
                  placeholder="jane@company.com"
                />
                <div className="hint">
                  Optional. Used to send the pre-packet.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header">
            <h2>
              <Link2
                size={18}
                style={{ verticalAlign: "middle", marginRight: 8 }}
              />
              Source URLs
            </h2>
          </div>
          <div className="card-body">
            <p
              style={{
                fontSize: 13,
                color: "var(--tamu-gray-500)",
                marginBottom: 16,
              }}
            >
              Provide URLs the AI should analyze: company website, LinkedIn,
              press coverage, industry pages.
            </p>
            {form.urls.map((url, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 12,
                  alignItems: "center",
                }}
              >
                <input
                  type="url"
                  value={url}
                  onChange={(e) => updateUrl(idx, e.target.value)}
                  placeholder="https://..."
                  style={{ flex: 1 }}
                />
                {form.urls.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => removeUrl(idx)}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={addUrl}
            >
              <Plus size={14} />
              Add URL
            </button>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header">
            <h2>
              <Upload
                size={18}
                style={{ verticalAlign: "middle", marginRight: 8 }}
              />
              Document Upload
            </h2>
          </div>
          <div className="card-body">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={form.hasPdfUpload}
                onChange={(e) =>
                  updateField("hasPdfUpload", e.target.checked)
                }
                style={{ width: 18, height: 18 }}
              />
              <span>
                I have a PDF to upload (prior notes, sector briefs, etc.)
              </span>
            </label>
            {form.hasPdfUpload && (
              <div
                className="status-bar info mt-4"
                style={{ fontSize: 13 }}
              >
                After creating the session, you'll receive a secure upload
                link for your PDF.
              </div>
            )}
          </div>
        </div>

        <div
          className="card mb-4"
          style={{
            background:
              "linear-gradient(135deg, var(--tamu-maroon) 0%, #7a1a1a 100%)",
            color: "white",
          }}
        >
          <div className="card-body" style={{ textAlign: "center", padding: 32 }}>
            <Sparkles size={32} style={{ marginBottom: 12, opacity: 0.9 }} />
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>
              What happens next
            </h3>
            <p style={{ opacity: 0.85, fontSize: 14, maxWidth: 500, margin: "0 auto 20px" }}>
              The AI will analyze your sources, generate a 2-3 page Interviewer
              Brief with coaching cues, and create a 1-page Interviewee
              Pre-Packet — all in under 60 seconds.
            </p>
            <button
              type="submit"
              className="btn btn-lg"
              disabled={loading}
              style={{
                background: "white",
                color: "var(--tamu-maroon)",
                fontWeight: 600,
              }}
            >
              {loading ? (
                <>
                  <span className="spinner" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Intelligence Brief
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateSession;
