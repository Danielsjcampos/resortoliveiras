# Resort Management System (PMS)

A comprehensive Property Management System built with React, Vite, TypeScript, and Supabase. This application is designed to manage all operations of a Resort or Hotel, from reservations and check-ins to housekeeping and financial reporting.

## 🚀 Key Features

### 🏨 Front Desk & Reservations
- **Interactive Calendar**: Visual reservation management.
- **Check-in/Check-out**: Seamless guest flow.
- **Channel Manager**: Integration with **Airbnb** and **Booking.com** (Simulated) to sync reservations.
- **Room Management**: Real-time status updates (Clean, Dirty, Maintenance).

### 👥 Guest & Client Management
- **Guest Portal**: Dedicated area for guests to view consumption, request services, and self-checkout.
- **Client Profiles**: Detailed history of stays and spending.
- **Facial Recognition**: Feature for profile photos and potential access control.

### 🛠 Administrative & HR
- **Executive Dashboard**: Real-time KPIs (Occupancy Rate, RevPAR, Total Revenue).
- **Time Sheet**: Facial recognition clock-in/out for staff time tracking.
- **Inventory & Products**: Manage stock levels, minibar items, and restaurant menu.
- **Maintenance & Cleaning**: Task assignment and tracking for housekeeping staff.

### 🔒 Security & Roles
- **Role-Based Access Control (RBAC)**: Distinct permissions for Admin, Manager, Receptionist, and Guest.
- **Supabase Authentication**: Secure user management.

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS (Glassmorphism & Mobile-First)
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Context & Hooks

## 📂 Project Structure

- `/pages`: Main application views (AdminDashboard, GuestLogin, etc.).
- `/components`: Reusable UI components (Modals, Tables, Forms).
- `/database`: SQL migrations and setup scripts.
- `/lib`: Supabase configuration and utility functions.
- `/types`: TypeScript definitions.

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/resort-pms.git
   cd resort-pms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env.local` file in the root with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Run Locally**
   ```bash
   npm run dev
   ```

## 📜 Database Setup

SQL scripts for setting up the database schema and seeding initial data can be found in the `database/migrations` folder.

---

*Developed for the Resort Management Portfolio.*