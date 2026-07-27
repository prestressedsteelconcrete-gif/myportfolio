const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function getToken() { return localStorage.getItem('admin_token') || null; }
export function setToken(t) {
  if (t) localStorage.setItem('admin_token', t);
  else localStorage.removeItem('admin_token');
}

async function req(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'কিছু একটা ভুল হয়েছে');
  return data;
}

export const api = {
  login: (password) => req('/api/auth/login', { method: 'POST', body: JSON.stringify({ password }) }),
  changePassword: (oldPassword, newPassword) =>
    req('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ oldPassword, newPassword }) }),

  getProfile: () => req('/api/profile'),
  updateProfile: (data) => req('/api/profile', { method: 'PUT', body: JSON.stringify(data) }),

  getSegments: () => req('/api/segments'),
  addSegment: (name) => req('/api/segments', { method: 'POST', body: JSON.stringify({ name }) }),
  deleteSegment: (name) => req(`/api/segments/${encodeURIComponent(name)}`, { method: 'DELETE' }),

  getProjects: () => req('/api/projects'),
  addProject: (data) => req('/api/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id, data) => req(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id) => req(`/api/projects/${id}`, { method: 'DELETE' }),

  driveStatus: () => req('/api/drive/status'),
  driveAuthUrl: () => req('/api/drive/auth-url'),
  driveFiles: () => req('/api/drive/files'),
  driveDelete: (id) => req(`/api/drive/files/${id}`, { method: 'DELETE' }),

  githubInfo: (url) => req(`/api/github/repo-info?url=${encodeURIComponent(url)}`),

  uploadToDrive: async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const headers = {};
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_URL}/api/drive/upload`, { method: 'POST', body: fd, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'আপলোড ব্যর্থ হয়েছে');
    return data;
  }
};

export { API_URL };
