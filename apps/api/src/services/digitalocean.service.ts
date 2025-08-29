import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { S3 } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import {
  PutObjectCommand,
  DeleteObjectCommand,
  ObjectCannedACL,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DigitalOceanService {
  private readonly logger = new Logger(DigitalOceanService.name);
  private readonly s3Client: S3;
  private readonly bucketName: string;
  private readonly cdnEndpoint: string;

  constructor(private readonly configService: ConfigService) {
    // Use the regular endpoint for API operations, not CDN
    const endpoint = `https://${this.configService.get<string>('DO_SPACE_ENDPOINT')}`;
    const bucketName = this.configService.get<string>('DO_SPACE_BUCKET');
    const cdnEndpoint = this.configService.get<string>('DO_SPACE_CDN_ENDPOINT');
    const region = this.configService.get<string>('DO_SPACE_REGION');
    const accessKeyId = this.configService.get<string>('DO_SPACE_ACCESS_KEY');
    const secretAccessKey = this.configService.get<string>(
      'DO_SPACE_SECRET_KEY'
    );

    if (
      !bucketName ||
      !cdnEndpoint ||
      !region ||
      !accessKeyId ||
      !secretAccessKey
    ) {
      throw new Error('Missing required DigitalOcean configuration');
    }

    this.bucketName = bucketName;
    this.cdnEndpoint = cdnEndpoint;

    this.s3Client = new S3({
      forcePathStyle: false,
      endpoint: endpoint,
      region: region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  /**
   * Upload a file to DigitalOcean Spaces
   * @param file - The file to upload (Express.Multer.File)
   * @param key - The key/path where the file should be stored in the bucket
   * @param contentType - Optional MIME type override (defaults to file.mimetype)
   * @returns Object containing the CDN URL, relative path, and key
   *
   * @example
   * ```typescript
   * const result = await this.digitalOceanService.uploadFile(file, 'users/123/avatar.jpg');
   * // Store result.key in your database for future reference
   * // Use result.cdnUrl to display the image
   * ```
   */
  async uploadFile(
    file: Express.Multer.File,
    key: string,
    contentType?: string
  ): Promise<{ cdnUrl: string; relativePath: string; key: string }> {
    try {
      if (!file) {
        throw new BadRequestException('File is required');
      }

      // Debug logging to see file structure
      this.logger.debug(
        `File object: ${JSON.stringify({
          fieldname: file.fieldname,
          originalname: file.originalname,
          encoding: file.encoding,
          mimetype: file.mimetype,
          size: file.size,
          hasBuffer: !!file.buffer,
          hasPath: !!file.path,
          bufferLength: file.buffer?.length,
        })}`
      );

      // Check if file has buffer (memory storage) or path (disk storage)
      if (!file.buffer && !file.path) {
        throw new BadRequestException(
          'File must have either buffer or path property'
        );
      }

      let fileBody: Buffer;
      if (file.buffer) {
        // Memory storage - use buffer directly
        fileBody = file.buffer;
      } else if (file.path) {
        // Disk storage - read file from path
        const fs = await import('fs/promises');
        fileBody = await fs.readFile(file.path);
      } else {
        throw new BadRequestException('Unable to read file content');
      }

      const uploadParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: fileBody,
        ContentType: contentType || file.mimetype || 'application/octet-stream',
        ACL: 'public-read' as ObjectCannedACL,
      };

      await this.s3Client.send(new PutObjectCommand(uploadParams));

      const cdnUrl = `${this.cdnEndpoint}/${key}`;
      const relativePath = `/${key}`;

      this.logger.log(`File uploaded successfully: ${key}`);

      return {
        cdnUrl,
        relativePath,
        key,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${(error as Error).message}`);
      throw new BadRequestException(
        `Failed to upload file: ${(error as Error).message}`
      );
    }
  }

  /**
   * Upload a file with automatic key generation based on bucket, date, and message ID
   * This is the recommended method for most use cases as it organizes files by date
   *
   * @param file - The file to upload (Express.Multer.File)
   * @param bucket - The bucket/folder name (e.g., 'messages', 'avatars', 'attachments', 'documents')
   * @param messageId - The ID of the message or entity this file belongs to
   * @param contentType - Optional MIME type override
   * @returns Object containing the CDN URL, relative path, and generated key
   *
   * @example
   * ```typescript
   * // Upload message attachment
   * const result = await this.digitalOceanService.uploadFileWithAutoKey(file, 'messages', 123);
   * // Result: { key: 'messages/2024/01/123-abc123.jpg', ... }
   *
   * // Upload user avatar
   * const result = await this.digitalOceanService.uploadFileWithAutoKey(file, 'avatars', 456);
   * // Result: { key: 'avatars/2024/01/456-xyz789.png', ... }
   * ```
   */
  async uploadFileWithAutoKey(
    file: Express.Multer.File,
    bucket: string,
    id: number,
    contentType?: string
  ): Promise<{ cdnUrl: string; relativePath: string; key: string }> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!id || typeof id !== 'number') {
      throw new BadRequestException('Valid id is required');
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // Generate a unique filename with id and random string
    const randomString = uuidv4();
    const extension = file.originalname
      ? `.${file.originalname.split('.').pop()}`
      : '';
    const fileName = `${id}-${randomString}${extension}`;

    const key = `${bucket}/${year}/${month}/${fileName}`;

    return this.uploadFile(file, key, contentType);
  }

  /**
   * Upload a file with automatic key generation based on bucket and date (timestamp-based)
   * Use this when you don't have a specific ID yet, but want organized file structure
   *
   * @param file - The file to upload (Express.Multer.File)
   * @param bucket - The bucket/folder name (e.g., 'avatars', 'documents', 'temp')
   * @param contentType - Optional MIME type override
   * @returns Object containing the CDN URL, relative path, and generated key
   *
   * @example
   * ```typescript
   * // Upload temporary file
   * const result = await this.digitalOceanService.uploadFileWithTimestamp(file, 'temp');
   * // Result: { key: 'temp/2024/01/1704067200000-abc123.jpg', ... }
   *
   * // Upload user avatar before user creation
   * const result = await this.digitalOceanService.uploadFileWithTimestamp(file, 'avatars');
   * // Result: { key: 'avatars/2024/01/1704067200000-xyz789.png', ... }
   * ```
   */
  async uploadFileWithTimestamp(
    file: Express.Multer.File,
    bucket: string,
    contentType?: string
  ): Promise<{ cdnUrl: string; relativePath: string; key: string }> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // Generate a unique filename with timestamp and random string
    const timestamp = Date.now();
    const randomString = uuidv4();
    const extension = file.originalname
      ? `.${file.originalname.split('.').pop()}`
      : '';
    const fileName = `${timestamp}-${randomString}${extension}`;

    const key = `${bucket}/${year}/${month}/${fileName}`;

    return this.uploadFile(file, key, contentType);
  }

  /**
   * Delete a file from DigitalOcean Spaces by its key
   * @param key - The key/path of the file to delete
   * @returns Success message
   *
   * @example
   * ```typescript
   * // Delete by stored key
   * await this.digitalOceanService.deleteFile('avatars/2024/01/123-abc123.jpg');
   * ```
   */
  async deleteFile(key: string): Promise<{ message: string }> {
    try {
      if (!key) {
        throw new BadRequestException('File key is required');
      }

      const deleteParams = {
        Bucket: this.bucketName,
        Key: key,
      };

      await this.s3Client.send(new DeleteObjectCommand(deleteParams));

      this.logger.log(`File deleted successfully: ${key}`);

      return {
        message: `File deleted successfully: ${key}`,
      };
    } catch (error) {
      this.logger.error(`Failed to delete file: ${(error as Error).message}`);
      throw new BadRequestException(
        `Failed to delete file: ${(error as Error).message}`
      );
    }
  }

  /**
   * Delete a file by CDN URL
   * Useful when you only have the CDN URL and need to delete the file
   *
   * @param cdnUrl - The CDN URL of the file to delete
   * @returns Success message
   *
   * @example
   * ```typescript
   * // Delete by CDN URL
   * await this.digitalOceanService.deleteFileByUrl('https://cdn.example.com/avatars/2024/01/123-abc123.jpg');
   * ```
   */
  async deleteFileByUrl(cdnUrl: string): Promise<{ message: string }> {
    try {
      if (!cdnUrl) {
        throw new BadRequestException('CDN URL is required');
      }

      // Extract the key from the URL
      const key = this.extractKeyFromUrl(cdnUrl);

      if (!key) {
        throw new BadRequestException('Invalid CDN URL format');
      }

      // Delete using the extracted key
      const result = await this.deleteFile(key);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to delete file by URL: ${(error as Error).message}`
      );
      throw new BadRequestException(
        `Failed to delete file by URL: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get the CDN URL for a given key
   * @param key - The file key
   * @returns The CDN URL
   *
   * @example
   * ```typescript
   * const cdnUrl = this.digitalOceanService.getCdnUrl('avatars/2024/01/1704067200000-abc123.jpg');
   * // Returns: 'https://cdn.example.com/avatars/2024/01/1704067200000-abc123.jpg'
   * ```
   */
  getCdnUrl(key: string): string {
    return `${this.cdnEndpoint}/${key}`;
  }

  /**
   * Get the relative path for a given key
   * @param key - The file key
   * @returns The relative path
   *
   * @example
   * ```typescript
   * const relativePath = this.digitalOceanService.getRelativePath('avatars/2024/01/1704067200000-abc123.jpg');
   * // Returns: '/avatars/2024/01/1704067200000-abc123.jpg'
   * ```
   */
  getRelativePath(key: string): string {
    return `/${key}`;
  }

  /**
   * Get the CDN URL from a relative path
   * Useful when you have stored relative paths and need to display the file
   *
   * @param relativePath - The relative path (e.g., '/messages/2024/01/123-abc123.jpg')
   * @returns The full CDN URL
   *
   * @example
   * ```typescript
   * const cdnUrl = this.digitalOceanService.getCdnUrlFromRelativePath('/avatars/2024/01/123-abc123.jpg');
   * // Returns: 'https://cdn.example.com/avatars/2024/01/123-abc123.jpg'
   * ```
   */
  getCdnUrlFromRelativePath(relativePath: string): string {
    if (!relativePath) {
      throw new BadRequestException('Relative path is required');
    }

    // Remove leading slash if present
    const cleanPath = relativePath.startsWith('/')
      ? relativePath.substring(1)
      : relativePath;

    return `${this.cdnEndpoint}/${cleanPath}`;
  }

  /**
   * Extract the file key from a CDN URL
   * @param cdnUrl - The CDN URL
   * @returns The file key or null if invalid
   *
   * @example
   * ```typescript
   * const key = this.digitalOceanService.extractKeyFromUrl('https://cdn.example.com/avatars/2024/01/123-abc123.jpg');
   * // Returns: 'avatars/2024/01/123-abc123.jpg'
   * ```
   */
  extractKeyFromUrl(cdnUrl: string): string | null {
    try {
      if (!cdnUrl || !cdnUrl.includes(this.cdnEndpoint)) {
        return null;
      }

      // Remove the CDN endpoint and leading slash
      const key = cdnUrl.replace(`${this.cdnEndpoint}/`, '');
      return key || null;
    } catch (error) {
      this.logger.error(
        `Failed to extract key from URL: ${(error as Error).message}`
      );
      return null;
    }
  }
}
