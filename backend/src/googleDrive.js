import express from 'express';
import multer from 'multer';
import { requireAdmin } from '../auth.js';
import { getAuthUrl, handleOAuthCallback, listDriveFiles, uploadToDrive, deleteFromDrive } from '../googleDrive.js';
import { readDb } from '../db.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });
const router = express.Router();

router.get('/status', requireAdmin, (req, res) => {
  const db = readDb();
  res.json({ connected: !!db.google.refreshToken });
});

router.get('/auth-url', requireAdmin, (req, res) => {
  try {
    res.json({ url: getAuthUrl() });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Google এই URL এ redirect করবে, তাই এটা public route (token ছাড়া) হতে হবে
router.get('/oauth-callback', async (req, res) => {
  try {
    await handleOAuthCallback(req.query.code);
    res.redirect(`${process.env.FRONTEND_URL}/#admin?drive=connected`);
  } catch (e) {
    res.redirect(`${process.env.FRONTEND_URL}/#admin?drive=error`);
  }
});

router.get('/files', requireAdmin, async (req, res) => {
  try {
    res.json(await listDriveFiles());
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/upload', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'ফাইল পাওয়া যায়নি' });
    const result = await uploadToDrive(req.file.buffer, req.file.originalname, req.file.mimetype);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/files/:id', requireAdmin, async (req, res) => {
  try {
    await deleteFromDrive(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
