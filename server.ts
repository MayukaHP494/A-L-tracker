import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Storage folders
const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const DB_FILE = path.resolve(DATA_DIR, 'db.json');

function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    return { papers: [], submissions: [], homework: [], sessions: [], settings: null };
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch {
    return { papers: [], submissions: [], homework: [], sessions: [], settings: null };
  }
}

function writeDb(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// API Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// File upload endpoint for PDF papers
app.post('/api/files/upload', (req: Request, res: Response) => {
  try {
    const { filename, fileData, mimeType } = req.body;
    if (!fileData) {
      return res.status(400).json({ error: 'Missing file data' });
    }

    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const base64Data = fileData.replace(/^data:application\/pdf;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const safeFilename = `${fileId}_${path.basename(filename || 'document.pdf')}`;
    const filePath = path.join(UPLOADS_DIR, safeFilename);

    fs.writeFileSync(filePath, buffer);

    res.json({
      fileId,
      filename: filename || 'document.pdf',
      size: buffer.length,
      mimeType: mimeType || 'application/pdf',
      downloadUrl: `/api/files/${safeFilename}`,
    });
  } catch (err: any) {
    console.error('File upload error:', err);
    res.status(500).json({ error: err?.message || 'Upload failed' });
  }
});

// Secure file viewing/download endpoint
app.get('/api/files/:filename', (req: Request, res: Response) => {
  const safeFilename = path.basename(req.params.filename);
  const filePath = path.join(UPLOADS_DIR, safeFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
  fs.createReadStream(filePath).pipe(res);
});

// Data export / backup
app.get('/api/backup', (req: Request, res: Response) => {
  const db = readDb();
  res.json(db);
});

app.post('/api/backup/restore', (req: Request, res: Response) => {
  try {
    writeDb(req.body);
    res.json({ success: true, message: 'Database restored successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  // Mount Vite dev server in middleware mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
