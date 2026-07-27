import { google } from 'googleapis';
import { Readable } from 'stream';
import { readDb, writeDb } from './db.js';

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function getAuthUrl() {
  const oauth2Client = getOAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/drive.file']
  });
}

export async function handleOAuthCallback(code) {
  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  const db = readDb();
  db.google.refreshToken = tokens.refresh_token || db.google.refreshToken;
  writeDb(db);
  return true;
}

async function getDriveClient() {
  const db = readDb();
  if (!db.google.refreshToken) throw new Error('Google Drive এখনো সংযুক্ত করা হয়নি — অ্যাডমিন প্যানেলের Drive ট্যাব থেকে কানেক্ট করো');
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({ refresh_token: db.google.refreshToken });
  return google.drive({ version: 'v3', auth: oauth2Client });
}

export async function listDriveFiles() {
  const drive = await getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const q = folderId ? `'${folderId}' in parents and trashed=false` : `trashed=false and (mimeType contains 'image/' or mimeType='application/pdf')`;
  const resp = await drive.files.list({
    q,
    fields: 'files(id,name,mimeType,thumbnailLink,webViewLink,createdTime)',
    pageSize: 100,
    orderBy: 'createdTime desc'
  });
  return resp.data.files || [];
}

export async function uploadToDrive(fileBuffer, filename, mimeType) {
  const drive = await getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const stream = Readable.from(fileBuffer);
  const resp = await drive.files.create({
    requestBody: { name: filename, parents: folderId ? [folderId] : undefined },
    media: { mimeType, body: stream },
    fields: 'id,name,mimeType,webViewLink'
  });
  const fileId = resp.data.id;
  await drive.permissions.create({ fileId, requestBody: { role: 'reader', type: 'anyone' } });
  const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
  return {
    id: fileId,
    name: resp.data.name,
    url: directUrl,
    viewLink: `https://drive.google.com/file/d/${fileId}/view`
  };
}

export async function deleteFromDrive(fileId) {
  const drive = await getDriveClient();
  await drive.files.delete({ fileId });
}
