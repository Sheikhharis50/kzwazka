import { Injectable, BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { join, extname, resolve } from 'path';
import { randomUUID } from 'crypto';

export type BucketName = 'messages' | 'avatars' | 'attachments'; // extend as needed

@Injectable()
export class FileUploadService {
  /** Build a date-based folder path like <cwd>/media/<bucket>/YYYY/MM */
  private static resolveDest(bucket: BucketName) {
    const now = new Date();
    const dest = join(
      process.cwd(),
      'media',
      bucket,
      String(now.getFullYear()),
      String(now.getMonth() + 1).padStart(2, '0')
    );
    if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
    return dest;
  }

  /** Disk storage helper — use inside FileInterceptor options */
  static diskStorage(bucket: BucketName) {
    return diskStorage({
      destination: (_req, _file, cb) => cb(null, this.resolveDest(bucket)),
      filename: (_req, file, cb) => {
        const id = randomUUID();
        cb(null, `${id}${extname(file.originalname) || ''}`);
      },
    });
  }

  /** Convert an absolute saved path to a public `/media/...` URL */
  publicPathFromAbsolute(absPath: string) {
    const abs = resolve(absPath).replace(/\\/g, '/');
    const mediaRoot = resolve(process.cwd(), 'media').replace(/\\/g, '/');
    if (!abs.startsWith(mediaRoot)) {
      // fallback – if storage is elsewhere, just return filename under /media
      const filename = abs.split('/').pop()!;
      return `/media/${filename}`;
    }
    const rel = abs.slice(mediaRoot.length).replace(/\\/g, '/');
    return `/media${rel.startsWith('/') ? rel : `/${rel}`}`;
  }

  /**
   * Validate payload and return the string to store in `content`.
   * - If content_type === 'text' → use dto.content (no file allowed)
   * - Else → require file and return its public URL
   */
  resolveMessageContent(
    dto: { content_type: string; content?: string },
    file?: Express.Multer.File
  ): string {
    const type = dto.content_type?.toLowerCase();
    if (type === 'text') {
      if (!dto.content || dto.content.trim() === '') {
        throw new BadRequestException(
          'content is required when content_type is text'
        );
      }
      if (file) {
        throw new BadRequestException(
          'file must not be provided when content_type is text'
        );
      }
      return dto.content.trim();
    }
    // non-text → must have file
    if (!file) {
      throw new BadRequestException(
        'file is required when content_type is not text'
      );
    }
    return this.publicPathFromAbsolute(file.path);
  }
}
