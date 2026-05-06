import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import Preloader from './components/ui/Preloader';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import CleanLayout from './layouts/CleanLayout';

// Auth
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import OnboardingPage from './pages/OnboardingPage';
import ProtectedRoute from './components/Auth/AuthRoutes';

// Public Pages
import LandingPage from './pages/Home';
import GCELevelsPage from './pages/LevelSelector';
import SubjectsPage from './pages/SubjectsPage';
import SubjectPapersPage from './pages/SubjectPapersPage';
import PaperPage from './pages/PaperPage';
import CommunityPage from './pages/CommunityPage';
import CommunityGroupPage from './pages/CommunityGroupPage';
import ThreadDetailPage from './pages/ThreadDetail';

// Dashboard Pages
import StudentDashboard from './pages/Dashboard';
import SettingsPage from './pages/SettingsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminPapers from './pages/admin/AdminPapers';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTestimonials from './pages/admin/AdminTestimonials';

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
      <Toaster position="top-right" richColors expand={true} />
      
      <AnimatePresence mode="wait">
        {isAppLoading ? (
          <Preloader key="preloader" />
        ) : (
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/levels" element={<GCELevelsPage />} />
              <Route path="/subjects" element={<SubjectsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* Clean Interactive Layout (No Footer) */}
            <Route element={<CleanLayout />}>
               <Route path="/subjects/:subjectId/papers" element={<SubjectPapersPage />} />
               <Route path="/papers/:paperId" element={<PaperPage />} />
               <Route path="/community" element={<CommunityPage />} />
               <Route path="/community/group/:groupId" element={<CommunityGroupPage />} />
               <Route path="/community/thread/:threadId" element={<ThreadDetailPage />} />
            </Route>

            {/* Student/Tutor Dashboard Routes */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<StudentDashboard />} />
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

            {/* Onboarding */}
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </AnimatePresence>
    </Router>
  );
}

export default App;
