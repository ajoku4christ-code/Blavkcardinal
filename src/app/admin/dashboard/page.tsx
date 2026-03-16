'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth');
    if (auth) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'login', 
          username: credentials.username, 
          password: credentials.password 
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('admin_auth', 'true');
        localStorage.setItem('admin_user', credentials.username);
        setIsAuthenticated(true);
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_user');
    setIsAuthenticated(false);
    setCredentials({ username: '', password: '' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#C9A227] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen py-24 px-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Admin <span className="text-[#C9A227]">Login</span>
            </h1>
            <p className="text-white/60">Enter your credentials to access the control panel</p>
          </div>

          <div className="glass-card p-8">
            <form onSubmit={handleLogin}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Username</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter username"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    required
                    autoComplete="username"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Password</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Enter password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    required
                    autoComplete="current-password"
                  />
                </div>

                {error && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Login'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <Link href="/" className="text-white/40 hover:text-white text-sm">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return <AdminDashboardContent onLogout={handleLogout} />;
}

function AdminDashboardContent({ onLogout }: { onLogout: () => void }) {
  const router = useRouter();
  const [guests, setGuests] = useState<any[]>([]);
  const [stats, setStats] = useState({ count: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('guests');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [settings, setSettings] = useState({
    eventName: 'Exclusive House Party',
    eventDate: '2026-03-28',
    eventTime: '20:00',
    location: 'Abuja, Nigeria',
    gateFee: '10000',
    maxGuests: '100',
  });

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
    
    const interval = setInterval(() => {
      fetchGuests();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchGuests]);

  const handleAction = async (guestId: number, action: 'approve' | 'reject') => {
    if (!confirm(`Are you sure you want to ${action} this payment?`)) {
      return;
    }
    
    setActionLoading(guestId);
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, guestId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        if (data.emailSent) {
          alert('Ticket email sent to guest!');
        }
      } else {
        alert(data.error || 'Action failed');
      }
      
      fetchGuests();
    } catch (error) {
      console.error('Action failed:', error);
      alert('Action failed. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const viewReceipt = (receiptPath: string) => {
    setSelectedReceipt(receiptPath);
    setShowReceiptModal(true);
  };

  const handleSettingChange = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  const saveSettings = () => {
    localStorage.setItem('eventSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const pendingBankTransfers = guests.filter((g: any) => 
    g.payment_method === 'bank_transfer' && g.payment_status === 'pending'
  );

  return (
    <main className="min-h-screen py-12 px-6">
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A2E] rounded-xl p-4 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Payment Receipt</h3>
              <button 
                onClick={() => setShowReceiptModal(false)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="relative h-96">
              <Image 
                src={selectedReceipt} 
                alt="Receipt" 
                fill
                className="object-contain"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  const guest = guests.find((g: any) => g.bank_transfer_proof === selectedReceipt);
                  if (guest) handleAction(guest.id, 'approve');
                  setShowReceiptModal(false);
                }}
                className="flex-1 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30"
              >
                ✓ Approve Payment
              </button>
              <button
                onClick={() => {
                  const guest = guests.find((g: any) => g.bank_transfer_proof === selectedReceipt);
                  if (guest) handleAction(guest.id, 'reject');
                  setShowReceiptModal(false);
                }}
                className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
              >
                ✗ Reject Payment
              </button>
            </div>
          </div>
        </div>
      )}

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
            <button
              onClick={onLogout}
              className="btn-secondary"
            >
              Logout
            </button>
            <Link href="/verify" className="btn-secondary">
              ✓ Verify Tickets
            </Link>
          </div>
        </div>

        {pendingBankTransfers.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <div className="font-semibold text-yellow-400">
                  {pendingBankTransfers.length} Payment{pendingBankTransfers.length > 1 ? 's' : ''} Pending Verification
                </div>
                <div className="text-sm text-white/60">
                  Review and approve bank transfer receipts
                </div>
              </div>
            </div>
          </div>
        )}

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
                  {guests.filter((g: any) => g.payment_status === 'pending').length}
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
                        <th className="text-left py-4 px-4 text-sm text-white/60 font-medium">Phone</th>
                        <th className="text-left py-4 px-4 text-sm text-white/60 font-medium">Ticket ID</th>
                        <th className="text-left py-4 px-4 text-sm text-white/60 font-medium">Receipt</th>
                        <th className="text-left py-4 px-4 text-sm text-white/60 font-medium">Status</th>
                        <th className="text-left py-4 px-4 text-sm text-white/60 font-medium">Date</th>
                        <th className="text-right py-4 px-4 text-sm text-white/60 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {guests.map((guest: any) => (
                        <tr key={guest.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium">{guest.full_name}</div>
                              <div className="text-sm text-white/40">{guest.email}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm">{guest.phone}</td>
                          <td className="py-4 px-4 font-mono text-sm">{guest.ticket_id}</td>
                          <td className="py-4 px-4">
                            {guest.bank_transfer_proof ? (
                              <button
                                onClick={() => viewReceipt(guest.bank_transfer_proof)}
                                className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-sm"
                              >
                                👁️ View
                              </button>
                            ) : (
                              <span className="text-white/40 text-sm">No receipt</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`status-badge status-${guest.payment_status}`}>
                              {guest.payment_status === 'paid' ? '✓ Approved' : 
                               guest.payment_status === 'pending' ? '⏳ Pending' : 
                               '✗ Rejected'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-white/60">
                            {new Date(guest.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 text-right">
                            {guest.payment_status === 'pending' && (
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => handleAction(guest.id, 'approve')}
                                  disabled={actionLoading === guest.id}
                                  className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm transition-all disabled:opacity-50"
                                >
                                  {actionLoading === guest.id ? '...' : '✓ Approve'}
                                </button>
                                <button
                                  onClick={() => handleAction(guest.id, 'reject')}
                                  disabled={actionLoading === guest.id}
                                  className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm transition-all disabled:opacity-50"
                                >
                                  {actionLoading === guest.id ? '...' : '✗ Reject'}
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
                <div className="text-3xl font-bold text-green-400">{guests.filter((g: any) => g.payment_status === 'paid').length}</div>
              </div>
              <div className="glass-card p-6">
                <div className="text-sm text-white/60 mb-2">Pending</div>
                <div className="text-3xl font-bold text-yellow-400">{guests.filter((g: any) => g.payment_status === 'pending').length}</div>
              </div>
              <div className="glass-card p-6">
                <div className="text-sm text-white/60 mb-2">Rejected</div>
                <div className="text-3xl font-bold text-red-400">{guests.filter((g: any) => g.payment_status === 'rejected').length}</div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Bank Transfer Summary</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg bg-white/5">
                  <div className="text-sm text-white/60 mb-2">Awaiting Verification</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {guests.filter((g: any) => g.payment_method === 'bank_transfer' && g.payment_status === 'pending').length}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                  <div className="text-sm text-white/60 mb-2">Approved</div>
                  <div className="text-2xl font-bold text-green-400">
                    {guests.filter((g: any) => g.payment_method === 'bank_transfer' && g.payment_status === 'paid').length}
                  </div>
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
                  <span className="text-xl font-bold text-white">₦{(guests.filter((g: any) => g.payment_status !== 'rejected').length * 10000).toLocaleString()}</span>
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
