import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import HostelDetailsPage from './pages/HostelDetailsPage';
import AddHostelPage from './pages/AddHostelPage';
import EditHostelPage from './pages/EditHostelPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Scroll to top helper component on route navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <div className="flex-grow">
                <ErrorBoundary>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/explore" element={<ExplorePage />} />
                    <Route path="/hostels/:id" element={<HostelDetailsPage />} />
                    <Route path="/hostels/:id/edit" element={<EditHostelPage />} />
                    <Route path="/add-hostel" element={<AddHostelPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </ErrorBoundary>
              </div>
              <Footer />
            </div>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
