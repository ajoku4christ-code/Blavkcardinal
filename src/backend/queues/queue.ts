import { Queue, QueueEvents } from 'bullmq';

export const getConnectionConfig = () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  retryStrategy: (times: number) => {
    if (times > 3) {
      console.error('Redis connection failed after 3 retries');
      return null;
    }
    return Math.min(times * 100, 3000);
  },
  lazyConnect: true,
});

export const redisConnection = getConnectionConfig();

export const QUEUE_NAMES = {
  PAYMENT: 'payment-queue',
  EMAIL: 'email-queue',
  TICKET: 'ticket-queue',
  NOTIFICATION: 'notification-queue',
  REMINDER: 'reminder-queue',
  EVENTS: 'events-queue',
} as const;

export const JOB_NAMES = {
  USER_REGISTERED: 'USER_REGISTERED',
  PAYMENT_RECEIPT_UPLOADED: 'PAYMENT_RECEIPT_UPLOADED',
  PAYMENT_APPROVED: 'PAYMENT_APPROVED',
  PAYMENT_REJECTED: 'PAYMENT_REJECTED',
  TICKET_GENERATED: 'TICKET_GENERATED',
} as const;

export const createQueue = (name: string) => {
  return new Queue(name, {
    connection: getConnectionConfig(),
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: {
        count: 100,
        age: 24 * 3600,
      },
      removeOnFail: {
        count: 500,
        age: 7 * 24 * 3600,
      },
    },
  });
};

export const createQueueEvents = (name: string) => {
  return new QueueEvents(name, { connection: getConnectionConfig() });
};

export const paymentQueue = createQueue(QUEUE_NAMES.PAYMENT);
export const emailQueue = createQueue(QUEUE_NAMES.EMAIL);
export const ticketQueue = createQueue(QUEUE_NAMES.TICKET);
export const notificationQueue = createQueue(QUEUE_NAMES.NOTIFICATION);
export const reminderQueue = createQueue(QUEUE_NAMES.REMINDER);
export const eventQueue = createQueue(QUEUE_NAMES.EVENTS);

export const paymentQueueEvents = createQueueEvents(QUEUE_NAMES.PAYMENT);
export const emailQueueEvents = createQueueEvents(QUEUE_NAMES.EMAIL);
export const ticketQueueEvents = createQueueEvents(QUEUE_NAMES.TICKET);
export const notificationQueueEvents = createQueueEvents(QUEUE_NAMES.NOTIFICATION);
export const reminderQueueEvents = createQueueEvents(QUEUE_NAMES.REMINDER);
export const eventQueueEvents = createQueueEvents(QUEUE_NAMES.EVENTS);

export type JobData = {
  guestId: number;
  ticketId: string;
  email: string;
  fullName: string;
  phone: string;
  amount?: number;
  paymentMethod?: string;
  receiptPath?: string;
  status?: string;
  eventId?: number;
  template?: string;
  subject?: string;
  eventDate?: string;
  eventTime?: string;
  location?: string;
  reason?: string;
  daysUntil?: number;
  alertType?: string;
  action?: string;
};

export const addPaymentJob = async (jobName: string, data: JobData) => {
  return paymentQueue.add(jobName, data, {
    priority: data.receiptPath ? 1 : 2,
  });
};

export const addEmailJob = async (jobName: string, data: JobData & { template: string; subject: string }) => {
  return emailQueue.add(jobName, data, {
    priority: 1,
  });
};

export const addTicketJob = async (jobName: string, data: JobData) => {
  return ticketQueue.add(jobName, data, {
    priority: 1,
  });
};

export const addNotificationJob = async (jobName: string, data: JobData & { type: string; message: string }) => {
  return notificationQueue.add(jobName, data);
};

export const addReminderJob = async (jobName: string, data: JobData & { eventDate: string; daysBefore: number }) => {
  return reminderQueue.add(jobName, data, {
    delay: calculateReminderDelay(data.eventDate, data.daysBefore),
  });
};

export const addEventJob = async (eventType: string, data: {
  guestId: number;
  ticketId: string;
  email: string;
  fullName: string;
  phone?: string;
  amount?: number;
  receiptPath?: string;
  metadata?: Record<string, any>;
}) => {
  return eventQueue.add(eventType, {
    eventType,
    ...data,
  });
};

function calculateReminderDelay(eventDate: string, daysBefore: number): number {
  const event = new Date(eventDate);
  const reminder = new Date(event);
  reminder.setDate(reminder.getDate() - daysBefore);
  const now = new Date();
  return Math.max(0, reminder.getTime() - now.getTime());
}

export const closeAllQueues = async () => {
  await Promise.all([
    paymentQueue.close(),
    emailQueue.close(),
    ticketQueue.close(),
    notificationQueue.close(),
    reminderQueue.close(),
  ]);
};

export const queueExports = {
  redisConnection,
  paymentQueue,
  emailQueue,
  ticketQueue,
  notificationQueue,
  reminderQueue,
  eventQueue,
  QUEUE_NAMES,
  JOB_NAMES,
  addPaymentJob,
  addEmailJob,
  addTicketJob,
  addNotificationJob,
  addReminderJob,
  addEventJob,
  closeAllQueues,
};

export default queueExports;
