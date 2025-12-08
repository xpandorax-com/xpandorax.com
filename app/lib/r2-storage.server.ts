/**
 * Cloudflare R2 Storage Utilities
 * 
 * Uses the native R2 Bucket Binding (MEDIA) in Workers runtime.
 * No AWS SDK needed - uses Cloudflare's native API.
 * 
 * For Workers: Always use the binding method (env.MEDIA or context.cloudflare.env.MEDIA)
 */

// CDN URL for public access
export const R2_PUBLIC_URL = "https://cdn.xpandorax.com";

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
 * Check if a file exists in R2
 */
export async function existsInR2(
  bucket: R2Bucket,
  key: string
): Promise<boolean> {
  const head = await bucket.head(key);
  return head !== null;
}

/**
 * Get metadata for an R2 object without downloading it
 */
export async function getR2ObjectMetadata(
  bucket: R2Bucket,
  key: string
): Promise<R2Object | null> {
  return bucket.head(key);
}
