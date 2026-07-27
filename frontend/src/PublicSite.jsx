import React, { useEffect, useState, useRef } from 'react';
import { api } from './api.js';
import { useLanguage } from './i18n.js';

// Priority order for segments/projects: 3D Modeling first, then
// Architectural, then Structural, then anything else in its original order.
const SEGMENT_PRIORITY = ['3d', 'architect', 'structural'];
function segmentRank(name = '') {
  const n = name.toLowerCase();
  const idx = SEGMENT_PRIORITY.findIndex((k) => n.includes(k));
  return idx === -1 ? 999 : idx;
}
function orderSegments(list) {
  return [...list].sort((a, b) => segmentRank(a) - segmentRank(b));
}

export default function PublicSite() {
  const { tr, lang, toggleLang } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [segments, setSegments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [p, s, pr] = await Promise.all([api.getProfile(), api.getSegments(), api.getProjects()]);
        setProfile(p); setSegments(s); setProjects(pr);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="wrap" style={{ padding: '100px 0', textAlign: 'center', color: 'var(--muted)' }}>{tr.loading}</div>;
  }
  if (!profile) {
    return <div className="wrap" style={{ padding: '100px 0', textAlign: 'center', color: 'var(--muted)' }}>
      {tr.connectionError}
    </div>;
  }

  const orderedSegments = orderSegments(segments);

  const filtered = projects
    .filter(p => activeTab === 'All' || p.segment === activeTab)
    .sort((a, b) => (activeTab === 'All' ? segmentRank(a.segment) - segmentRank(b.segment) : 0));

  const sliderItems = projects
    .filter(p => p.inSlider && p.images && p.images.length)
    .sort((a, b) => segmentRank(a.segment) - segmentRank(b.segment));

  return (
    <>
      <div className="glow"></div>
      <nav>
        <div className="nav-inner">
          <div className="brand">
            {profile.profilePic && <img src={profile.profilePic} alt="" />}
            <span>{profile.name || tr.brandFallback}</span>
          </div>
          <div className="nav-links">
            <a href="#projects">{tr.navProjects}</a>
            <a href="#contact">{tr.navContact}</a>
            <button className="lang-toggle" onClick={toggleLang} title="Switch language">
              {tr.langToggleLabel}
            </button>
          </div>
        </div>
      </nav>

      <section className="hero wrap">
        <div className="hero-top">
          <div>
            <div className="eyebrow">{tr.heroEyebrow}</div>
            <h1>{profile.name || tr.namePlaceholder}</h1>
            <div className="role">{profile.tagline}</div>
          </div>
          <div className="location-badge">{tr.basedOn(profile.location)}</div>
        </div>
        <p className="hero-bio">{profile.bio || tr.bioPlaceholder}</p>
        <div className="btn-row">
          <a href="#projects" className="btn btn-primary">{tr.viewProjects}</a>
          {profile.resumeLink && <a href={profile.resumeLink} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">{tr.downloadResume}</a>}
        </div>
        <div className="chips">
          {orderedSegments.map(s => (
            <a key={s} className="chip" href="#projects" onClick={() => setActiveTab(s)}>{s}</a>
          ))}
        </div>
      </section>

      <section className="wrap" id="featured">
        <div className="section-head">
          <h2>{tr.featuredWorks}</h2>
          <div className="eyebrow">{tr.bestShowcase}</div>
        </div>
        <Slider items={sliderItems} emptyLabel={tr.sliderEmpty} />
      </section>

      <hr className="rule wrap" />

      <section className="wrap" id="projects">
        <div className="section-head"><h2>{tr.allProjects}</h2></div>
        <div className="tabs">
          {['All', ...orderedSegments].map(t => (
            <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t === 'All' ? tr.allTab : t}
            </button>
          ))}
        </div>
        <div className="grid">
          {filtered.length === 0 && <div className="empty-state">{tr.emptySegment}</div>}
          {filtered.map(p => (
            <div key={p.id} className="card" onClick={() => setDetail(p)}>
              <div className="thumb">
                {p.images && p.images[0] ? <img src={p.images[0].url} alt="" /> : 'No image'}
              </div>
              <div className="card-body">
                <div className="card-tag">{p.segment}</div>
                <h4>{p.title}</h4>
                <div className="date">{p.date}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap" id="contact">
        <div className="contact-box">
          <h2>{tr.contactHeading}</h2>
          <p>{profile.contactIntro}</p>
          <div className="contact-line"><b>{profile.phone || tr.notAdded}</b> · {tr.phone}</div>
          <div className="contact-line"><b>{profile.email || tr.notAdded}</b> · {tr.email}</div>
          <div className="socials">
            {(profile.socials || []).map((s, i) => (
              <a key={i} className="social-pill" href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>
            ))}
          </div>
        </div>
      </section>

      <footer>© {new Date().getFullYear()} · {tr.footerRights}</footer>

      {detail && <ProjectModal project={detail} onClose={() => setDetail(null)} tr={tr} />}
    </>
  );
}

function Slider({ items, emptyLabel }) {
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    clearInterval(timer.current);
    if (items.length > 1) {
      timer.current = setInterval(() => setIdx(i => (i + 1) % items.length), 4500);
    }
    return () => clearInterval(timer.current);
  }, [items.length]);

  if (items.length === 0) {
    return <div className="slider"><div className="slider-empty">{emptyLabel}</div></div>;
  }
  const cur = Math.min(idx, items.length - 1);
  return (
    <div className="slider">
      {items.map((p, i) => (
        <div key={p.id} className={`slide ${i === cur ? 'active' : ''}`}>
          <img src={p.images[0].url} alt="" />
          <div className="slide-info">
            <div className="tag">{p.segment}</div>
            <h3>{p.title}</h3>
          </div>
        </div>
      ))}
      <div className="slider-dots">
        {items.map((_, i) => (
          <div key={i} className={`dot ${i === cur ? 'active' : ''}`} onClick={() => setIdx(i)}></div>
        ))}
      </div>
    </div>
  );
}

function ProjectModal({ project, onClose, tr }) {
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="card-tag">{project.segment}</div>
        <h3>{project.title}</h3>
        <div className="date" style={{ marginBottom: 16 }}>{project.date}</div>
        {project.images && project.images.length > 0 && (
          <div className="pd-gallery">
            {project.images.map((img, i) => <img key={i} src={img.url} alt="" />)}
          </div>
        )}
        <p style={{ color: '#cfccd6', fontSize: 14.5 }}>{project.description}</p>
        <div className="pd-links">
          {project.driveLink && <a className="btn btn-ghost" href={project.driveLink} target="_blank" rel="noopener noreferrer">{tr.driveOrPdf}</a>}
          {project.githubLink && <a className="btn btn-ghost" href={project.githubLink} target="_blank" rel="noopener noreferrer">{tr.githubRepo}</a>}
        </div>
      </div>
    </div>
  );
}
