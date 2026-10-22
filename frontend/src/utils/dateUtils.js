/**
 * Safe date parsing and formatting utilities
 * Guarantees zero 'Invalid Date' outputs across all browsers and engines.
 */

export const parseSafeDate = (val) => {
  if (!val) return null;
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }
  if (typeof val === 'number') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return null;

    // Direct attempt
    let d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d;

    // Handle nanoseconds ISO strings (e.g. 2026-10-21T18:07:12.759678775)
    if (trimmed.includes('T') && trimmed.includes('.')) {
      const parts = trimmed.split('.');
      const fraction = (parts[1] || '').replace(/Z|[+-].*$/, '').slice(0, 3);
      const tz = trimmed.match(/Z|[+-].*$/)?.[0] || '';
      const fixedIso = `${parts[0]}.${fraction}${tz}`;
      d = new Date(fixedIso);
      if (!isNaN(d.getTime())) return d;
    }

    // Handle DD/MM/YYYY or DD-MM-YYYY
    const ddmmyyyy = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (ddmmyyyy) {
      const day = parseInt(ddmmyyyy[1], 10);
      const month = parseInt(ddmmyyyy[2], 10) - 1;
      const year = parseInt(ddmmyyyy[3], 10);
      d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }
  }
  return null;
};

export const formatSafeDate = (val, options = { month: 'short', day: 'numeric', year: 'numeric' }, fallback = 'Recent') => {
  const d = parseSafeDate(val);
  if (!d) return fallback;
  try {
    return d.toLocaleDateString('en-IN', options);
  } catch (e) {
    return fallback;
  }
};

export const formatSafeTime = (val, options = { hour: '2-digit', minute: '2-digit' }, fallback = 'Recent') => {
  const d = parseSafeDate(val);
  if (!d) return fallback;
  try {
    return d.toLocaleTimeString('en-IN', options);
  } catch (e) {
    return fallback;
  }
};

export const formatSafeDateTime = (val, fallback = 'Recent') => {
  const d = parseSafeDate(val);
  if (!d) return fallback;
  try {
    return `${d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  } catch (e) {
    return fallback;
  }
};

export const getOrderDateKey = (order) => {
  const raw = order?.createdAt || order?.created_at || order?.date || order?.updatedAt || order?.updated_at;
  const d = parseSafeDate(raw);
  if (!d) return 'Recent Orders';
  return d.toDateString();
};
