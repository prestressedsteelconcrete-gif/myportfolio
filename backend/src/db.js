import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

const defaultData = {
  profile: {
    name: "তোমার নাম",
    tagline: "Structural Design · Architectural Drafting · 3D Modeling",
    location: "",
    bio: "",
    phone: "",
    email: "",
    resumeLink: "",
    profilePic: "",
    contactIntro: "নতুন প্রজেক্ট বা কোলাবোরেশনের কথা বলতে সরাসরি মেসেজ করো।",
    socials: []
  },
  segments: ["Structural Design", "Architectural Drafting", "3D Modeling"],
  projects: [],
  adminPasswordHash: null,
  google: { refreshToken: null }
};

function ensureDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));
  }
}

export function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

export function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}
