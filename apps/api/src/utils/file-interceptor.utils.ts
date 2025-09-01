import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

export interface FileUploadConfig {
  fieldName: string;
  maxFileSize?: number;
  maxFiles?: number;
  allowedMimeTypes?: string[];
  allowAllFiles?: boolean;
}

/**
 * Creates a FileInterceptor configuration for file uploads
 *
 * This function provides a centralized way to configure file upload interceptors
 * with consistent validation and error handling across the application.
 *
 * @param config Configuration options for the file upload
 * @returns Configured FileInterceptor
 *
 * @example
 * ```typescript
 * // Basic image upload
 * @UseInterceptors(createFileUploadInterceptor({
 *   fieldName: 'photo',
 *   maxFileSize: 5 * 1024 * 1024, // 5MB
 *   allowedMimeTypes: ['image/']
 * }))
 *
 * // Allow all file types
 * @UseInterceptors(createFileUploadInterceptor({
 *   fieldName: 'document',
 *   maxFileSize: 10 * 1024 * 1024, // 10MB
 *   allowAllFiles: true
 * }))
 * ```
 */
export function createFileUploadInterceptor(config: FileUploadConfig) {
  const {
    fieldName,
    maxFileSize = 5 * 1024 * 1024, // Default 5MB
    maxFiles = 1,
    allowedMimeTypes = ['image/'],
    allowAllFiles = false,
  } = config;

  return FileInterceptor(fieldName, {
    storage: memoryStorage(),
    limits: {
      fileSize: maxFileSize,
      files: maxFiles,
    },
    fileFilter: (req, file, cb) => {
      if (allowAllFiles) {
        cb(null, true);
        return;
      }

      // Check if file mimetype matches any of the allowed types
      const isAllowed = allowedMimeTypes.some((mimeType) =>
        file.mimetype.startsWith(mimeType)
      );

      if (isAllowed) {
        cb(null, true);
      } else {
        const allowedTypes = allowedMimeTypes.join(', ');
        cb(new Error(`Only ${allowedTypes} files are allowed`), false);
      }
    },
  });
}

/**
 * Creates a FileInterceptor for image uploads (default configuration)
 *
 * This is a convenience function for the most common use case - uploading images.
 * It uses sensible defaults: 5MB file size limit, single file, and image MIME types only.
 *
 * @param fieldName The field name for the file upload (defaults to 'photo_url')
 * @returns Configured FileInterceptor for images
 *
 * @example
 * ```typescript
 * // Basic usage with default field name
 * @UseInterceptors(createImageUploadInterceptor())
 *
 * // Custom field name
 * @UseInterceptors(createImageUploadInterceptor('avatar'))
 * ```
 */
export function createImageUploadInterceptor(fieldName: string = 'photo_url') {
  return createFileUploadInterceptor({
    fieldName,
    maxFileSize: 500 * 1024, // 500KB
    maxFiles: 1,
    allowedMimeTypes: ['image/'],
  });
}

/**
 * Creates a FileInterceptor for general file uploads (allows all file types)
 *
 * This function is useful when you need to accept various file types,
 * such as documents, videos, or other media files.
 *
 * @param fieldName The field name for the file upload (defaults to 'file')
 * @param maxFileSize Maximum file size in bytes (defaults to 10MB)
 * @returns Configured FileInterceptor for general files
 *
 * @example
 * ```typescript
 * // Basic usage with default settings
 * @UseInterceptors(createGeneralFileUploadInterceptor())
 *
 * // Custom field name and file size
 * @UseInterceptors(createGeneralFileUploadInterceptor('document', 20 * 1024 * 1024))
 * ```
 */
export function createGeneralFileUploadInterceptor(
  fieldName: string = 'file',
  maxFileSize: number = 10 * 1024 * 1024 // 10MB
) {
  return createFileUploadInterceptor({
    fieldName,
    maxFileSize,
    maxFiles: 1,
    allowAllFiles: true,
  });
}
