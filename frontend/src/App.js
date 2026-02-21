import React from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Video,
  ClipboardCheck,
  Shield,
  LogOut,
  ChevronRight,
  Layers,
} from "lucide-react";
import Dashboard from "./pages/Dashboard";
import CreateSession from "./pages/CreateSession";
import SessionDetail from "./pages/SessionDetail";
import IntervieweeFeedback from "./pages/IntervieweeFeedback";
import LiveInterview from "./pages/LiveInterview";
import PostCallSynthesis from "./pages/PostCallSynthesis";
import GovernanceDashboard from "./pages/GovernanceDashboard";
import TechAndArchitecture from "./pages/TechAndArchitecture";

function Navbar({ user, signOut }) {
  const location = useLocation();

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/create", icon: PlusCircle, label: "New Session" },
    { to: "/tech", icon: Layers, label: "Tech & Architecture" },
    { to: "/governance", icon: Shield, label: "Governance" },
  ];

  return (
    <nav
      style={{
        background: "var(--tamu-maroon)",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
        boxShadow: "var(--shadow-md)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <Link
          to="/"
          style={{
            color: "white",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <FileText size={24} />
          <span style={{ fontWeight: 700, fontSize: 18 }}>
            Texas Insights Engine
          </span>
        </Link>

        <div style={{ display: "flex", gap: 4 }}>
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  color: active ? "white" : "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  padding: "8px 14px",
                  borderRadius: "var(--radius)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  background: active ? "rgba(255,255,255,0.15)" : "transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span
          style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: 13,
          }}
        >
          {user?.signInDetails?.loginId || "User"}
        </span>
        <button
          onClick={signOut}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "white",
            padding: "6px 12px",
            borderRadius: "var(--radius)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
          }}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </nav>
  );
}

function Breadcrumb() {
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean);

  if (parts.length === 0) return null;

  const crumbs = [{ label: "Home", to: "/" }];
  const labelMap = {
    create: "New Session",
    session: "Session",
    feedback: "Feedback",
    interview: "Live Interview",
    synthesis: "Synthesis",
    governance: "Governance",
    tech: "Tech & Architecture",
  };

  parts.forEach((part, idx) => {
    const label = labelMap[part] || part;
    const to = "/" + parts.slice(0, idx + 1).join("/");
    crumbs.push({ label, to });
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontSize: 13,
        color: "var(--tamu-gray-500)",
        marginBottom: 20,
      }}
    >
      {crumbs.map((crumb, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <ChevronRight size={14} />}
          {idx === crumbs.length - 1 ? (
            <span style={{ color: "var(--tamu-gray-700)", fontWeight: 500 }}>
              {crumb.label}
            </span>
          ) : (
            <Link
              to={crumb.to}
              style={{ color: "var(--tamu-gray-500)", textDecoration: "none" }}
            >
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function App({ user, signOut }) {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar user={user} signOut={signOut} />
        <main className="main-content">
          <Breadcrumb />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateSession />} />
            <Route path="/session/:sessionId" element={<SessionDetail />} />
            <Route
              path="/feedback/:sessionId"
              element={<IntervieweeFeedback />}
            />
            <Route
              path="/interview/:sessionId"
              element={<LiveInterview />}
            />
            <Route
              path="/synthesis/:sessionId"
              element={<PostCallSynthesis />}
            />
            <Route path="/tech" element={<TechAndArchitecture />} />
            <Route path="/governance" element={<GovernanceDashboard />} />
          </Routes>
        </main>
        <footer
          style={{
            textAlign: "center",
            padding: "20px",
            fontSize: 12,
            color: "var(--tamu-gray-400)",
            borderTop: "1px solid var(--tamu-gray-200)",
          }}
        >
          Texas Insights Engine &mdash; Mays Business School, Texas A&M
          University &mdash; AWS AI Hackathon 2025
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
