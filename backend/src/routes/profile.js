import express from 'express';
import { readDb, writeDb } from '../db.js';
import { requireAdmin } from '../auth.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json(readDb().profile);
});

router.put('/', requireAdmin, (req, res) => {
  const db = readDb();
  db.profile = { ...db.profile, ...req.body };
  writeDb(db);
  res.json(db.profile);
});

export default router;
