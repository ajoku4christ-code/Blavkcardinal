import { Worker, Job } from 'bullmq';
import { QUEUE_NAMES, redisConnection } from '../queues/queue';
import { notificationService, NotificationPayload } from '../services/notificationService';

interface NotificationJobData {
  guestId: number;
  ticketId: string;
  email: string;
  fullName: string;
  phone?: string;
  amount?: number;
  type: string;
  message: string;
  metadata?: Record<string, any>;
}

const notificationWorker = new Worker<NotificationJobData>(
  QUEUE_NAMES.NOTIFICATION,
  async (job: Job<NotificationJobData>) => {
    const data = job.data;
    
    console.log(`[NotificationWorker] Processing job ${job.id} - Type: ${data.type}`);

    try {
      const payload: NotificationPayload = {
        type: data.type as NotificationPayload['type'],
        guestId: data.guestId,
        ticketId: data.ticketId,
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        amount: data.amount,
        message: data.message,
        metadata: data.metadata,
      };

      await notificationService.broadcastNotification(payload);

      return { success: true, type: data.type, guestId: data.guestId };
    } catch (error) {
      console.error(`[NotificationWorker] Error processing job ${job.id}:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 10,
  }
);

notificationWorker.on('completed', (job) => {
  console.log(`[NotificationWorker] Job ${job.id} completed successfully`);
});

notificationWorker.on('failed', (job, error) => {
  console.error(`[NotificationWorker] Job ${job?.id} failed:`, error.message);
});

notificationWorker.on('error', (error) => {
  console.error('[NotificationWorker] Worker error:', error);
});

export const startNotificationWorker = async () => {
  console.log('[NotificationWorker] Starting notification worker...');
};

export const stopNotificationWorker = async () => {
  await notificationWorker.close();
  console.log('[NotificationWorker] Stopped notification worker');
};

export default notificationWorker;
