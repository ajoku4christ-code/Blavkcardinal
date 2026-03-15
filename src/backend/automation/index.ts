import eventWorker from './eventWorker';
import emailWorker from './emailWorker';
import ticketWorker from './ticketWorker';
import notificationWorker from './notificationWorker';
import paymentWorker from './paymentWorker';

export const startAllWorkers = async () => {
  console.log('[Automation] Starting all workers...');
  
  await Promise.all([
    eventWorker.waitUntilReady(),
    emailWorker.waitUntilReady(),
    ticketWorker.waitUntilReady(),
    notificationWorker.waitUntilReady(),
    paymentWorker.waitUntilReady(),
  ]);
  
  console.log('[Automation] All workers started successfully');
};

export const stopAllWorkers = async () => {
  console.log('[Automation] Stopping all workers...');
  
  await Promise.all([
    eventWorker.close(),
    emailWorker.close(),
    ticketWorker.close(),
    notificationWorker.close(),
    paymentWorker.close(),
  ]);
  
  console.log('[Automation] All workers stopped');
};

export {
  eventWorker,
  emailWorker,
  ticketWorker,
  notificationWorker,
  paymentWorker,
};
