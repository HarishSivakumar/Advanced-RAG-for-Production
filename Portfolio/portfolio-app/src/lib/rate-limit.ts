import { NextRequest } from 'next/server';

interface RateLimitConfig {
  interval: number; // in milliseconds
  maxRequests: number;
}

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export function rateLimit(config: RateLimitConfig = { interval: 60000, maxRequests: 5 }) {
  return {
    check: (req: NextRequest): { success: boolean; remaining: number } => {
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
      const now = Date.now();
      const entry = rateLimitMap.get(ip);

      if (!entry || now - entry.lastReset > config.interval) {
        rateLimitMap.set(ip, { count: 1, lastReset: now });
        return { success: true, remaining: config.maxRequests - 1 };
      }

      if (entry.count >= config.maxRequests) {
        return { success: false, remaining: 0 };
      }

      entry.count++;
      return { success: true, remaining: config.maxRequests - entry.count };
    },
  };
}

// Clean up old entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    rateLimitMap.forEach((value, key) => {
      if (now - value.lastReset > 300000) { // 5 minutes
        rateLimitMap.delete(key);
      }
    });
  }, 60000);
}
