import { Worker, Job } from 'bullmq';
import { QUEUE_NAMES, redisConnection, JOB_NAMES } from '../queues/queue';
import { emailService } from '../services/emailService';
import { EVENT_TYPES, EventType } from '../services/eventTypes';

interface EventJobData {
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

const eventWorker = new Worker<EventJobData>(
  QUEUE_NAMES.EVENTS,
  async (job: Job<EventJobData>) => {
    const data = job.data;
    const eventType = data.eventType;
    
    console.log(`[EventWorker] Processing job ${job.id} - Event: ${eventType}`);

    try {
      let result = false;

      switch (eventType) {
        case EVENT_TYPES.USER_REGISTERED:
          result = await emailService.sendVerificationEmail(
            data.email,
            data.fullName,
            data.ticketId
          );
          break;

        case EVENT_TYPES.PAYMENT_RECEIPT_UPLOADED:
          result = await emailService.sendReceiptAcknowledgementEmail(
            data.email,
            data.fullName,
            data.ticketId
          );
          
          const adminEmails = (process.env.ADMIN_EMAILS || 'admin@party.com').split(',');
          for (const adminEmail of adminEmails) {
            await emailService.sendAdminAlertEmail(
              adminEmail,
              'New Payment Received',
              data.fullName,
              data.ticketId,
              data.amount || 10000
            );
          }
          break;

        case EVENT_TYPES.PAYMENT_APPROVED:
          result = await emailService.sendTicketEmail(
            data.email,
            data.fullName,
            data.ticketId,
            'March 28, 2026',
            '8:00 PM',
            'Abuja, Nigeria'
          );
          break;

        case EVENT_TYPES.PAYMENT_REJECTED:
          result = await emailService.sendPaymentRejectedEmail(
            data.email,
            data.fullName,
            data.ticketId,
            data.metadata?.reason || 'Payment could not be verified'
          );
          break;

        case EVENT_TYPES.TICKET_GENERATED:
          console.log(`[EventWorker] Ticket generated for ${data.email}`);
          result = true;
          break;

        default:
          console.warn(`[EventWorker] Unknown event type: ${eventType}`);
          result = false;
      }

      if (result) {
        console.log(`[EventWorker] Successfully processed ${eventType} for ${data.email}`);
      } else {
        console.error(`[EventWorker] Failed to process ${eventType} for ${data.email}`);
      }

      return { success: result, eventType, email: data.email };
    } catch (error) {
      console.error(`[EventWorker] Error processing job ${job.id}:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

eventWorker.on('completed', (job) => {
  console.log(`[EventWorker] Job ${job.id} completed successfully`);
});

eventWorker.on('failed', (job, error) => {
  console.error(`[EventWorker] Job ${job?.id} failed:`, error.message);
});

eventWorker.on('error', (error) => {
  console.error('[EventWorker] Worker error:', error);
});

export const startEventWorker = async () => {
  console.log('[EventWorker] Starting event worker...');
};

export const stopEventWorker = async () => {
  await eventWorker.close();
  console.log('[EventWorker] Stopped event worker');
};

export default eventWorker;
