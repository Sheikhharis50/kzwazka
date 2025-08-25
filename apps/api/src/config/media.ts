import * as fs from 'fs';
import * as path from 'path';

export const MEDIA_ROOT =
  process.env.MEDIA_ROOT || path.join(process.cwd(), 'media');
export const MEDIA_URL_PREFIX = '/media';

export function ensureDirSync(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function datePathParts(d = new Date()) {
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return { yyyy, mm, dd };
}
