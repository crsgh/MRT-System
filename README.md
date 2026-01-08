# MRT System Admin Panel

This is the Admin Dashboard and QR Generation component for the MRT System.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB (Mongoose)
- **Maps**: Google Maps API
- **Auth**: JWT (HttpOnly Cookies)

## Setup

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Environment Variables**
   Rename or create `.env.local` in the root directory:
   ```env
   MONGODB_URI=mongodb+srv://carlosdrmiranda_db_user:cmrtdb@<YOUR_CLUSTER_URL>/mrt-system?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```
   *Note: Replace `<YOUR_CLUSTER_URL>` with your actual MongoDB Atlas cluster address (e.g., `cluster0.xyz.mongodb.net`).*

3. **Seed Admin User**
   Run the seed script to create the initial admin account:
   ```bash
   node scripts/seed-admin.js
   ```
   **Default Credentials:**
   - Username: `admin`
   - Password: `password123`

4. **Run Development Server**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Admin Authentication**: Secure login for administrators.
- **Station Management**: 
  - Create, Read, Update, Delete (CRUD) stations.
  - Interactive Map Picker for setting station coordinates.
  - Automatic QR Code generation based on Station Code.
- **Dashboard**: Overview of system status.

## Project Structure

- `src/app/admin`: Admin dashboard routes.
- `src/app/api`: Backend API routes (Auth, Stations).
- `src/models`: Mongoose database models.
- `src/lib`: Shared utilities (Database connection).
- `src/components`: Reusable UI components.
