import express from 'express';
import { requireAdmin } from '../auth.js';

const router = express.Router();

router.get('/repo-info', requireAdmin, async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url দরকার' });
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return res.status(400).json({ error: 'সঠিক GitHub repository URL না' });
  const owner = match[1];
  const repo = match[2].replace(/\.git$/, '');
  try {
    const headers = process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};
    const r = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!r.ok) return res.status(r.status).json({ error: 'GitHub থেকে তথ্য পাওয়া যায়নি' });
    const data = await r.json();
    res.json({
      stars: data.stargazers_count,
      language: data.language,
      description: data.description,
      updatedAt: data.updated_at
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
