export const formatDate = (d) => {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const daysLeft = (d) => {
  const date = typeof d === 'string' ? new Date(d) : d;
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
};

export const isOverdue = (due, completion) => daysLeft(due) < 0 && completion < 100;

export const daysBetween = (a, b) => {
  const start = new Date(a).getTime();
  const end = new Date(b).getTime();
  return Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
};

export const monthsAgo = (n) => {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 10);
};

export const pct = (n) => `${Math.round(n)}%`;
