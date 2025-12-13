import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { uploadToR2, getR2PublicUrl } from "~/lib/r2-storage.server";

/**
 * API endpoint for uploading pictures to R2 storage
 * 
 * POST /api/upload-picture
 * - Accepts multipart/form-data with 'file' field
 * - Returns the R2 public URL for the uploaded image
 * 
 * Files are stored in: pictures/{year}/{month}/{filename}
 */

// Allowed image types
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png", 
  "image/webp",
  "image/gif",
  "image/avif",
];

// Max file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// CORS headers to allow Sanity Studio uploads
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

// Helper function to add CORS headers to JSON response
function jsonWithCors(data: unknown, init?: ResponseInit) {
  return json(data, {
    ...init,
    headers: {
      ...CORS_HEADERS,
      ...(init?.headers || {}),
    },
  });
}

// Handle OPTIONS preflight requests
export async function loader({ request }: LoaderFunctionArgs) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  return jsonWithCors({
    message: "Picture Upload API",
    instructions: {
      method: "POST",
      contentType: "multipart/form-data",
      field: "file",
      allowedTypes: ALLOWED_TYPES,
      maxSize: `${MAX_FILE_SIZE / 1024 / 1024}MB`,
    },
    example: {
      curl: `curl -X POST -F "file=@/path/to/image.jpg" ${new URL(request.url).origin}/api/upload-picture`,
    },
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  // Handle OPTIONS preflight requests
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  // Only allow POST requests
  if (request.method !== "POST") {
    return jsonWithCors({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    
    if (!contentType.includes("multipart/form-data")) {
      return jsonWithCors({ error: "Content-Type must be multipart/form-data" }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return jsonWithCors({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return jsonWithCors({ 
        error: `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_TYPES.join(", ")}` 
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return jsonWithCors({ 
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` 
      }, { status: 400 });
    }

    // Generate unique filename with organized path
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const timestamp = now.getTime();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    
    // Get file extension
    const originalName = file.name;
    const extension = originalName.split(".").pop()?.toLowerCase() || "jpg";
    
    // Sanitize filename
    const sanitizedName = originalName
      .replace(/\.[^/.]+$/, "") // Remove extension
      .replace(/[^a-zA-Z0-9-_]/g, "-") // Replace special chars with dash
      .substring(0, 50) // Limit length
      .toLowerCase();
    
    // Create organized path: pictures/2024/12/filename-timestamp-random.ext
    const key = `pictures/${year}/${month}/${sanitizedName}-${timestamp}-${randomSuffix}.${extension}`;

    // Get R2 bucket binding
    const bucket = context.cloudflare.env.MEDIA as R2Bucket;
    
    if (!bucket) {
      console.error("R2 bucket binding (MEDIA) not found");
      return jsonWithCors({ error: "Storage not configured" }, { status: 500 });
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Upload to R2
    await uploadToR2(bucket, key, arrayBuffer, {
      contentType: file.type,
      metadata: {
        originalName: originalName,
        uploadedAt: now.toISOString(),
      },
    });

    // Get public URL
    const publicUrl = getR2PublicUrl(key);

    return jsonWithCors({
      success: true,
      url: publicUrl,
      key: key,
      filename: originalName,
      size: file.size,
      contentType: file.type,
    });

  } catch (error) {
    console.error("Error uploading picture to R2:", error);
    return jsonWithCors({ 
      error: "Failed to upload picture",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
