import express from 'express';
import crypto from 'crypto';
import { readDb, writeDb } from '../db.js';
import { requireAdmin } from '../auth.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json(readDb().projects);
});

router.get('/:id', (req, res) => {
  const p = readDb().projects.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'পাওয়া যায়নি' });
  res.json(p);
});

router.post('/', requireAdmin, (req, res) => {
  const db = readDb();
  const obj = { id: crypto.randomUUID(), images: [], inSlider: false, ...req.body };
  db.projects.push(obj);
  writeDb(db);
  res.json(obj);
});

router.put('/:id', requireAdmin, (req, res) => {
  const db = readDb();
  const idx = db.projects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'পাওয়া যায়নি' });
  db.projects[idx] = { ...db.projects[idx], ...req.body, id: db.projects[idx].id };
  writeDb(db);
  res.json(db.projects[idx]);
});

router.delete('/:id', requireAdmin, (req, res) => {
  const db = readDb();
  db.projects = db.projects.filter(p => p.id !== req.params.id);
  writeDb(db);
  res.json({ ok: true });
});

export default router;
