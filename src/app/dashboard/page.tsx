'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import QRCode from 'qrcode';

function DashboardContent() {
  const searchParams = useSearchParams();
  const ticketId = searchParams.get('ticketId');
  const success = searchParams.get('success');
  const [guest, setGuest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (!mounted) return;
      
      if (success === 'true' && ticketId) {
        try {
          const res = await fetch(`/api/guests?ticketId=${ticketId}`);
          const data = await res.json();
          
          if (data.payment_status === 'pending') {
            await fetch('/api/payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ticketId, action: 'confirm' }),
            });
            window.location.href = `/dashboard?ticketId=${ticketId}`;
          } else {
            setGuest(data);
          }
        } catch {
          setError('Failed to load ticket');
        }
      } else if (ticketId) {
        try {
          const res = await fetch(`/api/guests?ticketId=${ticketId}`);
          const data = await res.json();
          setGuest(data);
        } catch {
          setError('Guest not found');
        }
      }
      
      if (mounted) {
        setLoading(false);
      }
    };
    
    loadData();
    
    return () => { mounted = false; };
  }, [ticketId, success]);

  useEffect(() => {
    if (guest?.ticket_id) {
      QRCode.toDataURL(guest.ticket_id, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
      }).then(setQrCode);
    }
  }, [guest]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#E94560] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!ticketId) {
    return (
      <main className="min-h-screen py-24 px-6">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-6">🔍</div>
          <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Enter Your Ticket ID
          </h1>
          <p className="text-white/60 mb-6">
            Please enter your ticket ID to view your gate pass
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const id = new FormData(e.currentTarget).get('ticketId') as string;
              window.location.href = `/dashboard?ticketId=${id}`;
            }}
          >
            <input
              name="ticketId"
              type="text"
              className="input-field mb-4"
              placeholder="EHP-XXXXXXXX"
              required
            />
            <button type="submit" className="btn-primary w-full">
              View Ticket
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (error || !guest) {
    return (
      <main className="min-h-screen py-24 px-6">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-6">❌</div>
          <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Ticket Not Found
          </h1>
          <p className="text-white/60 mb-6">
            We could not find a ticket with that ID. Please check and try again.
          </p>
          <Link href="/" className="btn-primary inline-block">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const isPaid = guest.payment_status === 'paid';

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors">
          ← Back to Home
        </Link>

        {success === 'true' && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-center">
            🎉 Payment successful! Your gate pass is ready.
          </div>
        )}

        <div className="ticket text-center">
          <div className="mb-6">
            <span
              className={`status-badge ${isPaid ? 'status-paid' : 'status-pending'}`}
            >
              {isPaid ? '✓ Confirmed' : '⏳ Pending'}
            </span>
          </div>

          <div className="mb-6">
            {qrCode && (
              <div className="inline-block p-4 bg-white rounded-xl">
                <Image src={qrCode} alt="QR Code" width={192} height={192} className="w-48 h-48" />
              </div>
            )}
          </div>

          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            {guest.full_name}
          </h1>

          <p className="text-white/60 mb-6">Guest</p>

          <div className="grid grid-cols-2 gap-4 mb-6 text-left max-w-md mx-auto">
            <div className="bg-black/20 rounded-lg p-4">
              <div className="text-sm text-white/40">Event</div>
              <div className="font-semibold">Exclusive House Party</div>
            </div>
            <div className="bg-black/20 rounded-lg p-4">
              <div className="text-sm text-white/40">Date</div>
              <div className="font-semibold">March 28, 2026</div>
            </div>
            <div className="bg-black/20 rounded-lg p-4">
              <div className="text-sm text-white/40">Time</div>
              <div className="font-semibold">8:00 PM</div>
            </div>
            <div className="bg-black/20 rounded-lg p-4">
              <div className="text-sm text-white/40">Location</div>
              <div className="font-semibold">Abuja, Nigeria</div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 mb-6">
            <div className="text-sm text-white/40 mb-1">Ticket ID</div>
            <div className="text-xl font-mono text-[#E94560]">{guest.ticket_id}</div>
          </div>

          {isPaid ? (
            <button
              onClick={() => window.print()}
              className="btn-primary"
            >
              🖨️ Download Ticket
            </button>
          ) : (
            <div>
              <p className="text-white/60 mb-4">
                Your payment is still being processed. You will receive an email once confirmed.
              </p>
              {guest.payment_method === 'bank_transfer' && (
                <Link href="/register" className="btn-secondary inline-block">
                  Upload Transfer Proof
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 glass-card p-6">
          <h3 className="font-semibold mb-4">Event Details</h3>
          <div className="space-y-3 text-white/60">
            <p>📅 <strong>Date:</strong> March 28, 2026</p>
            <p>⏰ <strong>Time:</strong> 8:00 PM - Till Dawn</p>
            <p>📍 <strong>Location:</strong> Abuja, Nigeria</p>
            <p>👗 <strong>Dress Code:</strong> Party Chic</p>
            <p>🎵 <strong>Music:</strong> Afrobeats, Amapiano, Hip Hop</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#E94560] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
