# Exclusive House Party - Gate Pass System

## Project Overview
- **Project Name**: Exclusive House Party Gate Pass System
- **Type**: Event ticketing and payment web application
- **Core Functionality**: Allow guests to pay ₦10,000 gate fee and receive a digital QR-coded invite ticket
- **Target Users**: Party guests in Abuja, Nigeria (max 100 attendees)
- **Event Date**: March 28, 2026
- **Founder**: Akinwale Gabriel Atoyebi

---

## UI/UX Specification

### Layout Structure

**Pages**:
1. Landing Page (Home)
2. Registration/Payment Page
3. Guest Dashboard
4. Admin Dashboard
5. Login Page

**Responsive Breakpoints**:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Visual Design

**Color Palette**:
- Primary: `#0D0D0D` (Rich Black)
- Secondary: `#1A1A2E` (Dark Navy)
- Accent: `#E94560` (Vibrant Red/Pink)
- Gold: `#FFD700` (Gold for VIP elements)
- Success: `#00D26A` (Green)
- Warning: `#FFB800` (Amber)
- Text Primary: `#FFFFFF`
- Text Secondary: `#A0A0A0`
- Background: `#0D0D0D` to `#1A1A2E` gradient

**Typography**:
- Headings: `Playfair Display` (elegant, luxurious)
- Body: `DM Sans` (clean, modern)
- Accent/Numbers: `Space Mono` (for countdown timer)
- H1: 48px / 64px mobile: 36px
- H2: 36px
- H3: 24px
- Body: 16px
- Small: 14px

**Spacing System**:
- Base unit: 8px
- Section padding: 80px vertical, 24px horizontal
- Card padding: 24px
- Gap: 16px / 24px / 32px

**Visual Effects**:
- Glassmorphism cards with backdrop blur
- Gradient borders on hover
- Particle/spotlight background effects
- Smooth transitions (0.3s ease)
- Floating animations for decorative elements

### Components

**Navigation**:
- Fixed header with blur background
- Logo (left), nav links (center), admin button (right)
- Mobile: hamburger menu

**Hero Section**:
- Full viewport height
- Animated gradient background with particles
- Event title with text glow effect
- Countdown timer (days, hours, minutes, seconds)
- "Get Your Gate Pass" CTA button
- Floating decorative elements

**Countdown Timer**:
- 4 boxes (Days, Hours, Minutes, Seconds)
- Glassmorphism style
- Animated numbers
- Label below each number

**Payment Form**:
- Step indicator (1. Details, 2. Payment, 3. Confirmation)
- Input fields with floating labels
- Card payment via Stripe
- Bank transfer option with account details
- File upload for transfer proof
- Submit button with loading state

**Gate Pass/Ticket**:
- Landscape ticket design
- QR code (centered)
- Event details (name, date, location)
- Guest name
- Unique ticket ID
- Decorative border design

**Admin Table**:
- Sortable columns
- Status badges (Paid, Pending, Rejected)
- Action buttons (Approve, Reject)
- Search/filter functionality
- Pagination

---

## Functionality Specification

### Core Features

**1. Landing Page**
- Display event name: "Exclusive House Party"
- Event description and rules
- Countdown to March 28, 2026
- Primary CTA: "Get Your Gate Pass"
- Secondary info: Location, Time, Price

**2. Registration System**
- Collect: Full Name, Email, Phone Number
- Store guest information
- Generate unique registration ID
- Anti-duplicate: Check by email/phone

**3. Payment System**
- **Card Payment**: Stripe integration
- **Bank Transfer**: 
  - Display bank account details
  - Upload proof of transfer
  - Admin approval required
- Payment amount: ₦10,000
- Store payment status

**4. Gate Pass Generation**
- Generate unique ticket ID
- Create QR code containing ticket data
- Display downloadable ticket
- Send email with ticket attachment

**5. Guest Dashboard**
- View payment status
- View/download ticket
- View event details
- Email ticket option

**6. Admin Dashboard**
- View all registered guests
- Filter by status (All, Paid, Pending)
- Approve/reject bank transfer payments
- View total revenue
- See guest count (max 100)
- Export guest list

**7. Security Features**
- Limit to 100 paid guests
- Prevent duplicate registrations
- Verify payment before ticket generation

### User Interactions & Flows

**Guest Flow**:
1. Visit landing page
2. Click "Get Your Gate Pass"
3. Fill registration form
4. Choose payment method
5. Complete payment / upload transfer proof
6. Receive confirmation
7. View/download ticket
8. Receive email with ticket

**Admin Flow**:
1. Login to admin dashboard
2. View all registrations
3. Approve pending payments
4. Monitor revenue and guest count

### Edge Cases
- 100 guest limit reached: Show "Sold Out" message
- Duplicate email: Show error, prompt login
- Payment failed: Allow retry
- Bank transfer pending: Show pending status
- Invalid QR code: Show error at gate

---

## Technical Architecture

### Frontend
- Next.js 16 (App Router)
- React 19
- TailwindCSS 4
- Stripe Elements for payments
- QRCode generation (qrcode library)

### Backend (API Routes)
- Next.js API routes
- SQLite database (better-sqlite3)
- Stripe for card payments
- Nodemailer for emails

### Database Schema

**guests table**:
- id (PRIMARY KEY)
- full_name (TEXT)
- email (TEXT, UNIQUE)
- phone (TEXT)
- payment_method (TEXT: 'card' | 'bank_transfer')
- payment_status (TEXT: 'pending' | 'paid' | 'rejected')
- stripe_payment_id (TEXT)
- bank_transfer_proof (TEXT - file path)
- ticket_id (TEXT, UNIQUE)
- qr_code_data (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)

**admin table**:
- id (PRIMARY KEY)
- username (TEXT)
- password_hash (TEXT)
- created_at (DATETIME)

---

## Acceptance Criteria

### Visual Checkpoints
- [ ] Dark, luxurious theme with accent colors
- [ ] Responsive on mobile, tablet, desktop
- [ ] Countdown timer working correctly
- [ ] Smooth animations and transitions
- [ ] Professional ticket design with QR code
- [ ] Clean admin dashboard layout

### Functional Checkpoints
- [ ] Registration form validates and saves
- [ ] Payment via Stripe works
- [ ] Bank transfer upload works
- [ ] Admin can approve/reject payments
- [ ] Ticket generates with QR code
- [ ] Guest can view and download ticket
- [ ] Email confirmation sent
- [ ] Guest limit enforced (100 max)
- [ ] No duplicate registrations allowed

### Performance
- [ ] Page loads under 3 seconds
- [ ] No console errors
- [ ] Build succeeds
- [ ] TypeScript compiles without errors
