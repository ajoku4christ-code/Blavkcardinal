import { z } from 'zod';

export const securityConfig = {
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // max requests per window
    adminMaxRequests: 30,
    authMaxRequests: 5,
  },

  // Session security
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
  },

  // JWT settings
  jwt: {
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
    issuer: 'exclusive-house-party',
    audience: 'blavkcardinal-app',
  },

  // Password policy
  password: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxLength: 128,
    bcryptRounds: 12,
  },

  // API security
  api: {
    timeout: 30000,
    maxBodySize: '10mb',
    allowedContentTypes: [
      'application/json',
      'application/x-www-form-urlencoded',
      'multipart/form-data',
    ],
  },

  // File upload security
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
    ],
    uploadDir: 'public/receipts',
  },

  // CORS
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    credentials: true,
    maxAge: 86400,
  },

  // Security headers
  headers: {
    hstsMaxAge: 31536000, // 1 year
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    xssProtection: '1; mode=block',
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: {
      geolocation: '()',
      microphone: '()',
      camera: '()',
    },
  },

  // Logging
  logging: {
    logLevel: process.env.LOG_LEVEL || 'info',
    logSensitiveData: false,
    maskFields: ['password', 'token', 'secret', 'key', 'authorization'],
  },

  // IP validation
  trustedProxies: process.env.TRUSTED_PROXIES?.split(',') || ['127.0.0.1'],
};

export const validationSchemas = {
  // Registration validation
  registration: z.object({
    fullName: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be less than 100 characters')
      .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
    email: z.string()
      .email('Invalid email address')
      .max(255, 'Email must be less than 255 characters')
      .transform(val => val.toLowerCase().trim()),
    phone: z.string()
      .regex(/^\+?[1-9]\d{6,14}$/, 'Invalid phone number format')
      .min(10, 'Phone number too short')
      .max(15, 'Phone number too long'),
    paymentMethod: z.enum(['bank_transfer']).default('bank_transfer'),
  }),

  // Admin login validation
  adminLogin: z.object({
    username: z.string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must be less than 50 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Username contains invalid characters'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters'),
  }),

  // Guest query validation
  guestQuery: z.object({
    ticketId: z.string()
      .regex(/^[A-Z0-9-]+$/, 'Invalid ticket ID format')
      .max(50, 'Ticket ID too long'),
    status: z.enum(['all', 'paid', 'pending', 'rejected']).optional(),
  }),

  // Admin action validation
  adminAction: z.object({
    action: z.enum(['login', 'approve', 'reject', 'send_reminder']),
    username: z.string().optional(),
    password: z.string().optional(),
    guestId: z.number().int().positive().optional(),
    status: z.string().optional(),
  }),

  // ID parameter validation
  idParam: z.object({
    id: z.coerce.number().int().positive('Invalid ID'),
  }),
};

export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

export const maskSensitiveData = (data: Record<string, unknown>): Record<string, unknown> => {
  const masked = { ...data };
  const sensitiveFields = securityConfig.logging.maskFields;
  
  for (const field of sensitiveFields) {
    if (field in masked && typeof masked[field] === 'string') {
      const value = masked[field] as string;
      if (value.length > 4) {
        masked[field] = value.slice(0, 2) + '*'.repeat(value.length - 4) + value.slice(-2);
      } else {
        masked[field] = '****';
      }
    }
  }
  
  return masked;
};
