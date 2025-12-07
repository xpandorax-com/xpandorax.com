/**
 * Security utilities for the admin panel
 * - Rate limiting
 * - Token generation
 * - Security checks
 */

// Generate a secure random token
export function generateSecureToken(length: number = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Generate password reset token (URL-safe)
export function generatePasswordResetToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// Hash a token for storage (don't store raw tokens)
export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Verify a token against its hash
export async function verifyToken(token: string, hashedToken: string): Promise<boolean> {
  const computedHash = await hashToken(token);
  return computedHash === hashedToken;
}

// Constants for security
export const SECURITY_CONFIG = {
  // Password reset token expires in 1 hour
  PASSWORD_RESET_EXPIRES_IN: 60 * 60 * 1000, // 1 hour in ms
  
  // Account lockout after failed attempts
  MAX_FAILED_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes in ms
  
  // Session settings
  SESSION_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  ADMIN_SESSION_MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours for admins
  
  // Rate limiting
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 10, // max requests per window
  
  // Password requirements
  MIN_PASSWORD_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: true,
};

// Validate password strength
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < SECURITY_CONFIG.MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${SECURITY_CONFIG.MIN_PASSWORD_LENGTH} characters`);
  }
  
  if (SECURITY_CONFIG.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (SECURITY_CONFIG.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (SECURITY_CONFIG.REQUIRE_NUMBER && !/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  if (SECURITY_CONFIG.REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)");
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Check if account is locked
export function isAccountLocked(lockedUntil: Date | number | null | undefined): boolean {
  if (!lockedUntil) return false;
  const lockTime = typeof lockedUntil === 'number' ? lockedUntil : lockedUntil.getTime();
  return Date.now() < lockTime;
}

// Calculate lockout end time
export function calculateLockoutEnd(): Date {
  return new Date(Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION);
}

// Get client IP from request
export function getClientIp(request: Request): string {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    request.headers.get("X-Real-IP") ||
    "unknown"
  );
}

// Generate CSRF token
export function generateCsrfToken(): string {
  return generateSecureToken(32);
}

// Security headers for responses
export function getSecurityHeaders(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  };
}

// Simple in-memory rate limiter (for Cloudflare Workers, consider using KV or Durable Objects for production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + SECURITY_CONFIG.RATE_LIMIT_WINDOW,
    });
    return { allowed: true };
  }
  
  if (record.count >= SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfter: Math.ceil((record.resetAt - now) / 1000),
    };
  }
  
  record.count++;
  return { allowed: true };
}

// Clean up old rate limit entries (call periodically)
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}
