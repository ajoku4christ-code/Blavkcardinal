import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError, ZodIssue } from 'zod';
import { securityConfig, sanitizeInput, validationSchemas } from './config';
import { auditLogger, AuditEventType, AuditOutcome } from './auditLog';
import { rateLimit, RateLimitConfig } from './rateLimit';

export interface ValidationSchema {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}

export function validateRequest(schema: ValidationSchema) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    try {
      if (schema.body) {
        const contentType = request.headers.get('content-type') || '';
        
        if (!securityConfig.api.allowedContentTypes.some(type => contentType.includes(type))) {
          auditLogger.logSecurityEvent(
            AuditEventType.SECURITY_VIOLATION,
            request,
            { reason: 'Invalid content type', contentType }
          );
          return NextResponse.json(
            { error: 'Invalid content type' },
            { status: 415 }
          );
        }
        
        const body = await request.json();
        const sanitizedBody = sanitizeObject(body);
        schema.body.parse(sanitizedBody);
      }
      
      if (schema.query) {
        const url = new URL(request.url);
        const queryParams = Object.fromEntries(url.searchParams);
        schema.query.parse(queryParams);
      }
      
      if (schema.params) {
        const params = request.nextUrl.pathname.split('/').reduce((acc, part, index) => {
          if (part.startsWith('[') && part.endsWith(']')) {
            const key = part.slice(1, -1);
            const urlParts = request.nextUrl.pathname.split('/');
            acc[key] = urlParts[index];
          }
          return acc;
        }, {} as Record<string, string>);
        
        if (Object.keys(params).length > 0) {
          schema.params.parse(params);
        }
      }
      
      return null;
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = formatZodIssues(error.issues);
        
        auditLogger.logSecurityEvent(
          AuditEventType.SECURITY_VIOLATION,
          request,
          { reason: 'Validation failed', issues }
        );
        
        return NextResponse.json(
          { error: 'Validation failed', details: issues },
          { status: 400 }
        );
      }
      
      console.error('Validation error:', error);
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }
  };
}

function sanitizeObject(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

function formatZodIssues(issues: ZodIssue[]): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  for (const issue of issues) {
    const path = issue.path.join('.');
    formatted[path] = issue.message;
  }
  
  return formatted;
}

export function withValidation(schema: ValidationSchema, config?: RateLimitConfig) {
  const validate = validateRequest(schema);
  const rateLimitMiddleware = config ? withRateLimit(config) : null;
  
  return async (request: NextRequest): Promise<NextResponse | null> => {
    if (rateLimitMiddleware) {
      const rateLimitResponse = rateLimitMiddleware(request);
      if (rateLimitResponse) {
        return rateLimitResponse;
      }
    }
    
    return validate(request);
  };
}

function withRateLimit(config: RateLimitConfig) {
  return (request: NextRequest): NextResponse | null => {
    const result = rateLimit(request, config);
    
    if (!result.allowed) {
      auditLogger.logSecurityEvent(
        AuditEventType.RATE_LIMIT_EXCEEDED,
        request,
        { limit: config.maxRequests, window: config.windowMs }
      );
      
      const response = NextResponse.json(
        { 
          error: 'Too many requests',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        },
        { status: 429 }
      );
      response.headers.set('Retry-After', String(Math.ceil((result.resetTime - Date.now()) / 1000)));
      return response;
    }
    
    return null;
  };
}

export const validateRegistration = validateRequest({
  body: validationSchemas.registration,
});

export const validateAdminLogin = validateRequest({
  body: validationSchemas.adminLogin,
});

export const validateGuestQuery = validateRequest({
  query: validationSchemas.guestQuery,
});

export const validateAdminAction = validateRequest({
  body: validationSchemas.adminAction,
});

export const validateIdParam = validateRequest({
  params: validationSchemas.idParam,
});
