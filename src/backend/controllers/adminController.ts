import { NextRequest, NextResponse } from 'next/server';
import { getAllGuests, getGuestCount, getTotalRevenue, getGuestById, updatePaymentStatus, adminLogin } from '@/lib/db';
import { addEmailJob, addPaymentJob } from '../queues/queue';

interface GuestRecord {
  id: number;
  ticket_id: string;
  email: string;
  full_name: string;
  phone: string;
  payment_status: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, username, password, guestId, status } = body;

    if (action === 'login') {
      const admin = adminLogin(username, password);
      if (!admin) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      return NextResponse.json({ success: true, admin });
    }

    if (action === 'approve' || action === 'reject') {
      const newStatus = action === 'approve' ? 'paid' : 'rejected';
      const guest = getGuestById(guestId) as GuestRecord | undefined;
      
      if (!guest) {
        return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
      }

      updatePaymentStatus(guestId, newStatus);

      const emailJobData = {
        guestId: Number(guestId),
        ticketId: String(guest.ticket_id),
        email: String(guest.email),
        fullName: String(guest.full_name),
        phone: String(guest.phone),
        template: action === 'approve' ? 'ticket' : 'rejected',
        subject: action === 'approve' ? 'Your Ticket is Ready!' : 'Payment Update',
        amount: 10000,
        eventDate: 'March 28, 2026',
        eventTime: '8:00 PM',
        location: 'Abuja, Nigeria',
        reason: action === 'reject' ? 'Payment could not be verified' : undefined,
      };

      const paymentJobData = {
        guestId: Number(guestId),
        ticketId: String(guest.ticket_id),
        email: String(guest.email),
        fullName: String(guest.full_name),
        phone: String(guest.phone),
        amount: 10000,
        action,
      };

      if (action === 'approve') {
        addEmailJob('ticket', emailJobData).catch(console.error);
      } else {
        addEmailJob('rejected', emailJobData).catch(console.error);
      }

      addPaymentJob(action, paymentJobData).catch(console.error);

      return NextResponse.json({ 
        success: true, 
        message: `Guest ${action}d successfully`,
        emailSent: true
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin error:', error);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const guests = getAllGuests(status || undefined);
  const count = getGuestCount();
  const revenue = getTotalRevenue();

  return NextResponse.json({ guests, count, revenue });
}
