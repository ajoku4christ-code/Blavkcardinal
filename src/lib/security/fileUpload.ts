import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { securityConfig } from './config';
import { auditLogger, AuditEventType, AuditOutcome } from './auditLog';
import { sanitizeInput } from './config';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  filename?: string;
  path?: string;
  size?: number;
}

export function validateFileUpload(
  file: File,
  request: NextRequest
): FileValidationResult {
  const filename = sanitizeInput(file.name);
  
  if (!filename || filename.length === 0) {
    return { valid: false, error: 'Invalid filename' };
  }
  
  const ext = '.' + filename.split('.').pop()?.toLowerCase();
  if (!securityConfig.upload.allowedExtensions.includes(ext)) {
    return { 
      valid: false, 
      error: `File type not allowed. Allowed types: ${securityConfig.upload.allowedExtensions.join(', ')}` 
    };
  }
  
  if (!securityConfig.upload.allowedMimeTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file content type' 
    };
  }
  
  const sizeInMB = file.size / (1024 * 1024);
  if (sizeInMB > securityConfig.upload.maxFileSize / (1024 * 1024)) {
    return { 
      valid: false, 
      error: `File too large. Maximum size: ${securityConfig.upload.maxFileSize / (1024 * 1024)}MB` 
    };
  }
  
  return { valid: true, filename, size: file.size };
}

export async function secureFileUpload(
  file: File,
  subDir: string,
  request: NextRequest
): Promise<FileValidationResult> {
  const validation = validateFileUpload(file, request);
  
  if (!validation.valid) {
    auditLogger.logSecurityEvent(
      AuditEventType.SECURITY_VIOLATION,
      request,
      { reason: validation.error, filename: file.name }
    );
    return validation;
  }
  
  try {
    const uploadDir = join(process.cwd(), 'public', subDir);
    
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const safeFilename = validation.filename!.replace(/[^a-zA-Z0-9.-]/g, '_');
    const finalFilename = `${uniqueSuffix}-${safeFilename}`;
    const filePath = join(uploadDir, finalFilename);
    
    writeFileSync(filePath, buffer);
    
    const fileUrl = `/${subDir}/${finalFilename}`;
    
    auditLogger.logAction(
      AuditEventType.RECEIPT_UPLOADED,
      'user',
      'file_upload',
      fileUrl,
      AuditOutcome.SUCCESS,
      { filename: finalFilename, size: validation.size }
    );
    
    return {
      valid: true,
      filename: finalFilename,
      path: fileUrl,
      size: validation.size,
    };
  } catch (error) {
    console.error('File upload error:', error);
    
    auditLogger.logAction(
      AuditEventType.RECEIPT_UPLOADED,
      'user',
      'file_upload',
      subDir,
      AuditOutcome.FAILURE,
      {},
      error instanceof Error ? error.message : 'Unknown error'
    );
    
    return { 
      valid: false, 
      error: 'Failed to upload file. Please try again.' 
    };
  }
}

export const validateAndUploadReceipt = (
  file: File,
  ticketId: string,
  request: NextRequest
): Promise<FileValidationResult> => {
  return secureFileUpload(file, 'receipts', request);
};

export const validateAndUploadTicket = (
  file: File,
  ticketId: string,
  request: NextRequest
): Promise<FileValidationResult> => {
  return secureFileUpload(file, 'tickets', request);
};
