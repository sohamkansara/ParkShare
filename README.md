# ParkShare — Private Parking Marketplace (India)

A peer-to-peer and commercial parking space marketplace tailored for high-density Indian urban centers (Bengaluru, Pune, Mumbai, Delhi NCR).

Built with a **Python (FastAPI + SQLAlchemy)** backend and a **Next.js 14 + Tailwind CSS + Leaflet** interactive frontend.

---

## 🏗️ Architecture

```text
parkshare/
├── backend/                       # Python FastAPI Backend
│   ├── database.py                # SQLAlchemy engine & SQLite session
│   ├── models.py                  # User, Vehicle, Listing, Booking models
│   ├── schemas.py                 # Pydantic v2 request/response schemas
│   ├── services/
│   │   ├── pricing.py             # Indian marketplace fee calculations (GST, TDS)
│   │   └── geo.py                 # Spherical Haversine distance calculator
│   ├── main.py                    # FastAPI app, CORS, routes & seed endpoint
│   ├── run.py                     # Uvicorn server launcher
│   └── requirements.txt           # Python dependencies
├── src/                           # Next.js 14 Frontend
│   ├── app/                       # App Router views (Explore, Host, Pass, Admin)
│   ├── components/                # Leaflet map, checkout modal, gate pass
│   └── lib/                       # Types, utilities & storage
├── next.config.mjs                # Next.js config with proxy rewrites to FastAPI
└── README.md
```

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
* **Geospatial Proximity Search:** Spherical Haversine algorithm calculates real-time distance from user coordinates.

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

### Option 1: Start the Python FastAPI Backend

```cmd
cd /d C:\Users\soham\.gemini\antigravity\scratch\parkshare
py backend\run.py
```

* **API Server:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
* **Interactive Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc Documentation:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### Option 2: Start the Next.js Frontend

```cmd
cd /d C:\Users\soham\.gemini\antigravity\scratch\parkshare
npm.cmd run dev
```

* **Web Application:** [http://localhost:3000](http://localhost:3000)
