import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import Preloader from './components/ui/Preloader';
import ScrollToTop from './components/ScrollToTop';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import CleanLayout from './layouts/CleanLayout';

// Auth
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
import ProtectedRoute from './components/Auth/AuthRoutes';

// Public Pages
const LandingPage = lazy(() => import('./pages/Home'));
const GCELevelsPage = lazy(() => import('./pages/LevelSelector'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const SubjectsPage = lazy(() => import('./pages/SubjectsPage'));
const SubjectPapersPage = lazy(() => import('./pages/SubjectPapersPage'));
const PaperPage = lazy(() => import('./pages/PaperPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const CommunityGroupPage = lazy(() => import('./pages/CommunityGroupPage'));
const ThreadDetailPage = lazy(() => import('./pages/ThreadDetail'));

// Dashboard Pages
const StudentDashboard = lazy(() => import('./pages/Dashboard'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminSubjects = lazy(() => import('./pages/admin/AdminSubjects'));
const AdminPapers = lazy(() => import('./pages/admin/AdminPapers'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminTestimonials = lazy(() => import('./pages/admin/AdminTestimonials'));

// Loading Fallback
const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-white/50 backdrop-blur-sm fixed inset-0 z-[100]">
    <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
  </div>
);

// Tutor Pages
import TutorDashboard from './pages/tutor/TutorDashboard';

function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    // Simulate initial asset loading/initialization
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Toaster position="top-right" richColors expand={true} />
      
      <AnimatePresence mode="wait">
        {isAppLoading ? (
          <Preloader key="preloader" />
        ) : (
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/levels" element={<GCELevelsPage />} />
                <Route path="/about" element={<AboutPage />} />
              </Route>

              {/* Clean Layout (No Footer) - Auth & Critical Interaction */}
              <Route element={<CleanLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Protected interactive pages */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/subjects" element={<SubjectsPage />} />
                  <Route path="/subjects/:subjectId/papers" element={<SubjectPapersPage />} />
                  <Route path="/papers/:paperId" element={<PaperPage />} />
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/community/group/:groupId" element={<CommunityGroupPage />} />
                  <Route path="/community/thread/:threadId" element={<ThreadDetailPage />} />
                </Route>
              </Route>

              {/* Student/Tutor Dashboard Routes */}
              <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<StudentDashboard />} />
                <Route path="/tutor_dashboard" element={<TutorDashboard />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin_dashboard" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="subjects" element={<AdminSubjects />} />
                <Route path="subjects/:subjectId/papers" element={<AdminPapers />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="testimonials" element={<AdminTestimonials />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        )}
      </AnimatePresence>
    </Router>
  );
}

export default App;
