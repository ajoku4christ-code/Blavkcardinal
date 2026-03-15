'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [guests, setGuests] = useState<any[]>([]);
  const [stats, setStats] = useState({ count: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('guests');
  const [settings, setSettings] = useState({
    eventName: 'Exclusive House Party',
    eventDate: '2026-03-28',
    eventTime: '20:00',
    location: 'Abuja, Nigeria',
    gateFee: '10000',
    maxGuests: '100',
  });

  useEffect(() => {
    const isAuthenticated = document.cookie.includes('admin_session=true');
    if (!isAuthenticated) {
      router.push('/admin');
      return;
    }
    fetchGuests();
  }, [router]);

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
    fetchGuests();
  }, [fetchGuests]);

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

  const handleSettingChange = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  const saveSettings = () => {
    localStorage.setItem('eventSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
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
              Admin <span className="text-[#C9A227]">Dashboard</span>
            </h1>
          </div>
          <div className="flex gap-4">
            <Link href="/verify" className="btn-secondary">
              ✓ Verify Tickets
            </Link>
            <button 
              onClick={() => {
                document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
                router.push('/');
              }}
              className="btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          {['guests', 'payments', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-[#C9A227] text-black'
                  : 'glass-card text-white/70 hover:text-white'
              }`}
            >
              {tab === 'guests' ? '👥 Guests' : tab === 'payments' ? '💳 Payments' : '⚙️ Settings'}
            </button>
          ))}
        </div>

        {activeTab === 'guests' && (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="glass-card p-6">
                <div className="text-sm text-white/60 mb-2">Total Paid Guests</div>
                <div className="text-4xl font-bold text-[#C9A227]">{stats.count}</div>
                <div className="text-sm text-white/40">/ {settings.maxGuests} maximum</div>
              </div>
              <div className="glass-card p-6">
                <div className="text-sm text-white/60 mb-2">Total Revenue</div>
                <div className="text-4xl font-bold text-[#C9A227]">₦{stats.revenue.toLocaleString()}</div>
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
                          ? 'bg-[#C9A227] text-black'
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
                  <div className="w-12 h-12 border-4 border-[#C9A227] border-t-transparent rounded-full animate-spin mx-auto" />
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
          </>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="glass-card p-6">
                <div className="text-sm text-white/60 mb-2">Total Guests</div>
                <div className="text-3xl font-bold text-[#C9A227]">{guests.length}</div>
              </div>
              <div className="glass-card p-6">
                <div className="text-sm text-white/60 mb-2">Paid</div>
                <div className="text-3xl font-bold text-green-400">{guests.filter((g) => g.payment_status === 'paid').length}</div>
              </div>
              <div className="glass-card p-6">
                <div className="text-sm text-white/60 mb-2">Pending</div>
                <div className="text-3xl font-bold text-yellow-400">{guests.filter((g) => g.payment_status === 'pending').length}</div>
              </div>
              <div className="glass-card p-6">
                <div className="text-sm text-white/60 mb-2">Rejected</div>
                <div className="text-3xl font-bold text-red-400">{guests.filter((g) => g.payment_status === 'rejected').length}</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Card Payments</h3>
                <div className="text-2xl font-bold text-[#C9A227] mb-2">
                  {guests.filter((g) => g.payment_method === 'card' && g.payment_status === 'paid').length}
                </div>
                <div className="text-sm text-white/40">Paid via Stripe</div>
              </div>
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Bank Transfers</h3>
                <div className="text-2xl font-bold text-[#C9A227] mb-2">
                  {guests.filter((g) => g.payment_method === 'bank_transfer' && g.payment_status === 'paid').length}
                </div>
                <div className="text-sm text-white/40">Awaiting approval</div>
                <div className="mt-2 text-sm text-yellow-400">
                  {guests.filter((g) => g.payment_method === 'bank_transfer' && g.payment_status === 'pending').length} pending verification
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-white/60">Total Revenue Collected</span>
                  <span className="text-xl font-bold text-[#C9A227]">₦{stats.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-white/60">Expected Revenue (if all pending paid)</span>
                  <span className="text-xl font-bold text-white">₦{(guests.filter((g) => g.payment_status !== 'rejected').length * 10000).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-white/60">Remaining Spots</span>
                  <span className="text-xl font-bold text-white">{parseInt(settings.maxGuests) - stats.count}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
              Event <span className="text-[#C9A227]">Settings</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-white/60 mb-2">Event Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={settings.eventName}
                  onChange={(e) => handleSettingChange('eventName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Event Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={settings.eventDate}
                  onChange={(e) => handleSettingChange('eventDate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Event Time</label>
                <input
                  type="time"
                  className="input-field"
                  value={settings.eventTime}
                  onChange={(e) => handleSettingChange('eventTime', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Location</label>
                <input
                  type="text"
                  className="input-field"
                  value={settings.location}
                  onChange={(e) => handleSettingChange('location', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Gate Fee (₦)</label>
                <input
                  type="number"
                  className="input-field"
                  value={settings.gateFee}
                  onChange={(e) => handleSettingChange('gateFee', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Maximum Guests</label>
                <input
                  type="number"
                  className="input-field"
                  value={settings.maxGuests}
                  onChange={(e) => handleSettingChange('maxGuests', e.target.value)}
                />
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button onClick={saveSettings} className="btn-primary">
                Save Settings
              </button>
              <button 
                onClick={() => {
                  const saved = localStorage.getItem('eventSettings');
                  if (saved) setSettings(JSON.parse(saved));
                }} 
                className="btn-secondary"
              >
                Load Saved Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
