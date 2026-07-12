import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useEffect } from 'react';

import './i18n';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppWidget from './components/WhatsAppWidget';
import ChatbotWidget from './components/ChatbotWidget';
import StickyCTA from './components/StickyCTA';
import DemoDashboardsWidget from './components/DemoDashboardsWidget';

import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Appointment from './pages/Appointment';
import Testimonials from './pages/Testimonials';
import FAQ from './pages/FAQ';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Prescription from './pages/Prescription';
import Login from './pages/Login';

import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/appointment" element={<Appointment />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/prescription" element={<Prescription />} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                
                {/* Demo Routes */}
                <Route path="/demo/doctor" element={<DoctorDashboard isDemo={true} />} />
                <Route path="/demo/receptionist" element={<ReceptionistDashboard isDemo={true} />} />
                <Route path="/demo/admin" element={<AdminDashboard isDemo={true} />} />
                
                {/* Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']} />}>
                  <Route path="/doctor" element={<DoctorDashboard />} />
                </Route>
                
                <Route element={<ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN']} />}>
                  <Route path="/receptionist" element={<ReceptionistDashboard />} />
                </Route>
                
                <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>
              </Routes>
            </div>
            <Footer />

            {/* Persistent Widgets */}
            <WhatsAppWidget />
            <ChatbotWidget />
            <StickyCTA />
            <DemoDashboardsWidget />
          </div>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
