import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DigitalOceanService } from './digitalocean.service';
import { MediaConfig } from '../config/media';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';

export interface FileUploadResult {
  url: string;
  relativePath: string;
  key: string;
  storage: 'local' | 'digitalocean';
}

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private readonly mediaConfig: MediaConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly digitalOceanService: DigitalOceanService
  ) {
    // Check NODE_ENV directly for more reliable environment detection
    const nodeEnv = process.env.NODE_ENV;
    const isProduction = nodeEnv === 'production';

    this.mediaConfig = {
      storage: isProduction ? 'digitalocean' : 'local',
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
    };

    this.logger.log(
      `File storage initialized with: ${this.mediaConfig.storage} (NODE_ENV: ${nodeEnv})`
    );

    // Validate production configuration
    if (isProduction) {
      const { digitalOcean } = this.mediaConfig;
      const missingVars: string[] = [];

      if (!digitalOcean.endpoint) missingVars.push('DO_SPACE_ENDPOINT');
      if (!digitalOcean.bucket) missingVars.push('DO_SPACE_BUCKET');
      if (!digitalOcean.cdnEndpoint) missingVars.push('DO_SPACE_CDN_ENDPOINT');
      if (!digitalOcean.region) missingVars.push('DO_SPACE_REGION');
      if (!digitalOcean.accessKey) missingVars.push('DO_SPACE_ACCESS_KEY');
      if (!digitalOcean.secretKey) missingVars.push('DO_SPACE_SECRET_KEY');

      if (missingVars.length > 0) {
        this.logger.error(
          `Missing required DigitalOcean environment variables: ${missingVars.join(', ')}`
        );
        this.logger.error('Falling back to local storage');
        this.mediaConfig.storage = 'local';
      } else {
        this.logger.log(
          `DigitalOcean config validated: bucket=${digitalOcean.bucket}, region=${digitalOcean.region}`
        );
      }
    }
  }

  /**
   * Upload a file with automatic storage selection based on environment
   * @param file - The file to upload
   * @param bucket - The bucket/folder name
   * @param id - The ID for file naming
   * @param contentType - Optional MIME type override
   * @returns File upload result with URL, relative path, and key
   */
  async uploadFile(
    file: Express.Multer.File,
    bucket: string,
    id: number,
    contentType?: string
  ): Promise<FileUploadResult> {
    if (this.mediaConfig.storage === 'digitalocean') {
      return this.uploadToDigitalOcean(file, bucket, id, contentType);
    } else {
      return this.uploadToLocal(file, bucket, id, contentType);
    }
  }

  /**
   * Upload file to DigitalOcean Spaces
   */
  private async uploadToDigitalOcean(
    file: Express.Multer.File,
    bucket: string,
    id: number,
    contentType?: string
  ): Promise<FileUploadResult> {
    const result = await this.digitalOceanService.uploadFileWithAutoKey(
      file,
      bucket,
      id,
      contentType
    );

    return {
      url: result.cdnUrl,
      relativePath: result.relativePath,
      key: result.key,
      storage: 'digitalocean',
    };
  }

  /**
   * Upload file to local media directory
   */
  private async uploadToLocal(
    file: Express.Multer.File,
    bucket: string,
    id: number,
    contentType?: string
  ): Promise<FileUploadResult> {
    if (!file || !file.buffer) {
      throw new BadRequestException('File buffer is required');
    }

    // Create directory structure
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.originalname
      ? `.${file.originalname.split('.').pop()}`
      : '';
    const fileName = `${id}-${randomString}${extension}`;

    const relativePath = `/${bucket}/${year}/${month}/${fileName}`;
    const fullPath = path.join(
      process.cwd(),
      this.mediaConfig.localPath,
      bucket,
      String(year),
      month
    );
    const filePath = path.join(fullPath, fileName);

    // Ensure directory exists
    await fs.mkdir(fullPath, { recursive: true });

    // Write file
    await fs.writeFile(filePath, file.buffer);

    const url = `${this.mediaConfig.publicUrl}${relativePath}`;

    this.logger.log(`File uploaded locally: ${filePath}`);

    return {
      url,
      relativePath,
      key: `${bucket}/${year}/${month}/${fileName}`,
      storage: 'local',
    };
  }

  /**
   * Delete a file from storage
   * @param relativePath - The relative path of the file
   * @returns Success message
   */
  async deleteFile(relativePath: string): Promise<{ message: string }> {
    if (this.mediaConfig.storage === 'digitalocean') {
      // Remove leading slash for DigitalOcean key
      const key = relativePath.startsWith('/')
        ? relativePath.substring(1)
        : relativePath;
      return this.digitalOceanService.deleteFile(key);
    } else {
      return this.deleteFromLocal(relativePath);
    }
  }

  /**
   * Delete file from local storage
   */
  private async deleteFromLocal(
    relativePath: string
  ): Promise<{ message: string }> {
    try {
      const fullPath = path.join(
        process.cwd(),
        this.mediaConfig.localPath,
        relativePath.substring(1)
      );

      // Check if file exists
      await fs.access(fullPath);

      // Delete file
      await fs.unlink(fullPath);

      this.logger.log(`File deleted locally: ${fullPath}`);

      return {
        message: `File deleted successfully: ${relativePath}`,
      };
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        // File doesn't exist, consider it deleted
        return {
          message: `File not found (already deleted): ${relativePath}`,
        };
      }
      throw new BadRequestException(
        `Failed to delete local file: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get the public URL for a file
   * @param relativePath - The relative path of the file
   * @returns The public URL
   */
  getFileUrl(relativePath: string): string {
    if (this.mediaConfig.storage === 'digitalocean') {
      // Convert relative path to CDN URL
      return this.digitalOceanService.getCdnUrlFromRelativePath(relativePath);
    } else {
      // Return local media URL
      return `${this.mediaConfig.publicUrl}${relativePath}`;
    }
  }

  /**
   * Get storage type
   * @returns Current storage type
   */
  getStorageType(): 'local' | 'digitalocean' {
    return this.mediaConfig.storage;
  }

  /**
   * Get debug information about the current configuration
   * Useful for troubleshooting environment issues
   */
  getDebugInfo() {
    return {
      nodeEnv: process.env.NODE_ENV,
      storage: this.mediaConfig.storage,
      localConfig: {
        path: this.mediaConfig.localPath,
        url: this.mediaConfig.publicUrl,
      },
      digitalOceanConfig: {
        endpoint: this.mediaConfig.digitalOcean.endpoint || 'NOT_SET',
        bucket: this.mediaConfig.digitalOcean.bucket || 'NOT_SET',
        cdnEndpoint: this.mediaConfig.digitalOcean.cdnEndpoint || 'NOT_SET',
        region: this.mediaConfig.digitalOcean.region || 'NOT_SET',
        hasAccessKey: !!this.mediaConfig.digitalOcean.accessKey,
        hasSecretKey: !!this.mediaConfig.digitalOcean.secretKey,
      },
      environmentVariables: {
        NODE_ENV: process.env.NODE_ENV,
        DO_SPACE_ENDPOINT: process.env.DO_SPACE_ENDPOINT || 'NOT_SET',
        DO_SPACE_BUCKET: process.env.DO_SPACE_BUCKET || 'NOT_SET',
        DO_SPACE_CDN_ENDPOINT: process.env.DO_SPACE_CDN_ENDPOINT || 'NOT_SET',
        DO_SPACE_REGION: process.env.DO_SPACE_REGION || 'NOT_SET',
        DO_SPACE_ACCESS_KEY: process.env.DO_SPACE_ACCESS_KEY
          ? 'SET'
          : 'NOT_SET',
        DO_SPACE_SECRET_KEY: process.env.DO_SPACE_SECRET_KEY
          ? 'SET'
          : 'NOT_SET',
      },
    };
  }

  /**
   * Check if file exists
   * @param relativePath - The relative path of the file
   * @returns Whether the file exists
   */
  async fileExists(relativePath: string): Promise<boolean> {
    if (this.mediaConfig.storage === 'digitalocean') {
      // For DigitalOcean, we'll assume it exists if we have the path
      // In a real implementation, you might want to check with HeadObject
      return true;
    } else {
      try {
        const fullPath = path.join(
          process.cwd(),
          this.mediaConfig.localPath,
          relativePath.substring(1)
        );
        await fs.access(fullPath);
        return true;
      } catch {
        return false;
      }
    }
  }
}
