import { mediaApi } from '@/lib/api';
import type { UploadUrlRequest } from '@/lib/api/schemas/media.schemas';
import { logError, logInfo } from '@/utils/logger';

import { isDevelopment } from './env';

export type MediaUploadOptions = {
  fileName: string;
  fileType: string;
  purpose: UploadUrlRequest['purpose'];
  prefix?: string;
};

export type MediaUploadResult = {
  publicUrl: string;
  key: string;
};

/**
 * Convert File to base64 data URL
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    });
    reader.addEventListener('error', () => reject(new Error('Failed to read file')));
    reader.readAsDataURL(file);
  });
};

/**
 * Convert base64 data URL to File object
 */
export const base64ToFile = (base64: string, fileName: string): File => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.codePointAt(n) ?? 0;
  }
  return new File([u8arr], fileName, { type: mime });
};

/**
 * Upload a file to S3 using presigned URL
 */
export const uploadToS3 = async (
  file: File,
  options: MediaUploadOptions,
): Promise<MediaUploadResult> => {
  if (isDevelopment) {
    return {
      publicUrl:
        'https://ctkper.s3.amazonaws.com/nktu/undefined/2025-10-02/d505ed07-ee27-415b-aeff-56ccb52a6806/delivery-request-photo/delivery/1759383029926-delivery-photo-1759383029879.jpg',
      key: '1759383029926-delivery-photo-1759383029879.jpg',
    };
  }
  try {
    logInfo('Starting S3 upload', {
      module: 'MediaUpload',
      action: 'uploadToS3',
      metadata: {
        fileName: options.fileName,
        fileType: options.fileType,
        fileSize: file.size,
        purpose: options.purpose,
      },
    });

    // Step 1: Get presigned upload URL
    const uploadUrlRequest: UploadUrlRequest = {
      fileName: options.fileName,
      fileType: options.fileType,
      purpose: options.purpose,
      ...(options.prefix && { prefix: options.prefix }),
    };

    const uploadUrlResponse = await mediaApi.getUploadUrl(uploadUrlRequest);

    if (!uploadUrlResponse.uploadUrl) {
      throw new Error('Failed to get upload URL');
    }

    const { uploadUrl, fileUrl: publicUrl, key } = uploadUrlResponse;

    // Step 2: Upload file to S3
    await mediaApi.uploadToS3(uploadUrl, file);

    logInfo('S3 upload completed successfully', {
      module: 'MediaUpload',
      action: 'uploadToS3',
      metadata: {
        publicUrl,
        key,
      },
    });

    return {
      publicUrl,
      key,
    };
  } catch (error) {
    logError('Failed to upload to S3', error, {
      module: 'MediaUpload',
      action: 'uploadToS3',
      metadata: options,
    });
    throw error;
  }
};

/**
 * Upload multiple files to S3
 */
export const uploadMultipleToS3 = async (
  files: File[],
  optionsProvider: (file: File, index: number) => MediaUploadOptions,
): Promise<MediaUploadResult[]> => {
  const uploadPromises = files.map((file, index) => uploadToS3(file, optionsProvider(file, index)));

  return Promise.all(uploadPromises);
};

/**
 * Upload base64 images to S3
 */
export const uploadBase64ToS3 = async (
  base64Image: string,
  options: MediaUploadOptions,
): Promise<MediaUploadResult> => {
  const file = base64ToFile(base64Image, options.fileName);
  const result = await uploadToS3(file, options);
  return {
    publicUrl: result.publicUrl,
    key: result.key,
  };
};
