export interface NotificationPayload {
  type: 'payment_received' | 'payment_approved' | 'payment_rejected' | 'reminder' | 'admin_alert';
  guestId: number;
  ticketId: string;
  email: string;
  fullName: string;
  phone?: string;
  amount?: number;
  message: string;
  metadata?: Record<string, any>;
}

export interface AdminAlertPayload {
  alertType: string;
  guestName: string;
  ticketId: string;
  amount: number;
  timestamp: Date;
}

class NotificationService {
  private adminEmails: string[];

  constructor() {
    this.adminEmails = (process.env.ADMIN_EMAILS || 'admin@party.com').split(',');
  }

  async sendPaymentReceivedNotification(payload: NotificationPayload): Promise<void> {
    console.log(`[Notification] Payment received from ${payload.fullName} (${payload.email}) - Amount: ₦${payload.amount}`);
    
    this.adminEmails.forEach(adminEmail => {
      console.log(`[Admin Alert] Would send email to ${adminEmail}: New payment of ₦${payload.amount} from ${payload.fullName}`);
    });
  }

  async sendPaymentApprovedNotification(payload: NotificationPayload): Promise<void> {
    console.log(`[Notification] Payment approved for ${payload.fullName} (${payload.email})`);
  }

  async sendPaymentRejectedNotification(payload: NotificationPayload): Promise<void> {
    console.log(`[Notification] Payment rejected for ${payload.fullName} - Reason: ${payload.message}`);
  }

  async sendReminderNotification(payload: NotificationPayload): Promise<void> {
    console.log(`[Notification] Sending reminder to ${payload.email} for event`);
  }

  async sendAdminAlert(alertType: string, payload: AdminAlertPayload): Promise<void> {
    console.log(`[Admin Alert] ${alertType}: ${payload.guestName} (${payload.ticketId}) - ₦${payload.amount}`);
    
    this.adminEmails.forEach(adminEmail => {
      console.log(`[Admin Email] Would send alert email to ${adminEmail}`);
    });
  }

  async broadcastNotification(notification: NotificationPayload): Promise<void> {
    switch (notification.type) {
      case 'payment_received':
        await this.sendPaymentReceivedNotification(notification);
        break;
      case 'payment_approved':
        await this.sendPaymentApprovedNotification(notification);
        break;
      case 'payment_rejected':
        await this.sendPaymentRejectedNotification(notification);
        break;
      case 'reminder':
        await this.sendReminderNotification(notification);
        break;
      case 'admin_alert':
        await this.sendAdminAlert('General Alert', {
          alertType: notification.message,
          guestName: notification.fullName,
          ticketId: notification.ticketId,
          amount: notification.amount || 0,
          timestamp: new Date(),
        });
        break;
      default:
        console.log(`[Notification] Unknown notification type: ${notification.type}`);
    }
  }

  setAdminEmails(emails: string[]): void {
    this.adminEmails = emails;
  }

  getAdminEmails(): string[] {
    return this.adminEmails;
  }
}

export const notificationService = new NotificationService();
export default notificationService;
