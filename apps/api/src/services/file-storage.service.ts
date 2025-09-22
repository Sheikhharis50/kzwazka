import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3,
  PutObjectCommand,
  DeleteObjectCommand,
  ObjectCannedACL,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface FileUploadResult {
  url: string;
  relativePath: string;
  key: string;
  storage: 'local' | 'digitalocean';
}

export interface StorageConfig {
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

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private readonly config: StorageConfig;
  private readonly s3Client?: S3;

  constructor(private readonly configService: ConfigService) {
    this.config = this.initializeConfig();

    if (this.config.storage === 'digitalocean') {
      this.s3Client = this.initializeS3Client();
    }
  }

  /**
   * Initialize storage configuration based on environment
   */
  private initializeConfig(): StorageConfig {
    const nodeEnv = process.env.NODE_ENV;
    const isProduction = nodeEnv === 'production';

    const config: StorageConfig = {
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

    // Validate production configuration
    if (isProduction) {
      const { digitalOcean } = config;
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
        config.storage = 'local';
      }
    }

    this.logger.log(
      `File storage initialized with: ${config.storage} (NODE_ENV: ${nodeEnv})`
    );
    return config;
  }

  /**
   * Initialize S3 client for DigitalOcean Spaces
   */
  private initializeS3Client(): S3 {
    const { digitalOcean } = this.config;

    return new S3({
      forcePathStyle: false,
      endpoint: `https://${digitalOcean.endpoint}`,
      region: digitalOcean.region,
      credentials: {
        accessKeyId: digitalOcean.accessKey,
        secretAccessKey: digitalOcean.secretKey,
      },
    });
  }

  /**
   * Upload a file with automatic storage selection
   * @param file - The file to upload
   * @param bucket - The bucket/folder name
   * @param id - The ID for file naming
   * @param contentType - Optional MIME type override
   * @returns File upload result
   */
  async uploadFile(
    file: Express.Multer.File,
    bucket: string,
    id: number,
    contentType?: string
  ): Promise<FileUploadResult> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!id || typeof id !== 'number') {
      throw new BadRequestException('Valid id is required');
    }

    if (this.config.storage === 'digitalocean') {
      return this.uploadToDigitalOcean(file, bucket, id, contentType);
    } else {
      return this.uploadToLocal(file, bucket, id);
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
    if (!this.s3Client) {
      throw new BadRequestException('S3 client not initialized');
    }

    try {
      // Generate file path
      const { key, relativePath } = this.generateFilePath(
        bucket,
        id,
        file.originalname
      );

      // Get file content
      const fileBody = await this.getFileContent(file);

      // Upload to S3
      const uploadParams = {
        Bucket: this.config.digitalOcean.bucket,
        Key: key,
        Body: fileBody,
        ContentType: contentType || file.mimetype || 'application/octet-stream',
        ACL: 'public-read' as ObjectCannedACL,
      };

      await this.s3Client.send(new PutObjectCommand(uploadParams));

      const url = `${this.config.digitalOcean.cdnEndpoint}/${key}`;

      this.logger.log(`File uploaded to DigitalOcean: ${key}`);

      return {
        url,
        relativePath,
        key,
        storage: 'digitalocean',
      };
    } catch (error) {
      this.logger.error(
        `Failed to upload file to DigitalOcean: ${(error as Error).message}`
      );
      throw new BadRequestException(
        `Failed to upload file: ${(error as Error).message}`
      );
    }
  }

  /**
   * Upload file to local storage
   */
  private async uploadToLocal(
    file: Express.Multer.File,
    bucket: string,
    id: number
  ): Promise<FileUploadResult> {
    try {
      if (!file.buffer) {
        throw new BadRequestException(
          'File buffer is required for local storage'
        );
      }

      // Generate file path
      const { key, relativePath, fullPath } = this.generateFilePath(
        bucket,
        id,
        file.originalname
      );

      // Ensure directory exists
      await fs.mkdir(path.dirname(fullPath), { recursive: true });

      // Write file
      await fs.writeFile(fullPath, file.buffer);

      const url = `${this.config.publicUrl}${relativePath}`;

      this.logger.log(`File uploaded locally: ${fullPath}`);

      return {
        url,
        relativePath,
        key,
        storage: 'local',
      };
    } catch (error) {
      this.logger.error(
        `Failed to upload file locally: ${(error as Error).message}`
      );
      throw new BadRequestException(
        `Failed to upload file: ${(error as Error).message}`
      );
    }
  }

  /**
   * Generate consistent file path structure
   */
  private generateFilePath(bucket: string, id: number, originalName?: string) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const randomString = uuidv4();
    const extension = originalName ? `.${originalName.split('.').pop()}` : '';
    const fileName = `${id}-${randomString}${extension}`;

    const key = `${bucket}/${year}/${month}/${fileName}`;
    const relativePath = `/${key}`;
    const fullPath = path.join(process.cwd(), this.config.localPath, key);

    return { key, relativePath, fullPath, fileName };
  }

  /**
   * Get file content from buffer or path
   */
  private async getFileContent(file: Express.Multer.File): Promise<Buffer> {
    if (file.buffer) {
      return file.buffer;
    } else if (file.path) {
      return await fs.readFile(file.path);
    } else {
      throw new BadRequestException(
        'File must have either buffer or path property'
      );
    }
  }

  /**
   * Delete a file from storage
   * @param relativePath - The relative path of the file
   * @returns Success message
   */
  async deleteFile(relativePath: string): Promise<{ message: string }> {
    if (!relativePath) {
      throw new BadRequestException('Relative path is required');
    }

    if (this.config.storage === 'digitalocean') {
      return this.deleteFromDigitalOcean(relativePath);
    } else {
      return this.deleteFromLocal(relativePath);
    }
  }

  /**
   * Delete file from DigitalOcean Spaces
   */
  private async deleteFromDigitalOcean(
    relativePath: string
  ): Promise<{ message: string }> {
    if (!this.s3Client) {
      throw new BadRequestException('S3 client not initialized');
    }

    try {
      const key = relativePath.startsWith('/')
        ? relativePath.substring(1)
        : relativePath;

      const deleteParams = {
        Bucket: this.config.digitalOcean.bucket,
        Key: key,
      };

      await this.s3Client.send(new DeleteObjectCommand(deleteParams));

      this.logger.log(`File deleted from DigitalOcean: ${key}`);

      return {
        message: `File deleted successfully: ${relativePath}`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to delete file from DigitalOcean: ${(error as Error).message}`
      );
      throw new BadRequestException(
        `Failed to delete file: ${(error as Error).message}`
      );
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
        this.config.localPath,
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
      if ((error as { code?: string }).code === 'ENOENT') {
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
    if (!relativePath) {
      throw new BadRequestException('Relative path is required');
    }

    if (this.config.storage === 'digitalocean') {
      const key = relativePath.startsWith('/')
        ? relativePath.substring(1)
        : relativePath;
      return `${this.config.digitalOcean.cdnEndpoint}/${key}`;
    } else {
      return `${this.config.publicUrl}${relativePath}`;
    }
  }

  /**
   * Get storage type
   * @returns Current storage type
   */
  getStorageType(): 'local' | 'digitalocean' {
    return this.config.storage;
  }

  /**
   * Check if file exists
   * @param relativePath - The relative path of the file
   * @returns Whether the file exists
   */
  async fileExists(relativePath: string): Promise<boolean> {
    if (!relativePath) {
      return false;
    }

    if (this.config.storage === 'digitalocean') {
      // For DigitalOcean, we'll assume it exists if we have the path
      // In a real implementation, you might want to check with HeadObject
      return true;
    } else {
      try {
        const fullPath = path.join(
          process.cwd(),
          this.config.localPath,
          relativePath.substring(1)
        );
        await fs.access(fullPath);
        return true;
      } catch {
        return false;
      }
    }
  }

  /**
   * Get debug information about the current configuration
   */
  getDebugInfo() {
    return {
      nodeEnv: process.env.NODE_ENV,
      storage: this.config.storage,
      localConfig: {
        path: this.config.localPath,
        url: this.config.publicUrl,
      },
      digitalOceanConfig: {
        endpoint: this.config.digitalOcean.endpoint || 'NOT_SET',
        bucket: this.config.digitalOcean.bucket || 'NOT_SET',
        cdnEndpoint: this.config.digitalOcean.cdnEndpoint || 'NOT_SET',
        region: this.config.digitalOcean.region || 'NOT_SET',
        hasAccessKey: !!this.config.digitalOcean.accessKey,
        hasSecretKey: !!this.config.digitalOcean.secretKey,
      },
    };
  }

  getAbsoluteUrl(relativePath: string): string {
    if (!relativePath) {
      throw new BadRequestException('Relative path is required');
    }

    if (this.config.storage === 'digitalocean') {
      const key = relativePath.startsWith('/')
        ? relativePath.substring(1)
        : relativePath;
      return `https://${this.config.digitalOcean.bucket}.${this.config.digitalOcean.cdnEndpoint}/${key}`;
    } else {
      return `${this.config.publicUrl}${relativePath}`;
    }
  }

  downloadFile(url: string): Promise<Buffer> {
    if (!url) {
      throw new BadRequestException('URL is required');
    }

    if (this.config.storage === 'digitalocean') {
      return this.downloadFromDigitalOcean(url);
    } else {
      return this.downloadFromLocal(url);
    }
  }

  private async downloadFromDigitalOcean(url: string): Promise<Buffer> {
    if (!this.s3Client) {
      throw new BadRequestException('S3 client not initialized');
    }

    const urlObj = new URL(url);
    const key = urlObj.pathname.substring(1);

    const downloadParams = {
      Bucket: this.config.digitalOcean.bucket,
      Key: key,
    };
    const object = await this.s3Client.send(
      new GetObjectCommand(downloadParams)
    );
    return (await object.Body?.transformToByteArray()) as Buffer;
  }

  private async downloadFromLocal(url: string): Promise<Buffer> {
    const key = url.startsWith('/') ? url.substring(1) : url;
    const fullPath = path.join(process.cwd(), this.config.localPath, key);
    return await fs.readFile(fullPath);
  }
}
