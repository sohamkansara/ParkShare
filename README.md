# ParkShare — Private Parking Marketplace (India)

A peer-to-peer and commercial parking space marketplace tailored for high-density Indian urban centers (Bengaluru, Pune, Mumbai, Delhi NCR).

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Leaflet (OpenStreetMap)**.

---

## 🚀 Key Features

### 1. Driver Discovery & Interactive Map
* Geocoded map exploration with real-time price pins (`₹50/hr`, `₹20/hr` for two-wheelers).
* Filter by vehicle category:
  * 🏍️ **Two-Wheeler** (Bikes / Scooters — 70% of Indian urban transit demand)
  * 🚗 **Car / Sedan / Hatchback**
  * 🚙 **SUV**
* Filter by parking category:
  * 🏡 **Private Driveways** (Independent bungalows with direct road access)
  * 🏢 **Gated Societies** (Apartment complexes with security guard and boom barrier)
  * 🏬 **Commercial Basements** (Retail/Office lots with CCTV & EV charging)

### 2. Digital Parking Entry Pass (The Society Gatekeeper Solution)
* Automated gate verification pass generated on booking confirmation:
  * 4-Digit Guard Verification PIN (`[ 4 8 2 1 ]`)
  * Registered vehicle license plate (`MH 12 QX 4421`)
  * Society name, Flat/Unit number, and guard entry note
  * One-tap **Open in Google Maps**
  * One-tap **WhatsApp / Call Host**
  * GPS-assisted Check-In & Check-Out
  * Emergency **"Spot Blocked / Guard Refused Entry" SOS dispute trigger**

### 3. Transparent Indian Pricing & Checkout
* Instant fee breakdown:
  * Base Parking Fare
  * Platform Convenience Fee (10%)
  * Statutory GST on Convenience Fee (18%)
* Razorpay payment sheet simulation (UPI Apps: PhonePe, Google Pay, Paytm, UPI QR, and Cards).

### 4. Host Hub & Listing Creation Wizard
* Step-by-step listing onboarding with mandatory **RWA / Society NOC acknowledgement**.
* Pricing controls (hourly rate, daily cap) and Guard instructions.
* Real-time earnings dashboard with **Section 194-O TDS (1%)** and net payout tracking.
* Live guest arrival roster with vehicle numbers and gate pass codes.

### 5. Platform Operations & Moderation Console
* Admin dashboard tracking Gross GMV, Platform Revenue, and Active Inventory.
* Dispute settlement queue to resolve blocked spots and trigger instant refunds.

---

## 🛠️ Running Locally

```bash
# 1. Navigate to project directory
cd C:\Users\soham\.gemini\antigravity\scratch\parkshare

# 2. Start development server
npm.cmd run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.
