// Versioned localStorage persistence. Bump SCHEMA_VERSION to force a reseed.
export const STORAGE_KEY = 'performiq:v1';
export const SCHEMA_VERSION = 1;

export const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== SCHEMA_VERSION) return null;
    return parsed.data;
  } catch {
    return null;
  }
};

export const saveState = (data) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: SCHEMA_VERSION, data, savedAt: Date.now() })
    );
  } catch {
    // Quota errors are non-fatal for a client-side demo.
  }
};

export const clearState = () => {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
};
