import { createContext, useEffect, useMemo, useState } from 'react';
import { getTokens } from '../styles/tokens';

export const ThemeContext = createContext({ C: getTokens(true), isDark: true, toggle: () => {} });

const KEY = 'performiq:theme';

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem(KEY) !== 'light'; } catch { return true; }
  });

  useEffect(() => {
    try { localStorage.setItem(KEY, isDark ? 'dark' : 'light'); } catch { /* ignore */ }
    document.body.style.background = getTokens(isDark).bg;
    document.body.style.color = getTokens(isDark).text;
  }, [isDark]);

  const value = useMemo(
    () => ({ C: getTokens(isDark), isDark, toggle: () => setIsDark((v) => !v) }),
    [isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
