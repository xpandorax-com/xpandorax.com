/**
 * Backblaze B2 Storage Utilities with Cloudflare CDN
 * 
 * Uses Backblaze B2 S3-compatible API for storage with Cloudflare CDN for delivery.
 * This provides cost-effective storage and global CDN delivery.
 * 
 * Architecture:
 * - Upload: Direct to Backblaze B2 via S3-compatible API
 * - Delivery: Cloudflare CDN (caching layer in front of B2)
 * 
 * Required Environment Variables:
 * - B2_KEY_ID: Backblaze application key ID
 * - B2_APPLICATION_KEY: Backblaze application key
 * - B2_BUCKET_NAME: Name of the B2 bucket
 * - B2_BUCKET_ID: ID of the B2 bucket (for native API)
 * - B2_REGION: B2 region (e.g., 'us-west-004')
 * - B2_ENDPOINT: S3-compatible endpoint (e.g., 's3.us-west-004.backblazeb2.com')
 * - CDN_URL: Cloudflare CDN URL (e.g., 'https://cdn.xpandorax.com')
 */

import { AwsClient } from 'aws4fetch';

export interface B2Config {
  keyId: string;
  applicationKey: string;
  bucketName: string;
  bucketId: string;
  region: string;
  endpoint: string;
  cdnUrl: string;
}

export interface UploadResult {
  success: boolean;
  url: string;
  key: string;
  size: number;
  contentType: string;
  etag?: string;
}

// CDN URL for public access (Cloudflare CDN in front of B2)
export const B2_CDN_URL = "https://cdn.xpandorax.com";

/**
 * Get B2 configuration from environment variables
 */
export function getB2Config(env: Record<string, string | undefined>): B2Config {
  const config: B2Config = {
    keyId: env.B2_KEY_ID || '',
    applicationKey: env.B2_APPLICATION_KEY || '',
    bucketName: env.B2_BUCKET_NAME || 'xpandorax-media',
    bucketId: env.B2_BUCKET_ID || '',
    region: env.B2_REGION || 'us-west-004',
    endpoint: env.B2_ENDPOINT || 's3.us-west-004.backblazeb2.com',
    cdnUrl: env.CDN_URL || B2_CDN_URL,
  };

  if (!config.keyId || !config.applicationKey) {
    throw new Error('B2 credentials not configured. Set B2_KEY_ID and B2_APPLICATION_KEY environment variables.');
  }

  return config;
}

/**
 * Create an AWS-compatible client for B2 S3 API
 */
export function createB2Client(config: B2Config): AwsClient {
  return new AwsClient({
    accessKeyId: config.keyId,
    secretAccessKey: config.applicationKey,
    service: 's3',
    region: config.region,
  });
}

/**
 * Upload a file to B2 using S3-compatible API
 */
export async function uploadToB2(
  config: B2Config,
  key: string,
  data: ArrayBuffer | Uint8Array | string,
  options?: {
    contentType?: string;
    metadata?: Record<string, string>;
    cacheControl?: string;
  }
): Promise<UploadResult> {
  const client = createB2Client(config);
  
  // Build the S3-compatible URL
  const url = `https://${config.endpoint}/${config.bucketName}/${key}`;
  
  // Prepare headers
  const headers: Record<string, string> = {};
  
  if (options?.contentType) {
    headers['Content-Type'] = options.contentType;
  }
  
  // Set cache control for CDN optimization
  headers['Cache-Control'] = options?.cacheControl || 'public, max-age=31536000, immutable';
  
  // Add custom metadata as x-amz-meta-* headers
  if (options?.metadata) {
    for (const [metaKey, metaValue] of Object.entries(options.metadata)) {
      headers[`x-amz-meta-${metaKey.toLowerCase()}`] = metaValue;
    }
  }

  // Convert data to ArrayBuffer if needed
  let bodyData: ArrayBuffer;
  if (typeof data === 'string') {
    bodyData = new TextEncoder().encode(data).buffer as ArrayBuffer;
  } else if (data instanceof Uint8Array) {
    bodyData = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
  } else {
    bodyData = data;
  }

  // Sign and send the request
  const response = await client.fetch(url, {
    method: 'PUT',
    headers,
    body: bodyData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload to B2: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const etag = response.headers.get('ETag') || undefined;

  return {
    success: true,
    url: getB2PublicUrl(config, key),
    key,
    size: bodyData.byteLength,
    contentType: options?.contentType || 'application/octet-stream',
    etag,
  };
}

/**
 * Delete a file from B2 using S3-compatible API
 */
export async function deleteFromB2(
  config: B2Config,
  key: string
): Promise<void> {
  const client = createB2Client(config);
  const url = `https://${config.endpoint}/${config.bucketName}/${key}`;

  const response = await client.fetch(url, {
    method: 'DELETE',
  });

  if (!response.ok && response.status !== 404) {
    const errorText = await response.text();
    throw new Error(`Failed to delete from B2: ${response.status} ${response.statusText} - ${errorText}`);
  }
}

/**
 * Check if a file exists in B2
 */
export async function existsInB2(
  config: B2Config,
  key: string
): Promise<boolean> {
  const client = createB2Client(config);
  const url = `https://${config.endpoint}/${config.bucketName}/${key}`;

  const response = await client.fetch(url, {
    method: 'HEAD',
  });

  return response.ok;
}

/**
 * Get file metadata from B2
 */
export async function getB2ObjectMetadata(
  config: B2Config,
  key: string
): Promise<{
  size: number;
  contentType: string;
  lastModified: Date;
  etag?: string;
  metadata?: Record<string, string>;
} | null> {
  const client = createB2Client(config);
  const url = `https://${config.endpoint}/${config.bucketName}/${key}`;

  const response = await client.fetch(url, {
    method: 'HEAD',
  });

  if (!response.ok) {
    return null;
  }

  const metadata: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    if (key.toLowerCase().startsWith('x-amz-meta-')) {
      metadata[key.replace('x-amz-meta-', '')] = value;
    }
  });

  return {
    size: parseInt(response.headers.get('Content-Length') || '0', 10),
    contentType: response.headers.get('Content-Type') || 'application/octet-stream',
    lastModified: new Date(response.headers.get('Last-Modified') || Date.now()),
    etag: response.headers.get('ETag') || undefined,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  };
}

/**
 * List files in B2 bucket with optional prefix
 */
export async function listB2Objects(
  config: B2Config,
  options?: {
    prefix?: string;
    maxKeys?: number;
    continuationToken?: string;
  }
): Promise<{
  objects: Array<{
    key: string;
    size: number;
    lastModified: Date;
    etag?: string;
  }>;
  isTruncated: boolean;
  nextContinuationToken?: string;
}> {
  const client = createB2Client(config);
  
  const params = new URLSearchParams();
  params.set('list-type', '2');
  
  if (options?.prefix) {
    params.set('prefix', options.prefix);
  }
  if (options?.maxKeys) {
    params.set('max-keys', options.maxKeys.toString());
  }
  if (options?.continuationToken) {
    params.set('continuation-token', options.continuationToken);
  }

  const url = `https://${config.endpoint}/${config.bucketName}?${params.toString()}`;

  const response = await client.fetch(url, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to list B2 objects: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const xmlText = await response.text();
  
  // Parse XML response (basic parsing)
  const objects: Array<{ key: string; size: number; lastModified: Date; etag?: string }> = [];
  
  const contentMatches = xmlText.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g);
  for (const match of contentMatches) {
    const content = match[1];
    const keyMatch = content.match(/<Key>(.*?)<\/Key>/);
    const sizeMatch = content.match(/<Size>(.*?)<\/Size>/);
    const lastModifiedMatch = content.match(/<LastModified>(.*?)<\/LastModified>/);
    const etagMatch = content.match(/<ETag>"?(.*?)"?<\/ETag>/);
    
    if (keyMatch) {
      objects.push({
        key: keyMatch[1],
        size: sizeMatch ? parseInt(sizeMatch[1], 10) : 0,
        lastModified: lastModifiedMatch ? new Date(lastModifiedMatch[1]) : new Date(),
        etag: etagMatch ? etagMatch[1] : undefined,
      });
    }
  }

  const isTruncatedMatch = xmlText.match(/<IsTruncated>(.*?)<\/IsTruncated>/);
  const nextTokenMatch = xmlText.match(/<NextContinuationToken>(.*?)<\/NextContinuationToken>/);

  return {
    objects,
    isTruncated: isTruncatedMatch ? isTruncatedMatch[1] === 'true' : false,
    nextContinuationToken: nextTokenMatch ? nextTokenMatch[1] : undefined,
  };
}

/**
 * Get the public CDN URL for a B2 object
 * Uses Cloudflare CDN URL for fast, cached delivery
 */
export function getB2PublicUrl(config: B2Config, key: string): string {
  return `${config.cdnUrl}/${key}`;
}

/**
 * Get the direct B2 URL (bypasses CDN, not recommended for production)
 */
export function getB2DirectUrl(config: B2Config, key: string): string {
  return `https://${config.bucketName}.${config.endpoint}/${key}`;
}

/**
 * Generate a presigned URL for direct upload (useful for client-side uploads)
 */
export async function generatePresignedUploadUrl(
  config: B2Config,
  key: string,
  options?: {
    contentType?: string;
    expiresIn?: number; // seconds, default 3600 (1 hour)
  }
): Promise<string> {
  const client = createB2Client(config);
  const expiresIn = options?.expiresIn || 3600;
  
  const params = new URLSearchParams();
  params.set('X-Amz-Expires', expiresIn.toString());
  
  if (options?.contentType) {
    params.set('Content-Type', options.contentType);
  }

  const url = `https://${config.endpoint}/${config.bucketName}/${key}?${params.toString()}`;
  
  // Sign the URL
  const signedRequest = await client.sign(url, {
    method: 'PUT',
    headers: options?.contentType ? { 'Content-Type': options.contentType } : undefined,
  });

  return signedRequest.url;
}

/**
 * Upload a video file to B2 (for premium content)
 * Videos are stored in a separate path and optimized for streaming
 */
export async function uploadVideoToB2(
  config: B2Config,
  key: string,
  data: ArrayBuffer | Uint8Array,
  options?: {
    contentType?: string;
    title?: string;
    duration?: number;
  }
): Promise<UploadResult> {
  // Ensure video path prefix
  const videoKey = key.startsWith('videos/') ? key : `videos/${key}`;
  
  const metadata: Record<string, string> = {};
  if (options?.title) {
    metadata.title = options.title;
  }
  if (options?.duration) {
    metadata.duration = options.duration.toString();
  }

  return uploadToB2(config, videoKey, data, {
    contentType: options?.contentType || 'video/mp4',
    metadata,
    // Videos should be cached for a long time
    cacheControl: 'public, max-age=31536000, immutable',
  });
}

/**
 * Upload an image file to B2
 * Images are stored in organized paths by date
 */
export async function uploadImageToB2(
  config: B2Config,
  filename: string,
  data: ArrayBuffer | Uint8Array,
  options?: {
    contentType?: string;
    originalFilename?: string;
    folder?: string; // e.g., 'pictures', 'thumbnails'
  }
): Promise<UploadResult> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const folder = options?.folder || 'pictures';
  
  // Create organized path: folder/2024/12/filename
  const key = `${folder}/${year}/${month}/${filename}`;
  
  const metadata: Record<string, string> = {
    uploadedAt: now.toISOString(),
  };
  if (options?.originalFilename) {
    metadata.originalFilename = options.originalFilename;
  }

  return uploadToB2(config, key, data, {
    contentType: options?.contentType || 'image/jpeg',
    metadata,
    // Images should be cached for a long time
    cacheControl: 'public, max-age=31536000, immutable',
  });
}

// Export legacy function names for backward compatibility
export { getB2PublicUrl as getR2PublicUrl };
