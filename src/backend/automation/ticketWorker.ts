import { Worker, Job } from 'bullmq';
import { QUEUE_NAMES, redisConnection } from '../queues/queue';
import { ticketService } from '../services/ticketService';
import { getGuestById } from '@/lib/db';

interface TicketJobData {
  guestId: number;
  ticketId: string;
  email: string;
  fullName: string;
  eventName?: string;
  eventDate?: string;
  eventTime?: string;
  location?: string;
}

const ticketWorker = new Worker<TicketJobData>(
  QUEUE_NAMES.TICKET,
  async (job: Job<TicketJobData>) => {
    const data = job.data;
    
    console.log(`[TicketWorker] Processing job ${job.id} - Ticket ID: ${data.ticketId}`);

    try {
      const guest = getGuestById(data.guestId);
      
      if (!guest) {
        throw new Error(`Guest not found: ${data.guestId}`);
      }

      const ticketData = {
        ticketId: data.ticketId,
        guestName: data.fullName,
        email: data.email,
        eventName: data.eventName || 'Exclusive House Party',
        eventDate: data.eventDate || 'March 28, 2026',
        eventTime: data.eventTime || '8:00 PM',
        location: data.location || 'Abuja, Nigeria',
        qrData: `${data.ticketId}|${data.email}`,
      };

      const ticketPath = await ticketService.createTicket(ticketData);
      
      console.log(`[TicketWorker] Generated ticket for ${data.email}: ${ticketPath}`);

      return { success: true, ticketId: data.ticketId, ticketPath };
    } catch (error) {
      console.error(`[TicketWorker] Error processing job ${job.id}:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 3,
  }
);

ticketWorker.on('completed', (job) => {
  console.log(`[TicketWorker] Job ${job.id} completed successfully`);
});

ticketWorker.on('failed', (job, error) => {
  console.error(`[TicketWorker] Job ${job?.id} failed:`, error.message);
});

ticketWorker.on('error', (error) => {
  console.error('[TicketWorker] Worker error:', error);
});

export const startTicketWorker = async () => {
  console.log('[TicketWorker] Starting ticket worker...');
};

export const stopTicketWorker = async () => {
  await ticketWorker.close();
  console.log('[TicketWorker] Stopped ticket worker');
};

export default ticketWorker;
