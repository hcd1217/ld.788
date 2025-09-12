import { BaseApiClient } from '../base';
import {
  type UploadUrlRequest,
  UploadUrlRequestSchema,
  type UploadUrlResponse,
  UploadUrlResponseSchema,
} from '../schemas/media.schemas';

export class MediaApi extends BaseApiClient {
  async getUploadUrl(data: UploadUrlRequest): Promise<UploadUrlResponse> {
    return this.post<UploadUrlResponse, UploadUrlRequest>(
      '/api/media/upload-url',
      data,
      UploadUrlResponseSchema,
      UploadUrlRequestSchema,
    );
  }

  async uploadToS3(uploadUrl: string, file: File): Promise<void> {
    const debug = uploadUrl.includes('mock');
    if (debug) {
      return;
    }
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to upload to S3: ${response.status} ${response.statusText}`);
    }
  }
}
