export const DARK = {
  bg: '#0a0f1e', sidebar: '#0d1426', card: '#131b2e', surface: '#1a2340',
  accent: '#5b8def', accentHover: '#7aa3f5', accentDim: 'rgba(91,141,239,0.12)',
  success: '#22c55e', successDim: 'rgba(34,197,94,0.12)',
  warning: '#f59e0b', warningDim: 'rgba(245,158,11,0.12)',
  danger: '#ef4444', dangerDim: 'rgba(239,68,68,0.12)',
  purple: '#a855f7', purpleDim: 'rgba(168,85,247,0.12)',
  cyan: '#06b6d4', cyanDim: 'rgba(6,182,212,0.12)',
  text: '#e6edf7', textMuted: '#9aa7bd', textSub: '#6b7890',
  border: 'rgba(255,255,255,0.08)'
};

export const LIGHT = {
  bg: '#f4f6fb', sidebar: '#ffffff', card: '#ffffff', surface: '#f0f3fa',
  accent: '#2563eb', accentHover: '#1d4ed8', accentDim: 'rgba(37,99,235,0.10)',
  success: '#16a34a', successDim: 'rgba(22,163,74,0.10)',
  warning: '#d97706', warningDim: 'rgba(217,119,6,0.10)',
  danger: '#dc2626', dangerDim: 'rgba(220,38,38,0.10)',
  purple: '#9333ea', purpleDim: 'rgba(147,51,234,0.10)',
  cyan: '#0891b2', cyanDim: 'rgba(8,145,178,0.10)',
  text: '#0f1629', textMuted: '#4b5568', textSub: '#6b7890',
  border: 'rgba(15,22,41,0.10)'
};

export const getTokens = (isDark) => (isDark ? DARK : LIGHT);
