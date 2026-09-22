import fs from 'fs';
import path from 'path';

// Where uploaded images are saved on disk (git-ignored). Served publicly at
// /uploads/<file> — see app.ts.
export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
