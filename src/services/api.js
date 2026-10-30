const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
export function readLocal(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
export function writeLocal(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
let token = readLocal('acrewise-v2-token', null);
let sessionPromise;
export async function apiRequest(path, options = {}) {
  const { headers, ...rest } = options;
  const response = await fetch(`${BASE}${path}`, { ...rest, signal: options.signal || AbortSignal.timeout(35000), headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers } });
  if (response.status === 204) return null;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const d = body.detail;
    const error = new Error(typeof d === 'string' ? d : Array.isArray(d) ? d.map(x => `${x.loc.slice(1).join('.')}: ${x.msg}`).join('; ') : d?.message || `Request failed (${response.status})`);
    error.status = response.status; throw error;
  }
  return body;
}
export const apiBase = BASE;
export const post = (path, body) => apiRequest(path, { method: 'POST', body: JSON.stringify(body) });
export async function ensureSession() {
  if (token) return false;
  if (!sessionPromise) sessionPromise = post('/api/workspaces', {}).then(data => { token = data.token; writeLocal('acrewise-v2-token', token); return true; }).catch(e => { sessionPromise = null; throw e; });
  return sessionPromise;
}
export function resetSession() { token = null; sessionPromise = null; localStorage.removeItem('acrewise-v2-token'); }
