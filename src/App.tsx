import { useEffect, Suspense, lazy, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ContactToolbar from './components/ContactToolbar';
import { UnauthorizedPage } from './components/ProtectedRoute';
import { SecurityProvider, HTTPSRedirect, SecurityMonitor } from './components/SecurityProvider';
import { withSecurity } from './components/withSecurity';

// Import critical pages directly for instant loading
import HomePage from './pages/HomePage';
import Gallery from './pages/Gallery';

// Lazy load other pages
const Parts = lazy(() => import('./pages/Parts'));
const SalesMap = lazy(() => import('./pages/SalesMap'));
const GraderDetails = lazy(() => import('./pages/GraderDetails'));
const PartDetails = lazy(() => import('./pages/PartDetails'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const EditGrader = lazy(() => import('./pages/EditGrader'));
const AddGrader = lazy(() => import('./pages/AddGrader'));
const AddPart = lazy(() => import('./pages/AddPart'));
const EditPart = lazy(() => import('./pages/EditPart'));
const Login = lazy(() => import('./pages/Login'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const UserLogin = lazy(() => import('./pages/UserLogin'));
const Register = lazy(() => import('./pages/Register'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQ = lazy(() => import('./pages/FAQ'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Preload critical pages on hover/focus
const preloadPage = (pageImport: () => Promise<any>) => {
  pageImport();
};

// Preload critical pages immediately - moved inside component

// Optimized loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
      <p className="text-gray-600 text-sm">Yükleniyor...</p>
    </div>
  </div>
);

function App() {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Preload critical pages on component mount
  useEffect(() => {
    // Preload most visited pages
    preloadPage(() => import('./pages/Gallery'));
    preloadPage(() => import('./pages/Parts'));
    preloadPage(() => import('./pages/About'));
  }, []);

  // Optimized route change handling
  useEffect(() => {
    setIsTransitioning(true);
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Reset transition state after a short delay
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <SecurityProvider>
      <HTTPSRedirect />
      <SecurityMonitor />
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className={`pt-16 transition-opacity duration-200 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/parts" element={
              <Suspense fallback={<PageLoader />}>
                <Parts />
              </Suspense>
            } />
            <Route path="/sales-map" element={
              <Suspense fallback={<PageLoader />}>
                <SalesMap />
              </Suspense>
            } />
            <Route path="/search" element={
              <Suspense fallback={<PageLoader />}>
                <SearchResults />
              </Suspense>
            } />
            <Route path="/grader/:id" element={
              <Suspense fallback={<PageLoader />}>
                <GraderDetails />
              </Suspense>
            } />
            <Route path="/part/:id" element={
              <Suspense fallback={<PageLoader />}>
                <PartDetails />
              </Suspense>
            } />
            <Route path="/admin" element={
              <Suspense fallback={<PageLoader />}>
                <AdminDashboard />
              </Suspense>
            } />
            <Route path="/admin/add-grader" element={
              <Suspense fallback={<PageLoader />}>
                <AddGrader />
              </Suspense>
            } />
            <Route path="/admin/add-part" element={
              <Suspense fallback={<PageLoader />}>
                <AddPart />
              </Suspense>
            } />
            <Route path="/admin/edit-grader/:id" element={
              <Suspense fallback={<PageLoader />}>
                <EditGrader />
              </Suspense>
            } />
            <Route path="/admin/edit-part/:id" element={
              <Suspense fallback={<PageLoader />}>
                <EditPart />
              </Suspense>
            } />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/login" element={
              <Suspense fallback={<PageLoader />}>
                <Login />
              </Suspense>
            } />
            <Route path="/user-login" element={
              <Suspense fallback={<PageLoader />}>
                <UserLogin />
              </Suspense>
            } />
            <Route path="/register" element={
              <Suspense fallback={<PageLoader />}>
                <Register />
              </Suspense>
            } />
            <Route path="/admin-login" element={
              <Suspense fallback={<PageLoader />}>
                <AdminLogin />
              </Suspense>
            } />
            <Route path="/about" element={
              <Suspense fallback={<PageLoader />}>
                <About />
              </Suspense>
            } />
            <Route path="/contact" element={
              <Suspense fallback={<PageLoader />}>
                <Contact />
              </Suspense>
            } />
            <Route path="/faq" element={
              <Suspense fallback={<PageLoader />}>
                <FAQ />
              </Suspense>
            } />
            <Route path="*" element={
              <Suspense fallback={<PageLoader />}>
                <NotFound />
              </Suspense>
            } />
          </Routes>
        </main>
        <Footer />
        <ContactToolbar />
      </div>
    </SecurityProvider>
  );
}

export default withSecurity(App);
