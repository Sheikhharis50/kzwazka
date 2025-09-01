import * as fs from 'fs';
import * as path from 'path';

export interface MediaConfig {
  storage: 'local' | 'digitalocean';
  localPath: string;
  publicUrl: string;
  digitalOcean: {
    endpoint: string;
    bucket: string;
    cdnEndpoint: string;
    region: string;
    accessKey: string;
    secretKey: string;
  };
}

export const mediaConfig = (): MediaConfig => ({
  storage: process.env.NODE_ENV === 'production' ? 'digitalocean' : 'local',
  localPath: process.env.LOCAL_MEDIA_PATH || 'media',
  publicUrl: process.env.LOCAL_MEDIA_URL || '/media',
  digitalOcean: {
    endpoint: process.env.DO_SPACE_ENDPOINT || '',
    bucket: process.env.DO_SPACE_BUCKET || '',
    cdnEndpoint: process.env.DO_SPACE_CDN_ENDPOINT || '',
    region: process.env.DO_SPACE_REGION || '',
    accessKey: process.env.DO_SPACE_ACCESS_KEY || '',
    secretKey: process.env.DO_SPACE_SECRET_KEY || '',
  },
});

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
