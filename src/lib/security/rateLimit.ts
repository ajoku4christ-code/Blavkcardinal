import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

const cleanExpiredEntries = () => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
};

setInterval(cleanExpiredEntries, 60000);

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
  message: 'Too many requests, please try again later.',
};

export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = defaultConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip') 
    || '127.0.0.1';
  
  const path = request.nextUrl.pathname;
  const key = `${ip}:${path}`;
  
  const now = Date.now();
  const windowStart = now - config.windowMs;
  
  if (!store[key] || store[key].resetTime < windowStart) {
    store[key] = {
      count: 0,
      resetTime: now + config.windowMs,
    };
  }
  
  store[key].count++;
  
  const remaining = Math.max(0, config.maxRequests - store[key].count);
  const allowed = store[key].count <= config.maxRequests;
  
  return {
    allowed,
    remaining,
    resetTime: store[key].resetTime,
  };
}

export function withRateLimit(
  config: RateLimitConfig = defaultConfig
) {
  return (request: NextRequest): NextResponse | null => {
    const result = rateLimit(request, config);
    
    if (!result.allowed) {
      const response = NextResponse.json(
        { 
          error: config.message || 'Too many requests',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        },
        { status: 429 }
      );
      response.headers.set('Retry-After', String(Math.ceil((result.resetTime - Date.now()) / 1000)));
      response.headers.set('X-RateLimit-Limit', String(config.maxRequests));
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', String(result.resetTime));
      return response;
    }
    
    return null;
  };
}

export const authRateLimit: RateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many login attempts. Please try again in 15 minutes.',
};

export const apiRateLimit: RateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
  message: 'API rate limit exceeded.',
};

export const uploadRateLimit: RateLimitConfig = {
  windowMs: 60 * 60 * 1000,
  maxRequests: 10,
  message: 'Too many file uploads. Please try again later.',
};
