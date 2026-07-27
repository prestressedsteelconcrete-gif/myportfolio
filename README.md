# পোর্টফোলিও ওয়েবসাইট — Backend + Frontend (Google Drive + GitHub সহ)

এটা দুইটা আলাদা প্রজেক্ট নিয়ে গঠিত:
- `backend/`  — Node.js + Express সার্ভার (লগইন, ডাটা, Google Drive, GitHub API)
- `frontend/` — React (Vite) সাইট (পাবলিক পোর্টফোলিও + এডমিন প্যানেল)

নিচে ধাপে ধাপে সবকিছু লোকালে চালানো থেকে শুরু করে লাইভ ডিপ্লয় পর্যন্ত দেওয়া হলো।

---

## ধাপ ০ — যা যা লাগবে
- কম্পিউটারে **Node.js 18+** ইনস্টল থাকতে হবে ([nodejs.org](https://nodejs.org) থেকে LTS ভার্সন নামাও)
- একটা Google একাউন্ট (Drive এর জন্য)
- একটা GitHub একাউন্ট (Repo লিঙ্ক দেখানোর জন্য — টোকেন ঐচ্ছিক)

---

## ধাপ ১ — ফাইলগুলো রেডি করো
Zip ফাইলটা extract করো। ভেতরে `backend` আর `frontend` দুইটা ফোল্ডার পাবে।

```
cd backend
npm install
cp .env.example .env
```

```
cd ../frontend
npm install
cp .env.example .env
```

---

## ধাপ ২ — Google Drive এর জন্য OAuth ক্রেডেনশিয়াল বানাও

1. [Google Cloud Console](https://console.cloud.google.com/) এ যাও, নতুন একটা Project বানাও।
2. বাম মেনু থেকে **APIs & Services → Library** → সার্চ করো "Google Drive API" → **Enable** করো।
3. **APIs & Services → OAuth consent screen** এ গিয়ে "External" সিলেক্ট করে বেসিক তথ্য (অ্যাপের নাম, ইমেইল) দিয়ে সেভ করো। Test user হিসেবে নিজের Gmail যোগ করো।
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**।
   - Application type: **Web application**
   - Authorized redirect URIs এ দাও: `http://localhost:4000/api/drive/oauth-callback`
   - তৈরি হলে **Client ID** আর **Client Secret** পাবে।
5. `backend/.env` ফাইলে বসাও:
   ```
   GOOGLE_CLIENT_ID=তোমার-client-id
   GOOGLE_CLIENT_SECRET=তোমার-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:4000/api/drive/oauth-callback
   ```
6. (ঐচ্ছিক) Drive এ একটা নির্দিষ্ট ফোল্ডার বানিয়ে তার ID (ফোল্ডার খুললে URL এর শেষ অংশ) `GOOGLE_DRIVE_FOLDER_ID` তে বসাতে পারো — না দিলে সব ফাইল Drive এর রুটে যাবে।

> **নোট:** যতক্ষণ না তুমি Google এ অ্যাপ verification submit করছো (personal ব্যবহারের জন্য দরকার নেই), শুধু "Test users" এ যোগ করা একাউন্ট দিয়েই কানেক্ট করা যাবে — এটাই তোমার নিজের একাউন্ট হলেই যথেষ্ট।

---

## ধাপ ৩ — GitHub টোকেন (ঐচ্ছিক কিন্তু রেকমেন্ড করা)

টোকেন ছাড়াও GitHub এর পাবলিক রিপো তথ্য পাওয়া যায়, কিন্তু রেট-লিমিট কম থাকে। টোকেন দিলে বেশি স্মুথ চলবে।

1. GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token।
2. শুধু "Public Repositories (read-only)" পারমিশন দিলেই যথেষ্ট।
3. টোকেনটা `backend/.env` এ বসাও:
   ```
   GITHUB_TOKEN=তোমার-টোকেন
   ```

---

## ধাপ ৪ — বাকি .env ভ্যালুগুলো ঠিক করো

`backend/.env`:
```
JWT_SECRET=এখানে-একটা-লম্বা-র‍্যান্ডম-স্ট্রিং-দাও
ADMIN_PASSWORD=তোমার-পছন্দের-প্রথম-পাসওয়ার্ড
FRONTEND_URL=http://localhost:5173
```

`frontend/.env`:
```
VITE_API_URL=http://localhost:4000
```

---

## ধাপ ৫ — লোকালে চালাও

দুইটা আলাদা টার্মিনালে:

```
cd backend
npm run dev
```
```
cd frontend
npm run dev
```

ব্রাউজারে যাও: `http://localhost:5173` — এটা তোমার পাবলিক সাইট।
এডমিন প্যানেলের জন্য: `http://localhost:5173/#admin` — এখানে `.env` এ দেওয়া `ADMIN_PASSWORD` দিয়ে লগইন করো।

লগইন করার পর:
1. **Google Drive ট্যাবে** গিয়ে "Google Drive সংযুক্ত করো" চাপো → নতুন ট্যাবে Google এর অনুমতি স্ক্রিন আসবে → অনুমতি দাও → এটা তোমাকে ফিরিয়ে আনবে → "রিফ্রেশ" চাপলে "সংযুক্ত আছে ✓" দেখাবে।
2. **প্রজেক্টস ট্যাবে** গিয়ে নতুন প্রজেক্ট বানাও — ছবি আপলোড করলেই সরাসরি তোমার Google Drive এ জমা হবে এবং সাইটে দেখাবে।
3. **প্রোফাইল ট্যাবে** নাম, বায়ো, ফোন, ইমেইল, সোশ্যাল লিঙ্ক ইত্যাদি বসাও।
4. **পাসওয়ার্ড ট্যাব** থেকে .env এর ডিফল্ট পাসওয়ার্ড পরিবর্তন করে ফেলো।

---

## ধাপ ৬ — লাইভ ডিপ্লয় (ইন্টারনেটে সবাই দেখতে পারবে)

### Backend ডিপ্লয় (Render.com উদাহরণ হিসেবে, ফ্রি টিয়ার আছে)
1. এই `backend/` ফোল্ডারটা একটা GitHub রিপোতে পুশ করো।
2. [Render.com](https://render.com) এ একাউন্ট খুলে **New → Web Service** করো, ঐ রিপো কানেক্ট করো।
3. Build command: `npm install` · Start command: `npm start`
4. Environment ভ্যারিয়েবলগুলো (JWT_SECRET, ADMIN_PASSWORD, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, GOOGLE_DRIVE_FOLDER_ID, GITHUB_TOKEN, FRONTEND_URL) Render এর ড্যাশবোর্ডে বসাও — `GOOGLE_REDIRECT_URI` এখন হবে `https://তোমার-backend-domain.onrender.com/api/drive/oauth-callback`, আর `FRONTEND_URL` হবে তোমার ফ্রন্টএন্ডের লাইভ URL।
5. Google Cloud Console এ ফিরে গিয়ে Credentials এ নতুন redirect URI-টাও যোগ করো।

### Frontend ডিপ্লয় (Netlify/Vercel উদাহরণ)
1. `frontend/` ফোল্ডারটা GitHub এ পুশ করো (একই রিপো বা আলাদা রিপো)।
2. Netlify/Vercel এ ইমপোর্ট করো, Build command: `npm run build`, Publish directory: `dist`।
3. Environment variable: `VITE_API_URL=https://তোমার-backend-domain.onrender.com`
4. ডিপ্লয় হয়ে গেলে `https://তোমার-সাইট.netlify.app/#admin` দিয়ে এডমিনে ঢুকতে পারবে।

> **গুরুত্বপূর্ণ:** ডিপ্লয়ের পর backend এর `data/db.json` ফাইলটা যেই সার্ভারে চলছে সেখানেই সেভ হয়। Render এর ফ্রি টিয়ারে ডিস্ক মাঝে মাঝে রিসেট হতে পারে — দীর্ঘমেয়াদে চাইলে Render এর "Persistent Disk" যোগ করো, বা পরে চাইলে এই JSON ফাইলটাকে একটা রিয়েল ডাটাবেজ (Postgres/MongoDB) দিয়ে বদলে নেওয়া যাবে।

---

## নিরাপত্তা নিয়ে সততার সাথে কিছু কথা
- পাসওয়ার্ড bcrypt দিয়ে হ্যাশ করে রাখা হয়, JWT টোকেন দিয়ে সেশন যাচাই হয় — এটা আগের single-HTML ভার্সনের চেয়ে অনেক বেশি নিরাপদ।
- তবুও, এটা একটা পার্সোনাল পোর্টফোলিওর জন্য যথেষ্ট মানের সিস্টেম — ব্যাংকিং লেভেলের সিকিউরিটি না। `JWT_SECRET` আর `ADMIN_PASSWORD` কাউকে শেয়ার কোরো না।
- Google OAuth refresh token `data/db.json` এ প্লেইন টেক্সটে সেভ থাকে — সার্ভারের এক্সেস যেন শুধু তোমারই থাকে সেটা নিশ্চিত করো।

কিছু জায়গায় আটকে গেলে বা এরর মেসেজ পেলে সেটা কপি করে বলো, আমি ঠিক করে দিতে সাহায্য করবো।
