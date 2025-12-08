/**
 * Cloudflare R2 Storage Utilities
 * 
 * SECURITY NOTE: This module uses two methods to access R2:
 * 1. R2 Bucket Binding (MEDIA) - Used in Workers runtime, no credentials needed
 * 2. S3-compatible API - Used for external tools or server-side operations
 * 
 * For Workers: Always prefer the binding method (env.MEDIA)
 * For external access: Use the S3 client with credentials from env
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// CDN URL for public access
export const R2_PUBLIC_URL = "https://cdn.xpandorax.com";

/**
 * Create an S3-compatible client for R2
 * Only use this for operations that can't use the Worker binding
 */
export function createR2Client(env: {
  R2_ACCOUNT_ID?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_ENDPOINT?: string;
}) {
  if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
    throw new Error("R2 credentials not configured. Check your environment variables.");
  }

  return new S3Client({
    region: "auto",
    endpoint: env.R2_ENDPOINT || `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
}

/**
 * Upload a file to R2 using the Worker binding (preferred method)
 */
export async function uploadToR2(
  bucket: R2Bucket,
  key: string,
  data: ReadableStream | ArrayBuffer | string,
  options?: {
    contentType?: string;
    metadata?: Record<string, string>;
  }
): Promise<R2Object> {
  const httpMetadata: R2HTTPMetadata = {};
  if (options?.contentType) {
    httpMetadata.contentType = options.contentType;
  }

  const result = await bucket.put(key, data, {
    httpMetadata,
    customMetadata: options?.metadata,
  });

  if (!result) {
    throw new Error(`Failed to upload ${key} to R2`);
  }

  return result;
}

/**
 * Get a file from R2 using the Worker binding
 */
export async function getFromR2(
  bucket: R2Bucket,
  key: string
): Promise<R2ObjectBody | null> {
  return bucket.get(key);
}

/**
 * Delete a file from R2 using the Worker binding
 */
export async function deleteFromR2(
  bucket: R2Bucket,
  key: string
): Promise<void> {
  await bucket.delete(key);
}

/**
 * List files in R2 using the Worker binding
 */
export async function listR2Objects(
  bucket: R2Bucket,
  options?: {
    prefix?: string;
    limit?: number;
    cursor?: string;
  }
): Promise<R2Objects> {
  return bucket.list({
    prefix: options?.prefix,
    limit: options?.limit,
    cursor: options?.cursor,
  });
}

/**
 * Get the public URL for an R2 object
 */
export function getR2PublicUrl(key: string): string {
  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Generate a presigned URL for uploading (S3 API method)
 * Use this when you need to give a client direct upload access
 */
export async function getPresignedUploadUrl(
  env: {
    R2_ACCOUNT_ID?: string;
    R2_ACCESS_KEY_ID?: string;
    R2_SECRET_ACCESS_KEY?: string;
    R2_ENDPOINT?: string;
    R2_BUCKET_NAME?: string;
  },
  key: string,
  expiresIn = 3600
): Promise<string> {
  const client = createR2Client(env);
  
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME || "xpandorax-com",
    Key: key,
  });

  return getSignedUrl(client, command, { expiresIn });
}

/**
 * Generate a presigned URL for downloading (S3 API method)
 * Use this for private files that need temporary access
 */
export async function getPresignedDownloadUrl(
  env: {
    R2_ACCOUNT_ID?: string;
    R2_ACCESS_KEY_ID?: string;
    R2_SECRET_ACCESS_KEY?: string;
    R2_ENDPOINT?: string;
    R2_BUCKET_NAME?: string;
  },
  key: string,
  expiresIn = 3600
): Promise<string> {
  const client = createR2Client(env);
  
  const command = new GetObjectCommand({
    Bucket: env.R2_BUCKET_NAME || "xpandorax-com",
    Key: key,
  });

  return getSignedUrl(client, command, { expiresIn });
}
