export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export enum AuditEventType {
  USER_REGISTRATION = 'USER_REGISTRATION',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PAYMENT_INITIATED = 'PAYMENT_INITIATED',
  PAYMENT_APPROVED = 'PAYMENT_APPROVED',
  PAYMENT_REJECTED = 'PAYMENT_REJECTED',
  RECEIPT_UPLOADED = 'RECEIPT_UPLOADED',
  TICKET_GENERATED = 'TICKET_GENERATED',
  ADMIN_ACTION = 'ADMIN_ACTION',
  API_ACCESS = 'API_ACCESS',
  SECURITY_VIOLATION = 'SECURITY_VIOLATION',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

export enum AuditOutcome {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  BLOCKED = 'BLOCKED',
}

export interface AuditLogEntry {
  id?: number;
  timestamp: string;
  eventType: AuditEventType;
  actorId?: string;
  actorIp: string;
  actorUserAgent?: string;
  resource?: string;
  action: string;
  outcome: AuditOutcome;
  details?: Record<string, unknown>;
  errorMessage?: string;
}

class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private maxLogs = 10000;
  private logLevel: LogLevel = LogLevel.INFO;

  constructor() {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    if (envLevel === 'DEBUG') this.logLevel = LogLevel.DEBUG;
    else if (envLevel === 'WARN') this.logLevel = LogLevel.WARN;
    else if (envLevel === 'ERROR') this.logLevel = LogLevel.ERROR;
    else if (envLevel === 'FATAL') this.logLevel = LogLevel.FATAL;
  }

  private formatEntry(entry: AuditLogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = entry.outcome === AuditOutcome.FAILURE || entry.outcome === AuditOutcome.BLOCKED 
      ? 'WARN' 
      : 'INFO';
    
    return JSON.stringify({
      timestamp,
      level,
      type: entry.eventType,
      actor: entry.actorId || entry.actorIp,
      action: entry.action,
      outcome: entry.outcome,
      resource: entry.resource,
      details: entry.details,
      error: entry.errorMessage,
    });
  }

  log(entry: AuditLogEntry): void {
    const formatted = this.formatEntry(entry);
    
    if (entry.outcome === AuditOutcome.FAILURE || entry.eventType === AuditEventType.SECURITY_VIOLATION) {
      console.error(`[AUDIT] ${formatted}`);
    } else {
      console.log(`[AUDIT] ${formatted}`);
    }
    
    this.logs.push(entry);
    
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  logApiAccess(
    request: NextRequest,
    responseStatus: number,
    duration: number
  ): void {
    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      eventType: AuditEventType.API_ACCESS,
      actorIp: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
        || request.headers.get('x-real-ip') 
        || 'unknown',
      actorUserAgent: request.headers.get('user-agent') || 'unknown',
      action: `${request.method} ${request.nextUrl.pathname}`,
      outcome: responseStatus < 400 ? AuditOutcome.SUCCESS : AuditOutcome.FAILURE,
      details: {
        method: request.method,
        path: request.nextUrl.pathname,
        statusCode: responseStatus,
        duration: `${duration}ms`,
      },
    };
    
    this.log(entry);
  }

  logSecurityEvent(
    eventType: AuditEventType,
    request: NextRequest,
    details: Record<string, unknown>,
    outcome: AuditOutcome = AuditOutcome.BLOCKED
  ): void {
    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      eventType,
      actorIp: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
        || request.headers.get('x-real-ip') 
        || 'unknown',
      actorUserAgent: request.headers.get('user-agent') || 'unknown',
      action: `${request.method} ${request.nextUrl.pathname}`,
      outcome,
      details,
    };
    
    this.log(entry);
  }

  logAction(
    eventType: AuditEventType,
    actorId: string,
    action: string,
    resource: string,
    outcome: AuditOutcome,
    details?: Record<string, unknown>,
    errorMessage?: string
  ): void {
    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      eventType,
      actorId,
      actorIp: 'server',
      action,
      resource,
      outcome,
      details,
      errorMessage,
    };
    
    this.log(entry);
  }

  getRecentLogs(count: number = 100): AuditLogEntry[] {
    return this.logs.slice(-count);
  }

  getLogsByType(eventType: AuditEventType): AuditLogEntry[] {
    return this.logs.filter(log => log.eventType === eventType);
  }

  getFailedLogs(): AuditLogEntry[] {
    return this.logs.filter(log => log.outcome === AuditOutcome.FAILURE);
  }

  clear(): void {
    this.logs = [];
  }
}

export const auditLogger = new AuditLogger();

import { NextRequest } from 'next/server';

export const createAuditMiddleware = () => {
  return async (request: NextRequest): Promise<void> => {
    const startTime = Date.now();
    
    const originalResponse = await fetch(request);
    const duration = Date.now() - startTime;
    
    auditLogger.logApiAccess(request, originalResponse.status, duration);
  };
};
