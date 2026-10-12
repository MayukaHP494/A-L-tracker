import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Detect serverless environment (Netlify, AWS Lambda)
const isServerless = Boolean(
  process.env.NETLIFY ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT
);

// Storage folders: use /tmp when in serverless environments where root is read-only
const DATA_DIR = isServerless
  ? path.resolve('/tmp', 'al_tracker_data')
  : path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');

try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
} catch (e) {
  console.warn('Could not initialize local data storage directory:', e);
}

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
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to write database file:', err);
  }
}

// Locate frontend build directory (dist)
export function getDistPath(): string {
  const possiblePaths = [
    path.resolve(process.cwd(), 'dist'),
    path.resolve(__dirname, 'dist'),
    path.resolve(__dirname, '../dist'),
  ];
  for (const candidate of possiblePaths) {
    if (fs.existsSync(candidate) && fs.existsSync(path.join(candidate, 'index.html'))) {
      return candidate;
    }
  }
  return path.resolve(process.cwd(), 'dist');
}

// API Router
const apiRouter = express.Router();

apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    serverless: isServerless,
  });
});

// File upload endpoint for PDF papers
apiRouter.post('/files/upload', (req: Request, res: Response) => {
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
apiRouter.get('/files/:filename', (req: Request, res: Response) => {
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
apiRouter.get('/backup', (req: Request, res: Response) => {
  const db = readDb();
  res.json(db);
});

apiRouter.post('/backup/restore', (req: Request, res: Response) => {
  try {
    writeDb(req.body);
    res.json({ success: true, message: 'Database restored successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mount API routes on standard and Netlify function paths
app.use('/api', apiRouter);
app.use('/.netlify/functions/server/api', apiRouter);
app.use('/.netlify/functions/server', apiRouter);

// Function to attach production static serving of the frontend build
export function setupStaticServing(expressApp: express.Express) {
  const distPath = getDistPath();
  const indexHtml = path.join(distPath, 'index.html');

  if (fs.existsSync(distPath)) {
    // Serve static frontend assets from dist (JS, CSS, images, etc.)
    expressApp.use(express.static(distPath, { index: false }));

    // SPA fallback: any non-API GET request serves the frontend build index.html
    expressApp.get('*', (req: Request, res: Response, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/.netlify')) {
        return next();
      }
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Frontend build not found. Please run "npm run build".');
      }
    });
  }
}

export async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Mount Vite dev server in middleware mode for local development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve the compiled frontend build in production
    setupStaticServing(app);
  }

  // Bind and listen on port
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server listening on http://0.0.0.0:${PORT} (${isProduction ? 'production - serving frontend build' : 'development'})`);
  });
}

// In serverless environments, static serving is also attached if dist is present
if (isServerless) {
  setupStaticServing(app);
} else {
  // Start standalone server process
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
  });
}
