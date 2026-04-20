# 🌍 Tourism Platform - Cartagena Tours

A professional Single Page Application (SPA) for discovering and booking amazing tours in Cartagena, Colombia and surrounding areas. Built with React, TypeScript, Vite, Tailwind CSS, DaisyUI, Firebase, and Leaflet Maps.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Firebase Configuration](#firebase-configuration)
- [Seed Database](#seed-database)
- [Running the Project](#running-the-project)
- [Building for Production](#building-for-production)
- [Testing](#testing)
- [Project Features in Detail](#project-features-in-detail)
- [API Structure](#api-structure)
- [Security Rules](#security-rules)
- [Contributing](#contributing)

## ✨ Features

### Authentication
- ✅ Email/Password authentication with Firebase Auth
- ✅ Google Sign-In integration
- ✅ User profiles with roles (user/admin)
- ✅ Protected routes (authentication & admin-only)

### Tours Management
- ✅ Browse all available tours with filtering
- ✅ Detailed tour pages with maps, ratings, and reviews
- ✅ Interactive maps using Leaflet (OpenStreetMap)
- ✅ Admin panel for CRUD operations on tours
- ✅ Image URLs from CDN (Unsplash, Imgur, etc.)

### Bookings
- ✅ User can book tours with date selection
- ✅ View booking history in dashboard
- ✅ Real-time booking status updates
- ✅ Only authenticated users can book

### User Experience
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Beautiful UI with Tailwind CSS + DaisyUI
- ✅ Fast performance with Vite
- ✅ Type-safe with TypeScript
- ✅ Smooth animations and transitions

### Data & Security
- ✅ Firestore database for data persistence
- ✅ Security rules for data access control
- ✅ Admin-only tour creation/modification
- ✅ User data privacy protection
- ✅ **NO Firebase Storage** - All images use external URLs (Unsplash, CDN, etc.)

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Tailwind component library
- **React Router v6** - Client-side routing
- **Leaflet** - Interactive maps
- **React Leaflet** - React wrapper for Leaflet

### Backend & Database
- **Firebase** - Backend as a Service
  - **Firebase Auth** - Authentication (Email/Password + Google)
  - **Firestore** - NoSQL database (NO Firebase Storage)
  - **Security Rules** - Firestore data access control

### Development Tools
- **Vitest** - Unit testing framework
- **React Testing Library** - React component testing
- **ESLint** - Code quality
- **TypeScript** - Static type checking
- **PostCSS** - CSS processing
- **Autoprefixer** - Vendor prefixes

## 📁 Project Structure

```
tourism-platform/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── booking/
│   │   │   └── Booking.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── map/
│   │   │   ├── GlobalMap.tsx
│   │   │   └── TourMap.tsx
│   │   └── tours/
│   │       ├── TourCard.tsx
│   │       ├── TourDetail.tsx
│   │       └── TourList.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useBookings.ts
│   │   └── useTours.ts
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Tours.tsx
│   │   ├── TourDetailPage.tsx
│   │   ├── Dashboard.tsx
│   │   └── Admin.tsx
│   ├── services/
│   │   └── firebase.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── constants.ts
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── tests/
│   ├── setup.ts
│   └── components/
│       ├── TourCard.test.tsx
│       ├── ProtectedRoute.test.tsx
│       └── booking.test.tsx
├── scripts/
│   └── seed.ts
├── public/
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── firestore.rules
└── README.md
```

## 🚀 Installation

### Prerequisites
- Node.js 16+ and npm/yarn installed
- Firebase project created
- Git installed

### Steps

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/tourism-platform.git
cd tourism-platform
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file:**
```bash
cp .env.example .env
```

## 🔐 Environment Setup

### Firebase Configuration

1. **Create a Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Firestore Database (production mode)
   - Enable Authentication (Email/Password and Google)

2. **Get Your Credentials:**
   - Go to Project Settings → Service Accounts → Web App
   - Copy your Firebase config

3. **Update `.env` file:**
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Firebase Rules Setup

1. **Update Firestore Rules:**
   - Go to Firebase Console → Firestore → Rules
   - Replace with content from `firestore.rules`
   - Deploy

2. **Create Collections:**
   - Create collections: `users`, `tours`, `bookings` in Firestore
   - Or use the seed script to auto-populate

## 🌱 Seed Database

The project includes a seed script to populate your database with sample tour data.

### Before Seeding

1. Ensure your Firebase project is configured
2. Update `.env` with Firebase credentials
3. Deploy Firestore rules

### Run Seed Script

```bash
# Install dependencies first if not done
npm install

# Run the seed script
npm run seed
```

### What Gets Seeded

✅ **8 Sample Tours** with:
- Real coordinates from Cartagena, Islas del Rosario, and Barú
- Descriptions, prices, duration, and ratings
- Public image URLs from Unsplash
- Categories and featured status

✅ **1 Admin User**
- Email: `admin@tourism.com`
- Password: `Admin123!`
- Role: admin

### After Seeding

1. Go to Firebase Console → Authentication
2. Verify the `admin@tourism.com` email
3. Login to the app as admin to create additional tours

## 🏃 Running the Project

### Development Mode

```bash
npm run dev
```

- Opens at `http://localhost:5173`
- Hot Module Replacement (HMR) enabled
- Auto-refresh on file changes

### Build for Production

```bash
npm run build
```

- Optimized bundle in `dist/` folder
- Ready to deploy to hosting services

### Preview Production Build

```bash
npm run preview
```

- Serves the production build locally
- Useful for testing before deployment

## 🧪 Testing

### Run All Tests

```bash
npm run test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Generate Coverage Report

```bash
npm run test:coverage
```

### Test Files Included

- `TourCard.test.tsx` - Tour card rendering and interactions
- `ProtectedRoute.test.tsx` - Route protection and admin access
- `booking.test.tsx` - Booking form and validation

## 📖 Project Features in Detail

### 🏠 Home Page
- Hero section with call-to-action
- Featured tours carousel
- Features section (Historic Sites, Beaches, Culture)
- Global map with all tour locations
- CTA for booking

### 🗺️ Tours Page
- Browse all available tours
- Filter by category and price range
- Toggle between list and map views
- Tour cards with ratings and quick info
- Link to detailed tour pages

### 🎫 Tour Detail Page
- Full tour information
- Multiple images gallery
- Interactive Leaflet map
- User reviews and ratings
- Booking form with date selection
- Share button

### 👤 User Dashboard
- View all personal bookings
- Booking status (pending/confirmed/cancelled)
- Tour information for each booking
- User profile section

### ⚙️ Admin Panel
- Create new tours
- Edit existing tours
- Delete tours
- View all tours in table format
- Image URLs support (no uploads)
- Real-time updates

### 🔐 Authentication
- Register new account
- Login with email/password
- Google Sign-In
- Logout
- Auto-redirect after login
- Profile management

### 🗺️ Maps
- Global map showing all tour locations
- Individual tour location maps
- Interactive markers with popups
- Zoom and pan controls
- OpenStreetMap tiles

## 🗄️ API Structure

### Firestore Collections

#### users/{uid}
```typescript
{
  uid: string
  displayName: string
  email: string
  photoURL?: string
  role: "user" | "admin"
  phone?: string
  createdAt: Timestamp
}
```

#### tours/{tourId}
```typescript
{
  title: string
  slug: string
  description: string
  price: number
  images: string[] // Public URLs
  coords: { lat: number, lng: number }
  duration: string
  rating: number
  reviews: Review[]
  createdAt: Timestamp
  authorId: string // Admin uid
  featured?: boolean
  category?: string
}
```

#### bookings/{bookingId}
```typescript
{
  userId: string
  tourId: string
  date: Timestamp
  status: "pending" | "confirmed" | "cancelled" | "completed"
  participants?: number
  totalPrice?: number
  createdAt: Timestamp
}
```

## 🔒 Security Rules

### Firestore Rules
- **Tours**: Readable by all, writable by admins only
- **Bookings**: Users see only their bookings, admins see all
- **Users**: Users edit only their own profile
- **Reviews**: Readable by all, writable by authenticated users

See `firestore.rules` for detailed rules.

## 📦 Dependencies

### Production
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.1",
  "firebase": "^10.7.1",
  "react-firebase-hooks": "^5.1.1",
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1"
}
```

### Development
```json
{
  "typescript": "^5.2.2",
  "vite": "^5.0.8",
  "tailwindcss": "^3.4.0",
  "daisyui": "^4.4.24",
  "vitest": "^1.1.0"
}
```

## 🌐 Deployment

### Deploy to Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase project:
```bash
firebase init
```

4. Build and deploy:
```bash
npm run build
firebase deploy
```

### Deploy to Other Platforms

The project can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- AWS Amplify
- Digital Ocean

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_FIREBASE_API_KEY` | Firebase API Key | Yes |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | Yes |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | Yes |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | Yes |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | Yes |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | Yes |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | No |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support & Troubleshooting

### Issue: Firebase config not loading
- Verify `.env` file exists and has correct values
- Restart dev server: `npm run dev`

### Issue: Firestore rules error
- Deploy rules from `firestore.rules` in Firebase Console
- Check Firestore collections exist

### Issue: Maps not showing
- Check internet connection
- Verify Leaflet CSS is loaded (check browser console)
- Ensure tour coordinates are valid

### Issue: Tests failing
- Clear node_modules: `rm -rf node_modules && npm install`
- Run: `npm run test`

### Issue: Build errors
- Check TypeScript: `npx tsc --noEmit`
- Clear dist folder: `rm -rf dist`
- Rebuild: `npm run build`

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [DaisyUI](https://daisyui.com)
- [Leaflet Docs](https://leafletjs.com)

## 👨‍💻 Author

Tourism Platform created with ❤️ for exploring beautiful Cartagena

---

**Last Updated:** November 2024 | **Version:** 1.0.0
