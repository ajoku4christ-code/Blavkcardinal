'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const EVENT_DATE = new Date('2026-03-28T20:00:00');

function Countdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = EVENT_DATE.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-3 md:gap-6 justify-center flex-wrap">
      {[
        { value: timeLeft.days, label: 'Days' },
        { value: timeLeft.hours, label: 'Hours' },
        { value: timeLeft.minutes, label: 'Minutes' },
        { value: timeLeft.seconds, label: 'Seconds' },
      ].map((item, i) => (
        <div key={i} className="countdown-box-minimal">
          <div className="countdown-number-minimal">{String(item.value).padStart(2, '0')}</div>
          <div className="countdown-label-minimal">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

function Stars() {
  const stars = [
    { id: 1, left: 5, top: 10, delay: 0.2, size: 1.5 },
    { id: 2, left: 15, top: 25, delay: 1.5, size: 1 },
    { id: 3, left: 25, top: 8, delay: 0.8, size: 2 },
    { id: 4, left: 35, top: 30, delay: 2.1, size: 1 },
    { id: 5, left: 45, top: 15, delay: 0.5, size: 1.8 },
    { id: 6, left: 55, top: 40, delay: 1.2, size: 1.2 },
    { id: 7, left: 65, top: 5, delay: 0.9, size: 1.5 },
    { id: 8, left: 75, top: 22, delay: 1.8, size: 1 },
    { id: 9, left: 85, top: 35, delay: 0.3, size: 2 },
    { id: 10, left: 95, top: 12, delay: 2.5, size: 1.3 },
    { id: 11, left: 8, top: 50, delay: 1.1, size: 1 },
    { id: 12, left: 18, top: 65, delay: 0.7, size: 1.7 },
    { id: 13, left: 28, top: 55, delay: 1.9, size: 1.2 },
    { id: 14, left: 38, top: 72, delay: 0.4, size: 1.5 },
    { id: 15, left: 48, top: 60, delay: 2.2, size: 1 },
    { id: 16, left: 58, top: 80, delay: 0.6, size: 1.8 },
    { id: 17, left: 68, top: 52, delay: 1.4, size: 1.3 },
    { id: 18, left: 78, top: 68, delay: 2.8, size: 1 },
    { id: 19, left: 88, top: 45, delay: 1.3, size: 1.6 },
    { id: 20, left: 92, top: 78, delay: 0.9, size: 1.2 },
    { id: 21, left: 12, top: 85, delay: 1.7, size: 1.4 },
    { id: 22, left: 22, top: 90, delay: 0.5, size: 1 },
    { id: 23, left: 32, top: 82, delay: 2.0, size: 1.5 },
    { id: 24, left: 42, top: 88, delay: 1.1, size: 1.3 },
    { id: 25, left: 52, top: 75, delay: 0.8, size: 1.7 },
    { id: 26, left: 62, top: 92, delay: 2.3, size: 1 },
    { id: 27, left: 72, top: 58, delay: 1.6, size: 1.2 },
    { id: 28, left: 82, top: 85, delay: 0.4, size: 1.8 },
    { id: 29, left: 2, top: 42, delay: 2.6, size: 1.1 },
    { id: 30, left: 98, top: 32, delay: 1.0, size: 1.4 },
  ];

  return (
    <div className="stars-container">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            animationDelay: `${star.delay}s`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A227] to-[#8B7355]">EXCLUSIVE</span>
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/admin/dashboard" className="text-sm text-white/50 hover:text-[#C9A227] transition-all duration-300 tracking-widest uppercase text-xs">
              Admin
            </Link>
          </div>
        </div>
      </nav>

      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a0a] to-black" />
        <Stars />
        
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#C9A227]/5 rounded-full filter blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#C9A227]/3 rounded-full filter blur-[100px]" />
        </div>

        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[20%] left-[10%] w-2 h-2 bg-white rounded-full animate-ping" />
          <div className="absolute top-[40%] right-[20%] w-1 h-1 bg-[#C9A227] rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-[30%] left-[30%] w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24">
          <div className="mb-8 inline-flex items-center gap-3 px-6 py-3 rounded-full border border-[#C9A227]/20 bg-[#C9A227]/5 backdrop-blur-sm">
            <span className="w-2 h-2 bg-[#C9A227] rounded-full animate-pulse" />
            <span className="text-sm tracking-[0.3em] text-[#C9A227] uppercase text-xs">March 28, 2026 • Abuja</span>
          </div>
          
          <h1 className="text-7xl md:text-9xl font-bold mb-6 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50">EXCLUSIVE</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A227] via-[#8B7355] to-[#C9A227] animate-gradient bg-300pct">HOUSE PARTY</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/40 mb-16 max-w-2xl mx-auto font-light tracking-wide">
            An unforgettable night of luxury, music, and celebration
          </p>

          <div className="mb-16">
            <p className="text-xs tracking-[0.4em] text-white/30 uppercase mb-8">Event Starts In</p>
            <Countdown />
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
            <Link href="/register" className="btn-premiere text-lg px-10 py-4">
              Get Your Gate Pass
            </Link>
            <div className="text-center px-8 py-4 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
              <div className="text-3xl font-bold text-[#C9A227]">₦10,000</div>
              <div className="text-xs text-white/40 uppercase tracking-widest mt-1">Gate Fee</div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: '◈', title: 'Location', desc: 'Abuja, Nigeria' },
              { icon: '◇', title: 'Guests', desc: 'Limited to 100' },
              { icon: '◎', title: 'Entry', desc: 'QR Code Verified' },
            ].map((item, i) => (
              <div key={i} className="premiere-card p-6">
                <div className="text-2xl text-[#C9A227] mb-3">{item.icon}</div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-white/60 mb-1">{item.title}</h3>
                <p className="text-white">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a0a] to-black" />
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16" style={{ fontFamily: 'var(--font-heading)' }}>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A227] to-[#8B7355]">House Rules</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: '▸', title: 'Gate Pass Required', desc: 'Valid QR-coded gate pass mandatory for entry' },
              { icon: '▸', title: 'Arrival Time', desc: 'Doors open 8:00 PM sharp' },
              { icon: '▸', title: 'No Photography', desc: 'Respect guests privacy' },
              { icon: '▸', title: 'No Drugs/Weapons', desc: 'Zero tolerance policy' },
              { icon: '▸', title: 'Dress Code', desc: 'Smart Casual / Party Chic' },
              { icon: '▸', title: 'Age Restriction', desc: '18+ only' },
            ].map((rule, i) => (
              <div key={i} className="premiere-card p-5 flex gap-4 items-center">
                <span className="text-[#C9A227] text-lg">{rule.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">{rule.title}</h3>
                  <p className="text-white/40 text-sm mt-1">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/20 text-xs tracking-[0.3em] uppercase">© 2026 Exclusive House Party. All Rights Reserved.</p>
        </div>
      </footer>
    </main>
  );
}
