import emailWorker from './emailWorker';
import ticketWorker from './ticketWorker';
import notificationWorker from './notificationWorker';
import paymentWorker from './paymentWorker';

export const startAllWorkers = async () => {
  console.log('[Automation] Starting all workers...');
  
  await Promise.all([
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
    emailWorker.close(),
    ticketWorker.close(),
    notificationWorker.close(),
    paymentWorker.close(),
  ]);
  
  console.log('[Automation] All workers stopped');
};

export {
  emailWorker,
  ticketWorker,
  notificationWorker,
  paymentWorker,
};
