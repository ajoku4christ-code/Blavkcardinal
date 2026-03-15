export const EVENT_TYPES = {
  USER_REGISTERED: 'USER_REGISTERED',
  PAYMENT_RECEIPT_UPLOADED: 'PAYMENT_RECEIPT_UPLOADED',
  PAYMENT_APPROVED: 'PAYMENT_APPROVED',
  PAYMENT_REJECTED: 'PAYMENT_REJECTED',
  TICKET_GENERATED: 'TICKET_GENERATED',
  PAYMENT_REMINDER: 'PAYMENT_REMINDER',
} as const;

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];

export interface EventPayload {
  eventType: EventType;
  guestId: number;
  ticketId: string;
  email: string;
  fullName: string;
  phone?: string;
  amount?: number;
  receiptPath?: string;
  metadata?: Record<string, any>;
}

export const getEventMessage = (eventType: EventType, data: EventPayload): string => {
  switch (eventType) {
    case EVENT_TYPES.USER_REGISTERED:
      return `Welcome ${data.fullName}! Your registration is complete.`;
    case EVENT_TYPES.PAYMENT_RECEIPT_UPLOADED:
      return `Payment receipt uploaded. Pending verification.`;
    case EVENT_TYPES.PAYMENT_APPROVED:
      return `Payment approved! Your ticket is ready.`;
    case EVENT_TYPES.PAYMENT_REJECTED:
      return `Payment was not approved. Please contact support.`;
    case EVENT_TYPES.TICKET_GENERATED:
      return `Your QR ticket is ready!`;
    case EVENT_TYPES.PAYMENT_REMINDER:
      return `Reminder: Complete your payment to secure your ticket.`;
    default:
      return 'Update regarding your House Party registration.';
  }
};

export const getAdminAlertTitle = (eventType: EventType, data: EventPayload): string => {
  switch (eventType) {
    case EVENT_TYPES.USER_REGISTERED:
      return 'New User Registration';
    case EVENT_TYPES.PAYMENT_RECEIPT_UPLOADED:
      return 'New Payment Received';
    case EVENT_TYPES.PAYMENT_APPROVED:
      return 'Payment Approved';
    case EVENT_TYPES.PAYMENT_REJECTED:
      return 'Payment Rejected';
    case EVENT_TYPES.TICKET_GENERATED:
      return 'Ticket Generated';
    default:
      return 'Admin Alert';
  }
};
