# StayNest — Full-Stack MERN Vacation Rental Marketplace

> **Internship Capstone Project**  
> A production-ready property rental web application inspired by Airbnb, built with the MERN stack (MongoDB, Express.js, React.js, Node.js), Tailwind CSS, Vite, JWT authentication, and automated concurrency protection.

---

## 🌟 Executive Summary & Objectives

**StayNest** connects property owners (**hosts**) with travelers (**guests**) seeking accommodation. The platform offers a seamless, responsive accommodation booking experience with persistent database storage, zero-friction local development fallback, automated conflict prevention, server-side price verification, and dedicated dashboards for both guests and hosts.

---

## 📑 Table of Contents
1. [Key Features](#-key-features)
2. [Technology Stack](#-technology-stack)
3. [System Architecture](#-system-architecture)
4. [Project Structure](#-project-structure)
5. [Prerequisites & Environment Variables](#-prerequisites--environment-variables)
6. [Installation & Quick Start](#-installation--quick-start)
7. [Database Seeding & Demo Accounts](#-database-seeding--demo-accounts)
8. [Automated Testing Suite](#-automated-testing-suite)
9. [REST API Documentation](#-rest-api-documentation)
10. [Booking Logic & Concurrency Protection](#-booking-logic--concurrency-protection)
11. [Production Build & Deployment Guide](#-production-build--deployment-guide)
12. [Security Best Practices](#-security-best-practices)
13. [Troubleshooting](#-troubleshooting)

---

## 🚀 Key Features

### For Guests
- **Secure Authentication**: Register and log in with JWT tokens and bcrypt password hashing.
- **Interactive Search & Filtering**:
  - Filter by destination (Hyderabad, Goa, Manali, Jaipur, Pondicherry, etc.).
  - Filter by property categories (*Trending, Iconic Cities, Beachfront, Luxury, Cabins, Mansions*).
  - Filter by price range (Min / Max in ₹ INR).
  - Filter by property type (*Apartment, Villa, House, Cottage, Cabin, Studio*).
  - Filter by number of guests.
  - Date-availability check: excludes listings that already have conflicting active reservations.
- **Property Exploration**: High-resolution image galleries, host profiles, capacity tags, and amenities with icons.
- **Real-Time Booking Calculator**: Dynamic calculation of nights, base prices, cleaning fees, and platform service fees.
- **Reservation Workflow**: Instant booking reservation with server-side date validation and pricing snapshot.
- **My Bookings Dashboard**: Manage active trips, view past stays, and cancel reservations with instant date release.
- **Verified Reviews**: Submit ratings (1–5 stars) and comments on properties after booking.

### For Hosts
- **Host Listing Management**: Create, edit, and delete property listings with ease.
- **Multi-Image Uploads**:
  - Multer integration supporting PNG, JPG, JPEG, and WEBP formats up to 5MB.
  - Cloudinary persistent cloud image hosting when configured.
  - Automatic fallback to local disk storage (`/uploads/`) and instant curated sample photo injection.
- **Host Dashboard**:
  - Top-line metrics: *Total Listings*, *Active Bookings*, and *Estimated Payout Revenue*.
  - *My Listings* tab with quick edit/delete actions and active reservation badges.
  - *Reservations Received* tab detailing guest identities, contact information, check-in dates, and booking values.
- **Role Scalability**: Any guest account can seamlessly create a listing and unlock host capabilities.

---

## 🛠 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, Tailwind CSS 3, React Router v6, Axios, Lucide React Icons |
| **Backend** | Node.js (v24+), Express.js 4, REST APIs, Multer, Helmet, CORS, Morgan, Express Rate Limit |
| **Database** | MongoDB 8+, Mongoose ODM (with seamless in-memory fallback for immediate zero-config testing) |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs (salt rounds = 10) |
| **Testing** | Jest, Supertest, MongoDB Memory Server |
| **Image Hosting** | Cloudinary API (with local disk storage fallback) |

---

## 🏛 System Architecture

```mermaid
flowchart TD
    Client["React 18 Single Page App\n(Vite + Tailwind CSS + Lucide)"]
    API["Express.js REST API Server\n(Helmet, CORS, RateLimit, JWT Auth)"]
    DB[("MongoDB Database\n(User, Property, Booking, Review)")]
    Cloudinary["Cloudinary CDN / Local Uploads"]

    Client -->|Axios REST (Bearer JWT)| API
    API -->|Mongoose ODM| DB
    API -->|Multer Stream| Cloudinary
```

---

## 📂 Project Structure

```
c:\Users\saide\Downloads\Smarted Inovations\
|
|-- client/                         # Frontend React + Vite application
|   |-- src/
|   |   |-- components/common/      # Navbar, CategoryFilter, PropertyCard, Modals, Footer
|   |   |-- context/                # AuthContext, ToastContext
|   |   |-- pages/                  # Home, Details, Book, Add, Edit, Dashboard, Bookings, Profile, Auth
|   |   |-- services/               # Axios API client with interceptors
|   |   |-- App.jsx                 # Route definitions and guards
|   |   |-- main.jsx                # DOM mount entry point
|   |   `-- index.css               # Tailwind directives & custom animations
|   |-- dist/                       # Production bundle (Vite)
|   |-- tailwind.config.js
|   |-- vite.config.js
|   `-- package.json
|
|-- server/                         # Backend Express + Node.js application
|   |-- config/                     # db.js (with memory fallback), cloudinary.js
|   |-- controllers/                # authController, propertyController, bookingController, uploadController, reviewController
|   |-- middleware/                 # auth.js, errorHandler.js, upload.js
|   |-- models/                     # User.js, Property.js, Booking.js, Review.js
|   |-- routes/                     # authRoutes, propertyRoutes, bookingRoutes, uploadRoutes
|   |-- scripts/                    # seed.js (comprehensive sample data seeder)
|   |-- tests/                      # api.test.js (21 automated Jest / Supertest tests)
|   |-- utils/                      # autoSeed.js (auto-populates empty database on boot)
|   |-- uploads/                    # Local image storage directory
|   |-- app.js                      # Express configuration & middleware
|   |-- server.js                   # HTTP server entry point
|   `-- package.json
|
|-- .env.example                    # Global environment template
|-- .gitignore                      # Git exclusion rules
|-- package.json                    # Root orchestration scripts
|-- PROJECT_STATUS.md               # Milestone tracking and project state
`-- README.md                       # Complete documentation
```

---

## 🔐 Prerequisites & Environment Variables

### Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node v24.11.0)
- **npm**: v9.0.0 or higher
- **MongoDB**: (Optional) MongoDB local service or MongoDB Atlas URI. If no MongoDB is running, StayNest **automatically spins up an in-memory database instance** so evaluation works out-of-the-box without installing MongoDB!

### Environment Configuration

Create a `.env` file in the `server/` directory:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Connection String (Atlas or Local)
# Leave as default to connect to local or let the auto-memory fallback engage
MONGODB_URI=mongodb://127.0.0.1:27017/staynest

# Authentication Secret
JWT_SECRET=staynest_super_secret_jwt_key_2026_capstone_secure
JWT_EXPIRES_IN=7d

# Optional Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Create a `.env` file in the `client/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## ⚡ Installation & Quick Start

### 1. Install all dependencies across root, server, and client:
```bash
# In the root project directory:
npm run install:all
```

### 2. Start both Frontend and Backend concurrently in development mode:
```bash
npm run dev
```
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **API Health Check**: `http://localhost:5000/api/health`

### 3. Alternatively, run services independently:
```bash
# Terminal 1: Start Backend
cd server
npm run dev

# Terminal 2: Start Frontend
cd client
npm run dev
```

---

## 🌱 Database Seeding & Demo Accounts

StayNest includes realistic sample data featuring premier properties in **Hyderabad** (*Jubilee Hills, Hitec City, Banjara Hills, Gachibowli*) and iconic tourist destinations (*Goa, Manali, Jaipur, Pondicherry*).

### Run the Seeder:
```bash
# From root:
npm run seed

# Or from server/:
cd server
npm run seed
```

### Demo Accounts for Instant Evaluation:

| Account Role | Email | Password | Pre-loaded Data |
|---|---|---|---|
| **Host Account** | `host@staynest.com` | `password123` | Owns luxury properties, has active reservations |
| **Guest Account** | `guest@staynest.com` | `password123` | Has confirmed upcoming stay & past reviews |

> **Tip**: The login page includes one-click **"Demo Host"** and **"Demo Guest"** buttons to log in instantly without typing!

---

## 🧪 Automated Testing Suite

StayNest includes a robust test suite covering authentication, property operations, server-side price calculation, capacity validation, date boundary logic, and concurrency collision prevention.

Run the test suite:
```bash
# From root:
npm run test:server

# Or from server/:
cd server
npm test
```

### Test Coverage Highlights (21 / 21 Tests Passing):
- **Authentication**:
  - `POST /api/auth/register` (success, password hash verification, duplicate email rejection).
  - `POST /api/auth/login` (credential verification, invalid password rejection).
  - `GET /api/auth/me` (JWT verification, unauthenticated rejection).
- **Property Operations**:
  - Public property retrieval with pagination, search, and category filtering.
  - Creation as authenticated host.
  - Rejection of unauthenticated creation.
  - Authorization check: non-owners cannot edit or delete listings.
- **Booking & Concurrency**:
  - Successful booking when dates are available.
  - Rejection when host attempts to book their own property.
  - Rejection when check-out date is before or equal to check-in.
  - Rejection when guest count exceeds max property capacity.
  - Rejection of overlapping active bookings for the same property.
  - Server-side price verification (client-supplied price tampering is ignored).
  - Cancellation rules and instant release of dates for new bookings.

---

## 📡 REST API Documentation

### Base URL: `http://localhost:5000/api`

### 1. Authentication Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register new user (`name`, `email`, `password`, `role`) |
| `POST` | `/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/auth/me` | Private | Retrieve logged-in user profile |
| `PATCH` | `/auth/profile` | Private | Update user profile (`name`, `phone`, `bio`, `profileImage`) |
| `POST` | `/auth/logout` | Public | Log out user session |

### 2. Property Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/properties` | Public | Query properties with pagination, search, category, price, and date filters |
| `GET` | `/properties/:id` | Public | Retrieve single property details with host information |
| `POST` | `/properties` | Private (Host) | Create a new property listing |
| `PUT` | `/properties/:id` | Private (Owner) | Update an existing property listing |
| `DELETE`| `/properties/:id` | Private (Owner) | Delete a property listing |
| `GET` | `/properties/host/my-listings` | Private (Host) | Get all properties owned by authenticated host |

### 3. Booking Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/bookings` | Private | Reserve a property (calculates price, checks concurrency) |
| `GET` | `/bookings/my` | Private | Retrieve bookings made by current guest |
| `GET` | `/bookings/host` | Private (Host) | Retrieve reservations placed on host's properties |
| `GET` | `/bookings/:id` | Private (Party) | View specific booking details |
| `PATCH`| `/bookings/:id/cancel` | Private (Party) | Cancel reservation and release dates |
| `GET` | `/bookings/property/:id/booked-dates` | Public | Get active booked date ranges for calendar disabling |

### 4. Review & Upload Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/properties/:id/reviews` | Public | Get all reviews for a property |
| `POST` | `/properties/:id/reviews` | Private (Guest)| Submit a verified review (1–5 stars + comment) |
| `POST` | `/upload` | Private (Host) | Upload up to 10 images (Cloudinary / local fallback) |

---

## 🛡 Booking Logic & Concurrency Protection

StayNest enforces strict enterprise booking rules:
1. **Date Validation**: Check-in must be today or in the future; check-out must be strictly after check-in.
2. **Server-Side Price Calculation**: Nightly rates, base totals, cleaning fees, and 12% service fees are calculated strictly on the backend. Client-provided monetary values are ignored.
3. **Agreed Price Snapshot**: The property's nightly price is recorded at booking time (`pricePerNightAtBooking`), guaranteeing that future host price edits do not retroactively alter confirmed reservations.
4. **Capacity Enforcement**: Guest counts cannot exceed the property's configured capacity.
5. **Self-Booking Guard**: Property owners are prevented from reserving their own listings.
6. **Conflict & Overlap Query**:
   ```javascript
   // Checks if an active reservation overlaps with requested dates
   const conflictingBooking = await Booking.findOne({
     property: propertyId,
     status: 'confirmed',
     checkIn: { $lt: requestedCheckOut },
     checkOut: { $gt: requestedCheckIn }
   });
   ```
7. **Immediate Date Release**: When a booking is cancelled, its status changes to `'cancelled'`, which immediately frees the date window for other guests.

---

## 🚀 Production Build & Deployment Guide

### Option 1: Unified Full-Stack Single Server (Recommended)
1. Build the frontend into `client/dist`:
   ```bash
   npm run build:client
   ```
2. Start the Express server in production mode:
   ```bash
   NODE_ENV=production PORT=5000 node server/server.js
   ```
   The Express server automatically detects `client/dist` and serves both the REST API and the static React Single Page Application on port 5000!

### Option 2: Cloud Deployment (Vercel + Render / Railway)
- **Frontend (Vercel / Netlify)**:
  - Root directory: `client`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
- **Backend (Render / Railway / Heroku)**:
  - Root directory: `server`
  - Build command: `npm install`
  - Start command: `node server.js`
  - Environment variables: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`

---

## 🔒 Security Best Practices Implemented

- **Password Hashing**: Passwords hashed with bcryptjs using 10 salt rounds; never stored in plain text.
- **Query Stripping**: Password hashes excluded by default (`select: false`) on User queries.
- **JWT Authorization**: Bearer tokens verified via Express middleware before protected actions.
- **Role Escalation Prevention**: Public registration and profile update APIs explicitly prevent users from granting themselves administrative privileges.
- **HTTP Security Headers**: Powered by `helmet` to mitigate clickjacking, MIME sniffing, and cross-site scripting.
- **CORS Allowlist**: Explicitly restricts origins to permitted client URLs.
- **Rate Limiting**: `express-rate-limit` prevents brute-force login and registration attempts.
- **Centralized Error Handling**: Detailed stack traces hidden in production to prevent information leakage.

---

## ❓ Troubleshooting

| Issue | Cause | Solution |
|---|---|---|
| `connect ECONNREFUSED 127.0.0.1:27017` | Local MongoDB is not running | No action needed! StayNest automatically engages an in-memory MongoDB fallback. Alternatively, supply a cloud `MONGODB_URI` from MongoDB Atlas in `server/.env`. |
| Port 5000 already in use | Previous process still running | Terminate the process using port 5000 or change `PORT=5001` in `server/.env`. |
| Image upload fails | Cloudinary keys missing or invalid | Without Cloudinary keys, the server automatically saves images to `server/uploads/`. You can also click **"Add Sample Photos"** in the property creator to use curated high-resolution photography. |
| 401 Unauthorized errors in browser | Token expired or invalid | Log out and log back in, or use the quick **Demo Host / Demo Guest** buttons on the login screen. |

---

## 📜 Capstone Submission Information
- **Project**: StayNest Airbnb Clone MERN Capstone
- **Module**: Final Capstone Submission
- **Author**: Internship Capstone Student
- **License**: MIT
