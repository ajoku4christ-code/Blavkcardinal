import QRCode from 'qrcode';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export interface TicketData {
  ticketId: string;
  guestName: string;
  email: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  location: string;
  qrData: string;
}

class TicketService {
  private ticketDir: string;

  constructor() {
    this.ticketDir = join(process.cwd(), 'public', 'tickets');
    if (!existsSync(this.ticketDir)) {
      mkdirSync(this.ticketDir, { recursive: true });
    }
  }

  async generateQRCode(ticketId: string, email: string): Promise<string> {
    const qrData = `${ticketId}|${email}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    });
    return qrCodeDataUrl;
  }

  async generateQRBuffer(ticketId: string, email: string): Promise<Buffer> {
    const qrData = `${ticketId}|${email}`;
    const qrCodeBuffer = await QRCode.toBuffer(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    });
    return qrCodeBuffer;
  }

  async saveQRCode(ticketId: string, email: string): Promise<string> {
    const qrData = `${ticketId}|${email}`;
    const fileName = `${ticketId}-qr.png`;
    const filePath = join(this.ticketDir, fileName);
    
    const qrCodeBuffer = await QRCode.toBuffer(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    });
    
    writeFileSync(filePath, qrCodeBuffer);
    
    return `/tickets/${fileName}`;
  }

  generateTicketHtml(ticketData: TicketData, qrCodeDataUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gate Pass - ${ticketData.eventName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Arial, sans-serif; 
      background: #0D0D0D; 
      color: #FFFFFF; 
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .ticket-container {
      max-width: 450px;
      width: 100%;
    }
    .ticket {
      background: linear-gradient(135deg, #1A1A2E 0%, #0D0D0D 100%);
      border: 3px solid #C9A227;
      border-radius: 20px;
      padding: 30px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .ticket::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(90deg, #C9A227, #FFF8DC, #C9A227);
    }
    .event-name {
      font-size: 24px;
      font-weight: bold;
      color: #C9A227;
      margin-bottom: 5px;
    }
    .event-subtitle {
      color: #A0A0A0;
      font-size: 14px;
      margin-bottom: 20px;
    }
    .qr-container {
      background: #FFFFFF;
      border-radius: 15px;
      padding: 20px;
      display: inline-block;
      margin: 20px 0;
    }
    .qr-container img {
      width: 200px;
      height: 200px;
    }
    .guest-name {
      font-size: 24px;
      font-weight: bold;
      color: #FFFFFF;
      margin: 15px 0;
    }
    .guest-label {
      color: #A0A0A0;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 5px;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin: 25px 0;
      text-align: left;
    }
    .detail-item {
      background: rgba(255,255,255,0.05);
      padding: 15px;
      border-radius: 10px;
    }
    .detail-label {
      color: #A0A0A0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 5px;
    }
    .detail-value {
      color: #FFFFFF;
      font-weight: 600;
      font-size: 14px;
    }
    .ticket-id {
      border-top: 1px solid rgba(255,255,255,0.1);
      padding-top: 20px;
      margin-top: 20px;
    }
    .ticket-id-label {
      color: #A0A0A0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .ticket-id-value {
      font-family: 'Courier New', monospace;
      font-size: 18px;
      color: #C9A227;
      font-weight: bold;
      margin-top: 5px;
    }
    .status {
      display: inline-block;
      background: rgba(0,210,106,0.2);
      color: #00D26A;
      padding: 8px 20px;
      border-radius: 25px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 15px;
      border: 1px solid #00D26A;
    }
    .footer {
      margin-top: 20px;
      color: #666;
      font-size: 11px;
    }
    @media print {
      body { background: #FFFFFF; }
      .ticket { 
        border: 2px solid #C9A227;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="ticket-container">
    <div class="ticket">
      <div class="status">✓ CONFIRMED</div>
      <div class="event-name">${ticketData.eventName}</div>
      <div class="event-subtitle">Exclusive Gate Pass</div>
      
      <div class="qr-container">
        <img src="${qrCodeDataUrl}" alt="QR Code" />
      </div>
      
      <div class="guest-label">Guest</div>
      <div class="guest-name">${ticketData.guestName}</div>
      
      <div class="details-grid">
        <div class="detail-item">
          <div class="detail-label">Date</div>
          <div class="detail-value">${ticketData.eventDate}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Time</div>
          <div class="detail-value">${ticketData.eventTime}</div>
        </div>
        <div class="detail-item" style="grid-column: span 2;">
          <div class="detail-label">Location</div>
          <div class="detail-value">${ticketData.location}</div>
        </div>
      </div>
      
      <div class="ticket-id">
        <div class="ticket-id-label">Ticket ID</div>
        <div class="ticket-id-value">${ticketData.ticketId}</div>
      </div>
      
      <div class="footer">
        Present this QR code at the entrance<br/>
        © 2026 ${ticketData.eventName}
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  async createTicket(ticketData: TicketData): Promise<string> {
    const qrCodeDataUrl = await this.generateQRCode(ticketData.ticketId, ticketData.email);
    const ticketHtml = this.generateTicketHtml(ticketData, qrCodeDataUrl);
    
    const fileName = `${ticketData.ticketId}-ticket.html`;
    const filePath = join(this.ticketDir, fileName);
    
    writeFileSync(filePath, ticketHtml);
    
    return `/tickets/${fileName}`;
  }

  validateTicket(qrCodeData: string): { valid: boolean; ticketId?: string; email?: string; error?: string } {
    try {
      const parts = qrCodeData.split('|');
      if (parts.length !== 2) {
        return { valid: false, error: 'Invalid QR code format' };
      }
      
      const [ticketId, email] = parts;
      
      if (!ticketId || !email) {
        return { valid: false, error: 'Missing ticket information' };
      }
      
      return { valid: true, ticketId, email };
    } catch (error) {
      return { valid: false, error: 'Failed to parse QR code' };
    }
  }
}

export const ticketService = new TicketService();
export default ticketService;
