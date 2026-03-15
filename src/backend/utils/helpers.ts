import { v4 as uuidv4 } from 'uuid';

export const generateTicketId = (prefix: string = 'EHP'): string => {
  const uuid = uuidv4().slice(0, 8).toUpperCase();
  return `${prefix}-${uuid}`;
};

export const generateVerificationToken = (): string => {
  return uuidv4();
};

export const formatCurrency = (amount: number, currency: string = 'NGN'): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (date: string | Date, format: string = 'en-US'): string => {
  const d = new Date(date);
  return d.toLocaleDateString(format, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const calculateEventStats = (guests: any[]): {
  total: number;
  paid: number;
  pending: number;
  rejected: number;
  revenue: number;
  completionRate: number;
} => {
  const total = guests.length;
  const paid = guests.filter((g: any) => g.payment_status === 'paid').length;
  const pending = guests.filter((g: any) => g.payment_status === 'pending').length;
  const rejected = guests.filter((g: any) => g.payment_status === 'rejected').length;
  const revenue = paid * 10000;
  const completionRate = total > 0 ? (paid / total) * 100 : 0;

  return {
    total,
    paid,
    pending,
    rejected,
    revenue,
    completionRate,
  };
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>,
  options: { retries: number; delay: number } = { retries: 3, delay: 1000 }
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i < options.retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < options.retries - 1) {
        await sleep(options.delay * Math.pow(2, i));
      }
    }
  }
  
  throw lastError!;
};
