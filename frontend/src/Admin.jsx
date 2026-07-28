import React, { useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';
import { useToast } from './ToastContext.jsx';

export default function AdminGate() {
  const [loggedIn, setLoggedIn] = useState(!!getToken());

  if (!loggedIn) return <LoginScreen onSuccess={() => setLoggedIn(true)} />;
  return <AdminDashboard onLogout={() => { setToken(null); setLoggedIn(false); }} />;
}

function LoginScreen({ onSuccess }) {
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setErr(''); setBusy(true);
    try {
      const { token } = await api.login(pass);
      setToken(token);
      onSuccess();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 380 }}>
        <h3>এডমিন লগইন</h3>
        <p className="hint">প্রথমবার হলে, ব্যাকএন্ডের .env ফাইলে দেওয়া ADMIN_PASSWORD দিয়ে লগইন করো। পরে সিকিউরিটি ট্যাব থেকে পরিবর্তন করে নাও।</p>
        <div className="field">
          <label>পাসওয়ার্ড</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()} autoFocus />
        </div>
        {err && <div className="error-msg">{err}</div>}
        <button className="btn btn-primary" disabled={busy} onClick={submit}>{busy ? '...' : 'লগইন'}</button>
        <div style={{ marginTop: 14 }}><a href="#" onClick={() => { window.location.hash = ''; }} className="hint">← সাইটে ফিরে যাও</a></div>
      </div>
    </div>
  );
}

function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState('profile');
  const tabs = [
    ['profile', 'প্রোফাইল'],
    ['segments', 'সেগমেন্টস'],
    ['projects', 'প্রজেক্টস'],
    ['drive', 'Google Drive'],
    ['security', 'পাসওয়ার্ড']
  ];
  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <div className="admin-tabs">
          {tabs.map(([key, label]) => (
            <button key={key} className={`admin-tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="icon-btn" onClick={() => { window.location.hash = ''; }}>সাইট দেখো</button>
          <button className="icon-btn danger" onClick={onLogout}>লগআউট</button>
        </div>
      </div>
      <div className="admin-body">
        {tab === 'profile' && <ProfileTab />}
        {tab === 'segments' && <SegmentsTab />}
        {tab === 'projects' && <ProjectsTab />}
        {tab === 'drive' && <DriveTab />}
        {tab === 'security' && <SecurityTab />}
      </div>
    </div>
  );
}

/* ---------------- PROFILE ---------------- */
function ProfileTab() {
  const toast = useToast();
  const [p, setP] = useState(null);
  useEffect(() => { api.getProfile().then(setP); }, []);
  if (!p) return <div className="hint">লোড হচ্ছে...</div>;

  function upd(field, val) { setP(prev => ({ ...prev, [field]: val })); }
  function updSocial(i, field, val) {
    const socials = [...(p.socials || [])];
    socials[i] = { ...socials[i], [field]: val };
    setP(prev => ({ ...prev, socials }));
  }
  function addSocial() { setP(prev => ({ ...prev, socials: [...(prev.socials || []), { label: '', url: '' }] })); }
  function removeSocial(i) { setP(prev => ({ ...prev, socials: prev.socials.filter((_, idx) => idx !== i) })); }

  async function save() {
    try { await api.updateProfile(p); toast('প্রোফাইল সেভ হয়েছে ✓'); }
    catch (e) { toast(e.message); }
  }

  return (
    <div>
      <h3>প্রোফাইল ও কন্টাক্ট</h3>
      <div className="field"><label>নাম</label><input value={p.name} onChange={e => upd('name', e.target.value)} /></div>
      <div className="field"><label>ট্যাগলাইন</label><input value={p.tagline} onChange={e => upd('tagline', e.target.value)} /></div>
      <div className="field"><label>লোকেশন</label><input value={p.location} onChange={e => upd('location', e.target.value)} placeholder="যেমন: Dhaka, Bangladesh" /></div>
      <div className="field"><label>বায়ো</label><textarea value={p.bio} onChange={e => upd('bio', e.target.value)} /></div>
      <div className="field"><label>প্রোফাইল ছবির URL (Drive ট্যাব থেকে আপলোড করে লিঙ্ক পেস্ট করো)</label><input value={p.profilePic} onChange={e => upd('profilePic', e.target.value)} /></div>
      <div className="field"><label>রিজিউমি লিঙ্ক</label><input value={p.resumeLink} onChange={e => upd('resumeLink', e.target.value)} /></div>
      <div className="field-row">
        <div className="field"><label>ফোন</label><input value={p.phone} onChange={e => upd('phone', e.target.value)} /></div>
        <div className="field"><label>ইমেইল</label><input value={p.email} onChange={e => upd('email', e.target.value)} /></div>
      </div>
      <div className="field"><label>কন্টাক্ট ইন্ট্রো লাইন</label><textarea value={p.contactIntro} onChange={e => upd('contactIntro', e.target.value)} /></div>

      <h3 style={{ marginTop: 30 }}>সোশ্যাল লিঙ্কস</h3>
      {(p.socials || []).map((s, i) => (
        <div className="field-row" key={i} style={{ alignItems: 'flex-end' }}>
          <div className="field"><label>লেবেল</label><input value={s.label} onChange={e => updSocial(i, 'label', e.target.value)} /></div>
          <div className="field"><label>URL</label><input value={s.url} onChange={e => updSocial(i, 'url', e.target.value)} /></div>
          <button className="icon-btn danger" style={{ marginBottom: 16 }} onClick={() => removeSocial(i)}>মুছো</button>
        </div>
      ))}
      <button className="icon-btn" onClick={addSocial}>+ নতুন সোশ্যাল লিঙ্ক</button>

      <div style={{ marginTop: 26 }}><button className="btn btn-primary" onClick={save}>প্রোফাইল সেভ করো</button></div>
    </div>
  );
}

/* ---------------- SEGMENTS ---------------- */
function SegmentsTab() {
  const toast = useToast();
  const [segments, setSegments] = useState([]);
  const [newSeg, setNewSeg] = useState('');
  useEffect(() => { api.getSegments().then(setSegments); }, []);

  async function add() {
    if (!newSeg.trim()) return;
    try { const s = await api.addSegment(newSeg.trim()); setSegments(s); setNewSeg(''); toast('সেগমেন্ট যোগ হয়েছে ✓'); }
    catch (e) { toast(e.message); }
  }
  async function del(name) {
    try { const s = await api.deleteSegment(name); setSegments(s); }
    catch (e) { toast(e.message); }
  }

  return (
    <div>
      <h3>সেগমেন্টস</h3>
      <div className="hint">প্রজেক্ট ক্যাটাগরি — যেমন Structural Design, Architectural Drafting, 3D Modeling। নতুন সেগমেন্টও যোগ করা যাবে।</div>
      {segments.map(s => (
        <div className="admin-list-item" key={s}>
          <span>{s}</span>
          <button className="icon-btn danger" onClick={() => del(s)}>মুছো</button>
        </div>
      ))}
      <div className="field-row" style={{ marginTop: 18 }}>
        <div className="field"><input value={newSeg} onChange={e => setNewSeg(e.target.value)} placeholder="নতুন সেগমেন্টের নাম" /></div>
        <button className="btn btn-ghost" style={{ height: 44 }} onClick={add}>+ যোগ করো</button>
      </div>
    </div>
  );
}

/* ---------------- PROJECTS ---------------- */
function ProjectsTab() {
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [segments, setSegments] = useState([]);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, obj = editing

  async function load() {
    const [pr, sg] = await Promise.all([api.getProjects(), api.getSegments()]);
    setProjects(pr); setSegments(sg);
  }
  useEffect(() => { load(); }, []);

  async function del(id) {
    try { await api.deleteProject(id); toast('প্রজেক্ট মুছে ফেলা হয়েছে'); load(); }
    catch (e) { toast(e.message); }
  }

  return (
    <div>
      <h3>প্রজেক্টস</h3>
      <button className="btn btn-primary" style={{ marginBottom: 22 }}
        onClick={() => setEditing({ title: '', description: '', date: '', segment: segments[0] || '', images: [], driveLink: '', githubLink: '', inSlider: false })}>
        + নতুন প্রজেক্ট যোগ করো
      </button>
      {projects.length === 0 && <div className="hint">এখনো কোনো প্রজেক্ট নেই।</div>}
      {projects.map(p => (
        <div className="admin-list-item" key={p.id}>
          <div>
            <div>{p.title} {p.inSlider && <span className="hint">· হোমপেজ স্লাইডারে আছে</span>}</div>
            <div className="meta">{p.segment} · {p.date}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="icon-btn" onClick={() => setEditing(p)}>এডিট</button>
            <button className="icon-btn danger" onClick={() => del(p.id)}>মুছো</button>
          </div>
        </div>
      ))}
      {editing && (
        <ProjectForm
          initial={editing}
          segments={segments}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function ProjectForm({ initial, segments, onClose, onSaved }) {
  const toast = useToast();
  const isEdit = !!initial.id;
  const [form, setForm] = useState({ ...initial });
  const [uploading, setUploading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  function upd(field, val) { setForm(prev => ({ ...prev, [field]: val })); }

  async function handleUpload(e) {
    const files = [...e.target.files];
    setUploading(true);
    try {
      for (const f of files) {
        const result = await api.uploadToDrive(f);
        setForm(prev => ({ ...prev, images: [...prev.images, result] }));
      }
      toast('ছবি Drive এ আপলোড হয়েছে ✓');
    } catch (err) {
      toast(err.message);
    } finally {
      setUploading(false);
    }
  }
  function removeImage(i) { setForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) })); }

  async function save() {
    if (!form.title.trim()) { toast('টাইটেল দাও'); return; }
    try {
      if (isEdit) await api.updateProject(form.id, form);
      else await api.addProject(form);
      onSaved();
    } catch (e) {
      toast(e.message);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>{isEdit ? 'প্রজেক্ট এডিট করো' : 'নতুন প্রজেক্ট'}</h3>
        <div className="field"><label>টাইটেল</label><input value={form.title} onChange={e => upd('title', e.target.value)} /></div>
        <div className="field-row">
          <div className="field">
            <label>সেগমেন্ট</label>
            <select value={form.segment} onChange={e => upd('segment', e.target.value)}>
              {segments.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="field"><label>তারিখ</label><input placeholder="যেমন: জুলাই ২০২৬" value={form.date} onChange={e => upd('date', e.target.value)} /></div>
        </div>
        <div className="field"><label>বিস্তারিত</label><textarea value={form.description} onChange={e => upd('description', e.target.value)} /></div>

        <div className="field">
          <label>ছবি (সরাসরি Google Drive এ আপলোড হবে)</label>
          <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading} />
          {uploading && <div className="spinner-text">আপলোড হচ্ছে...</div>}
          <div className="thumbs-strip">
            {form.images.map((img, i) => (
              <div className="t" key={img.id || i}>
                <img src={img.url} alt="" />
                <button onClick={() => removeImage(i)}>✕</button>
              </div>
            ))}
          </div>
          <button type="button" className="icon-btn" style={{ marginTop: 8 }} onClick={() => setShowPicker(s => !s)}>
            {showPicker ? 'পিকার বন্ধ করো' : 'Drive থেকে আগের ছবি বেছে নাও'}
          </button>
          {showPicker && <DrivePicker onSelect={(file) => { upd('images', [...form.images, file]); }} />}
        </div>

        <div className="field"><label>Google Drive লিঙ্ক (PDF/ডিটেইলস)</label><input value={form.driveLink} onChange={e => upd('driveLink', e.target.value)} placeholder="https://drive.google.com/..." /></div>
        <div className="field"><label>GitHub Repository লিঙ্ক</label><input value={form.githubLink} onChange={e => upd('githubLink', e.target.value)} placeholder="https://github.com/..." /></div>
        <div className="checkbox-row">
          <input type="checkbox" id="inSlider" checked={form.inSlider} onChange={e => upd('inSlider', e.target.checked)} />
          <label htmlFor="inSlider">হোমপেজ ফিচার্ড স্লাইডারে দেখাও</label>
        </div>
        <div style={{ marginTop: 22 }}><button className="btn btn-primary" onClick={save}>সেভ করো</button></div>
      </div>
    </div>
  );
}

function DrivePicker({ onSelect }) {
  const toast = useToast();
  const [files, setFiles] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.driveFiles().then(setFiles).catch(e => setErr(e.message));
  }, []);

  if (err) return <div className="error-msg">{err}</div>;
  if (!files) return <div className="spinner-text">লোড হচ্ছে...</div>;
  if (files.length === 0) return <div className="hint">Drive এ কোনো ফাইল পাওয়া যায়নি।</div>;

  return (
    <div className="drive-grid">
      {files.filter(f => f.mimeType && f.mimeType.startsWith('image/')).map(f => (
        <div key={f.id} className="d-item" onClick={() => {
          onSelect({ id: f.id, name: f.name, url: `https://drive.google.com/uc?export=view&id=${f.id}` });
          toast('ছবি যোগ হয়েছে ✓');
        }}>
          <img src={f.thumbnailLink || `https://drive.google.com/uc?export=view&id=${f.id}`} alt={f.name} />
        </div>
      ))}
    </div>
  );
}

/* ---------------- DRIVE ---------------- */
function DriveTab() {
  const toast = useToast();
  const [status, setStatus] = useState(null);

  async function refresh() {
    try { setStatus(await api.driveStatus()); }
    catch (e) { toast(e.message); }
  }
  useEffect(() => { refresh(); }, []);

  async function connect() {
    // Open the tab immediately (still inside the click's user-gesture
    // context) so browser popup blockers don't silently block it once
    // we await the API call below.
    const popup = window.open('', '_blank', 'noopener');
    try {
      const { url } = await api.driveAuthUrl();
      if (popup) {
        popup.location.href = url;
        toast('নতুন ট্যাবে Google অনুমতি দিয়ে ফিরে এসে এখানে রিফ্রেশ করো');
      } else {
        // Popup was blocked despite opening synchronously (strict blocker).
        toast('ব্রাউজার popup ব্লক করেছে — অ্যাড্রেস বারে popup-blocked আইকনে ক্লিক করে অনুমতি দাও, তারপর আবার চাপ দাও');
      }
    } catch (e) {
      if (popup) popup.close();
      toast(e.message);
    }
  }

  return (
    <div>
      <h3>Google Drive সংযোগ</h3>
      <div className="hint">
        প্রজেক্টের ছবি/ফাইল তোমার নিজের Google Drive এ জমা হবে। কানেক্ট করার আগে ব্যাকএন্ডের .env এ
        GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI ঠিকভাবে বসাও (README.md দেখো)।
      </div>
      <div className="drive-status">
        {status && (
          <span className={`drive-badge ${status.connected ? 'connected' : 'notconnected'}`}>
            {status.connected ? 'সংযুক্ত আছে ✓' : 'সংযুক্ত নেই'}
          </span>
        )}
        <button className="btn btn-ghost" onClick={connect}>{status?.connected ? 'আবার সংযুক্ত করো' : 'Google Drive সংযুক্ত করো'}</button>
        <button className="icon-btn" onClick={refresh}>রিফ্রেশ</button>
      </div>
    </div>
  );
}

/* ---------------- SECURITY ---------------- */
function SecurityTab() {
  const toast = useToast();
  const [oldP, setOldP] = useState('');
  const [newP, setNewP] = useState('');
  const [err, setErr] = useState('');

  async function change() {
    setErr('');
    try {
      await api.changePassword(oldP, newP);
      toast('পাসওয়ার্ড পরিবর্তন হয়েছে ✓');
      setOldP(''); setNewP('');
    } catch (e) { setErr(e.message); }
  }

  return (
    <div>
      <h3>পাসওয়ার্ড পরিবর্তন</h3>
      <div className="field"><label>বর্তমান পাসওয়ার্ড</label><input type="password" value={oldP} onChange={e => setOldP(e.target.value)} /></div>
      <div className="field"><label>নতুন পাসওয়ার্ড</label><input type="password" value={newP} onChange={e => setNewP(e.target.value)} /></div>
      {err && <div className="error-msg">{err}</div>}
      <button className="btn btn-primary" onClick={change}>পরিবর্তন করো</button>
    </div>
  );
}
