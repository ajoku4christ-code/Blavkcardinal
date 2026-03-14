'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [guests, setGuests] = useState<any[]>([]);
  const [stats, setStats] = useState({ count: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchGuests = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter === 'all' ? '/api/admin' : `/api/admin?status=${filter}`;
      const response = await fetch(url);
      const data = await response.json();
      setGuests(data.guests);
      setStats({ count: data.count, revenue: data.revenue });
    } catch (error) {
      console.error('Failed to fetch guests:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const isAuthenticated = document.cookie.includes('admin_session=true');
    if (!isAuthenticated) {
      router.push('/admin');
      return;
    }
    fetchGuests();
  }, [router, fetchGuests]);

  const handleAction = async (guestId: number, action: 'approve' | 'reject') => {
    setActionLoading(guestId);
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, guestId }),
      });
      fetchGuests();
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/');
  };

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
              Admin <span className="text-[#E94560]">Dashboard</span>
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary"
          >
            Logout
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="text-sm text-white/60 mb-2">Total Paid Guests</div>
            <div className="text-4xl font-bold text-[#E94560]">{stats.count}</div>
            <div className="text-sm text-white/40">/ 100 maximum</div>
          </div>
          <div className="glass-card p-6">
            <div className="text-sm text-white/60 mb-2">Total Revenue</div>
            <div className="text-4xl font-bold text-[#FFD700]">₦{stats.revenue.toLocaleString()}</div>
          </div>
          <div className="glass-card p-6">
            <div className="text-sm text-white/60 mb-2">Pending Payments</div>
            <div className="text-4xl font-bold text-[#FFB800]">
              {guests.filter((g) => g.payment_status === 'pending').length}
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold">Guest List</h2>
            <div className="flex gap-2">
              {['all', 'paid', 'pending', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    filter === status
                      ? 'bg-[#E94560] text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-[#E94560] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : guests.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              No guests found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4 text-sm text-white/60 font-medium">Guest</th>
                    <th className="text-left py-4 px-4 text-sm text-white/60 font-medium">Ticket ID</th>
                    <th className="text-left py-4 px-4 text-sm text-white/60 font-medium">Payment Method</th>
                    <th className="text-left py-4 px-4 text-sm text-white/60 font-medium">Status</th>
                    <th className="text-left py-4 px-4 text-sm text-white/60 font-medium">Date</th>
                    <th className="text-right py-4 px-4 text-sm text-white/60 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((guest) => (
                    <tr key={guest.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium">{guest.full_name}</div>
                          <div className="text-sm text-white/40">{guest.email}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-sm">{guest.ticket_id}</td>
                      <td className="py-4 px-4">
                        <span className="text-sm">
                          {guest.payment_method === 'card' ? '💳 Card' : '🏦 Bank Transfer'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`status-badge status-${guest.payment_status}`}>
                          {guest.payment_status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-white/60">
                        {new Date(guest.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {guest.payment_status === 'pending' && guest.payment_method === 'bank_transfer' && (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleAction(guest.id, 'approve')}
                              disabled={actionLoading === guest.id}
                              className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm transition-all disabled:opacity-50"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleAction(guest.id, 'reject')}
                              disabled={actionLoading === guest.id}
                              className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm transition-all disabled:opacity-50"
                            >
                              ✗ Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
