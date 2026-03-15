'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Verify() {
  const [ticketId, setTicketId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`/api/guests?ticketId=${ticketId}`);
      const data = await response.json();

      if (!response.ok || !data.id) {
        setError('Invalid ticket. Ticket not found.');
        return;
      }

      setResult(data);
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors">
          ← Back to Admin
        </Link>

        <div className="text-center mb-12">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            <span className="text-[#C9A227]">QR Code</span> Verification
          </h1>
          <p className="text-white/60">Scan or enter ticket ID to verify guest entry</p>
        </div>

        <div className="glass-card p-8 mb-8">
          <form onSubmit={handleVerify}>
            <div className="mb-6">
              <label className="block text-sm text-white/60 mb-2">Ticket ID</label>
              <input
                type="text"
                className="input-field text-center text-xl font-mono"
                placeholder="EHP-XXXXXXXX"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value.toUpperCase())}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-lg"
            >
              {loading ? 'Verifying...' : 'Verify Ticket'}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-center">
              {error}
            </div>
          )}
        </div>

        {result && (
          <div className="glass-card p-8 text-center">
            {result.payment_status === 'paid' ? (
              <>
                <div className="text-6xl mb-4">✓</div>
                <div className="text-3xl font-bold text-[#00D26A] mb-4">VERIFIED</div>
                <div className="text-xl font-semibold mb-2">{result.full_name}</div>
                <div className="text-white/60 mb-4">{result.email}</div>
                <div className="p-4 rounded-lg bg-[#00D26A]/10 border border-[#00D26A]/30 inline-block">
                  <span className="font-mono text-[#C9A227]">{result.ticket_id}</span>
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">✗</div>
                <div className="text-3xl font-bold text-[#C9A227] mb-4">NOT VERIFIED</div>
                <div className="text-white/60">Payment status: {result.payment_status}</div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
