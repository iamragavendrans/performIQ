export const genId = (prefix = 'id') =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(16).slice(2, 8)}`;
