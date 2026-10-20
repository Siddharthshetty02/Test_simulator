/**
 * In-memory sliding window rate limiter.
 * Limits each client IP to 20 requests per 60-second window.
 * 
 * TODO for production: Swap this in-memory Map with an Upstash Redis rate limiter
 * using `@upstash/ratelimit` and `@upstash/redis` so state persists across serverless instances.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 20;

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

export function checkRateLimit(req: Request): {
  allowed: boolean;
  remaining: number;
  reset: number;
} {
  const ip = getClientIp(req);
  const now = Date.now();

  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      reset: Math.ceil((now + WINDOW_MS) / 1000),
    };
  }

  if (record.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      reset: Math.ceil(record.resetTime / 1000),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: MAX_REQUESTS - record.count,
    reset: Math.ceil(record.resetTime / 1000),
  };
}
