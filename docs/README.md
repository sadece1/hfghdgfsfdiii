# 🚜 Premium Grader & Parts Marketplace

A modern, high-performance React-based grader and parts marketplace featuring Cat and Komatsu brands, with a premium design and smooth user experience with **Supabase** backend integration.

## ✨ Features

- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **Supabase Integration**: Real-time database, authentication, and storage
- **Role-based Authentication**: User and Admin roles with different permissions
- **Advanced Filtering**: Smart filters for brand, year, price, fuel type, transmission, and location
- **Favorites System**: Save and manage favorite grader and parts listings
- **Image Gallery**: Swiper.js powered image carousels with thumbnail navigation
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **State Management**: Zustand with localStorage persistence
- **TypeScript**: Full type safety throughout the application
- **Real-time Updates**: Live data synchronization with Supabase

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Supabase**
   - Follow the detailed guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
   - Create a Supabase project and configure environment variables

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Navigate to `http://localhost:3000`

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Routing**: React Router v6
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Icons**: React Icons
- **Carousel**: Swiper.js
- **Animations**: GSAP
- **Font**: Inter (Google Fonts)

## 📱 Pages & Features

### Public Pages
- **Gallery (Homepage)**: Browse graders and parts with advanced filtering
- **Grader Details**: Detailed grader information with image gallery
- **Favorites**: Manage saved grader and parts listings
- **About**: Company information
- **Contact**: Contact form and information
- **FAQ**: Frequently asked questions
- **404**: Custom not found page

### Authentication
- **User Registration**: Create new user accounts
- **User Login**: Standard email/password authentication
- **Admin Login**: Admin panel access with Supabase Auth
- **Session Management**: Persistent sessions with Supabase

### Admin Features
- **Dashboard**: Manage grader and parts listings
- **CRUD Operations**: Create, read, update, delete graders and parts
- **Statistics**: Overview of listings and metrics

## 🎨 Design System

- **Primary Color**: Grader Orange (#ea580c)
- **Typography**: Inter font family (300-700 weights)
- **Spacing**: 16px baseline grid
- **Components**: Reusable button and card components
- **Responsive**: Mobile-first approach

## 🔧 Configuration

### TypeScript
- Strict mode enabled for source files
- Relaxed mode for config files
- Proper type definitions for all interfaces

### Tailwind CSS
- Custom color palette
- Extended spacing and height utilities
- Component-based styling approach

### Vite
- React plugin configured
- Development server on port 3000
- Auto-open browser enabled

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx      # Navigation bar
│   ├── GraderCard.tsx  # Grader listing card
│   └── FilterSidebar.tsx # Advanced filtering
├── pages/              # Page components
│   ├── Gallery.tsx     # Homepage with grader listings
│   ├── GraderDetails.tsx # Detailed grader view
│   ├── Favorites.tsx   # User favorites
│   ├── AdminDashboard.tsx # Admin panel
│   ├── Login.tsx       # Authentication
│   └── ...            # Static pages
├── store/              # Zustand state management
│   └── index.ts        # Main store configuration
├── types/              # TypeScript type definitions
│   └── index.ts        # Interface definitions
├── App.tsx             # Main app component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## 🎯 Key Features Implemented

### ✅ Error-Free Setup
- Proper TypeScript configuration
- Correct file extensions (.tsx, .ts, .cjs)
- No unused imports
- Type-safe operations

### ✅ Modern React Patterns
- Functional components with hooks
- Custom hooks for state management
- Proper event handling
- Clean component architecture

### ✅ Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interactions
- Optimized for all screen sizes

### ✅ Performance Optimizations
- Lazy loading ready
- Optimized images
- Efficient state updates
- Minimal re-renders

## 🔐 Demo Credentials

For testing purposes, you can login with any username/password combination:

- **User Role**: Browse graders and parts, add to favorites, contact sellers
- **Admin Role**: Manage grader and parts listings, view statistics, CRUD operations

## 🚀 Deployment

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Preview Build**
   ```bash
   npm run preview
   ```

## 📝 Development Notes

- All components are TypeScript functional components
- State management uses Zustand with localStorage persistence
- Styling follows Tailwind CSS utility-first approach
- Images are sourced from Unsplash for demo purposes
- Mock data is included for immediate testing

## 🤝 Contributing

This is a demo project showcasing modern React development practices. Feel free to use it as a reference or starting point for your own projects.

## 📄 License

This project is for demonstration purposes. Please respect the terms of use for any external resources used.

