import express from 'express';
import bcrypt from 'bcryptjs';
import { readDb, writeDb } from '../db.js';
import { signToken, requireAdmin } from '../auth.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { password } = req.body;
  const db = readDb();
  let hash = db.adminPasswordHash;
  if (!hash) {
    const initial = process.env.ADMIN_PASSWORD || 'changeme123';
    hash = bcrypt.hashSync(initial, 10);
    db.adminPasswordHash = hash;
    writeDb(db);
  }
  const ok = await bcrypt.compare(password || '', hash);
  if (!ok) return res.status(401).json({ error: 'ভুল পাসওয়ার্ড' });
  res.json({ token: signToken() });
});

router.post('/change-password', requireAdmin, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const db = readDb();
  const ok = await bcrypt.compare(oldPassword || '', db.adminPasswordHash || '');
  if (!ok) return res.status(401).json({ error: 'বর্তমান পাসওয়ার্ড ভুল' });
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'নতুন পাসওয়ার্ড কমপক্ষে ৪ ক্যারেক্টার হতে হবে' });
  }
  db.adminPasswordHash = bcrypt.hashSync(newPassword, 10);
  writeDb(db);
  res.json({ ok: true });
});

export default router;
