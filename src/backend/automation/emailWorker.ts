import { Worker, Job } from 'bullmq';
import { QUEUE_NAMES, getConnectionConfig } from '../queues/queue';
import { emailService } from '../services/emailService';

interface EmailJobData {
  guestId: number;
  ticketId: string;
  email: string;
  fullName: string;
  template: string;
  subject: string;
  amount?: number;
  eventDate?: string;
  eventTime?: string;
  location?: string;
  reason?: string;
  daysUntil?: number;
  alertType?: string;
}

const emailWorker = new Worker<EmailJobData>(
  QUEUE_NAMES.EMAIL,
  async (job: Job<EmailJobData>) => {
    const data = job.data;
    const template = data.template;
    
    console.log(`[EmailWorker] Processing job ${job.id} - Template: ${template}`);

    try {
      let result = false;

      switch (template) {
        case 'verification':
          result = await emailService.sendVerificationEmail(
            data.email,
            data.fullName,
            data.ticketId
          );
          break;

        case 'payment_confirmation':
          result = await emailService.sendPaymentConfirmationEmail(
            data.email,
            data.fullName,
            data.ticketId,
            data.amount || 10000
          );
          break;

        case 'receipt_acknowledgement':
          result = await emailService.sendReceiptAcknowledgementEmail(
            data.email,
            data.fullName,
            data.ticketId
          );
          break;

        case 'ticket':
          result = await emailService.sendTicketEmail(
            data.email,
            data.fullName,
            data.ticketId,
            data.eventDate || 'March 28, 2026',
            data.eventTime || '8:00 PM',
            data.location || 'Abuja, Nigeria'
          );
          break;

        case 'reminder':
          result = await emailService.sendReminderEmail(
            data.email,
            data.fullName,
            data.ticketId,
            data.eventDate || 'March 28, 2026',
            data.eventTime || '8:00 PM',
            data.location || 'Abuja, Nigeria',
            data.daysUntil || 1
          );
          break;

        case 'rejected':
          result = await emailService.sendPaymentRejectedEmail(
            data.email,
            data.fullName,
            data.ticketId,
            data.reason || 'Payment could not be verified'
          );
          break;

        case 'admin_alert':
          const adminEmails = (process.env.ADMIN_EMAILS || 'admin@party.com').split(',');
          for (const adminEmail of adminEmails) {
            await emailService.sendAdminAlertEmail(
              adminEmail,
              data.alertType || 'Payment Alert',
              data.fullName,
              data.ticketId,
              data.amount || 10000
            );
          }
          result = true;
          break;

        default:
          console.warn(`[EmailWorker] Unknown template: ${template}`);
          result = false;
      }

      if (result) {
        console.log(`[EmailWorker] Successfully sent ${template} email to ${data.email}`);
      } else {
        console.error(`[EmailWorker] Failed to send ${template} email to ${data.email}`);
      }

      return { success: result, email: data.email, template };
    } catch (error) {
      console.error(`[EmailWorker] Error processing job ${job.id}:`, error);
      throw error;
    }
  },
  {
    connection: getConnectionConfig(),
    concurrency: 5,
  }
);

emailWorker.on('completed', (job) => {
  console.log(`[EmailWorker] Job ${job.id} completed successfully`);
});

emailWorker.on('failed', (job, error) => {
  console.error(`[EmailWorker] Job ${job?.id} failed:`, error.message);
});

emailWorker.on('error', (error) => {
  console.error('[EmailWorker] Worker error:', error);
});

export const startEmailWorker = async () => {
  console.log('[EmailWorker] Starting email worker...');
};

export const stopEmailWorker = async () => {
  await emailWorker.close();
  console.log('[EmailWorker] Stopped email worker');
};

export default emailWorker;
