import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import {
  Target, Users, BarChart2, Settings, LogOut, Bell, ChevronRight,
  Upload, CheckCircle, AlertCircle, Clock, TrendingUp, TrendingDown,
  Star, FileText, Plus, X, Check, Eye, ChevronDown, ChevronUp,
  Zap, Shield, Activity, Award, Calendar, Filter, Download,
  User, Briefcase, Home, Search, MoreVertical, ArrowUp, ArrowDown,
  Brain, Heart, Layers, PieChart as PieIcon, RefreshCw, Edit, Trash2,
  Link, Unlink, ArrowRight, Info, Copy, Hash, Percent, Mail
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════════════════════ */
const C = {
  bg: "#0a0f1e", sidebar: "#0d1528", sidebarHover: "#162040",
  card: "#111827", cardBorder: "#1e2d4a", surface: "#162040",
  accent: "#3b82f6", accentHover: "#60a5fa", accentDim: "#1e3a5f",
  success: "#10b981", successDim: "#064e3b",
  warning: "#f59e0b", warningDim: "#78350f",
  danger: "#ef4444", dangerDim: "#7f1d1d",
  purple: "#8b5cf6", purpleDim: "#2e1065",
  cyan: "#06b6d4", cyanDim: "#164e63",
  text: "#f1f5f9", textMuted: "#94a3b8", textSub: "#475569",
  border: "#1e293b",
};

/* ═══════════════════════════════════════════════════════════════════════════════
   SEED DATA — Single source of truth, mutable via setState at top level
   ═══════════════════════════════════════════════════════════════════════════════ */
const INITIAL_USERS = [
  { id: "u1", name: "Priya Sharma", email: "emp1@demo.com", role: "EMPLOYEE", managerId: "u10", avatar: "PS", dept: "QA Engineering", group: "QA Engineer", status: "ACTIVE" },
  { id: "u2", name: "Arjun Mehta", email: "emp2@demo.com", role: "EMPLOYEE", managerId: "u10", avatar: "AM", dept: "Backend Dev", group: "Backend Developer", status: "ACTIVE" },
  { id: "u3", name: "Kavitha Nair", email: "emp3@demo.com", role: "EMPLOYEE", managerId: "u11", avatar: "KN", dept: "Frontend Dev", group: "Frontend Developer", status: "ACTIVE" },
  { id: "u4", name: "Vikram Patel", email: "emp4@demo.com", role: "EMPLOYEE", managerId: "u10", avatar: "VP", dept: "Backend Dev", group: "Backend Developer", status: "ACTIVE" },
  { id: "u5", name: "Sneha Rao", email: "emp5@demo.com", role: "EMPLOYEE", managerId: "u11", avatar: "SR", dept: "Frontend Dev", group: "Frontend Developer", status: "ACTIVE" },
  { id: "u10", name: "Rohit Kumar", email: "mgr1@demo.com", role: "MANAGER", managerId: null, avatar: "RK", dept: "Engineering", group: null, status: "ACTIVE" },
  { id: "u11", name: "Deepa Iyer", email: "mgr2@demo.com", role: "MANAGER", managerId: null, avatar: "DI", dept: "Product", group: null, status: "ACTIVE" },
  { id: "u99", name: "Suresh Admin", email: "admin@demo.com", role: "ADMIN", managerId: null, avatar: "SA", dept: "HR Operations", group: null, status: "ACTIVE" },
];

const PASSWORDS = { "emp1@demo.com":"Demo1234!","emp2@demo.com":"Demo1234!","emp3@demo.com":"Demo1234!","emp4@demo.com":"Demo1234!","emp5@demo.com":"Demo1234!","mgr1@demo.com":"Demo1234!","mgr2@demo.com":"Demo1234!","admin@demo.com":"Demo1234!" };

const INITIAL_GOALS_CATALOG = [
  { id: "g1", title: "Bug Reporting & Documentation", category: "QA", defaultWeight: 25 },
  { id: "g2", title: "Test Execution Coverage", category: "QA", defaultWeight: 30 },
  { id: "g3", title: "Automation Scripting (Playwright)", category: "QA", defaultWeight: 25 },
  { id: "g4", title: "Knowledge Sharing Sessions", category: "Team", defaultWeight: 10 },
  { id: "g5", title: "Feature Development — Auth Module", category: "Dev", defaultWeight: 35 },
  { id: "g6", title: "Bug Fix Resolution Rate", category: "Dev", defaultWeight: 20 },
  { id: "g7", title: "Code Review Participation", category: "Dev", defaultWeight: 15 },
  { id: "g8", title: "AWS Certification (SAA)", category: "Certification", defaultWeight: 20 },
  { id: "g9", title: "Accessibility Compliance (WCAG 2.1)", category: "Quality", defaultWeight: 15 },
  { id: "g10", title: "Performance Optimization Sprint", category: "Dev", defaultWeight: 20 },
];

const INITIAL_EMP_GOALS = {
  u1: [
    { id: "eg1", goalId: "g1", completion: 85, weight: 25, dueDate: "2025-06-30", updates: [{ pct: 40, date: "2025-01-15", note: "Q1 kick-off, baseline set" },{ pct: 60, date: "2025-03-10", note: "Filed 24 bugs in Q1" },{ pct: 85, date: "2025-04-05", note: "Added severity classification docs" }], files: ["Bug_Report_Q1.pdf"] },
    { id: "eg2", goalId: "g2", completion: 45, weight: 30, dueDate: "2025-05-15", updates: [{ pct: 15, date: "2025-01-20", note: "Initial test plan" },{ pct: 30, date: "2025-03-01", note: "Covered 30% API tests" },{ pct: 45, date: "2025-04-01", note: "Improved API test coverage" }], files: [] },
    { id: "eg3", goalId: "g3", completion: 20, weight: 25, dueDate: "2025-05-01", updates: [{ pct: 5, date: "2025-02-01", note: "Playwright setup done" },{ pct: 10, date: "2025-03-15", note: "First 3 scripts written" },{ pct: 20, date: "2025-04-08", note: "Login flow automated" }], files: [] },
    { id: "eg4", goalId: "g4", completion: 100, weight: 10, dueDate: "2025-03-31", updates: [{ pct: 50, date: "2025-02-20", note: "Conducted 1 session on API testing" },{ pct: 100, date: "2025-03-28", note: "Conducted 2nd session on CI/CD" }], files: ["Session_Deck.pptx"] },
    { id: "eg5", goalId: "g8", completion: 60, weight: 10, dueDate: "2025-07-31", updates: [{ pct: 25, date: "2025-02-15", note: "Completed foundational modules" },{ pct: 60, date: "2025-04-10", note: "Passed 3 practice exams" }], files: [] },
  ],
  u2: [
    { id: "eg6", goalId: "g5", completion: 92, weight: 35, dueDate: "2025-06-30", updates: [{ pct: 30, date: "2025-01-20", note: "Auth module design complete" },{ pct: 65, date: "2025-03-05", note: "OAuth2 + JWT implemented" },{ pct: 92, date: "2025-04-12", note: "MFA added, PR reviewed" }], files: ["Auth_Module_PR.pdf"] },
    { id: "eg7", goalId: "g6", completion: 78, weight: 20, dueDate: "2025-06-30", updates: [{ pct: 40, date: "2025-02-01", note: "Bug triage process setup" },{ pct: 78, date: "2025-04-10", note: "78% resolution rate achieved" }], files: [] },
    { id: "eg8", goalId: "g7", completion: 55, weight: 15, dueDate: "2025-06-30", updates: [{ pct: 20, date: "2025-02-15", note: "Reviewed 5 PRs" },{ pct: 55, date: "2025-04-05", note: "22 PRs reviewed total" }], files: [] },
    { id: "eg9", goalId: "g8", completion: 100, weight: 30, dueDate: "2025-03-31", updates: [{ pct: 50, date: "2025-02-10", note: "All modules completed" },{ pct: 100, date: "2025-03-20", note: "Passed AWS SAA exam!" }], files: ["AWS_Certificate.pdf"] },
  ],
  u3: [
    { id: "eg10", goalId: "g9", completion: 40, weight: 35, dueDate: "2025-05-30", updates: [{ pct: 15, date: "2025-01-25", note: "WCAG audit started" },{ pct: 40, date: "2025-04-01", note: "40% components compliant" }], files: [] },
    { id: "eg11", goalId: "g10", completion: 70, weight: 40, dueDate: "2025-06-30", updates: [{ pct: 30, date: "2025-02-10", note: "Lighthouse audit baseline" },{ pct: 70, date: "2025-04-10", note: "LCP improved 45%, CLS fixed" }], files: [] },
    { id: "eg12", goalId: "g4", completion: 100, weight: 15, dueDate: "2025-03-31", updates: [{ pct: 100, date: "2025-03-30", note: "Presented React perf tips" }], files: [] },
    { id: "eg13", goalId: "g7", completion: 60, weight: 10, dueDate: "2025-06-30", updates: [{ pct: 25, date: "2025-02-20", note: "10 PRs reviewed" },{ pct: 60, date: "2025-04-08", note: "25 PRs reviewed total" }], files: [] },
  ],
  u4: [
    { id: "eg14", goalId: "g5", completion: 72, weight: 40, dueDate: "2025-06-30", updates: [{ pct: 25, date: "2025-01-30", note: "API scaffolding" },{ pct: 72, date: "2025-04-10", note: "Core endpoints done" }], files: [] },
    { id: "eg15", goalId: "g7", completion: 35, weight: 30, dueDate: "2025-06-30", updates: [{ pct: 10, date: "2025-02-15", note: "Started reviewing" },{ pct: 35, date: "2025-04-05", note: "12 PRs reviewed" }], files: [] },
    { id: "eg16", goalId: "g8", completion: 58, weight: 30, dueDate: "2025-06-30", updates: [{ pct: 30, date: "2025-03-01", note: "Core modules done" },{ pct: 58, date: "2025-04-08", note: "Practice exams ongoing" }], files: [] },
  ],
  u5: [
    { id: "eg17", goalId: "g9", completion: 55, weight: 30, dueDate: "2025-06-30", updates: [{ pct: 20, date: "2025-02-01", note: "Audit started" },{ pct: 55, date: "2025-04-05", note: "55% components done" }], files: [] },
    { id: "eg18", goalId: "g10", completion: 82, weight: 40, dueDate: "2025-06-30", updates: [{ pct: 40, date: "2025-02-20", note: "Initial optimizations" },{ pct: 82, date: "2025-04-10", note: "Bundle size reduced 38%" }], files: [] },
    { id: "eg19", goalId: "g4", completion: 100, weight: 15, dueDate: "2025-03-31", updates: [{ pct: 100, date: "2025-03-25", note: "CSS Grid workshop delivered" }], files: [] },
    { id: "eg20", goalId: "g7", completion: 48, weight: 15, dueDate: "2025-06-30", updates: [{ pct: 48, date: "2025-04-01", note: "18 PRs reviewed" }], files: [] },
  ],
};

const INITIAL_LIFE_EVENTS = {
  u1: [
    { id: "le1", type: "Medical Leave", desc: "Appendectomy recovery", start: "2025-01-10", end: "2025-01-25", status: "APPROVED", reviewedBy: "u10" },
    { id: "le2", type: "Personal Emergency", desc: "Family emergency — travel required", start: "2025-03-20", end: "2025-03-22", status: "PENDING", reviewedBy: null },
  ],
  u2: [],
  u3: [{ id: "le3", type: "Bereavement", desc: "Loss of parent", start: "2025-02-05", end: "2025-02-12", status: "APPROVED", reviewedBy: "u11" }],
  u4: [],
  u5: [{ id: "le4", type: "Sabbatical", desc: "Mental health break", start: "2025-03-01", end: "2025-03-07", status: "APPROVED", reviewedBy: "u11" }],
};

const INITIAL_RATING_PERIODS = [
  { id: "rp1", name: "H1 2024", start: "2024-01-01", end: "2024-06-30", isActive: false },
  { id: "rp2", name: "H2 2024", start: "2024-07-01", end: "2024-12-31", isActive: false },
  { id: "rp3", name: "H1 2025", start: "2025-01-01", end: "2025-06-30", isActive: true },
];

const INITIAL_GROUPS = [
  { id: "gr1", name: "QA Engineer", goals: ["g1","g2","g3","g4"] },
  { id: "gr2", name: "Backend Developer", goals: ["g5","g6","g7","g8"] },
  { id: "gr3", name: "Frontend Developer", goals: ["g9","g10","g4","g7"] },
];

const INITIAL_APPROVALS = [
  { id: "a1", type: "WEIGHT_CHANGE", employeeId: "u1", detail: "Goal: Test Execution — weight 30% → 40%", date: "2025-04-14", managerId: "u10" },
  { id: "a2", type: "LIFE_EVENT", employeeId: "u1", detail: "Personal Emergency: Mar 20–22", date: "2025-04-15", managerId: "u10", lifeEventId: "le2" },
  { id: "a3", type: "TEAM_LINK", detail: "Link new hire Ravi Das to Rohit Kumar's team", date: "2025-04-15", managerId: "u10", adminOnly: true },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════════════════════════ */
function goalStatus(completion) {
  if (completion >= 100) return "COMPLETED";
  if (completion < 30) return "OFF_TRACK";
  if (completion < 60) return "NEEDS_ATTENTION";
  return "ON_TRACK";
}

function computeRating(goals, lifeEvents = []) {
  if (!goals || goals.length === 0) return { raw: 0, adjusted: 0, isAdjusted: false };
  const totalWeight = goals.reduce((s, g) => s + g.weight, 0);
  if (totalWeight === 0) return { raw: 0, adjusted: 0, isAdjusted: false };
  const raw = goals.reduce((s, g) => s + (g.completion * g.weight / totalWeight), 0);
  const approved = (lifeEvents || []).filter(e => e.status === "APPROVED");
  const isAdjusted = approved.length > 0;
  const totalDays = approved.reduce((s, e) => {
    const d1 = new Date(e.start), d2 = new Date(e.end);
    return s + Math.max(0, (d2 - d1) / 86400000);
  }, 0);
  const factor = Math.min(1 + totalDays * 0.003, 1.10);
  const adjusted = isAdjusted ? Math.min(raw * factor, 100) : raw;
  return { raw: Math.round(raw * 10) / 10, adjusted: Math.round(adjusted * 10) / 10, isAdjusted };
}

function statusColor(s) {
  if (["COMPLETED","ON_TRACK","APPROVED","GREEN","ACTIVE"].includes(s)) return C.success;
  if (["NEEDS_ATTENTION","PENDING","YELLOW"].includes(s)) return C.warning;
  return C.danger;
}
function statusBg(s) {
  if (["COMPLETED","ON_TRACK","APPROVED","GREEN","ACTIVE"].includes(s)) return C.successDim;
  if (["NEEDS_ATTENTION","PENDING","YELLOW"].includes(s)) return C.warningDim;
  return C.dangerDim;
}

function teamHealthColor(goals) {
  if (goals.some(g => goalStatus(g.completion) === "OFF_TRACK")) return "RED";
  if (goals.some(g => goalStatus(g.completion) === "NEEDS_ATTENTION")) return "YELLOW";
  return "GREEN";
}

function genId(prefix = "x") { return prefix + Date.now() + Math.random().toString(36).slice(2, 6); }

function formatDate(d) { if (!d) return "—"; const dt = new Date(d); return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }

function daysLeft(d) { const diff = Math.ceil((new Date(d) - new Date()) / 86400000); return diff; }

/* ═══════════════════════════════════════════════════════════════════════════════
   UI PRIMITIVES
   ═══════════════════════════════════════════════════════════════════════════════ */
function Badge({ children, color = C.accent, style: s = {} }) {
  return <span style={{ background: color + "18", color, border: `1px solid ${color}33`, borderRadius: 6, padding: "2px 10px", fontSize: 11, fontWeight: 700, letterSpacing: 0.3, whiteSpace: "nowrap", ...s }}>{children}</span>;
}

function Card({ children, style: s = {}, onClick, hover = false }) {
  const [h, setH] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: C.card, border: `1px solid ${h && hover ? C.accent + "55" : C.border}`, borderRadius: 14, padding: "20px 24px", cursor: onClick ? "pointer" : "default", transition: "all 0.2s", transform: h && hover ? "translateY(-1px)" : "none", ...s }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color = C.accent, trend, onClick }) {
  return (
    <Card hover={!!onClick} onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={22} color={color} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: C.text, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: trend === "up" ? C.success : trend === "down" ? C.danger : C.textMuted, marginTop: 2 }}>{sub}</div>}
      </div>
      {onClick && <ChevronRight size={16} color={C.textSub} />}
    </Card>
  );
}

function ProgressBar({ value, color = C.accent, height = 8 }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div style={{ background: C.surface, borderRadius: 99, height, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${color}, ${color}cc)`, borderRadius: 99, transition: "width 0.5s ease" }} />
    </div>
  );
}

function Button({ children, onClick, variant = "primary", size = "md", disabled, style: s = {} }) {
  const base = { cursor: disabled ? "not-allowed" : "pointer", borderRadius: 9, fontWeight: 600, fontFamily: "inherit", transition: "all 0.15s", border: "none", display: "inline-flex", alignItems: "center", gap: 6, opacity: disabled ? 0.5 : 1 };
  const sizes = { sm: { padding: "6px 14px", fontSize: 12 }, md: { padding: "9px 20px", fontSize: 13 }, lg: { padding: "12px 28px", fontSize: 14 } };
  const variants = {
    primary: { background: C.accent, color: "#fff" },
    success: { background: C.success, color: "#000" },
    danger: { background: C.danger, color: "#fff" },
    ghost: { background: "transparent", color: C.textMuted, border: `1px solid ${C.border}` },
    outline: { background: "transparent", color: C.accent, border: `1px solid ${C.accent}44` },
    warning: { background: C.warning, color: "#000" },
  };
  return <button onClick={disabled ? undefined : onClick} style={{ ...base, ...sizes[size], ...variants[variant], ...s }}>{children}</button>;
}

function Modal({ open, onClose, title, children, width = 560 }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, width: "100%", maxWidth: width, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, background: C.card, zIndex: 1, borderRadius: "18px 18px 0 0" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, padding: 4 }}><X size={18} /></button>
        </div>
        <div style={{ padding: "20px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && <label style={{ fontSize: 12, color: C.textMuted, fontWeight: 600 }}>{label}</label>}
      <input {...props} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none", ...(props.style || {}) }} />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && <label style={{ fontSize: 12, color: C.textMuted, fontWeight: 600 }}>{label}</label>}
      <select {...props} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none", ...(props.style || {}) }}>{children}</select>
    </div>
  );
}

function TextArea({ label, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && <label style={{ fontSize: 12, color: C.textMuted, fontWeight: 600 }}>{label}</label>}
      <textarea {...props} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none", resize: "vertical", minHeight: 72, ...(props.style || {}) }} />
    </div>
  );
}

function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 2, background: C.surface, borderRadius: 10, padding: 3 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
          fontFamily: "inherit", background: active === t.id ? C.accent : "transparent", color: active === t.id ? "#fff" : C.textMuted,
          transition: "all 0.15s"
        }}>{t.label}</button>
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, text, action }) {
  return (
    <Card style={{ textAlign: "center", padding: 48 }}>
      <Icon size={32} color={C.textSub} style={{ margin: "0 auto 12px", display: "block" }} />
      <div style={{ color: C.textMuted, fontSize: 14 }}>{text}</div>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </Card>
  );
}

function ConfirmDialog({ open, onClose, onConfirm, title, message }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width={420}>
      <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7, marginBottom: 20 }}>{message}</div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm}>Confirm</Button>
      </div>
    </Modal>
  );
}

function Toast({ message, type = "success", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  const color = type === "success" ? C.success : type === "error" ? C.danger : C.warning;
  return (
    <div style={{ position: "fixed", top: 24, right: 24, zIndex: 2000, background: C.card, border: `1px solid ${color}44`, borderRadius: 12, padding: "12px 20px", display: "flex", alignItems: "center", gap: 10, boxShadow: `0 8px 32px rgba(0,0,0,0.4)`, animation: "slideIn 0.3s ease" }}>
      {type === "success" ? <CheckCircle size={16} color={color} /> : <AlertCircle size={16} color={color} />}
      <span style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{message}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   LAYOUT COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════════ */
const NAV = {
  EMPLOYEE: [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "goals", label: "My Goals", icon: Target },
    { id: "feedback", label: "AI Feedback", icon: Brain },
    { id: "rating", label: "My Rating", icon: Star },
    { id: "life-events", label: "Life Events", icon: Heart },
  ],
  MANAGER: [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "team", label: "My Team", icon: Users },
    { id: "goal-mgmt", label: "Goal Management", icon: Target },
    { id: "approvals", label: "Approvals", icon: CheckCircle },
    { id: "reports", label: "Team Report", icon: BarChart2 },
  ],
  ADMIN: [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "users", label: "User Management", icon: Users },
    { id: "goals", label: "Goal Management", icon: Target },
    { id: "periods", label: "Rating Periods", icon: Calendar },
    { id: "groups", label: "Groups", icon: Layers },
    { id: "reports", label: "Org Report", icon: BarChart2 },
  ],
};

function Sidebar({ user, page, setPage, onLogout, approvalCount }) {
  const nav = NAV[user.role];
  const rc = { EMPLOYEE: C.success, MANAGER: C.accent, ADMIN: C.purple }[user.role];
  return (
    <div style={{ width: 240, minHeight: "100vh", background: C.sidebar, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0, position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100 }}>
      <div style={{ padding: "20px 18px 16px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Activity size={18} color="#fff" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: C.text, letterSpacing: -0.3 }}>PerformIQ</span>
        </div>
      </div>
      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: rc + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: rc, flexShrink: 0 }}>{user.avatar}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
            <div style={{ fontSize: 11, color: rc, fontWeight: 600 }}>{user.role}</div>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "10px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {nav.map(item => {
          const active = page === item.id;
          const Icon = item.icon;
          const badge = item.id === "approvals" ? approvalCount : 0;
          return (
            <button key={item.id} onClick={() => setPage(item.id)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10,
              background: active ? C.accentDim : "transparent", border: "none", cursor: "pointer",
              color: active ? C.accent : C.textMuted, width: "100%", textAlign: "left", fontSize: 13,
              fontWeight: active ? 700 : 500, transition: "all 0.15s", fontFamily: "inherit"
            }}>
              <Icon size={17} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {badge > 0 && <span style={{ background: C.danger, color: "#fff", borderRadius: 99, padding: "1px 7px", fontSize: 10, fontWeight: 800 }}>{badge}</span>}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "10px 10px", borderTop: `1px solid ${C.border}` }}>
        <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "transparent", border: "none", cursor: "pointer", color: C.textMuted, width: "100%", textAlign: "left", fontSize: 13, fontFamily: "inherit" }}>
          <LogOut size={17} /> Sign Out
        </button>
      </div>
    </div>
  );
}

function TopBar({ title, sub, actions }) {
  return (
    <div style={{ padding: "20px 32px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: -0.5, margin: 0 }}>{title}</h1>
        {sub && <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>{sub}</div>}
      </div>
      {actions && <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );
}

function Page({ children }) {
  return <div style={{ padding: "0 32px 32px", display: "flex", flexDirection: "column", gap: 20, marginTop: 20 }}>{children}</div>;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   LOGIN
   ═══════════════════════════════════════════════════════════════════════════════ */
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("emp1@demo.com");
  const [password, setPassword] = useState("Demo1234!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const demos = [
    { label: "Employee", email: "emp1@demo.com", color: C.success },
    { label: "Manager", email: "mgr1@demo.com", color: C.accent },
    { label: "Admin", email: "admin@demo.com", color: C.purple },
  ];

  function handleLogin(e) {
    if (e) e.preventDefault();
    setLoading(true); setError("");
    setTimeout(() => {
      const u = Object.values(INITIAL_USERS).find(x => x.email === email);
      if (u && PASSWORDS[email] === password) { onLogin(u); }
      else { setError("Invalid credentials. Try a demo account below."); }
      setLoading(false);
    }, 500);
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: ${C.bg}; } ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        input, select, textarea { color-scheme: dark; }
        @keyframes slideIn { from { transform: translateX(100px); opacity:0 } to { transform: translateX(0); opacity:1 } }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.95)} }
        button:hover:not(:disabled) { filter: brightness(1.08); }
      `}</style>
      <div style={{ width: "100%", maxWidth: 420, padding: 24 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 60, height: 60, background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", boxShadow: `0 0 40px ${C.accent}33` }}>
            <Activity size={28} color="#fff" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>PerformIQ</div>
          <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>Performance Management System</div>
        </div>
        <Card style={{ padding: 28 }}>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
            <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            {error && <div style={{ color: C.danger, fontSize: 12, background: C.dangerDim, padding: "8px 12px", borderRadius: 8 }}>{error}</div>}
            <Button onClick={handleLogin} disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "11px" }}>
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>
        </Card>
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 11, color: C.textSub, textAlign: "center", marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>Quick Demo Access</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {demos.map(d => (
              <button key={d.label} onClick={() => { setEmail(d.email); setPassword("Demo1234!"); }}
                style={{ background: C.card, border: `1px solid ${d.color}33`, borderRadius: 10, padding: "9px 8px", cursor: "pointer", color: d.color, fontSize: 12, fontWeight: 700, fontFamily: "inherit", transition: "all 0.15s" }}>
                {d.label}
              </button>
            ))}
          </div>
          <div style={{ textAlign: "center", fontSize: 11, color: C.textSub, marginTop: 10 }}>Password: Demo1234!</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   EMPLOYEE VIEWS
   ═══════════════════════════════════════════════════════════════════════════════ */
function EmpDashboard({ user, goals, lifeEvents, goalsCatalog, setPage }) {
  const { adjusted, isAdjusted, raw } = computeRating(goals, lifeEvents);
  const completed = goals.filter(g => goalStatus(g.completion) === "COMPLETED").length;
  const attention = goals.filter(g => ["NEEDS_ATTENTION","OFF_TRACK"].includes(goalStatus(g.completion))).length;
  const onTrack = goals.filter(g => goalStatus(g.completion) === "ON_TRACK").length;
  const pending = lifeEvents.filter(e => e.status === "PENDING").length;
  const approvedEvts = lifeEvents.filter(e => e.status === "APPROVED").length;

  const upcomingDue = goals.filter(g => goalStatus(g.completion) !== "COMPLETED").sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const urgentGoals = upcomingDue.filter(g => daysLeft(g.dueDate) <= 30 && daysLeft(g.dueDate) > 0);

  const progressData = [
    { month: "Jan", score: 35 }, { month: "Feb", score: 44 }, { month: "Mar", score: 55 }, { month: "Apr", score: adjusted },
  ];
  const categoryData = goals.reduce((acc, g) => {
    const cat = goalsCatalog.find(c => c.id === g.goalId)?.category || "Other";
    const ex = acc.find(a => a.name === cat);
    if (ex) { ex.value += g.completion * g.weight / 100; } else { acc.push({ name: cat, value: g.completion * g.weight / 100 }); }
    return acc;
  }, []);
  const PIE_COLORS = [C.accent, C.success, C.purple, C.warning, C.cyan, C.danger];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <TopBar title={`Welcome back, ${user.name.split(" ")[0]}`} sub={`H1 2025 Performance Snapshot · ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}`} />

      {isAdjusted && (
        <div style={{ margin: "0 32px", background: C.accentDim, border: `1px solid ${C.accent}33`, borderRadius: 12, padding: "10px 18px", display: "flex", alignItems: "center", gap: 10 }}>
          <Heart size={15} color={C.accent} />
          <span style={{ fontSize: 13, color: C.accent }}>Empathy adjustment active — {approvedEvts} approved life event(s) factored into rating ({raw}% → {adjusted}%)</span>
        </div>
      )}

      <div style={{ padding: "0 32px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <StatCard label="Current Rating" value={`${adjusted}%`} sub={isAdjusted ? `Raw: ${raw}% · Adjusted` : "Weighted score"} icon={Star} color={C.accent} onClick={() => setPage("rating")} />
        <StatCard label="Goals Completed" value={`${completed}/${goals.length}`} sub={`${onTrack} on track`} icon={CheckCircle} color={C.success} onClick={() => setPage("goals")} />
        <StatCard label="Needs Attention" value={attention} sub={attention > 0 ? `${urgentGoals.length} due within 30 days` : "All healthy"} icon={AlertCircle} color={attention > 0 ? C.warning : C.success} onClick={() => setPage("goals")} />
        <StatCard label="Life Events" value={`${approvedEvts}/${lifeEvents.length}`} sub={pending > 0 ? `${pending} pending approval` : "All processed"} icon={Heart} color={C.purple} onClick={() => setPage("life-events")} />
      </div>

      <div style={{ padding: "0 32px", display: "grid", gridTemplateColumns: "5fr 3fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Rating Trend — H1 2025</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={progressData}>
              <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.accent} stopOpacity={0.3}/><stop offset="95%" stopColor={C.accent} stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="month" stroke={C.textMuted} tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} stroke={C.textMuted} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="score" stroke={C.accent} strokeWidth={2.5} fill="url(#rg)" dot={{ r: 4, fill: C.accent }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Weight by Category</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {categoryData.map((d, i) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span style={{ fontSize: 11, color: C.textMuted }}>{d.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {urgentGoals.length > 0 && (
        <div style={{ padding: "0 32px" }}>
          <Card style={{ borderColor: C.warning + "44" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.warning, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={16} /> Upcoming Deadlines
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {urgentGoals.slice(0, 3).map(g => {
                const def = goalsCatalog.find(c => c.id === g.goalId);
                const dl = daysLeft(g.dueDate);
                return (
                  <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: C.surface, borderRadius: 10, cursor: "pointer" }} onClick={() => setPage("goals")}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{def?.title}</div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>Due {formatDate(g.dueDate)}</div>
                    </div>
                    <Badge color={dl <= 7 ? C.danger : C.warning}>{dl}d left</Badge>
                    <span style={{ fontSize: 13, fontWeight: 700, color: statusColor(goalStatus(g.completion)) }}>{g.completion}%</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      <div style={{ padding: "0 32px" }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>Quick Actions</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {[
              { label: "Update Goal Progress", icon: TrendingUp, color: C.accent, page: "goals" },
              { label: "View AI Recommendations", icon: Brain, color: C.purple, page: "feedback" },
              { label: "Add Life Event", icon: Heart, color: C.success, page: "life-events" },
            ].map(({ label, icon: Icon, color, page: pg }) => (
              <div key={label} onClick={() => setPage(pg)} style={{ background: C.surface, borderRadius: 12, padding: 14, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", border: `1px solid ${C.border}`, transition: "all 0.15s" }}>
                <Icon size={18} color={color} />
                <span style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{label}</span>
                <ChevronRight size={14} color={C.textSub} style={{ marginLeft: "auto" }} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function MyGoals({ user, goals, setGoals, goalsCatalog, showToast }) {
  const [updateModal, setUpdateModal] = useState(null);
  const [weightModal, setWeightModal] = useState(null);
  const [fileModal, setFileModal] = useState(null);
  const [newPct, setNewPct] = useState("");
  const [note, setNote] = useState("");
  const [newWeight, setNewWeight] = useState("");
  const [fileName, setFileName] = useState("");
  const [expanded, setExpanded] = useState({});

  const sorted = useMemo(() => {
    const s = g => goalStatus(g.completion);
    const order = { OFF_TRACK: 0, NEEDS_ATTENTION: 1, ON_TRACK: 2, COMPLETED: 3 };
    return [...goals].sort((a, b) => order[s(a)] - order[s(b)]);
  }, [goals]);

  const needsAttn = sorted.filter(g => ["NEEDS_ATTENTION","OFF_TRACK"].includes(goalStatus(g.completion)));
  const onTrack = sorted.filter(g => goalStatus(g.completion) === "ON_TRACK");
  const completed = sorted.filter(g => goalStatus(g.completion) === "COMPLETED");
  const totalWeight = goals.reduce((s, g) => s + g.weight, 0);

  function handleUpdate() {
    const pct = parseFloat(newPct);
    if (isNaN(pct) || pct < 0 || pct > 100) return;
    setGoals(prev => prev.map(g => g.id === updateModal.id
      ? { ...g, completion: pct, updates: [...g.updates, { pct, date: new Date().toISOString().split("T")[0], note: note || undefined }] }
      : g));
    showToast(`Updated to ${pct}%`);
    setUpdateModal(null); setNewPct(""); setNote("");
  }

  function handleFileUpload() {
    if (!fileName.trim()) return;
    setGoals(prev => prev.map(g => g.id === fileModal.id ? { ...g, files: [...g.files, fileName.trim()] } : g));
    showToast(`File "${fileName}" attached`);
    setFileModal(null); setFileName("");
  }

  function GoalCard({ goal }) {
    const def = goalsCatalog.find(c => c.id === goal.goalId);
    const st = goalStatus(goal.completion);
    const sc = statusColor(st);
    const open = expanded[goal.id];
    const dl = daysLeft(goal.dueDate);
    return (
      <div style={{ background: C.surface, border: `1px solid ${sc}22`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", cursor: "pointer" }} onClick={() => setExpanded(e => ({ ...e, [goal.id]: !e[goal.id] }))}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
              <Badge color={sc}>{st.replace(/_/g, " ")}</Badge>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{def?.title}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: C.textMuted }}>W:{goal.weight}%</span>
              {dl > 0 && st !== "COMPLETED" && <Badge color={dl <= 14 ? C.danger : dl <= 30 ? C.warning : C.textMuted}>{dl}d</Badge>}
              {open ? <ChevronUp size={14} color={C.textMuted} /> : <ChevronDown size={14} color={C.textMuted} />}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1 }}><ProgressBar value={goal.completion} color={sc} /></div>
            <span style={{ fontSize: 14, fontWeight: 800, color: sc, minWidth: 36, textAlign: "right" }}>{goal.completion}%</span>
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 5 }}>Due: {formatDate(goal.dueDate)} · Category: {def?.category} · Contributes: {(goal.completion * goal.weight / (totalWeight || 1)).toFixed(1)} pts</div>
        </div>
        {open && (
          <div style={{ borderTop: `1px solid ${C.border}`, padding: "14px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {st !== "COMPLETED" && <Button size="sm" onClick={() => { setUpdateModal(goal); setNewPct(String(goal.completion)); }}><TrendingUp size={12} /> Update Progress</Button>}
              <Button size="sm" variant="outline" onClick={() => { setWeightModal(goal); setNewWeight(String(goal.weight)); }}>
                <Percent size={12} /> Request Weight Change
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setFileModal(goal); setFileName(""); }}>
                <Upload size={12} /> Upload File
              </Button>
            </div>
            {goal.files.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6 }}>Attached Files:</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {goal.files.map((f, i) => (
                    <div key={i} style={{ background: C.accentDim, border: `1px solid ${C.accent}22`, borderRadius: 7, padding: "3px 10px", fontSize: 11, color: C.accent, display: "flex", alignItems: "center", gap: 5 }}>
                      <FileText size={11} /> {f}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6 }}>Update Timeline ({goal.updates.length} entries):</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 160, overflowY: "auto" }}>
                {[...goal.updates].reverse().map((u, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "4px 0" }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.accent, marginTop: 6, flexShrink: 0 }} />
                    <div>
                      <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{u.pct}%</span>
                      <span style={{ fontSize: 11, color: C.textMuted }}> · {formatDate(u.date)}</span>
                      {u.note && <div style={{ fontSize: 11, color: C.textMuted }}>{u.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function Section({ title, items, color, emoji }) {
    if (items.length === 0) return null;
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 14 }}>{emoji}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>{title}</span>
          <span style={{ background: color + "18", color, padding: "1px 8px", borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{items.length}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{items.map(g => <GoalCard key={g.id} goal={g} />)}</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <TopBar title="My Goals" sub={`H1 2025 · ${goals.length} goals · Total weight: ${totalWeight}% · Sorted by priority`} />

      {totalWeight !== 100 && (
        <div style={{ margin: "0 32px", background: C.warningDim, border: `1px solid ${C.warning}33`, borderRadius: 10, padding: "8px 16px", fontSize: 12, color: C.warning }}>
          <AlertCircle size={13} style={{ display: "inline", marginRight: 6, verticalAlign: -2 }} />
          Total goal weight is {totalWeight}% — should be 100% for accurate rating. Contact your manager.
        </div>
      )}

      <Page>
        <Section title="Needs Attention" items={needsAttn} color={C.danger} emoji="⚠" />
        <Section title="On Track" items={onTrack} color={C.success} emoji="✓" />
        <Section title="Completed" items={completed} color={C.textSub} emoji="●" />
      </Page>

      <Modal open={!!updateModal} onClose={() => setUpdateModal(null)} title={`Update: ${goalsCatalog.find(c => c.id === updateModal?.goalId)?.title}`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1, background: C.surface, borderRadius: 8, padding: 12, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: C.textMuted }}>Current</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{updateModal?.completion}%</div>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}><ArrowRight size={18} color={C.textMuted} /></div>
            <div style={{ flex: 1 }}><Input label="New %" type="number" min="0" max="100" value={newPct} onChange={e => setNewPct(e.target.value)} /></div>
          </div>
          <TextArea label="Note (optional)" value={note} onChange={e => setNote(e.target.value)} placeholder="What progress was made?" />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Button variant="ghost" onClick={() => setUpdateModal(null)}>Cancel</Button>
            <Button onClick={handleUpdate}>Save Update</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!weightModal} onClose={() => setWeightModal(null)} title="Request Weight Change">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 13, color: C.textMuted }}>Goal: <strong style={{ color: C.text }}>{goalsCatalog.find(c => c.id === weightModal?.goalId)?.title}</strong></div>
          <div style={{ background: C.warningDim, border: `1px solid ${C.warning}33`, borderRadius: 8, padding: 12, fontSize: 12, color: C.warning }}>
            <Shield size={12} style={{ display: "inline", marginRight: 6, verticalAlign: -2 }} />
            This request will be sent to your manager for approval.
          </div>
          <Input label={`New Weightage (current: ${weightModal?.weight}%)`} type="number" min="5" max="100" value={newWeight} onChange={e => setNewWeight(e.target.value)} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Button variant="ghost" onClick={() => setWeightModal(null)}>Cancel</Button>
            <Button onClick={() => { showToast("Weight change request submitted for approval"); setWeightModal(null); }}>Submit Request</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!fileModal} onClose={() => setFileModal(null)} title="Upload Evidence File">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 13, color: C.textMuted }}>Goal: <strong style={{ color: C.text }}>{goalsCatalog.find(c => c.id === fileModal?.goalId)?.title}</strong></div>
          <Input label="File Name" value={fileName} onChange={e => setFileName(e.target.value)} placeholder="e.g. Report_Q1.pdf" />
          <div style={{ background: C.surface, border: `2px dashed ${C.border}`, borderRadius: 10, padding: 24, textAlign: "center" }}>
            <Upload size={24} color={C.textSub} style={{ margin: "0 auto 8px", display: "block" }} />
            <div style={{ fontSize: 12, color: C.textMuted }}>In production, drag & drop files here.</div>
            <div style={{ fontSize: 11, color: C.textSub, marginTop: 4 }}>For demo: type a filename above and click attach.</div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Button variant="ghost" onClick={() => setFileModal(null)}>Cancel</Button>
            <Button onClick={handleFileUpload} disabled={!fileName.trim()}>Attach File</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function AIFeedback({ user, goals, goalsCatalog, lifeEvents }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 1500); return () => clearTimeout(t); }, []);

  const totalWeight = goals.reduce((s, g) => s + g.weight, 0) || 1;
  const weighted = Math.round(goals.reduce((s, g) => s + g.completion * g.weight / totalWeight, 0));
  const attnGoals = goals.filter(g => ["NEEDS_ATTENTION","OFF_TRACK"].includes(goalStatus(g.completion)));
  const goodGoals = goals.filter(g => ["ON_TRACK","COMPLETED"].includes(goalStatus(g.completion)));

  // Radar data for skill dimensions - show as horizontal bar for better readability
  const radarData = goals.map(g => {
    const def = goalsCatalog.find(c => c.id === g.goalId);
    return { subject: def?.title?.length > 20 ? def.title.slice(0, 20) + "..." : def?.title || "Goal", score: g.completion, fullMark: 100, fullTitle: def?.title };
  });

  // Use horizontal bar chart for skill display (values on X-axis)
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <TopBar title="AI Feedback" sub="Personalized recommendations based on your performance data" />
      <Page>
        <Card style={{ background: `linear-gradient(135deg, ${C.accentDim}, ${C.purpleDim})`, borderColor: C.accent + "33" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <Brain size={20} color={C.accent} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6 }}>Performance Summary</div>
              <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>
                Across {goals.length} goals in H1 2025, the weighted completion stands at <strong style={{ color: C.text }}>{weighted}%</strong>.
                {goodGoals.length > attnGoals.length
                  ? ` Strong momentum with ${goodGoals.length} goals on track or completed. `
                  : ` ${attnGoals.length} goal(s) require immediate focus to protect the overall rating. `}
                {lifeEvents.filter(e => e.status === "APPROVED").length > 0 && "Life event empathy adjustments are factored into the final rating."}
              </div>
            </div>
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {attnGoals.length > 0 && (
            <Card>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.warning, marginBottom: 14, display: "flex", gap: 8, alignItems: "center" }}>
                <AlertCircle size={16} /> Priority Focus Areas
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {attnGoals.map(g => {
                  const def = goalsCatalog.find(c => c.id === g.goalId);
                  const contrib = (g.completion * g.weight / totalWeight).toFixed(1);
                  const potential = (100 * g.weight / totalWeight).toFixed(1);
                  return (
                    <div key={g.id} style={{ background: C.warningDim, borderRadius: 10, padding: 14, border: `1px solid ${C.warning}22` }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{def?.title}</div>
                      <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6, marginBottom: 8 }}>
                        At {g.completion}% with {g.weight}% weight — contributing only {contrib} pts of possible {potential} pts.
                        {daysLeft(g.dueDate) <= 30 && daysLeft(g.dueDate) > 0 && ` Only ${daysLeft(g.dueDate)} days remaining.`}
                      </div>
                      <div style={{ fontSize: 12, color: C.warning, background: C.warning + "11", borderRadius: 6, padding: "5px 10px", display: "inline-block" }}>
                        → Dedicate focused time this week. Consider requesting manager support if blocked.
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {goodGoals.length > 0 && (
            <Card>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.success, marginBottom: 14, display: "flex", gap: 8, alignItems: "center" }}>
                <TrendingUp size={16} /> Strengths
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {goodGoals.map(g => {
                  const def = goalsCatalog.find(c => c.id === g.goalId);
                  return (
                    <div key={g.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <CheckCircle size={14} color={C.success} style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{def?.title}: </span>
                        <span style={{ fontSize: 12, color: C.textMuted }}>{g.completion}% complete — {goalStatus(g.completion) === "COMPLETED" ? "well done!" : "maintain pace for on-time delivery."}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
          <Card>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14, display: "flex", gap: 8, alignItems: "center" }}>
              <Zap size={16} color={C.purple} /> Recommended Next Steps
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                attnGoals.length > 0 ? `Focus 60% of available time on "${goalsCatalog.find(c => c.id === attnGoals[0]?.goalId)?.title}" — highest-impact improvement area.` : "Maintain current trajectory — all goals are progressing well.",
                "Upload evidence files for completed milestones to strengthen rating verification.",
                "Schedule a 1:1 with your manager to discuss any blockers before the quarter closes.",
                goals.some(g => g.files.length === 0 && goalStatus(g.completion) !== "COMPLETED") ? "Attach documentation to goals missing evidence files." : null,
              ].filter(Boolean).map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.purpleDim, border: `1px solid ${C.purple}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.purple, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.5 }}>{step}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>Skill Distribution</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={radarData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke={C.textMuted} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="subject" stroke={C.textMuted} tick={{ fontSize: 9 }} width={80} />
                <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} cursor={{ fill: C.surface }} />
                <Bar dataKey="score" fill={C.accent} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </Page>
    </div>
  );
}

function MyRating({ user, goals, lifeEvents, goalsCatalog }) {
  const { raw, adjusted, isAdjusted } = computeRating(goals, lifeEvents);
  const label = adjusted >= 90 ? "Exceptional" : adjusted >= 75 ? "Strong" : adjusted >= 60 ? "Meets Expectations" : adjusted >= 40 ? "Developing" : "Needs Improvement";
  const rc = adjusted >= 75 ? C.success : adjusted >= 50 ? C.warning : C.danger;
  const totalWeight = goals.reduce((s, g) => s + g.weight, 0) || 1;
  // Rating periods in reverse chronology (newest first)
  const periods = [
    { name: "H1 2025", raw, adj: adjusted, isAdj: isAdjusted, current: true },
    { name: "H2 2024", raw: 68.8, adj: 71.2, isAdj: true },
    { name: "H1 2024", raw: 72.4, adj: 72.4, isAdj: false },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <TopBar title="My Rating" sub="Data-driven · Manager can view but cannot edit · System-computed" />
      <Page>
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
          <Card>
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ fontSize: 60, fontWeight: 900, color: rc, lineHeight: 1 }}>{adjusted}</div>
              <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>out of 100</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginTop: 10 }}>{label}</div>
              {isAdjusted && (
                <div style={{ background: C.accentDim, border: `1px solid ${C.accent}33`, borderRadius: 8, padding: "5px 12px", fontSize: 11, color: C.accent, marginTop: 10, display: "inline-block" }}>
                  ✦ Empathy-adjusted ({raw} → {adjusted})
                </div>
              )}
            </div>
            <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 11, color: C.textSub, marginBottom: 10, textAlign: "center", textTransform: "uppercase", letterSpacing: 1 }}>Transparency</div>
              {[
                ["Goals measured", goals.length],
                ["Total weight", `${totalWeight}%`],
                ["Life events applied", lifeEvents.filter(e => e.status === "APPROVED").length],
                ["Manager override", "None"],
                ["Last computed", "Today"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0" }}>
                  <span style={{ color: C.textMuted }}>{k}</span>
                  <span style={{ color: C.text, fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>
          </Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>Goal Contribution Breakdown</div>
              {goals.map(g => {
                const def = goalsCatalog.find(c => c.id === g.goalId);
                const st = goalStatus(g.completion);
                const contrib = (g.completion * g.weight / totalWeight).toFixed(1);
                const max = (100 * g.weight / totalWeight).toFixed(1);
                return (
                  <div key={g.id} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 12, color: C.text }}>{def?.title}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: statusColor(st) }}>+{contrib} / {max} pts</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1 }}><ProgressBar value={g.completion} color={statusColor(st)} height={6} /></div>
                      <span style={{ fontSize: 11, color: C.textMuted, minWidth: 55 }}>{g.completion}% × {g.weight}w</span>
                    </div>
                  </div>
                );
              })}
            </Card>
            <Card>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>Rating History</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {periods.map(p => (
                  <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", background: p.current ? C.accentDim : C.surface, borderRadius: 10, border: p.current ? `1px solid ${C.accent}33` : "none" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{p.name} {p.current && <Badge color={C.accent} style={{ marginLeft: 6 }}>CURRENT</Badge>}</div>
                      {p.isAdj && <div style={{ fontSize: 10, color: C.accent }}>Life event adjustment applied</div>}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: p.adj >= 75 ? C.success : p.adj >= 50 ? C.warning : C.danger }}>{p.adj}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </Page>
    </div>
  );
}

function LifeEvents({ user, events, setEvents, allUsers, showToast }) {
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ type: "Medical Leave", desc: "", start: "", end: "" });
  const types = ["Medical Leave", "Bereavement", "Parental Leave", "Sabbatical", "Personal Emergency", "Other"];

  function handleAdd() {
    if (!form.start || !form.end) return;
    const ne = { id: genId("le"), type: form.type, desc: form.desc, start: form.start, end: form.end, status: "PENDING", reviewedBy: null };
    setEvents(prev => [...prev, ne]);
    showToast("Life event submitted for manager approval");
    setAddModal(false); resetForm();
  }

  function handleEdit() {
    if (!form.start || !form.end) return;
    setEvents(prev => prev.map(e => e.id === editModal.id ? { ...e, type: form.type, desc: form.desc, start: form.start, end: form.end } : e));
    showToast("Life event updated");
    setEditModal(null); resetForm();
  }

  function handleDelete() {
    setEvents(prev => prev.filter(e => e.id !== deleteConfirm.id));
    showToast("Life event removed");
    setDeleteConfirm(null);
  }

  function resetForm() { setForm({ type: "Medical Leave", desc: "", start: "", end: "" }); }

  function openEdit(e) {
    setForm({ type: e.type, desc: e.desc, start: e.start, end: e.end });
    setEditModal(e);
  }

  function getReviewer(id) { return allUsers.find(u => u.id === id)?.name || "—"; }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <TopBar title="Life Events" sub="Events that ethically affect your performance rating" actions={<Button onClick={() => { resetForm(); setAddModal(true); }}><Plus size={14} /> Add Event</Button>} />
      <Page>
        <div style={{ background: C.accentDim, border: `1px solid ${C.accent}33`, borderRadius: 12, padding: "12px 18px", fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>
          <Shield size={14} color={C.accent} style={{ display: "inline", marginRight: 8, verticalAlign: -2 }} />
          Life events apply empathy adjustments to your rating for affected periods. They do not override scores but recalibrate expectations. All events require manager approval and are fully auditable.
        </div>

        {events.length === 0 ? (
          <EmptyState icon={Heart} text="No life events recorded this period." action={<Button onClick={() => { resetForm(); setAddModal(true); }}>Add First Event</Button>} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {events.map(e => (
              <Card key={e.id}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <Badge color={statusColor(e.status)}>{e.status}</Badge>
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{e.type}</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>{formatDate(e.start)} → {formatDate(e.end)} ({Math.max(1, Math.ceil((new Date(e.end) - new Date(e.start)) / 86400000))} days)</div>
                    {e.desc && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>{e.desc}</div>}
                    {e.reviewedBy && <div style={{ fontSize: 11, color: C.success, marginTop: 5 }}>Approved by {getReviewer(e.reviewedBy)}</div>}
                    {e.status === "APPROVED" && <div style={{ fontSize: 11, color: C.accent, marginTop: 3 }}>✦ Rating recalculated with empathy adjustment</div>}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {e.status === "PENDING" && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => openEdit(e)}><Edit size={12} /> Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => setDeleteConfirm(e)}><Trash2 size={12} /></Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Page>

      <Modal open={addModal || !!editModal} onClose={() => { setAddModal(false); setEditModal(null); }} title={editModal ? "Edit Life Event" : "Add Life Event"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Select label="Event Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            {types.map(t => <option key={t}>{t}</option>)}
          </Select>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Start Date" type="date" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} />
            <Input label="End Date" type="date" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} />
          </div>
          <TextArea label="Description (optional)" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="Brief context…" />
          <div style={{ background: C.warningDim, border: `1px solid ${C.warning}33`, borderRadius: 8, padding: 10, fontSize: 12, color: C.warning }}>
            Requires manager approval. Rating unchanged until approved.
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Button variant="ghost" onClick={() => { setAddModal(false); setEditModal(null); }}>Cancel</Button>
            <Button onClick={editModal ? handleEdit : handleAdd} disabled={!form.start || !form.end}>{editModal ? "Save Changes" : "Submit for Approval"}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete}
        title="Delete Life Event" message={`Remove "${deleteConfirm?.type}" (${formatDate(deleteConfirm?.start)} – ${formatDate(deleteConfirm?.end)})? This cannot be undone.`} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MANAGER VIEWS
   ═══════════════════════════════════════════════════════════════════════════════ */
function MgrDashboard({ user, allUsers, empGoals, lifeEvents, goalsCatalog, approvals, setPage }) {
  const team = allUsers.filter(u => u.managerId === user.id);
  const teamData = team.map(m => {
    const g = empGoals[m.id] || [];
    const le = lifeEvents[m.id] || [];
    const { adjusted } = computeRating(g, le);
    return { ...m, goals: g, rating: adjusted, health: teamHealthColor(g) };
  });
  const avgRating = teamData.length > 0 ? teamData.reduce((s, m) => s + m.rating, 0) / teamData.length : 0;
  const atRisk = teamData.filter(m => m.health === "RED").length;
  const mgrApprovals = approvals.filter(a => a.managerId === user.id && !a.adminOnly);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <TopBar title="Team Dashboard" sub={`${user.name}'s Team · H1 2025`} />
      <div style={{ padding: "0 32px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <StatCard label="Team Members" value={team.length} sub="Active this period" icon={Users} color={C.accent} onClick={() => setPage("team")} />
        <StatCard label="Avg Team Rating" value={`${avgRating.toFixed(1)}%`} sub={avgRating >= 70 ? "Healthy" : "Needs focus"} icon={Star} color={C.success} onClick={() => setPage("reports")} />
        <StatCard label="Pending Approvals" value={mgrApprovals.length} sub={mgrApprovals.length > 0 ? "Action required" : "All clear"} icon={Clock} color={C.warning} onClick={() => setPage("approvals")} />
        <StatCard label="At-Risk Members" value={atRisk} sub={atRisk > 0 ? "Has off-track goals" : "All progressing"} icon={AlertCircle} color={atRisk > 0 ? C.danger : C.success} onClick={() => setPage("team")} />
      </div>
      <div style={{ padding: "0 32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>Team Health</div>
          {teamData.map(m => {
            const sc = statusColor(m.health);
            return (
              <div key={m.id} onClick={() => setPage("team")} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: C.surface, borderRadius: 10, border: `1px solid ${sc}22`, marginBottom: 8, cursor: "pointer" }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: sc + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: sc }}>{m.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{m.dept} · {m.goals.length} goals</div>
                </div>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: sc }} />
                <span style={{ fontSize: 14, fontWeight: 800, color: sc, minWidth: 40, textAlign: "right" }}>{m.rating}%</span>
              </div>
            );
          })}
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>Team Rating Distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={teamData.map(m => ({ name: m.name.split(" ")[0], rating: m.rating }))}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="name" stroke={C.textMuted} tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} stroke={C.textMuted} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="rating" radius={[5, 5, 0, 0]}>
                {teamData.map((m, i) => <Cell key={i} fill={m.rating >= 75 ? C.success : m.rating >= 50 ? C.warning : C.danger} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      {mgrApprovals.length > 0 && (
        <div style={{ padding: "0 32px" }}>
          <Card style={{ borderColor: C.warning + "33" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.warning, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <Bell size={16} /> Pending Actions
            </div>
            {mgrApprovals.slice(0, 3).map(a => {
              const emp = allUsers.find(u => u.id === a.employeeId);
              return (
                <div key={a.id} onClick={() => setPage("approvals")} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}22`, cursor: "pointer" }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{emp?.name}: </span>
                    <span style={{ fontSize: 12, color: C.textMuted }}>{a.detail}</span>
                  </div>
                  <ChevronRight size={14} color={C.textSub} />
                </div>
              );
            })}
          </Card>
        </div>
      )}
    </div>
  );
}

function MyTeam({ user, allUsers, empGoals, lifeEvents, goalsCatalog, setEmpGoals, showToast }) {
  const team = allUsers.filter(u => u.managerId === user.id);
  const [expanded, setExpanded] = useState({});
  const [showDesc, setShowDesc] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [assignModal, setAssignModal] = useState(null);
  const [selectedGoalId, setSelectedGoalId] = useState("");

  function handleAssignGoal() {
    if (!selectedGoalId || !assignModal) return;
    const def = goalsCatalog.find(g => g.id === selectedGoalId);
    if (!def) return;
    const existing = (empGoals[assignModal.id] || []);
    if (existing.some(g => g.goalId === selectedGoalId)) { showToast("Goal already assigned", "warning"); return; }
    const newGoal = { id: genId("eg"), goalId: selectedGoalId, completion: 0, weight: def.defaultWeight, dueDate: "2025-06-30", updates: [{ pct: 0, date: new Date().toISOString().split("T")[0], note: "Goal assigned by manager" }], files: [] };
    setEmpGoals(prev => ({ ...prev, [assignModal.id]: [...(prev[assignModal.id] || []), newGoal] }));
    showToast(`Assigned "${def.title}" to ${assignModal.name}`);
    setAssignModal(null); setSelectedGoalId("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <TopBar title="My Team" sub={`${team.length} members · Manage goals and performance`}
        actions={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Tabs tabs={[{ id: "id", label: "Goal IDs" }, { id: "desc", label: "Descriptions" }]} active={showDesc ? "desc" : "id"} onChange={v => setShowDesc(v === "desc")} />
          </div>
        }
      />
      <Page>
        {team.map(member => {
          const goals = empGoals[member.id] || [];
          const le = lifeEvents[member.id] || [];
          const { adjusted } = computeRating(goals, le);
          const health = teamHealthColor(goals);
          const sc = statusColor(health);
          const isOpen = expanded[member.id];
          return (
            <Card key={member.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }} onClick={() => setExpanded(e => ({ ...e, [member.id]: !e[member.id] }))}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: sc + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: sc, flexShrink: 0 }}>{member.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{member.name}</span>
                    <Badge color={sc}>{health}</Badge>
                    <span style={{ fontSize: 12, color: C.textMuted }}>{member.dept} · {goals.length} goals</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    {goals.map(g => {
                      const st = goalStatus(g.completion);
                      const def = goalsCatalog.find(c => c.id === g.goalId);
                      return (
                        <div key={g.id} style={{ background: statusBg(st), border: `1px solid ${statusColor(st)}22`, borderRadius: 6, padding: "3px 8px", fontSize: 10, color: statusColor(st), fontWeight: 600 }}>
                          {showDesc ? (def?.title?.slice(0, 25) || g.goalId) : g.goalId} · {g.completion}%
                        </div>
                      );
                    })}
                  </div>
                </div>
                <span style={{ fontSize: 22, fontWeight: 800, color: sc }}>{adjusted}%</span>
                {isOpen ? <ChevronUp size={16} color={C.textMuted} /> : <ChevronDown size={16} color={C.textMuted} />}
              </div>
              {isOpen && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Goal Details</span>
                    <Button size="sm" onClick={() => { setAssignModal(member); setSelectedGoalId(""); }}><Plus size={12} /> Assign Goal</Button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {goals.map(g => {
                      const def = goalsCatalog.find(c => c.id === g.goalId);
                      const st = goalStatus(g.completion);
                      return (
                        <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: C.surface, borderRadius: 10 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{def?.title}</div>
                            <div style={{ fontSize: 11, color: C.textMuted }}>Weight: {g.weight}% · Due: {formatDate(g.dueDate)}</div>
                          </div>
                          <div style={{ width: 100 }}><ProgressBar value={g.completion} color={statusColor(st)} height={6} /></div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: statusColor(st), minWidth: 36, textAlign: "right" }}>{g.completion}%</span>
                          {g.files.length > 0 && <FileText size={14} color={C.accent} title={g.files.join(", ")} />}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: 12, fontSize: 12, color: C.textMuted }}>
                    Rating (read-only): <strong style={{ color: C.text }}>{adjusted}%</strong>
                    {le.filter(e => e.status === "APPROVED").length > 0 && <span style={{ color: C.accent }}> · Empathy-adjusted</span>}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </Page>

      <Modal open={!!assignModal} onClose={() => setAssignModal(null)} title={`Assign Goal to ${assignModal?.name}`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Select label="Select Goal" value={selectedGoalId} onChange={e => setSelectedGoalId(e.target.value)}>
            <option value="">— Choose a goal —</option>
            {goalsCatalog.map(g => <option key={g.id} value={g.id}>{g.title} ({g.category})</option>)}
          </Select>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Button variant="ghost" onClick={() => setAssignModal(null)}>Cancel</Button>
            <Button onClick={handleAssignGoal} disabled={!selectedGoalId}>Assign Goal</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function MgrGoalMgmt({ user, allUsers, empGoals, goalsCatalog, setGoalsCatalog, showToast }) {
  const team = allUsers.filter(u => u.managerId === user.id);
  const allGoalIds = new Set();
  team.forEach(m => (empGoals[m.id] || []).forEach(g => allGoalIds.add(g.goalId)));
  
  // Include both: goals assigned to team AND custom goals added by manager
  const managerAddedGoalIds = new Set(
    goalsCatalog.filter(g => g.addedBy === user.id).map(g => g.id)
  );
  
  const unique = goalsCatalog.filter(g => allGoalIds.has(g.id) || managerAddedGoalIds.has(g.id));
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({ title: "", category: "", defaultWeight: "" });

  function handleAdd() {
    if (!form.title) return;
    const ng = { id: genId("g"), title: form.title, category: form.category || "Custom", defaultWeight: parseInt(form.defaultWeight) || 10, addedBy: user.id, isCustom: true };
    setGoalsCatalog(prev => [...prev, ng]);
    showToast(`Goal "${ng.title}" added to catalog`);
    setAddModal(false); setForm({ title: "", category: "", defaultWeight: "" });
  }

  // Separate custom goals from org goals
  const customGoals = unique.filter(g => g.isCustom || g.addedBy === user.id);
  const orgGoals = unique.filter(g => !g.isCustom && g.addedBy !== user.id);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <TopBar title="Goal Management" sub={`${unique.length} unique goals across your team of ${team.length}`} actions={<Button onClick={() => setAddModal(true)}><Plus size={14} /> Add Custom Goal</Button>} />
      <Page>
        {/* Custom Goals Section - Always visible when manager has added goals */}
        {customGoals.length > 0 && (
          <>
            <div style={{ fontSize: 12, color: C.purple, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <Zap size={12} /> Your Custom Goals
            </div>
            {customGoals.map(g => (
              <Card key={g.id} style={{ display: "flex", alignItems: "center", gap: 14, borderColor: C.purple + "33" }}>
                <Target size={16} color={C.purple} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{g.title}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>Category: {g.category} · Default weight: {g.defaultWeight}% · Assigned to: {team.filter(m => (empGoals[m.id] || []).some(eg => eg.goalId === g.id)).length > 0 ? team.filter(m => (empGoals[m.id] || []).some(eg => eg.goalId === g.id)).map(m => m.name.split(" ")[0]).join(", ") : "Not yet assigned"}</div>
                </div>
                <Badge color={C.purple}>CUSTOM</Badge>
              </Card>
            ))}
          </>
        )}
        
        {/* Org Goals Section */}
        {orgGoals.length > 0 && (
          <>
            <div style={{ fontSize: 12, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 700, marginBottom: 10, marginTop: customGoals.length > 0 ? 20 : 0 }}>Organization Goals</div>
            {orgGoals.map(g => (
              <Card key={g.id} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Target size={16} color={C.accent} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{g.title}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>Category: {g.category} · Default weight: {g.defaultWeight}% · Assigned to: {team.filter(m => (empGoals[m.id] || []).some(eg => eg.goalId === g.id)).map(m => m.name.split(" ")[0]).join(", ")}</div>
                </div>
                <Badge color={C.accent}>ORG</Badge>
              </Card>
            ))}
          </>
        )}

        {unique.length === 0 && (
          <EmptyState icon={Target} text="No goals in catalog yet. Add your first custom goal!" />
        )}
      </Page>
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add Custom Goal">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Goal Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Security Awareness Training" />
          <Input label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Compliance" />
          <Input label="Default Weight (%)" type="number" value={form.defaultWeight} onChange={e => setForm(f => ({ ...f, defaultWeight: e.target.value }))} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Button variant="ghost" onClick={() => setAddModal(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.title}>Add to Catalog</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function MgrApprovals({ approvals, setApprovals, allUsers, lifeEvents, setLifeEvents, showToast, currentUser }) {
  const mine = approvals.filter(a => a.managerId === currentUser.id && !a.adminOnly);

  function resolve(id, action) {
    const ap = mine.find(a => a.id === id);
    if (ap && ap.type === "LIFE_EVENT" && ap.lifeEventId && action === "approve") {
      setLifeEvents(prev => {
        const copy = { ...prev };
        for (const uid in copy) {
          copy[uid] = copy[uid].map(e => e.id === ap.lifeEventId ? { ...e, status: "APPROVED", reviewedBy: currentUser.id } : e);
        }
        return copy;
      });
    }
    setApprovals(prev => prev.filter(a => a.id !== id));
    showToast(`Request ${action === "approve" ? "approved" : "rejected"}`);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <TopBar title="Approvals" sub="Pending requests from your team" />
      <Page>
        {mine.length === 0 ? (
          <EmptyState icon={CheckCircle} text="All caught up! No pending approvals." />
        ) : mine.map(a => {
          const emp = allUsers.find(u => u.id === a.employeeId);
          return (
            <Card key={a.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5 }}>
                    <Badge color={a.type === "LIFE_EVENT" ? C.purple : C.warning}>{a.type.replace(/_/g, " ")}</Badge>
                    <span style={{ fontSize: 11, color: C.textMuted }}>{formatDate(a.date)}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{emp?.name || "Unknown"}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>{a.detail}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button size="sm" variant="success" onClick={() => resolve(a.id, "approve")}><Check size={12} /> Approve</Button>
                  <Button size="sm" variant="danger" onClick={() => resolve(a.id, "reject")}><X size={12} /> Reject</Button>
                </div>
              </div>
            </Card>
          );
        })}
      </Page>
    </div>
  );
}

function MgrReports({ user, allUsers, empGoals, lifeEvents, goalsCatalog }) {
  const team = allUsers.filter(u => u.managerId === user.id);
  const [filterMember, setFilterMember] = useState("ALL");
  const [drillDown, setDrillDown] = useState(null);

  const filtered = filterMember === "ALL" ? team : team.filter(m => m.id === filterMember);
  const data = filtered.map(m => {
    const g = empGoals[m.id] || [];
    const le = lifeEvents[m.id] || [];
    const { adjusted } = computeRating(g, le);
    return {
      id: m.id, name: m.name.split(" ")[0], fullName: m.name, rating: adjusted,
      completed: g.filter(x => goalStatus(x.completion) === "COMPLETED").length,
      onTrack: g.filter(x => goalStatus(x.completion) === "ON_TRACK").length,
      attention: g.filter(x => ["NEEDS_ATTENTION","OFF_TRACK"].includes(goalStatus(x.completion))).length,
      goals: g, totalGoals: g.length,
    };
  });
  const avgRating = data.length > 0 ? data.reduce((s, d) => s + d.rating, 0) / data.length : 0;
  const drillData = drillDown ? data.find(d => d.id === drillDown) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <TopBar title="Team Report" sub={`H1 2025 · ${user.name}'s Team`}
        actions={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Select value={filterMember} onChange={e => { setFilterMember(e.target.value); setDrillDown(null); }} style={{ minWidth: 160 }}>
              <option value="ALL">All Team Members</option>
              {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </Select>
          </div>
        }
      />
      <Page>
        {!drillDown ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              <StatCard label="Team Avg Rating" value={`${avgRating.toFixed(1)}%`} icon={Star} color={C.accent} />
              <StatCard label="Goals Completed" value={data.reduce((s, d) => s + d.completed, 0)} icon={CheckCircle} color={C.success} />
              <StatCard label="Needs Attention" value={data.reduce((s, d) => s + d.attention, 0)} icon={AlertCircle} color={C.warning} />
            </div>
            <Card>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Rating Comparison</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="name" stroke={C.textMuted} tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} stroke={C.textMuted} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="rating" name="Rating %" radius={[5, 5, 0, 0]} cursor="pointer" onClick={(d) => setDrillDown(d.id)}>
                    {data.map((d, i) => <Cell key={i} fill={d.rating >= 75 ? C.success : d.rating >= 50 ? C.warning : C.danger} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ fontSize: 11, color: C.textSub, textAlign: "center", marginTop: 6 }}>Click a bar to drill down</div>
            </Card>
            <Card>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>Detailed Breakdown</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {["Employee","Rating","Completed","On Track","Needs Attention","Total"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: C.textMuted, fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map(r => (
                    <tr key={r.id} onClick={() => setDrillDown(r.id)} style={{ borderBottom: `1px solid ${C.border}22`, cursor: "pointer" }}>
                      <td style={{ padding: "10px 12px", color: C.text, fontWeight: 600 }}>{r.fullName}</td>
                      <td style={{ padding: "10px 12px" }}><span style={{ color: r.rating >= 75 ? C.success : C.warning, fontWeight: 800 }}>{r.rating}%</span></td>
                      <td style={{ padding: "10px 12px" }}><Badge color={C.success}>{r.completed}</Badge></td>
                      <td style={{ padding: "10px 12px" }}><Badge color={C.accent}>{r.onTrack}</Badge></td>
                      <td style={{ padding: "10px 12px" }}><Badge color={r.attention > 0 ? C.warning : C.textSub}>{r.attention}</Badge></td>
                      <td style={{ padding: "10px 12px", color: C.textMuted }}>{r.totalGoals}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => setDrillDown(null)} size="sm"><ChevronLeft size={14} /> Back to Team View</Button>
            <Card>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>{drillData?.fullName}</div>
              <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 16 }}>Individual Performance Drill-Down · Rating: <strong style={{ color: statusColor(drillData?.rating >= 75 ? "ON_TRACK" : drillData?.rating >= 50 ? "NEEDS_ATTENTION" : "OFF_TRACK") }}>{drillData?.rating}%</strong></div>
              {drillData?.goals.map(g => {
                const def = goalsCatalog.find(c => c.id === g.goalId);
                const st = goalStatus(g.completion);
                return (
                  <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: C.surface, borderRadius: 10, marginBottom: 8 }}>
                    <Badge color={statusColor(st)}>{st.replace(/_/g, " ")}</Badge>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{def?.title}</div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>W:{g.weight}% · Due: {formatDate(g.dueDate)} · {g.updates.length} updates · {g.files.length} files</div>
                    </div>
                    <div style={{ width: 80 }}><ProgressBar value={g.completion} color={statusColor(st)} height={6} /></div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: statusColor(st) }}>{g.completion}%</span>
                  </div>
                );
              })}
            </Card>
          </>
        )}
      </Page>
    </div>
  );
}

// missing ChevronLeft import — use inline
function ChevronLeft(props) { return <ChevronRight {...props} style={{ ...props.style, transform: "rotate(180deg)" }} />; }

/* ═══════════════════════════════════════════════════════════════════════════════
   ADMIN VIEWS
   ═══════════════════════════════════════════════════════════════════════════════ */
function AdminDashboard({ allUsers, empGoals, lifeEvents, goalsCatalog, groups, approvals, setPage }) {
  const employees = allUsers.filter(u => u.role === "EMPLOYEE");
  const managers = allUsers.filter(u => u.role === "MANAGER");
  const activeGoals = Object.values(empGoals).flat().length;
  const completedGoals = Object.values(empGoals).flat().filter(g => goalStatus(g.completion) === "COMPLETED").length;
  const pendingApprovals = approvals.length;
  const [drillDownDept, setDrillDownDept] = useState(null);

  const deptMap = {};
  employees.forEach(e => {
    const dept = e.dept || "Other";
    if (!deptMap[dept]) deptMap[dept] = { dept, members: 0, totalRating: 0 };
    deptMap[dept].members++;
    const g = empGoals[e.id] || [];
    const le = lifeEvents[e.id] || [];
    deptMap[dept].totalRating += computeRating(g, le).adjusted;
  });
  const deptData = Object.values(deptMap).map(d => ({ ...d, avg: Math.round(d.totalRating / d.members * 10) / 10 }));

  const allRatings = employees.map(e => {
    const g = empGoals[e.id] || [];
    const le = lifeEvents[e.id] || [];
    return computeRating(g, le).adjusted;
  });
  const orgAvg = allRatings.length > 0 ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1) : 0;

  // Get employees in the drilled-down department
  const drillDownEmployees = drillDownDept ? employees.filter(e => (e.dept || "Other") === drillDownDept) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <TopBar title="Organization Dashboard" sub="PerformIQ · H1 2025 Overview" />
      <div style={{ padding: "0 32px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <StatCard label="Total Employees" value={employees.length} sub={`${managers.length} managers`} icon={Users} color={C.accent} onClick={() => setPage("users")} />
        <StatCard label="Org Avg Rating" value={`${orgAvg}%`} icon={TrendingUp} color={parseFloat(orgAvg) >= 70 ? C.success : C.warning} onClick={() => setPage("reports")} />
        <StatCard label="Active Goals" value={activeGoals} sub={`${completedGoals} completed`} icon={Target} color={C.purple} onClick={() => setPage("goals")} />
        <StatCard label="Pending Actions" value={pendingApprovals} sub={pendingApprovals > 0 ? "Requires attention" : "All clear"} icon={Clock} color={C.warning} onClick={() => setPage("users")} />
      </div>
      <div style={{ padding: "0 32px", display: "grid", gridTemplateColumns: drillDownDept ? "1fr" : "3fr 2fr", gap: 16 }}>
        {!drillDownDept ? (
          <Card>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Department Performance</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={deptData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis type="number" domain={[0, 100]} stroke={C.textMuted} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="dept" stroke={C.textMuted} tick={{ fontSize: 10 }} width={100} />
                <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="avg" name="Avg Rating" radius={[0, 5, 5, 0]} cursor="pointer" onClick={(d) => setDrillDownDept(d.dept)}>
                  {deptData.map((d, i) => <Cell key={i} fill={d.avg >= 75 ? C.success : d.avg >= 60 ? C.warning : C.danger} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ fontSize: 11, color: C.textSub, textAlign: "center", marginTop: 6 }}>Click a bar to drill down by department</div>
          </Card>
        ) : (
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <Button size="sm" variant="ghost" onClick={() => setDrillDownDept(null)}><ChevronLeft size={14} /> Back</Button>
              <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{drillDownDept} Department</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["Employee","Rating","Goals"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: C.textMuted, fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {drillDownEmployees.map(e => {
                  const g = empGoals[e.id] || [];
                  const le = lifeEvents[e.id] || [];
                  const { adjusted } = computeRating(g, le);
                  return (
                    <tr key={e.id} style={{ borderBottom: `1px solid ${C.border}22` }}>
                      <td style={{ padding: "10px 12px", color: C.text, fontWeight: 600 }}>{e.name}</td>
                      <td style={{ padding: "10px 12px" }}><span style={{ color: adjusted >= 75 ? C.success : adjusted >= 50 ? C.warning : C.danger, fontWeight: 800 }}>{adjusted}%</span></td>
                      <td style={{ padding: "10px 12px", color: C.textMuted }}>{g.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>Org Health</div>
          {[
            ["Active Users", `${allUsers.filter(u => u.status === "ACTIVE").length}/${allUsers.length}`, C.success],
            ["Managers", managers.length, C.accent],
            ["Groups", groups.length, C.purple],
            ["Goal Templates", goalsCatalog.length, C.cyan],
            ["Life Events (approved)", Object.values(lifeEvents).flat().filter(e => e.status === "APPROVED").length, C.warning],
          ].map(([l, v, c]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0" }}>
              <span style={{ fontSize: 12, color: C.textMuted }}>{l}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: c }}>{v}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function UserManagement({ allUsers, setAllUsers, groups, showToast }) {
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [form, setForm] = useState({ name: "", email: "", role: "EMPLOYEE", managerId: "", group: "" });
  const managers = allUsers.filter(u => u.role === "MANAGER");
  const roleColor = { EMPLOYEE: C.success, MANAGER: C.accent, ADMIN: C.purple };

  const filtered = allUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "ALL" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  function resetForm() { setForm({ name: "", email: "", role: "EMPLOYEE", managerId: "", group: "" }); }

  function handleAdd() {
    if (!form.name || !form.email) return;
    const nu = { id: genId("u"), name: form.name, email: form.email, role: form.role, managerId: form.role === "EMPLOYEE" ? form.managerId || null : null, avatar: form.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(), dept: form.group || "Unassigned", group: form.group || null, status: "ACTIVE" };
    setAllUsers(prev => [...prev, nu]);
    PASSWORDS[form.email] = "Demo1234!";
    showToast(`User "${form.name}" created`);
    setAddModal(false); resetForm();
  }

  function handleEdit() {
    if (!form.name || !form.email) return;
    setAllUsers(prev => prev.map(u => u.id === editModal.id ? {
      ...u, name: form.name, email: form.email, role: form.role,
      managerId: form.role === "EMPLOYEE" ? form.managerId || null : null,
      avatar: form.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(),
      group: form.group || u.group, dept: form.group || u.dept,
    } : u));
    showToast(`User "${form.name}" updated`);
    setEditModal(null); resetForm();
  }

  function handleDelete() {
    setAllUsers(prev => prev.map(u => u.id === deleteConfirm.id ? { ...u, status: "INACTIVE" } : u));
    showToast(`User "${deleteConfirm.name}" deactivated`);
    setDeleteConfirm(null);
  }

  function handleToggleStatus(u) {
    const newStatus = u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setAllUsers(prev => prev.map(user => user.id === u.id ? { ...user, status: newStatus } : user));
    showToast(`User "${u.name}" ${newStatus === "ACTIVE" ? "activated" : "deactivated"}`);
  }

  function openEdit(u) {
    setForm({ name: u.name, email: u.email, role: u.role, managerId: u.managerId || "", group: u.group || "" });
    setEditModal(u);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <TopBar title="User Management" sub={`${allUsers.length} accounts`} actions={<Button onClick={() => { resetForm(); setAddModal(true); }}><Plus size={14} /> Add User</Button>} />
      <Page>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={14} color={C.textMuted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 12px 9px 34px", color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
          </div>
          <Select value={filterRole} onChange={e => setFilterRole(e.target.value)} style={{ minWidth: 130 }}>
            <option value="ALL">All Roles</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </Select>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Name","Email","Role","Manager","Group","Status","Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: C.textMuted, fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ borderBottom: `1px solid ${C.border}22` }}>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: (roleColor[u.role]) + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: roleColor[u.role] }}>{u.avatar}</div>
                      <span style={{ color: C.text, fontWeight: 600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px", color: C.textMuted }}>{u.email}</td>
                  <td style={{ padding: "10px 12px" }}><Badge color={roleColor[u.role]}>{u.role}</Badge></td>
                  <td style={{ padding: "10px 12px", color: C.textMuted }}>{allUsers.find(m => m.id === u.managerId)?.name || "—"}</td>
                  <td style={{ padding: "10px 12px", color: C.textMuted }}>{u.group || "—"}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <button 
                      onClick={() => handleToggleStatus(u)}
                      style={{ 
                        background: u.status === "ACTIVE" ? C.success + "20" : C.danger + "20", 
                        border: `1px solid ${u.status === "ACTIVE" ? C.success + "44" : C.danger + "44"}`, 
                        borderRadius: 6, 
                        padding: "4px 10px", 
                        fontSize: 11, 
                        fontWeight: 600, 
                        color: u.status === "ACTIVE" ? C.success : C.danger, 
                        cursor: "pointer",
                        fontFamily: "inherit"
                      }}
                    >
                      {u.status}
                    </button>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(u)}><Edit size={12} /></Button>
                      {u.role !== "ADMIN" && <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(u)}><Trash2 size={12} color={C.danger} /></Button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Page>

      <Modal open={addModal || !!editModal} onClose={() => { setAddModal(false); setEditModal(null); }} title={editModal ? "Edit User" : "Add New User"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Email Address" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <Select label="Role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            <option value="EMPLOYEE">EMPLOYEE</option>
            <option value="MANAGER">MANAGER</option>
            <option value="ADMIN">ADMIN</option>
          </Select>
          {form.role === "EMPLOYEE" && (
            <>
              <Select label="Manager" value={form.managerId} onChange={e => setForm(f => ({ ...f, managerId: e.target.value }))}>
                <option value="">— Select Manager —</option>
                {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </Select>
              <Select label="Group" value={form.group} onChange={e => setForm(f => ({ ...f, group: e.target.value }))}>
                <option value="">— Select Group —</option>
                {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
              </Select>
            </>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Button variant="ghost" onClick={() => { setAddModal(false); setEditModal(null); }}>Cancel</Button>
            <Button onClick={editModal ? handleEdit : handleAdd} disabled={!form.name || !form.email}>{editModal ? "Save Changes" : "Create Account"}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete}
        title="Deactivate User" message={`Deactivate "${deleteConfirm?.name}"? They will lose access but data is preserved.`} />
    </div>
  );
}

function AdminGoalMgmt({ goalsCatalog, setGoalsCatalog, showToast }) {
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ title: "", category: "", defaultWeight: "" });

  function resetForm() { setForm({ title: "", category: "", defaultWeight: "" }); }

  function handleAdd() {
    if (!form.title) return;
    setGoalsCatalog(prev => [...prev, { id: genId("g"), title: form.title, category: form.category || "General", defaultWeight: parseInt(form.defaultWeight) || 10 }]);
    showToast(`Goal "${form.title}" added`);
    setAddModal(false); resetForm();
  }

  function handleEdit() {
    if (!form.title) return;
    setGoalsCatalog(prev => prev.map(g => g.id === editModal.id ? { ...g, title: form.title, category: form.category, defaultWeight: parseInt(form.defaultWeight) || g.defaultWeight } : g));
    showToast(`Goal "${form.title}" updated`);
    setEditModal(null); resetForm();
  }

  function handleDelete() {
    setGoalsCatalog(prev => prev.filter(g => g.id !== deleteConfirm.id));
    showToast(`Goal removed from catalog`);
    setDeleteConfirm(null);
  }

  function openEdit(g) {
    setForm({ title: g.title, category: g.category, defaultWeight: String(g.defaultWeight) });
    setEditModal(g);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <TopBar title="Goal Management" sub={`${goalsCatalog.length} goals in catalog`} actions={<Button onClick={() => { resetForm(); setAddModal(true); }}><Plus size={14} /> Add Goal</Button>} />
      <Page>
        {goalsCatalog.map(g => (
          <Card key={g.id} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: C.accentDim, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Target size={15} color={C.accent} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{g.title}</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>Category: {g.category} · Default weight: {g.defaultWeight}%</div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <Button size="sm" variant="ghost" onClick={() => openEdit(g)}><Edit size={12} /></Button>
              <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(g)}><Trash2 size={12} color={C.danger} /></Button>
            </div>
          </Card>
        ))}
      </Page>

      <Modal open={addModal || !!editModal} onClose={() => { setAddModal(false); setEditModal(null); }} title={editModal ? "Edit Goal" : "Add Goal"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Goal Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <Input label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
          <Input label="Default Weight (%)" type="number" value={form.defaultWeight} onChange={e => setForm(f => ({ ...f, defaultWeight: e.target.value }))} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Button variant="ghost" onClick={() => { setAddModal(false); setEditModal(null); }}>Cancel</Button>
            <Button onClick={editModal ? handleEdit : handleAdd} disabled={!form.title}>{editModal ? "Save" : "Add to Catalog"}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete}
        title="Delete Goal" message={`Remove "${deleteConfirm?.title}" from the catalog? Existing assignments will not be affected.`} />
    </div>
  );
}

function RatingPeriods({ periods, setPeriods, showToast }) {
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [form, setForm] = useState({ name: "", start: "", end: "" });
  const [error, setError] = useState("");

  // Sort periods in reverse chronology (newest first)
  const sortedPeriods = [...periods].sort((a, b) => new Date(b.start) - new Date(a.start));

  function resetForm() { setForm({ name: "", start: "", end: "" }); setError(""); }

  function validate(isEdit = false) {
    if (!form.name || !form.start || !form.end) { setError("All fields are required."); return false; }
    if (form.start >= form.end) { setError("End date must be after start date."); return false; }
    const others = isEdit ? periods.filter(p => p.id !== editModal.id) : periods;
    const overlap = others.some(p => !(form.end <= p.start || form.start >= p.end));
    if (overlap) { setError("Date range overlaps with an existing period."); return false; }
    setError(""); return true;
  }

  function handleAdd() {
    if (!validate()) return;
    setPeriods(prev => [...prev, { id: genId("rp"), name: form.name, start: form.start, end: form.end, isActive: false }]);
    showToast(`Period "${form.name}" created`);
    setAddModal(false); resetForm();
  }

  function handleEdit() {
    if (!validate(true)) return;
    setPeriods(prev => prev.map(p => p.id === editModal.id ? { ...p, name: form.name, start: form.start, end: form.end } : p));
    showToast(`Period "${form.name}" updated`);
    setEditModal(null); resetForm();
  }

  function toggleActive(id) {
    setPeriods(prev => prev.map(p => ({ ...p, isActive: p.id === id ? !p.isActive : false })));
    showToast("Active period updated");
  }

  function openEdit(p) {
    setForm({ name: p.name, start: p.start, end: p.end });
    setEditModal(p);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <TopBar title="Rating Periods" sub="Define evaluation time windows" actions={<Button onClick={() => { resetForm(); setAddModal(true); }}><Plus size={14} /> Add Period</Button>} />
      <Page>
        {sortedPeriods.length === 0 ? (
          <EmptyState icon={Calendar} text="No rating periods configured." action={<Button onClick={() => { resetForm(); setAddModal(true); }}>Create First Period</Button>} />
        ) : sortedPeriods.map(p => (
          <Card key={p.id} style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: p.isActive ? C.successDim : C.surface, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Calendar size={18} color={p.isActive ? C.success : C.textMuted} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{p.name}</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>{formatDate(p.start)} → {formatDate(p.end)}</div>
            </div>
            <Badge color={p.isActive ? C.success : C.textSub}>{p.isActive ? "ACTIVE" : "CLOSED"}</Badge>
            <div style={{ display: "flex", gap: 4 }}>
              <Button size="sm" variant={p.isActive ? "success" : "ghost"} onClick={() => toggleActive(p.id)}>{p.isActive ? "Active" : "Activate"}</Button>
              <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Edit size={12} /></Button>
            </div>
          </Card>
        ))}
      </Page>

      <Modal open={addModal || !!editModal} onClose={() => { setAddModal(false); setEditModal(null); setError(""); }} title={editModal ? "Edit Period" : "Add Rating Period"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Period Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. H2 2025" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Start Date" type="date" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} />
            <Input label="End Date" type="date" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} />
          </div>
          {error && <div style={{ color: C.danger, fontSize: 12, background: C.dangerDim, padding: "8px 12px", borderRadius: 8 }}>{error}</div>}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Button variant="ghost" onClick={() => { setAddModal(false); setEditModal(null); setError(""); }}>Cancel</Button>
            <Button onClick={editModal ? handleEdit : handleAdd}>{editModal ? "Save" : "Create Period"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function GroupsView({ groups, setGroups, goalsCatalog, allUsers, showToast }) {
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ name: "", goals: [] });

  function resetForm() { setForm({ name: "", goals: [] }); }

  function handleAdd() {
    if (!form.name) return;
    setGroups(prev => [...prev, { id: genId("gr"), name: form.name, goals: form.goals }]);
    showToast(`Group "${form.name}" created`);
    setAddModal(false); resetForm();
  }

  function handleEdit() {
    if (!form.name) return;
    setGroups(prev => prev.map(g => g.id === editModal.id ? { ...g, name: form.name, goals: form.goals } : g));
    showToast(`Group "${form.name}" updated`);
    setEditModal(null); resetForm();
  }

  function handleDelete() {
    setGroups(prev => prev.filter(g => g.id !== deleteConfirm.id));
    showToast(`Group removed`);
    setDeleteConfirm(null);
  }

  function openEdit(g) {
    setForm({ name: g.name, goals: [...g.goals] });
    setEditModal(g);
  }

  function memberCount(groupName) {
    return allUsers.filter(u => u.group === groupName).length;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <TopBar title="Groups" sub="Role-based goal templates for automatic goal assignment" actions={<Button onClick={() => { resetForm(); setAddModal(true); }}><Plus size={14} /> Add Group</Button>} />
      <Page>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
          {groups.map(g => (
            <Card key={g.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{g.name}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{memberCount(g.name)} members · {g.goals.length} goals</div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(g)}><Edit size={12} /></Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(g)}><Trash2 size={12} color={C.danger} /></Button>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {g.goals.map(gid => {
                  const def = goalsCatalog.find(c => c.id === gid);
                  return def ? (
                    <div key={gid} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 10px", background: C.surface, borderRadius: 7 }}>
                      <Target size={11} color={C.accent} />
                      <span style={{ fontSize: 12, color: C.textMuted }}>{def.title}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </Card>
          ))}
        </div>
      </Page>

      <Modal open={addModal || !!editModal} onClose={() => { setAddModal(false); setEditModal(null); }} title={editModal ? "Edit Group" : "Add Group"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Group Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. DevOps Engineer" />
          <div>
            <label style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, display: "block", marginBottom: 5 }}>Default Goals</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 200, overflowY: "auto", background: C.surface, borderRadius: 8, padding: 10 }}>
              {goalsCatalog.map(g => (
                <label key={g.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "4px 6px", borderRadius: 6 }}>
                  <input type="checkbox" checked={form.goals.includes(g.id)} onChange={e => setForm(f => ({ ...f, goals: e.target.checked ? [...f.goals, g.id] : f.goals.filter(id => id !== g.id) }))} style={{ accentColor: C.accent }} />
                  <span style={{ fontSize: 12, color: C.textMuted }}>{g.title} <span style={{ color: C.textSub }}>({g.category})</span></span>
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Button variant="ghost" onClick={() => { setAddModal(false); setEditModal(null); }}>Cancel</Button>
            <Button onClick={editModal ? handleEdit : handleAdd} disabled={!form.name}>{editModal ? "Save" : "Create Group"}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete}
        title="Delete Group" message={`Remove group "${deleteConfirm?.name}"? Members will not be affected.`} />
    </div>
  );
}

function OrgReport({ allUsers, empGoals, lifeEvents, goalsCatalog }) {
  const employees = allUsers.filter(u => u.role === "EMPLOYEE");
  const managers = allUsers.filter(u => u.role === "MANAGER");
  const [filterMgr, setFilterMgr] = useState("ALL");
  const [drillDown, setDrillDown] = useState(null);

  const filtered = filterMgr === "ALL" ? employees : employees.filter(e => e.managerId === filterMgr);

  const deptMap = {};
  filtered.forEach(e => {
    const dept = e.dept || "Other";
    if (!deptMap[dept]) deptMap[dept] = { dept, members: 0, totalRating: 0, completed: 0, active: 0 };
    const g = empGoals[e.id] || [];
    const le = lifeEvents[e.id] || [];
    deptMap[dept].members++;
    deptMap[dept].totalRating += computeRating(g, le).adjusted;
    deptMap[dept].completed += g.filter(x => goalStatus(x.completion) === "COMPLETED").length;
    deptMap[dept].active += g.filter(x => goalStatus(x.completion) !== "COMPLETED").length;
  });
  const deptData = Object.values(deptMap).map(d => ({ ...d, avg: Math.round(d.totalRating / (d.members || 1) * 10) / 10 }));

  const empData = filtered.map(e => {
    const g = empGoals[e.id] || [];
    const le = lifeEvents[e.id] || [];
    const { adjusted } = computeRating(g, le);
    return { ...e, rating: adjusted, goals: g, totalGoals: g.length };
  });

  const drillEmp = drillDown ? empData.find(e => e.id === drillDown) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <TopBar title="Organization Report" sub="H1 2025 · Drill down by department or individual"
        actions={
          <Select value={filterMgr} onChange={e => { setFilterMgr(e.target.value); setDrillDown(null); }} style={{ minWidth: 160 }}>
            <option value="ALL">All Managers</option>
            {managers.map(m => <option key={m.id} value={m.id}>{m.name}'s Team</option>)}
          </Select>
        }
      />
      <Page>
        {!drillDown ? (
          <>
            <Card>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Department Ratings</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="dept" stroke={C.textMuted} tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} stroke={C.textMuted} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="avg" name="Avg Rating" radius={[5, 5, 0, 0]}>
                    {deptData.map((d, i) => <Cell key={i} fill={d.avg >= 75 ? C.success : d.avg >= 60 ? C.warning : C.danger} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>Department Details</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {["Department","Avg Rating","Headcount","Completed","Active"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: C.textMuted, fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deptData.map(d => (
                    <tr key={d.dept} style={{ borderBottom: `1px solid ${C.border}22` }}>
                      <td style={{ padding: "10px 12px", color: C.text, fontWeight: 600 }}>{d.dept}</td>
                      <td style={{ padding: "10px 12px" }}><span style={{ color: d.avg >= 75 ? C.success : C.warning, fontWeight: 800 }}>{d.avg}%</span></td>
                      <td style={{ padding: "10px 12px", color: C.textMuted }}>{d.members}</td>
                      <td style={{ padding: "10px 12px" }}><Badge color={C.success}>{d.completed}</Badge></td>
                      <td style={{ padding: "10px 12px" }}><Badge color={C.accent}>{d.active}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
            <Card>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>Individual Ratings</div>
              <div style={{ fontSize: 11, color: C.textSub, marginBottom: 10 }}>Click a row to drill down</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {["Employee","Dept","Manager","Rating","Goals"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: C.textMuted, fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {empData.map(e => (
                    <tr key={e.id} onClick={() => setDrillDown(e.id)} style={{ borderBottom: `1px solid ${C.border}22`, cursor: "pointer" }}>
                      <td style={{ padding: "10px 12px", color: C.text, fontWeight: 600 }}>{e.name}</td>
                      <td style={{ padding: "10px 12px", color: C.textMuted }}>{e.dept}</td>
                      <td style={{ padding: "10px 12px", color: C.textMuted }}>{allUsers.find(u => u.id === e.managerId)?.name || "—"}</td>
                      <td style={{ padding: "10px 12px" }}><span style={{ color: e.rating >= 75 ? C.success : e.rating >= 50 ? C.warning : C.danger, fontWeight: 800 }}>{e.rating}%</span></td>
                      <td style={{ padding: "10px 12px", color: C.textMuted }}>{e.totalGoals}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => setDrillDown(null)} size="sm"><ChevronLeft size={14} /> Back to Org View</Button>
            <Card>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>{drillEmp?.name}</div>
              <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 16 }}>{drillEmp?.dept} · Manager: {allUsers.find(u => u.id === drillEmp?.managerId)?.name} · Rating: <strong style={{ color: C.text }}>{drillEmp?.rating}%</strong></div>
              {drillEmp?.goals.map(g => {
                const def = goalsCatalog.find(c => c.id === g.goalId);
                const st = goalStatus(g.completion);
                return (
                  <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: C.surface, borderRadius: 10, marginBottom: 8 }}>
                    <Badge color={statusColor(st)}>{st.replace(/_/g, " ")}</Badge>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{def?.title}</div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>W:{g.weight}% · Due: {formatDate(g.dueDate)}</div>
                    </div>
                    <div style={{ width: 80 }}><ProgressBar value={g.completion} color={statusColor(st)} height={6} /></div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: statusColor(st) }}>{g.completion}%</span>
                  </div>
                );
              })}
            </Card>
          </>
        )}
      </Page>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   APP ROOT — Central state management
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [toast, setToast] = useState(null);

  // Central state
  const [allUsers, setAllUsers] = useState(INITIAL_USERS);
  const [goalsCatalog, setGoalsCatalog] = useState(INITIAL_GOALS_CATALOG);
  const [empGoals, setEmpGoals] = useState(INITIAL_EMP_GOALS);
  const [lifeEvents, setLifeEvents] = useState(INITIAL_LIFE_EVENTS);
  const [periods, setPeriods] = useState(INITIAL_RATING_PERIODS);
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [approvals, setApprovals] = useState(INITIAL_APPROVALS);

  function showToast(msg, type = "success") { setToast({ msg, type }); }
  function handleLogin(u) { setUser(u); setPage("dashboard"); }
  function handleLogout() { setUser(null); setPage("dashboard"); }

  if (!user) return <LoginPage onLogin={handleLogin} />;

  const myGoals = empGoals[user.id] || [];
  const myLifeEvents = lifeEvents[user.id] || [];
  const mgrApprovalCount = approvals.filter(a => a.managerId === user.id && !a.adminOnly).length;

  function setMyGoals(fn) {
    setEmpGoals(prev => ({ ...prev, [user.id]: typeof fn === "function" ? fn(prev[user.id] || []) : fn }));
  }
  function setMyLifeEvents(fn) {
    setLifeEvents(prev => ({ ...prev, [user.id]: typeof fn === "function" ? fn(prev[user.id] || []) : fn }));
  }

  function renderContent() {
    // EMPLOYEE
    if (user.role === "EMPLOYEE") {
      if (page === "dashboard") return <EmpDashboard user={user} goals={myGoals} lifeEvents={myLifeEvents} goalsCatalog={goalsCatalog} setPage={setPage} />;
      if (page === "goals") return <MyGoals user={user} goals={myGoals} setGoals={setMyGoals} goalsCatalog={goalsCatalog} showToast={showToast} />;
      if (page === "feedback") return <AIFeedback user={user} goals={myGoals} goalsCatalog={goalsCatalog} lifeEvents={myLifeEvents} />;
      if (page === "rating") return <MyRating user={user} goals={myGoals} lifeEvents={myLifeEvents} goalsCatalog={goalsCatalog} />;
      if (page === "life-events") return <LifeEvents user={user} events={myLifeEvents} setEvents={setMyLifeEvents} allUsers={allUsers} showToast={showToast} />;
    }
    // MANAGER
    if (user.role === "MANAGER") {
      if (page === "dashboard") return <MgrDashboard user={user} allUsers={allUsers} empGoals={empGoals} lifeEvents={lifeEvents} goalsCatalog={goalsCatalog} approvals={approvals} setPage={setPage} />;
      if (page === "team") return <MyTeam user={user} allUsers={allUsers} empGoals={empGoals} lifeEvents={lifeEvents} goalsCatalog={goalsCatalog} setEmpGoals={setEmpGoals} showToast={showToast} />;
      if (page === "goal-mgmt") return <MgrGoalMgmt user={user} allUsers={allUsers} empGoals={empGoals} goalsCatalog={goalsCatalog} setGoalsCatalog={setGoalsCatalog} showToast={showToast} />;
      if (page === "approvals") return <MgrApprovals approvals={approvals} setApprovals={setApprovals} allUsers={allUsers} lifeEvents={lifeEvents} setLifeEvents={setLifeEvents} showToast={showToast} currentUser={user} />;
      if (page === "reports") return <MgrReports user={user} allUsers={allUsers} empGoals={empGoals} lifeEvents={lifeEvents} goalsCatalog={goalsCatalog} />;
    }
    // ADMIN
    if (user.role === "ADMIN") {
      if (page === "dashboard") return <AdminDashboard allUsers={allUsers} empGoals={empGoals} lifeEvents={lifeEvents} goalsCatalog={goalsCatalog} groups={groups} approvals={approvals} setPage={setPage} />;
      if (page === "users") return <UserManagement allUsers={allUsers} setAllUsers={setAllUsers} groups={groups} showToast={showToast} />;
      if (page === "goals") return <AdminGoalMgmt goalsCatalog={goalsCatalog} setGoalsCatalog={setGoalsCatalog} showToast={showToast} />;
      if (page === "periods") return <RatingPeriods periods={periods} setPeriods={setPeriods} showToast={showToast} />;
      if (page === "groups") return <GroupsView groups={groups} setGroups={setGroups} goalsCatalog={goalsCatalog} allUsers={allUsers} showToast={showToast} />;
      if (page === "reports") return <OrgReport allUsers={allUsers} empGoals={empGoals} lifeEvents={lifeEvents} goalsCatalog={goalsCatalog} />;
    }
    return <div style={{ padding: 32, color: C.textMuted }}>Page not found</div>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        input, select, textarea { color-scheme: dark; }
        button:hover:not(:disabled) { filter: brightness(1.08); }
        @keyframes slideIn { from { transform: translateX(100px); opacity:0 } to { transform: translateX(0); opacity:1 } }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.95)} }
      `}</style>
      <Sidebar user={user} page={page} setPage={setPage} onLogout={handleLogout} approvalCount={mgrApprovalCount} />
      <main style={{ flex: 1, marginLeft: 240, minHeight: "100vh", overflowY: "auto", paddingBottom: 40 }}>
        <div style={{ paddingTop: 24 }}>{renderContent()}</div>
      </main>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
