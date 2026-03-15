import { Worker, Job } from 'bullmq';
import { QUEUE_NAMES, getConnectionConfig } from '../queues/queue';
import { getGuestById, updatePaymentStatus } from '@/lib/db';

interface PaymentJobData {
  guestId: number;
  ticketId: string;
  email: string;
  fullName: string;
  phone?: string;
  amount?: number;
  paymentMethod?: string;
  receiptPath?: string;
  action?: string;
}

const paymentWorker = new Worker<PaymentJobData>(
  QUEUE_NAMES.PAYMENT,
  async (job: Job<PaymentJobData>) => {
    const data = job.data;
    
    console.log(`[PaymentWorker] Processing job ${job.id} - Action: ${data.action || 'process'}`);

    try {
      switch (data.action) {
        case 'approve':
          updatePaymentStatus(data.guestId, 'paid');
          console.log(`[PaymentWorker] Approved payment for guest ${data.guestId}`);
          break;
          
        case 'reject':
          updatePaymentStatus(data.guestId, 'rejected');
          console.log(`[PaymentWorker] Rejected payment for guest ${data.guestId}`);
          break;
          
        case 'process':
        default:
          const guest = getGuestById(data.guestId);
          if (guest && data.receiptPath) {
            console.log(`[PaymentWorker] Receipt uploaded for guest ${data.guestId}: ${data.receiptPath}`);
          }
          break;
      }

      return { success: true, guestId: data.guestId, action: data.action };
    } catch (error) {
      console.error(`[PaymentWorker] Error processing job ${job.id}:`, error);
      throw error;
    }
  },
  {
    connection: getConnectionConfig(),
    concurrency: 5,
  }
);

paymentWorker.on('completed', (job) => {
  console.log(`[PaymentWorker] Job ${job.id} completed successfully`);
});

paymentWorker.on('failed', (job, error) => {
  console.error(`[PaymentWorker] Job ${job?.id} failed:`, error.message);
});

paymentWorker.on('error', (error) => {
  console.error('[PaymentWorker] Worker error:', error);
});

export const startPaymentWorker = async () => {
  console.log('[PaymentWorker] Starting payment worker...');
};

export const stopPaymentWorker = async () => {
  await paymentWorker.close();
  console.log('[PaymentWorker] Stopped payment worker');
};

export default paymentWorker;
