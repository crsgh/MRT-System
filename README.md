# 🚇 MRT System - Web Application

A comprehensive Metro Rapid Transit (MRT) management system built with Next.js, featuring admin controls, passenger management, and mobile API integration for seamless transit operations.

## 📋 Overview

The MRT System Web Application serves as the central hub for managing transit operations, including:
- **Admin Dashboard**: Comprehensive control panel for system administrators
- **Station Management**: CRUD operations with interactive map selection
- **Passenger Management**: User registration and profile management with discount types (PWD, Senior, Student)
- **Trip Tracking**: Real-time trip monitoring and fare calculation
- **Wallet System**: Integrated digital wallet with PayMongo payment gateway
- **QR Code Generation**: Automatic QR codes for station check-in/check-out
- **Mobile API**: RESTful endpoints for React Native mobile app integration

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + PostCSS
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with HttpOnly Cookies
- **Maps Integration**: Google Maps API
- **Payment Gateway**: PayMongo API
- **QR Generation**: qrcode.react
- **Icons**: Lucide React

## ✨ Features

### Admin Features
- 🔐 Secure admin authentication with JWT
- 🗺️ Interactive station management with Google Maps picker
- 📊 Station list with details and coordinates
- 🎫 Automatic QR code generation for stations
- 👥 User and passenger management
- 📈 Trip history and analytics
- 💰 Wallet transaction monitoring

### Passenger Features
- 📱 Mobile-friendly passenger portal
- 👤 Profile management with discount types
- 💳 Digital wallet with top-up via PayMongo
- 🎟️ Trip history and fare details
- 🚇 Station-to-station fare calculation
- 💵 Discount application (PWD: 20%, Senior: 20%, Student: 10%)

### Mobile API
- 🔌 RESTful API endpoints for mobile app
- 🔒 Secure authentication endpoints
- 📍 Station information retrieval
- 💼 Wallet operations
- 🎫 Passenger profile management

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- MongoDB Atlas account or local MongoDB instance
- Google Maps API key
- PayMongo API keys (for payment features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mrt-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Configuration**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mrt-system?retryWrites=true&w=majority
   
   # Authentication
   JWT_SECRET=your_super_secret_jwt_key_min_32_characters
   
   # Google Maps
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   
   # PayMongo (Optional - for payment features)
   PAYMONGO_SECRET_KEY=sk_test_your_paymongo_secret_key
   PAYMONGO_PUBLIC_KEY=pk_test_your_paymongo_public_key
   ```

4. **Database Setup**
   
   Seed the database with initial admin user:
   ```bash
   node scripts/seed-admin.js
   ```
   
   **Default Admin Credentials:**
   - Username: `admin`
   - Password: `password123`
   
   (Optional) Seed stations:
   ```bash
   node scripts/seed-stations.js
   ```

5. **Run Development Server**
   ```bash
   pnpm dev
   ```
   
   The application will be available at [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
mrt-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── mobile/        # Mobile app API
│   │   │   ├── passengers/    # Passenger management
│   │   │   ├── stations/      # Station CRUD
│   │   │   ├── trips/         # Trip tracking
│   │   │   └── wallet/        # Wallet operations
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   └── payment/           # Payment success/failure pages
│   ├── components/            # React components
│   ├── lib/                   # Utilities and configurations
│   │   ├── auth.ts           # JWT authentication
│   │   ├── db.ts             # MongoDB connection
│   │   └── paymongo.ts       # PayMongo integration
│   ├── models/                # Mongoose models
│   │   ├── User.ts           # User/Admin model
│   │   ├── Station.ts        # Station model
│   │   ├── Trip.ts           # Trip model
│   │   └── WalletTransaction.ts
│   └── types/                 # TypeScript types
├── scripts/                   # Database scripts
└── public/                    # Static assets
```

## 🔐 Authentication

The system uses JWT (JSON Web Tokens) stored in HttpOnly cookies for secure authentication:
- Admin users have elevated privileges for system management
- Passengers have restricted access to their own data
- Mobile API uses token-based authentication

## 🗺️ Station Management

Stations can be created with:
- Name and station code
- Geographic coordinates (via Google Maps picker)
- Automatic QR code generation
- Fare calculation based on distance

## 💳 Payment Integration

Integrated with PayMongo for secure online payments:
- Wallet top-up via GCash, credit/debit cards
- Real-time payment verification
- Transaction history tracking

## 📱 Mobile API Endpoints

### Authentication
- `POST /api/mobile/auth/login` - Passenger login
- `POST /api/mobile/auth/signup` - New passenger registration
- `GET /api/mobile/auth/me` - Get current user

### Stations
- `GET /api/mobile/stations` - List all stations
- `POST /api/mobile/stations/tap` - Tap in/out at station

### Wallet
- `GET /api/mobile/wallet` - Get wallet balance
- `GET /api/mobile/wallet/transactions` - Transaction history
- `POST /api/mobile/wallet/topup` - Create top-up payment

### Passenger
- `GET /api/mobile/passenger/profile` - Get profile
- `PUT /api/mobile/passenger/profile` - Update profile

## 🛠️ Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Database Scripts
node scripts/seed-admin.js           # Create admin user
node scripts/seed-stations.js        # Seed stations
node scripts/seed-test-passengers.js # Create test passengers
node scripts/list-stations.js        # List all stations
```

## 🧪 Testing

### Admin Testing
1. Navigate to [http://localhost:3000/login](http://localhost:3000/login)
2. Login with admin credentials
3. Access admin dashboard at `/admin`

### QR Code Testing
- Visit `/admin/qr-testing` to scan station QR codes
- Test tap in/out functionality

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Manual Deployment
```bash
pnpm build
pnpm start
```

## 🔒 Security Features

- JWT authentication with HttpOnly cookies
- Password hashing with bcrypt
- MongoDB injection prevention via Mongoose
- CORS configuration for mobile app
- Secure payment processing via PayMongo

## 🤝 Integration with Mobile App

This web application provides the backend API for the [MRT Mobile App](../mrt-app-mobile-reactnative/README.md). Ensure the web server is running before using the mobile app.

## 📄 License

This project is private and confidential.

## 👨‍💻 Author

Carlos Miranda

---

For mobile app documentation, see [MRT Mobile App README](../mrt-app-mobile-reactnative/README.md)
- **Dashboard**: Overview of system status.

## Project Structure

- `src/app/admin`: Admin dashboard routes.
- `src/app/api`: Backend API routes (Auth, Stations).
- `src/models`: Mongoose database models.
- `src/lib`: Shared utilities (Database connection).
- `src/components`: Reusable UI components.
