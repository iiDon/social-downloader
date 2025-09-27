import { headers } from 'next/headers';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (resets on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export async function getRealIP(): Promise<string> {
  const headersList = await headers();

  // Cloudflare real IP headers (in order of preference)
  const cfConnectingIP = headersList.get('cf-connecting-ip');
  if (cfConnectingIP) return cfConnectingIP;

  // Standard forwarded headers
  const xRealIP = headersList.get('x-real-ip');
  if (xRealIP) return xRealIP;

  const xForwardedFor = headersList.get('x-forwarded-for');
  if (xForwardedFor) {
    // Take the first IP from the comma-separated list
    return xForwardedFor.split(',')[0].trim();
  }

  // Fallback to remote address
  const remoteAddr = headersList.get('x-remote-addr');
  if (remoteAddr) return remoteAddr;

  // Default fallback
  return 'unknown';
}

interface RateLimitConfig {
  maxRequests: number;  // Maximum number of requests
  windowMs: number;     // Time window in milliseconds
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60 * 1000 } // Default: 10 requests per minute
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // If no entry exists or window has expired, create new entry
  if (!entry || entry.resetTime < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs
    };
    rateLimitStore.set(identifier, newEntry);

    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter
    };
  }

  // Increment counter
  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime
  };
}

export function getRateLimitKey(ip: string, action: string = 'download'): string {
  return `${action}:${ip}`;
}