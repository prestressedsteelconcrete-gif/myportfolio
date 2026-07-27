import React, { useEffect, useState, useRef } from 'react';
import { api } from './api.js';

export default function PublicSite() {
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
    return <div className="wrap" style={{ padding: '100px 0', textAlign: 'center', color: 'var(--muted)' }}>লোড হচ্ছে...</div>;
  }
  if (!profile) {
    return <div className="wrap" style={{ padding: '100px 0', textAlign: 'center', color: 'var(--muted)' }}>
      সার্ভারের সাথে সংযোগ করা যায়নি। ব্যাকএন্ড চালু আছে কিনা এবং VITE_API_URL ঠিক আছে কিনা দেখো।
    </div>;
  }

  const filtered = projects.filter(p => activeTab === 'All' || p.segment === activeTab);
  const sliderItems = projects.filter(p => p.inSlider && p.images && p.images.length);

  return (
    <>
      <div className="glow"></div>
      <nav>
        <div className="nav-inner">
          <div className="brand">
            {profile.profilePic && <img src={profile.profilePic} alt="" />}
            <span>{profile.name || 'পোর্টফোলিও'}</span>
          </div>
          <div className="nav-links">
            <a href="#projects">প্রজেক্টস</a>
            <a href="#contact">যোগাযোগ</a>
          </div>
        </div>
      </nav>

      <section className="hero wrap">
        <div className="hero-top">
          <div>
            <div className="eyebrow">সফটওয়্যার/ডিজাইন পোর্টফোলিও</div>
            <h1>{profile.name || 'তোমার নাম'}</h1>
            <div className="role">{profile.tagline}</div>
          </div>
          <div className="location-badge">{profile.location ? `Based on ${profile.location}` : 'Based on —'}</div>
        </div>
        <p className="hero-bio">{profile.bio || 'এডমিন প্যানেল থেকে এখানে বায়ো যোগ করো।'}</p>
        <div className="btn-row">
          <a href="#projects" className="btn btn-primary">প্রজেক্টস দেখুন</a>
          {profile.resumeLink && <a href={profile.resumeLink} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Resume ডাউনলোড</a>}
        </div>
        <div className="chips">
          {segments.map(s => (
            <a key={s} className="chip" href="#projects" onClick={() => setActiveTab(s)}>{s}</a>
          ))}
        </div>
      </section>

      <section className="wrap" id="featured">
        <div className="section-head">
          <h2>ফিচার্ড ওয়ার্কস</h2>
          <div className="eyebrow">বেস্ট 3D শোকেস</div>
        </div>
        <Slider items={sliderItems} />
      </section>

      <hr className="rule wrap" />

      <section className="wrap" id="projects">
        <div className="section-head"><h2>সব প্রজেক্টস</h2></div>
        <div className="tabs">
          {['All', ...segments].map(t => (
            <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
          ))}
        </div>
        <div className="grid">
          {filtered.length === 0 && <div className="empty-state">এই সেগমেন্টে এখনো কোনো প্রজেক্ট যোগ করা হয়নি।</div>}
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
          <h2>কিছু মাথায় এলো?</h2>
          <p>{profile.contactIntro}</p>
          <div className="contact-line"><b>{profile.phone || 'যোগ করা হয়নি'}</b> · ফোন</div>
          <div className="contact-line"><b>{profile.email || 'যোগ করা হয়নি'}</b> · ইমেইল</div>
          <div className="socials">
            {(profile.socials || []).map((s, i) => (
              <a key={i} className="social-pill" href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>
            ))}
          </div>
        </div>
      </section>

      <footer>© {new Date().getFullYear()} · সব রাইট সংরক্ষিত</footer>

      {detail && <ProjectModal project={detail} onClose={() => setDetail(null)} />}
    </>
  );
}

function Slider({ items }) {
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
    return <div className="slider"><div className="slider-empty">এখনো কোনো ফিচার্ড প্রজেক্ট যোগ করা হয়নি।</div></div>;
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

function ProjectModal({ project, onClose }) {
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
          {project.driveLink && <a className="btn btn-ghost" href={project.driveLink} target="_blank" rel="noopener noreferrer">Drive/PDF দেখুন</a>}
          {project.githubLink && <a className="btn btn-ghost" href={project.githubLink} target="_blank" rel="noopener noreferrer">GitHub Repo</a>}
        </div>
      </div>
    </div>
  );
}
