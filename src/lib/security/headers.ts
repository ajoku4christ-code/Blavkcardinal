import { NextRequest, NextResponse } from 'next/server';
import { securityConfig } from './config';

export function securityHeadersMiddleware(request: NextRequest, response: NextResponse): NextResponse {
  const headers = response.headers;
  
  // HSTS - Force HTTPS
  if (process.env.NODE_ENV === 'production') {
    headers.set(
      'Strict-Transport-Security',
      `max-age=${securityConfig.headers.hstsMaxAge}; includeSubDomains; preload`
    );
  }
  
  // Prevent clickjacking
  headers.set('X-Frame-Options', securityConfig.headers.xFrameOptions);
  
  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', securityConfig.headers.xContentTypeOptions);
  
  // XSS Protection
  headers.set('X-XSS-Protection', securityConfig.headers.xssProtection);
  
  // Referrer Policy
  headers.set('Referrer-Policy', securityConfig.headers.referrerPolicy);
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join('; ');
  
  headers.set('Content-Security-Policy', csp);
  
  // Permissions Policy
  const permissions = Object.entries(securityConfig.headers.permissionsPolicy)
    .map(([key, value]) => `${key}=${value}`)
    .join(', ');
  headers.set('Permissions-Policy', permissions);
  
  // Remove sensitive headers
  headers.set('X-Powered-By', '');
  headers.set('Server', '');
  
  return response;
}

export function addSecurityHeaders(response: NextResponse): NextResponse {
  return securityHeadersMiddleware(new NextRequest('http://localhost'), response);
}
