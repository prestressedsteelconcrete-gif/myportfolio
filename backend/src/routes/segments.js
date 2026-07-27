import express from 'express';
import { readDb, writeDb } from '../db.js';
import { requireAdmin } from '../auth.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json(readDb().segments);
});

router.post('/', requireAdmin, (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'নাম দাও' });
  const db = readDb();
  if (db.segments.includes(name.trim())) return res.status(400).json({ error: 'এই সেগমেন্ট আগে থেকেই আছে' });
  db.segments.push(name.trim());
  writeDb(db);
  res.json(db.segments);
});

router.delete('/:name', requireAdmin, (req, res) => {
  const db = readDb();
  const name = decodeURIComponent(req.params.name);
  if (db.projects.some(p => p.segment === name)) {
    return res.status(400).json({ error: 'এই সেগমেন্টে প্রজেক্ট আছে, আগে সরাও/পরিবর্তন করো' });
  }
  db.segments = db.segments.filter(s => s !== name);
  writeDb(db);
  res.json(db.segments);
});

export default router;
