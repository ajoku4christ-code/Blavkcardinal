import { NextRequest, NextResponse } from 'next/server';
import { getAllGuests, getGuestCount, getTotalRevenue, getGuestById, updatePaymentStatus, adminLogin } from '@/lib/db';
import { addEventJob } from '@/backend/queues/queue';
import { EVENT_TYPES } from '@/backend/services/eventTypes';

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
      const guest = getGuestById(guestId) as any;
      
      if (!guest) {
        return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
      }

      updatePaymentStatus(guestId, newStatus);

      const guestIdNum = Number(guestId);
      const ticketId = String(guest.ticket_id);
      const email = String(guest.email);
      const fullName = String(guest.full_name);
      const phone = String(guest.phone);

      const eventType = action === 'approve' 
        ? EVENT_TYPES.PAYMENT_APPROVED 
        : EVENT_TYPES.PAYMENT_REJECTED;

      addEventJob(eventType, {
        guestId: guestIdNum,
        ticketId,
        email,
        fullName,
        phone,
        amount: 10000,
        metadata: {
          reason: action === 'reject' ? 'Payment could not be verified' : undefined,
        },
      }).catch(console.error);

      return NextResponse.json({ 
        success: true, 
        message: `Guest ${action}d successfully`,
        emailSent: action === 'approve'
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
