import { Worker, Job } from 'bullmq';
import { QUEUE_NAMES, getConnectionConfig } from '../queues/queue';
import { getAllGuests } from '@/lib/db';

interface ReminderJobData {
  guestId: number;
  ticketId: string;
  email: string;
  fullName: string;
  eventDate: string;
  daysBefore: number;
}

const reminderWorker = new Worker<ReminderJobData>(
  QUEUE_NAMES.REMINDER,
  async (job: Job<ReminderJobData>) => {
    const data = job.data;
    
    console.log(`[ReminderWorker] Processing job ${job.id} - Days before: ${data.daysBefore}`);

    try {
      const guests = getAllGuests('paid');
      const eventDate = new Date(data.eventDate);
      const now = new Date();
      const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      console.log(`[ReminderWorker] Sending ${data.daysBefore}-day reminders to ${guests.length} guests`);

      for (const guest of guests as any[]) {
        console.log(`[ReminderWorker] Would send reminder to ${guest.email}`);
      }

      return { success: true, daysBefore: data.daysBefore, guestCount: guests.length };
    } catch (error) {
      console.error(`[ReminderWorker] Error processing job ${job.id}:`, error);
      throw error;
    }
  },
  {
    connection: getConnectionConfig(),
    concurrency: 3,
  }
);

reminderWorker.on('completed', (job) => {
  console.log(`[ReminderWorker] Job ${job.id} completed successfully`);
});

reminderWorker.on('failed', (job, error) => {
  console.error(`[ReminderWorker] Job ${job?.id} failed:`, error.message);
});

reminderWorker.on('error', (error) => {
  console.error('[ReminderWorker] Worker error:', error);
});

export const startReminderWorker = async () => {
  console.log('[ReminderWorker] Starting reminder worker...');
};

export const stopReminderWorker = async () => {
  await reminderWorker.close();
  console.log('[ReminderWorker] Stopped reminder worker');
};

export default reminderWorker;
